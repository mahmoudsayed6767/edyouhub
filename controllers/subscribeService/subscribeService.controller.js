import { body } from "express-validator";
import SubscribeService from "../../models/subscribeService/subscribeService.model";
import { checkExist, checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkValidations } from "../shared/shared.controller";
import i18n from "i18n";
import Report from "../../models/reports/report.model";
import Business from "../../models/business/business.model";
import ApiError from "../../helpers/ApiError";
import {transformSubscribeService} from "../../models/subscribeService/transformSubscribeService";
const populateQuery = [
    { path:'business',model:'business'}
]
export default {
    validateBody() {
        return [
            body('service').optional().isIn(['FEES-PAYMENT','FEES-INSTALLMENT','SUPPLIES','COURSES']).withMessage((value, { req}) => {
                return req.__('service.invalid', { value});
            }),
            body('contactPersonName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('contactPersonName.required', { value});
            }),
            body('contactPersonTitle').not().isEmpty().withMessage((value, { req}) => {
                return req.__('startDate.required', { value});
            }),
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }),
            body('discount').not().isEmpty().withMessage((value, { req}) => {
                return req.__('discount.required', { value});
            })
        ]
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocales(req)
            let {businessId} = req.params
            //check if pending request exist
            await checkExist(businessId,Business,{deleted:false})
            const validatedBody = checkValidations(req);
            if(await SubscribeService.findOne({deleted:false,tatus:'PENDING',service:validatedBody.service,business:businessId})){
                return next(new ApiError(500,  i18n.__('pendingReq.exist')));
            }

            validatedBody.business = businessId
            let data = await SubscribeService.create({ ...validatedBody });
            let reports = {
                "action":"Create New Suscribe request",
                "type":"SUBSCRIBE-REQUEST",
                "deepId":data.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await SubscribeService.findById(data.id)
                .populate(populateQuery)
                .then(async(e) => {
                    let index = await transformSubscribeService(e,lang)
                    return res.status(201).send({
                        success:true,
                        data:index
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocales(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {service,status} = req.query
            let query = { deleted: false };
            if(service) query.service = service
            if(status) query.status = status
            await SubscribeService.find(query)
                .populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data)=>{
                    let newdata = []
                    await Promise.all(data.map(async(e)=>{
                        let index = await transformSubscribeService(e,lang)
                        newdata.push(index)
                    }))
                    const count = await SubscribeService.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
    
        } catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocales(req)
            let { subscribeServiceId } = req.params;
            await checkExist(subscribeServiceId,SubscribeService, { deleted: false });

            const validatedBody = checkValidations(req);
            await SubscribeService.findByIdAndUpdate(subscribeServiceId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update Subscribe Service request",
                "type":"SUBSCRIBE-REQUEST",
                "deepId":subscribeServiceId,
                "user": req.user._id
            };
            await Report.create({...reports});
            await SubscribeService.findById(subscribeServiceId)
                .populate(populateQuery)
                .then(async(e) => {
                    let index = await transformSubscribeService(e,lang)
                    return res.status(201).send({
                        success:true,
                        data:index
                    });
                })
        }
        catch (err) {
            next(err);
        }
    },
    async accept(req, res, next) {        
        try {
            let { subscribeServiceId } = req.params;
            let subscribeService = await checkExistThenGet(subscribeServiceId, SubscribeService);
            subscribeService.status = "ACCEPTED";
            let business = await checkExistThenGet(subscribeService.business,Business,{deleted:false})
            subscribeService.service.forEach(service => {
                var found = arr.find(function(element) {
                    return element == service;
                }); 
                if(!found){
                    business.services.push(service);
                }
            });
            await business.save();
            await subscribeService.save();
            let reports = {
                "action":"accept Subscribe Service request",
                "type":"SUBSCRIBE-REQUEST",
                "deepId":subscribeServiceId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    async reject(req, res, next) {        
        try {
            let { subscribeServiceId } = req.params;
            let subscribeService = await checkExistThenGet(subscribeServiceId, SubscribeService);
            subscribeService.status = "REJECTED";
            await subscribeService.save();
            let reports = {
                "action":"reject Subscribe Service request",
                "type":"SUBSCRIBE-REQUEST",
                "deepId":subscribeServiceId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {        
        try {
            let { subscribeServiceId } = req.params;
            let subscribeService = await checkExistThenGet(subscribeServiceId, SubscribeService);
            subscribeService.deleted = true;
            await subscribeService.save();
            let reports = {
                "action":"delete Subscribe Service request",
                "type":"SUBSCRIBE-REQUEST",
                "deepId":subscribeServiceId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
};