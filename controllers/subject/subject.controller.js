import Subject from "../../models/subject/subject.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import Report from "../../models/reports/report.model";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import EducationSystem from "../../models/education system/education system.model";

export default {
    validateBody(isUpdate = false) {
        let validations = [
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('educationSystem').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('educationSystem.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationSystem.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationSystem.invalid'));
                else
                    return true;
            }),
        ];
        return validations;
    },
    async create(req, res, next) {
        try {
            let lang = i18n.getLocale(req)

            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));

            const validatedBody = checkValidations(req);
            let subject = await Subject.create({ ...validatedBody});
            let reports = {
                "action":"Create New subject",
                "type":"SUBJECT",
                "deepId":subject.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Subject.findById(subject.id).then((e) => {
                let subject = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    educationSystem:e.educationSystem,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(201).send({
                    success:true,
                    data:subject
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let { subjectId } = req.params;
            
            await checkExist(subjectId, Subject, { deleted: false });

            await Subject.findById(subjectId).then( e => {
                let subject = {
                    nmae:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    educationSystem:e.educationSystem,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:subject
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            let lang = i18n.getLocale(req)

            let { subjectId } = req.params;
            await checkExist(subjectId, Subject, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            await Subject.findByIdAndUpdate(subjectId, { ...validatedBody });
            let reports = {
                "action":"Update subject",
                "type":"SUBJECT",
                "deepId":subjectId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Subject.findById(subjectId).then((e) => {
                let subject = {
                    nmae:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    educationSystem:e.educationSystem,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(200).send({
                    success:true,
                    data:subject
                });
            })
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let {search,educationSystem} = req.query;
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
            if(educationSystem) query.educationSystem = educationSystem
            await Subject.find(query)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index ={
                        nmae:lang=="ar"?e.name_ar:e.name_en,
                        name_ar:e.name_ar,
                        name_en:e.name_en,
                        educationSystem:e.educationSystem,
                        id: e._id,
                        createdAt: e.createdAt,
                    }
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
            let {search,educationSystem} = req.query;
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
            if(educationSystem) query.educationSystem = educationSystem
            await Subject.find(query)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index ={
                            nmae:lang=="ar"?e.name_ar:e.name_en,
                            name_ar:e.name_ar,
                            name_en:e.name_en,
                            educationSystem:e.educationSystem,
                            id: e._id,
                            createdAt: e.createdAt,
                        }
                        newdata.push(index);
                    }))
                    const count = await Subject.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        
        try {
            let { subjectId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let subject = await checkExistThenGet(subjectId, Subject);
            subject.deleted = true;
            await subject.save();
            let reports = {
                "action":"Delete subject",
                "type":"SUBJECT",
                "deepId":subjectId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },

}