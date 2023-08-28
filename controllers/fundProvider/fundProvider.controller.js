import FundProvider from "../../models/fundProvider/fundProvider.model";
import { body } from "express-validator";
import { checkValidations ,handleImg} from "../shared/shared.controller";
import Report from "../../models/reports/report.model";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { transformFundProvider } from "../../models/fundProvider/transformFundProvider";
const populateQuery = [
    { path: 'programsPercent.fundProgram', model: 'fundProgram' },
];
export default {
    validateBody(isUpdate = false) {
        let validations = [
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('expensesRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('expensesRatio.required', { value});
            }),
            body('monthlyPercent').optional(),
            body('monthlyPercentType').not().isEmpty().withMessage((value, { req}) => {
                return req.__('monthlyPercentType.required', { value});
            }),
            body('programsPercent').not().isEmpty().withMessage((value, { req}) => {
                return req.__('programsPercent.required', { value});
            })
            .custom(async(programsPercent, { req }) => {
                for (let fundProgram of programsPercent) {
                    body('fundProgram').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('fundProgram.required', { value });
                    }).isNumeric().withMessage((value, { req }) => {
                        return req.__('fundProgram.numeric', { value });
                    }).custom(async(value, { req }) => {
                        if (!await FundProgram.findOne({ _id: value, deleted: false }))
                            throw new Error(req.__('fundProgram.invalid'));
                        else
                            return true;
                    }),
                    body('monthlyPercent').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('monthlyPercent.required', { value});
                    })
                }
                return true;
            }),
            
        ];
        if (isUpdate)
        validations.push([
            body('logo').optional().custom(val => isImgUrl(val)).withMessage((value, { req}) => {
                return req.__('logo.syntax', { value});
            })
        ]);

        return validations;
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            //upload img
            let image = await handleImg(req);
            validatedBody.logo = image;
            let fundProvider = await FundProvider.create({ ...validatedBody});
            let reports = {
                "action":"Create New fundProvider",
                "type":"FUND-PROVIDER",
                "deepId":fundProvider.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await FundProvider.findById(fundProvider.id).populate(populateQuery)
            .then(async(e) => {
                let index = await transformFundProvider(e,lang)
                return res.status(201).send({
                    success:true,
                    data:index
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { fundProviderId } = req.params;
            
            await checkExist(fundProviderId, FundProvider, { deleted: false });

            await FundProvider.findById(fundProviderId).populate(populateQuery)
            .then( async(e) => {
                let index = await transformFundProvider(e,lang)
                return res.send({
                    success:true,
                    data:index
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { fundProviderId } = req.params;
            await checkExist(fundProviderId, FundProvider, { deleted: false });
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'logo', isUpdate: true });
                validatedBody.img = image;
            }
            await FundProvider.findByIdAndUpdate(fundProviderId, { ...validatedBody });
            let reports = {
                "action":"Update fundProvider",
                "type":"FUND-PROVIDER",
                "deepId":fundProviderId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await FundProvider.findById(fundProviderId).populate(populateQuery)
            .then(async(e) => {
                let index = await transformFundProvider(e,lang)

                return res.status(200).send({
                    success:true,
                    data:index
                });
            })
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {fundProgram,search} = req.query;
            let query = { deleted: false };
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                        
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(fundProgram){
                Object.assign(query, {"programsPercent.fundProgram": fundProgram});
            } 
            await FundProvider.find(query).populate(populateQuery)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformFundProvider(e,lang)
                    newdata.push(index);
                    
                }))
                res.send({success:true,data:newdata});
            })
        } catch (error) {
            next(error);
        }
    },

    async getAllPaginated(req, res, next) {        
        try {    
            let lang = i18n.getLocale(req)       
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {search,fundProgram} = req.query;
            let query = { deleted: false };
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                        
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(fundProgram){
                Object.assign(query, {"programsPercent.fundProgram": fundProgram});
            } 

            await FundProvider.find(query).populate(populateQuery)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformFundProvider(e,lang)

                        newdata.push(index);
                    }))
                    const count = await FundProvider.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },


    async delete(req, res, next) {        
        try {
            let { fundProviderId } = req.params;
            let fundProvider = await checkExistThenGet(fundProviderId, FundProvider);
            fundProvider.deleted = true;
            await fundProvider.save();
            let reports = {
                "action":"Delete fundProvider",
                "type":"FUND-PROVIDER",
                "deepId":fundProviderId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}