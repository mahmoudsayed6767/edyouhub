import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { transformBusinessRequest } from "../../models/business/transformBusinessRequest";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import BusinessRequest from "../../models/business/businessRequest.model";
import Business from "../../models/business/business.model";
import User from "../../models/user/user.model";
const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'business', model: 'business' },
];
export default {
    //get without pagenation
    async getAll(req, res, next) {
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let {owner,business, status } = req.query;

            let query = { deleted: false }
            if (owner) query.owner = owner
            if (business) query.business = business
            if (status) query.status = status
            await BusinessRequest.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then(async(data) => {
                    var newdata = [];
                    await Promise.allSettled(data.map(async(e) => {
                        let index = await transformBusinessRequest(e, lang)
                        newdata.push(index)
                    }))
                    res.send({
                        success: true,
                        data: newdata
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //get with pagenation
    async getAllPaginated(req, res, next) {
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            
            let {owner,business, status } = req.query;

            let query = { deleted: false }
            if (owner) query.owner = owner
            if (business) query.business = business
            if (status) query.status = status
            console.log(query)
            await BusinessRequest.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformBusinessRequest(e, lang)
                        newdata.push(index)
                    }))
                    const count = await BusinessRequest.countDocuments(query);
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
            let { businessRequestId } = req.params;
            let businessRequest = await checkExistThenGet(businessRequestId, BusinessRequest);
            businessRequest.deleted = true;
            await businessRequest.save();
            let reports = {
                "action": "Delete BusinessRequest",
                "type": "BUSINESSRequest",
                "deepId": businessRequestId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('business').not().isEmpty().withMessage((value, { req}) => {
                return req.__('business.required', { value});
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('business.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await Business.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('business.invalid'));
                else
                    return true;
            }),
            body('owner').not().isEmpty().withMessage((value, { req}) => {
                return req.__('owner.required', { value});
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('owner.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('owner.invalid'));
                else
                    return true;
            }),
        ];

        return validations;
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{deleted:false});
            if(business.type != "NOT-ASSIGNED"){
                return next(new ApiError(500, i18n.__('business.isAssigned')));
            }
            if(await BusinessRequest.findOne({deleted:false,business:validatedBody.business,owner:validatedBody.owner})){
                return next(new ApiError(500, i18n.__('anRequest.exist')));
            }
            let businessRequest = await BusinessRequest.create({ ...validatedBody});
            let reports = {
                "action":"Create New assign request",
                "type":"BUSINESS",
                "deepId":businessRequest.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            return res.status(201).send({
                success:true,
            });
        } catch (error) {
            next(error);
        }
    },
    async accept(req, res, next) {
        try {
            let { businessRequestId } = req.params;
            let businessRequest = await checkExistThenGet(businessRequestId, BusinessRequest);
            
            let business = await checkExistThenGet(businessRequest.business, Business);
            businessRequest.status = 'ACCEPTED';
            business.type = 'ASSIGNED'
            business.owner = businessRequest.owner
            await business.save();
            await businessRequest.save();
            
            sendNotifiAndPushNotifi({
                targetUser: businessRequest.owner,
                fromUser: businessRequest.owner,
                text: ' EdHub',
                subject: business.id,
                subjectType: 'Business Status',
                info: 'BUSINESS'
            });
            let notif = {
                "description_en": 'Your business Request Has Been Confirmed ',
                "description_ar": '  تمت الموافقه على طلب  الخاص بك',
                "title_en": 'Your business Request Has Been Confirmed ',
                "title_ar": ' تمت الموافقه على طلب  الخاص بك',
                "type": 'BUSINESS'
            }
            await Notif.create({...notif, resource: req.user, target: businessRequest.owner, business: business.id });
            let otherRequests = await BusinessRequest.find({business:business._id,status:'PENDING',deleted:false})
            for (let request of otherRequests) {
                request.status = 'REJECTED';
                await request.save();
                sendNotifiAndPushNotifi({
                    targetUser: request.owner,
                    fromUser: request.owner,
                    text: ' EdHub',
                    subject: business.id,
                    subjectType: 'business Status',
                    info: 'BUSINESS'
                });
                let notif = {
                    "description_en": 'Your business Request Has Been Rejected ',
                    "description_ar": '   تم رفض  طلب الانضمام الخاص بك',
                    "title_en": 'Your business Request Has Been Rejected ',
                    "title_ar": ' تم رفض على طلب الانضمام الخاص بك',
                    "type": 'BUSINESS'
                }
                await Notif.create({...notif, resource: req.user, target: request.owner, business: business.id });
            }
            let reports = {
                "action": "Accept business Request",
                "type": "BUSINESS",
                "deepId": business.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    async reject(req, res, next) {
        try {
            let { businessRequestId } = req.params;
            let businessRequest = await checkExistThenGet(businessRequestId, BusinessRequest);
            if(businessRequest.status != "PENDING"){
                return next(new ApiError(500, i18n.__('businessRequest.notPending')));
            }
            let business = await checkExistThenGet(businessRequest.business, Business);
            businessRequest.status = 'REJECTED';
            await businessRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: businessRequest.owner,
                fromUser: businessRequest.owner,
                text: ' EdHub',
                subject: business.id,
                subjectType: 'business Status',
                info: 'BUSINESS'
            });
            let notif = {
                "description_en": 'Your business Request Has Been Rejected ',
                "description_ar": '   تم رفض  طلب الانضمام الخاص بك',
                "title_en": 'Your business Request Has Been Rejected ',
                "title_ar": ' تم رفض على طلب الانضمام الخاص بك',
                "type": 'BUSINESS'
            }
            await Notif.create({...notif, resource: req.user, target: businessRequest.owner, business: business.id });
            let reports = {
                "action": "Reject business Request",
                "type": "BUSINESS",
                "deepId": business.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    
}