import EducationSystem from "../../models/education system/education system.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang,handleImg} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray,isImgUrl } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";

export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('educationSystem_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem_en.required', { value});
            }),
            body('educationSystem_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem_ar.required', { value});
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
    //add new educationSystem
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let image = await handleImg(req, { attributeName: 'img'});
            validatedBody.img = image;
            let educationSystem = await EducationSystem.create({ ...validatedBody });
            let reports = {
                "action":"Create New educationSystem",
                "type":"EDUCATION-SYSTEM",
                "deepId":educationSystem.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:educationSystem
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
            let { educationSystemId } = req.params;
            
            await checkExist(educationSystemId, EducationSystem, { deleted: false });

            await EducationSystem.findById(educationSystemId).then( e => {
                let educationSystem ={
                    educationSystem:lang=="ar"?e.educationSystem_ar:e.educationSystem_en,
                    educationSystem_ar:e.educationSystem_ar,
                    educationSystem_en:e.educationSystem_en,
                    img:e.img,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                res.send({
                    success:true,
                    data:educationSystem
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update educationSystem
    async update(req, res, next) {
        try {
            convertLang(req)
            let { educationSystemId } = req.params;
            await checkExist(educationSystemId,EducationSystem, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img'});
                validatedBody.img = image;
            }
            await EducationSystem.findByIdAndUpdate(educationSystemId, { ...validatedBody });
            let reports = {
                "action":"Update educationSystem",
                "type":"EDUCATION-SYSTEM",
                "deepId":educationSystemId,
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
            let {name} = req.query;

            let query = {deleted: false }
             /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {educationSystem_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {educationSystem_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await EducationSystem.find(query)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = {
                            educationSystem:lang=="ar"?e.educationSystem_ar:e.educationSystem_en,
                            educationSystem_ar:e.educationSystem_ar,
                            educationSystem_en:e.educationSystem_en,
                            img:e.img,
                            id: e._id,
                            createdAt: e.createdAt,
                        }
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
            let {name} = req.query
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {  deleted: false }
            /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {educationSystem_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {educationSystem_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await EducationSystem.find(query)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = {
                            educationSystem:lang=="ar"?e.educationSystem_ar:e.educationSystem_en,
                            educationSystem_ar:e.educationSystem_ar,
                            educationSystem_en:e.educationSystem_en,
                            img:e.img,
                            id: e._id,
                            createdAt: e.createdAt,
                        }
                        newdata.push(index)
                    }))
                    const count = await EducationSystem.countDocuments(query);
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
            let { educationSystemId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let educationSystem = await checkExistThenGet(educationSystemId, EducationSystem);
            educationSystem.deleted = true;
            await educationSystem.save();
            let reports = {
                "action":"Delete educationSystem",
                "type":"EDUCATION-SYSTEM",
                "deepId":educationSystemId,
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