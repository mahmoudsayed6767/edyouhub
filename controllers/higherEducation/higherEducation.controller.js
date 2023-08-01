import HigherEducation from "../../models/higherEducation/higherEducation.model";
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
        ];
        return validations;
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            let higherEducation = await HigherEducation.create({ ...validatedBody});
            let reports = {
                "action":"Create New higherEducation",
                "type":"HIGHER-EDUCATION",
                "deepId":higherEducation.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await HigherEducation.findById(higherEducation.id).then((e) => {
                let higherEducation = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(201).send({
                    success:true,
                    data:higherEducation
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { higherEducationId } = req.params;
            
            await checkExist(higherEducationId, HigherEducation, { deleted: false });

            await HigherEducation.findById(higherEducationId).then( e => {
                let higherEducation = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:higherEducation
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)

            let { higherEducationId } = req.params;
            await checkExist(higherEducationId, HigherEducation, { deleted: false });
            const validatedBody = checkValidations(req);
            await HigherEducation.findByIdAndUpdate(higherEducationId, { ...validatedBody });
            let reports = {
                "action":"Update higherEducation",
                "type":"HIGHER-EDUCATION",
                "deepId":higherEducationId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await HigherEducation.findById(higherEducationId).then((e) => {
                let higherEducation = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(200).send({
                    success:true,
                    data:higherEducation
                });
            })
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {search} = req.query;
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
            await HigherEducation.find(query)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index ={
                        name:lang=="ar"?e.name_ar:e.name_en,
                        name_ar:e.name_ar,
                        name_en:e.name_en,
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
            let {search} = req.query;
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
            await HigherEducation.find(query)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index ={
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_ar:e.name_ar,
                            name_en:e.name_en,
                            id: e._id,
                            createdAt: e.createdAt,
                        }
                        newdata.push(index);
                    }))
                    const count = await HigherEducation.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },


    async delete(req, res, next) {        
        try {
            let { higherEducationId } = req.params;
            let higherEducation = await checkExistThenGet(higherEducationId, HigherEducation);
            higherEducation.deleted = true;
            await HigherEducation.save();
            let reports = {
                "action":"Delete higherEducation",
                "type":"HIGHER-EDUCATION",
                "deepId":higherEducationId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}