import FeesType from "../../models/feesType/feesType.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
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
            })
        ];

        return validations;
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            let feesType = await FeesType.create({ ...validatedBody});
            let reports = {
                "action":"Create New feesType",
                "type":"FEES-TYPE",
                "deepId":feesType.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await FeesType.findById(feesType.id).then((e) => {
                let feesType = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(201).send({
                    success:true,
                    data:feesType
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { feesTypeId } = req.params;
            
            await checkExist(feesTypeId, FeesType, { deleted: false });

            await FeesType.findById(feesTypeId).then( e => {
                let feesType = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:feesType
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { feesTypeId } = req.params;
            await checkExist(feesTypeId, FeesType, { deleted: false });
            const validatedBody = checkValidations(req);
            await FeesType.findByIdAndUpdate(feesTypeId, { ...validatedBody });
            let reports = {
                "action":"Update feesType",
                "type":"FEES-TYPE",
                "deepId":feesTypeId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await FeesType.findById(feesTypeId).then((e) => {
                let feesType = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(200).send({
                    success:true,
                    data:feesType
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
            await FeesType.find(query)
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
            await FeesType.find(query)
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
                    const count = await FeesType.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },


    async delete(req, res, next) {        
        try {
            let { feesTypeId } = req.params;
            let feesType = await checkExistThenGet(feesTypeId, FeesType);
            feesType.deleted = true;
            await feesType.save();
            let reports = {
                "action":"Delete feesType",
                "type":"FEES-TYPE",
                "deepId":feesTypeId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}