import Business from "../../models/business/business.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang,handleImg} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray,isImgUrl } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Country from "../../models/country/country.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import Category from "../../models/category/category.model"
import EducationSystem from "../../models/education system/education system.model";
import EducationInstitution from "../../models/education institution/education institution.model";
import { transformBusiness,transformBusinessById } from "../../models/business/transformBusiness";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import User from "../../models/user/user.model";
const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'sector', model: 'category' },
    { path: 'subSector', model: 'category' },
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    
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
            body('webSite').trim().not().isEmpty().withMessage((value, { req}) => {
                return req.__('webSite.required', { value});
            }),
            body('email').trim().not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }),
            body('phones').trim().not().isEmpty().withMessage((value, { req}) => {
                return req.__('phones.required', { value});
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
            body('country').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('country.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('country.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Country.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('city.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await City.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('area.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('area.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Area.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('area.invalid'));
                else
                    return true;
            }),
            body('owner').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('owner.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('owner.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await User.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('owner.invalid'));
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
            let image = await handleImg(req, { attributeName: 'img'});
            validatedBody.img = image;
            let business = await Business.create({ ...validatedBody });
            if(req.user.type =="ADMIN"){
                let educationInstitution = await EducationInstitution.create({ 
                    name_en:business.name_en,
                    name_ar:business.name_ar,
                    educationSystem:business.educationSystem,
                    educationSystem:business.educationSystem,
                    sector:business.sector,
                    subSector:business.subSector,
                    img:business.img,
    
                });
                business.status = "ACCEPTED"
                business.educationInstitution = educationInstitution
                await business.save();
            }
            let reports = {
                "action":"Create New business",
                "type":"BUSINESS",
                "deepId":business.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:business
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
            let { businessId } = req.params;
            
            await checkExist(businessId, Business, { deleted: false });
            await Business.findById(businessId)
            .populate(populateQuery)
            .then(async(e) => {
                let business = await transformBusinessById(e,lang)
                res.send({
                    success:true,
                    data:business
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update business
    async update(req, res, next) {
        try {
            convertLang(req)
            let { businessId } = req.params;
            await checkExist(businessId,Business, { deleted: false })
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img'});
                validatedBody.img = image;
            }
            await Business.findByIdAndUpdate(businessId, { ...validatedBody });
            let reports = {
                "action":"Update Business ",
                "type":"BUSINESS",
                "deepId":businessId,
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
            let {owner,name,sector,subSector,educationSystem,country,city,area,status} = req.query;

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
            if(owner) query.owner = owner
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            if(country) query.country = country
            if(city) query.city = city
            if(area) query.area = area
            if(status) query.status = status
            await Business.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBusiness(e,lang)
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
            let {owner,name,sector,subSector,educationSystem,country,city,area,status} = req.query;

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
            if(owner) query.owner = owner
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            if(country) query.country = country
            if(city) query.city = city
            if(area) query.area = area
            if(status) query.status = status
            await Business.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBusiness(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Business.countDocuments(query);
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
            let { businessId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let business = await checkExistThenGet(businessId, Business);
            business.deleted = true;
            await business.save();
            let reports = {
                "action":"Delete Business",
                "type":"BUSINESS",
                "deepId":businessId,
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
    async accept(req, res, next) {
        try {
            convertLang(req)
            let { businessId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let business = await checkExistThenGet(businessId, Business);
            business.status = 'ACCEPTED';
            
            if(!business.educationInstitution){
                let educationInstitution = await EducationInstitution.create({ 
                    name_en:business.name_en,
                    name_ar:business.name_ar,
                    educationSystem:business.educationSystem,
                    educationSystem:business.educationSystem,
                    sector:business.sector,
                    subSector:business.subSector,
                    img:business.img,

                });
                business.educationInstitution = educationInstitution
            }
            
            await business.save();
            sendNotifiAndPushNotifi({
                targetUser: business.owner, 
                fromUser: business.owner, 
                text: ' EdHub',
                subject: business.id,
                subjectType: 'Business Status',
                info:'BUSINESS'
            });
            let notif = {
                "description_en":'Your business Request Has Been Confirmed ',
                "description_ar":'  تمت الموافقه على طلب  الخاص بك',
                "title_en":'Your business Request Has Been Confirmed ',
                "title_ar":' تمت الموافقه على طلب  الخاص بك',
                "type":'BUSINESS'
            }
            await Notif.create({...notif,resource:req.user,target:business.owner,business:business.id});
            let reports = {
                "action":"Accept business Request",
                "type":"BUSINESS",
                "deepId":businessId,
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
    
    async reject(req, res, next) {
        
        try {
            convertLang(req)
            let { businessId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let business = await checkExistThenGet(businessId, Business);
            business.status = 'REJECTED';
            business.reason  = req.body.reason
            await business.save();
            
            sendNotifiAndPushNotifi({
                targetUser: business.owner, 
                fromUser: business.owner, 
                text: ' EdHub',
                subject: business.id,
                subjectType: 'business Status',
                info:'BUSINESS'
            });
            let notif = {
                "description_en":'Your business Request Has Been Rejected ',
                "description_ar":'   تم رفض  طلب التمويل الخاص بك',
                "title_en":'Your business Request Has Been Rejected ',
                "title_ar":' تم رفض على طلب التمويل الخاص بك',
                "type":'BUSINESS'
            }
            await Notif.create({...notif,resource:req.user,target:business.owner,business:business.id});
            let reports = {
                "action":"Reject business Request",
                "type":"BUSINESS",
                "deepId":businessId,
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
}