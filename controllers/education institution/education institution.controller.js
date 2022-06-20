import EducationInstitution from "../../models/education institution/education institution.model";
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
            body('educationInstitution_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationInstitution_en.required', { value});
            }),
            body('educationInstitution_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationInstitution_ar.required', { value});
            }),
            body('educationSystem').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('educationSystem.numeric', { value});
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
    //add new educationInstitution
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

            await EducationInstitution.findById(educationInstitutionId).then( e => {
                let educationInstitution ={
                    educationInstitution:lang=="ar"?e.educationInstitution_ar:e.educationInstitution_en,
                    educationInstitution_ar:e.educationInstitution_ar,
                    educationInstitution_en:e.educationInstitution_en,
                    img:e.img,
                    id: e._id,
                    createdAt: e.createdAt,
                }
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
            let {name} = req.query;

            let query = {deleted: false }
             /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {educationInstitution_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {educationInstitution_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await EducationInstitution.find(query)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = {
                            educationInstitution:lang=="ar"?e.educationInstitution_ar:e.educationInstitution_en,
                            educationInstitution_ar:e.educationInstitution_ar,
                            educationInstitution_en:e.educationInstitution_en,
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
                            {educationInstitution_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {educationInstitution_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await EducationInstitution.find(query)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = {
                            educationInstitution:lang=="ar"?e.educationInstitution_ar:e.educationInstitution_en,
                            educationInstitution_ar:e.educationInstitution_ar,
                            educationInstitution_en:e.educationInstitution_en,
                            img:e.img,
                            id: e._id,
                            createdAt: e.createdAt,
                        }
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

   

}