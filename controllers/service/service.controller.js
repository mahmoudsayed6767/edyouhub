import ApiResponse from "../../helpers/ApiResponse";
import Service from "../../models/service/service.model";
import Business from "../../models/business/business.model";
import Specialization from "../../models/specialization/specialization.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import { transformService } from "../../models/service/transformService";
import { toImgUrl } from "../../utils";

const populateQuery = [
    { path: 'business', model: 'business'},
    { path: 'specialization', model: 'specialization'},
];
export default {

    async findAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req) 
            let {specialization,business} = req.query
            let query = {deleted: false};
            if (specialization)  query.specialization = specialization
            if (business) query.business = business
            await Service.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformService(e,lang)
                    newdata.push(index)
                }))
                res.send({
                    success:true,
                    data:newdata
                });
            })

        } catch (err) {
            next(err);
        }
    },
    async findAllPagenation(req, res, next) {
        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {specialization,business} = req.query
            let query = {deleted: false};
            if (specialization)  query.specialization = specialization
            if (business) query.business = business
            await Service.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformService(e,lang)
                    newdata.push(index)
                }))
                const count = await Service.countDocuments(query);
                const pageCount = Math.ceil(count / limit);

                res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
            })

        } catch (err) {
            next(err);
        }
    },
    //get by id
    async getById(req, res, next) {
        try {
            let lang = i18n.getLocale(req)          
            let { serviceId } = req.params;
            await checkExist(serviceId, Service, { deleted: false });

            await Service.findById(serviceId).populate(populateQuery)
            .then(async(e) => {
                let index = await transformService(e,lang)
                return res.send({
                    success:true,
                    data:index,
                });
                
            })
        } catch (error) {
            next(error);

        }
    },

    validateBody(isUpdate = false) {
        let validations = [
            body('title').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title.required', { value});
            }),
            body('details').not().isEmpty().withMessage((value, { req}) => {
                return req.__('details.required', { value});
            }),
            body('priceType').not().isEmpty().withMessage((value, { req}) => {
                return req.__('priceType.required', { value});
            }).isIn(['BY-CONTACT','FIXED']).withMessage((value, { req}) => {
                return req.__('priceType.invalid', { value});
            }),
            body('priceType').optional(),
            body('specialization').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('specialization.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Specialization.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('specialization.invalid'));
                else
                    return true;
            }),
        ];
        return validations;
    },

    async create(req, res, next) {
        try {
            let {businessId} = req.params
            const validatedBody = checkValidations(req);
            validatedBody.business = businessId
            let business = await checkExistThenGet(businessId,Business,{deleted:false})
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(business.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }

            //upload imgs
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('imgs.required')));
                }
                if (req.files['attachment']) {
                    let imagesList = [];
                    for (let imges of req.files['attachment']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.attachment = imagesList[0];
                }
            }else{
                return next(new ApiError(422, i18n.__('imgs.required')));
            }
            let theservice = await Service.create({ ...validatedBody});
            let reports = {
                "action":"Create service",
                "type":"SERVICE",
                "deepId":theservice.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true,data:theservice});
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { serviceId } = req.params;
            let service = await checkExistThenGet(serviceId, Service, { deleted: false });
            let business = await checkExistThenGet(service.business,Business,{deleted:false})
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(business.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            //upload imgs
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }
                if (req.files['attachment']) {
                    let imagesList = [];
                    for (let imges of req.files['attachment']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.attachment = imagesList[0];
                }
            }
            await Service.findByIdAndUpdate(serviceId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update service",
                "type":"SERVICE",
                "deepId":serviceId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success:true});
        }
        catch (err) {
            next(err);
        }
    },
   
    async delete(req, res, next) {
        try {
            let { serviceId } = req.params;
            let service = await checkExistThenGet(serviceId, Service, { deleted: false });
            let business = await checkExistThenGet(service.business,Business,{deleted:false})
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(business.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            service.deleted = true;
            await service.save();

            let reports = {
                "action":"Delete service",
                "type":"SERVICE",
                "deepId":serviceId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
};