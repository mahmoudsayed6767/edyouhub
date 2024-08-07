import Specialization from "../../models/specialization/specialization.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import Report from "../../models/reports/report.model";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";

export default {
    validateBody(isUpdate = false) {
        let validations = [
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('type').not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }).isIn(['FOR-EDUCATION','FOR-HIGH-EDUCATION','FOR-BASIC-EDUCATION','FOR-TUTOR','FOR-SERVICE-PROVIDER','FOR-COURSE']).withMessage((value, { req}) => {
                return req.__('type.invalid', { value});
            }),
        ];
        return validations;
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            let specialization = await Specialization.create({ ...validatedBody});
            let reports = {
                "action":"Create New specialization",
                "type":"SPECIALIZATION",
                "deepId":specialization.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Specialization.findById(specialization.id).then((e) => {
                let specialization = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    type:e.type,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(201).send({
                    success:true,
                    data:specialization
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { specializationId } = req.params;
            
            await checkExist(specializationId, Specialization, { deleted: false });

            await Specialization.findById(specializationId).then( e => {
                let specialization = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    type:e.type,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:specialization
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)

            let { specializationId } = req.params;
            await checkExist(specializationId, Specialization, { deleted: false });
            const validatedBody = checkValidations(req);
            await Specialization.findByIdAndUpdate(specializationId, { ...validatedBody });
            let reports = {
                "action":"Update specialization",
                "type":"SPECIALIZATION",
                "deepId":specializationId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Specialization.findById(specializationId).then((e) => {
                let specialization = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    type:e.type,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(200).send({
                    success:true,
                    data:specialization
                });
            })
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {search,type} = req.query;
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
            if(type) query.type = type;
            await Specialization.find(query)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index ={
                        name:lang=="ar"?e.name_ar:e.name_en,
                        name_ar:e.name_ar,
                        name_en:e.name_en,
                        type:e.type,
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
            let {search,type} = req.query;
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
            if(type) query.type = type;

            await Specialization.find(query)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index ={
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_ar:e.name_ar,
                            name_en:e.name_en,
                            type:e.type,
                            id: e._id,
                            createdAt: e.createdAt,
                        }
                        newdata.push(index);
                    }))
                    const count = await Specialization.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {        
        try {
            let { specializationId } = req.params;
            let specialization = await checkExistThenGet(specializationId, Specialization);
            specialization.deleted = true;
            await specialization.save();
            let reports = {
                "action":"Delete specialization",
                "type":"SPECIALIZATION",
                "deepId":specializationId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },

}