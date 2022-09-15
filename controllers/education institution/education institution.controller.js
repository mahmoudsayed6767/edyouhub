import EducationInstitution from "../../models/education institution/education institution.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang,handleImg} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray,isImgUrl } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Category from "../../models/category/category.model"
import EducationSystem from "../../models/education system/education system.model";
import Order from "../../models/order/order.model";
import Supplies from "../../models/supplies/supplies.model";
import { transformEducationInstitution } from "../../models/education institution/transformEducationInstitution";
const populateQuery = [
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'sector', model: 'category' },
    { path: 'subSector', model: 'category' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('name_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('name_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('services').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('services.required', { value});
            }),
            body('educationSystem').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('educationSystem.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationSystem.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationSystem.invalid'));
                else
                    return true;
            }),
            body('sector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('sector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('sector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('sector.invalid'));
                else
                    return true;
            }),
            body('subSector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('subSector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('subSector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('subSector.invalid'));
                else
                    return true;
            }),
            
        ];
        if (isUpdate)
            validations.push([
                body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req}) => {
                    return req.__('img.syntax', { value});
                })
            ]);
        return validations;
    },
    //add new education Institution
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let image = await handleImg(req, { attributeName: 'img'});
            validatedBody.img = image;
            let educationInstitution = await EducationInstitution.create({ ...validatedBody });
            let reports = {
                "action":"Create New education Institution",
                "type":"EDUCATION-INSTITUTION",
                "deepId":educationInstitution.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:educationInstitution
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async getById(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { educationInstitutionId } = req.params;
            
            await checkExist(educationInstitutionId, EducationInstitution, { deleted: false });

            await EducationInstitution.findById(educationInstitutionId)
            .populate(populateQuery)
            .then(async(e) => {
                let educationInstitution = await transformEducationInstitution(e,lang)
                res.send({
                    success:true,
                    data:educationInstitution
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update educationInstitution
    async update(req, res, next) {
        try {
            convertLang(req)
            let { educationInstitutionId } = req.params;
            await checkExist(educationInstitutionId,EducationInstitution, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);

            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img'});
                validatedBody.img = image;
            }
            await EducationInstitution.findByIdAndUpdate(educationInstitutionId, { ...validatedBody });
            let reports = {
                "action":"Update education Institution",
                "type":"EDUCATION-INSTITUTION",
                "deepId":educationInstitutionId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({
                success:true
            });
        } catch (error) {
            next(error);
        }
    },
    //get without pagenation
    async getAll(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let {service,name,sector,subSector,educationSystem} = req.query;

            let query = {deleted: false }
             /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(service) query.service = service
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            await EducationInstitution.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformEducationInstitution(e,lang)
                        newdata.push(index)
                    }))
                    res.send({
                        success:true,
                        data:newdata
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //get with pagenation
    async getAllPaginated(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {service,name,sector,subSector,educationSystem} = req.query;
            let query = {deleted: false }
             /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(service) query.service = service
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            await EducationInstitution.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformEducationInstitution(e,lang)
                        newdata.push(index)
                    }))
                    const count = await EducationInstitution.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },
    //delete 
    async delete(req, res, next) {
        
        try {
            convertLang(req)
            let { educationInstitutionId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let educationInstitution = await checkExistThenGet(educationInstitutionId, EducationInstitution);
            educationInstitution.deleted = true;
            await educationInstitution.save();
            let reports = {
                "action":"Delete education Institution",
                "type":"EDUCATION-INSTITUTION",
                "deepId":educationInstitutionId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({
                success:true
            });
        } catch (err) {
            next(err);
        }
    },
    //get supplies total
    async getSuppliesTotal(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { educationInstitutionId } = req.params;
            await checkExist(educationInstitutionId, EducationInstitution, { deleted: false });
            let newdata = []
            let allSupplies = await Supplies.find({deleted: false,educationInstitution: educationInstitutionId}).select('_id name_ar name_en');
            for (const list of allSupplies) {
                let stationeriesCost = 0
                let orders = await Order.find({deleted: false,'suppliesList.supplies':list._id})
                for (const order of orders) {
                    let theIndex = order.suppliesList.findIndex( v => v.supplies == list._id)
                    stationeriesCost = stationeriesCost + order.suppliesList[theIndex].stationeriesCost
                }
                newdata.push({
                    supplies:{
                        name:lang=="ar"?list.name_ar:list.name_en,
                        id:list._id
                    },
                    stationeriesCost:stationeriesCost
                })
            }
            res.send({success: true,data:newdata})
        } catch (error) {
            next(error);
        }
    },

   

}