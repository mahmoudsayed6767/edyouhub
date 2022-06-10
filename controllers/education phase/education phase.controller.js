import EducationPhase from "../../models/education phase/education phase.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";

export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('educationPhase_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationPhase_en.required', { value});
            }),
            body('educationPhase_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationPhase_ar.required', { value});
            }),
            
        ];
        return validations;
    },
    //add new educationPhase
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let educationPhase = await EducationPhase.create({ ...validatedBody });
            let reports = {
                "action":"Create New educationPhase",
                "type":"EDUCATION-PHASE",
                "deepId":educationPhase.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:educationPhase
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
            let { educationPhaseId } = req.params;
            
            await checkExist(educationPhaseId, EducationPhase, { deleted: false });

            await EducationPhase.findById(educationPhaseId).then( e => {
                let educationPhase ={
                    educationPhase:lang=="ar"?e.educationPhase_ar:e.educationPhase_en,
                    educationPhase_ar:e.educationPhase_ar,
                    educationPhase_en:e.educationPhase_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                res.send({
                    success:true,
                    data:educationPhase
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update educationPhase
    async update(req, res, next) {
        try {
            convertLang(req)
            let { educationPhaseId } = req.params;
            await checkExist(educationPhaseId,EducationPhase, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            await EducationPhase.findByIdAndUpdate(educationPhaseId, { ...validatedBody });
            let reports = {
                "action":"Update educationPhase",
                "type":"EDUCATION-PHASE",
                "deepId":educationPhaseId,
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
                            {educationPhase_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {educationPhase_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await EducationPhase.find(query)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = {
                            educationPhase:lang=="ar"?e.educationPhase_ar:e.educationPhase_en,
                            educationPhase_ar:e.educationPhase_ar,
                            educationPhase_en:e.educationPhase_en,
    
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
                            {educationPhase_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {educationPhase_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await EducationPhase.find(query)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = {
                            educationPhase:lang=="ar"?e.educationPhase_ar:e.educationPhase_en,
                            educationPhase_ar:e.educationPhase_ar,
                            educationPhase_en:e.educationPhase_en,
    
                            id: e._id,
                            createdAt: e.createdAt,
                        }
                        newdata.push(index)
                    }))
                    const count = await EducationPhase.countDocuments(query);
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
            let { educationPhaseId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let educationPhase = await checkExistThenGet(educationPhaseId, EducationPhase);
            educationPhase.deleted = true;
            await educationPhase.save();
            let reports = {
                "action":"Delete educationPhase",
                "type":"EDUCATION-PHASE",
                "deepId":educationPhaseId,
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