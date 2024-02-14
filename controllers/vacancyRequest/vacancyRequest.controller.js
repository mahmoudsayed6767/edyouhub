import VacancyRequest from "../../models/vacancyRequest/vacancyRequest.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations,handleImg} from "../shared/shared.controller";
import {checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformVacancyRequest,transformVacancyRequestById } from "../../models/vacancyRequest/transformVacancyRequest";
import Vacancy from "../../models/vacancy/vacancy.model";
import BusinessManagement from "../../models/business/businessManagement.model"
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Business from "../../models/business/business.model";
import ApiError from "../../helpers/ApiError";

const populateQuery = [
    { path: 'owner', model: 'user' },
    {
        path: 'business', model: 'business',
        populate: { path: 'package', model: 'package' },
    },
    { path: 'vacancy', model: 'vacancy' },

];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('fullname').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fullname.required', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }),
            body('age').not().isEmpty().withMessage((value, { req}) => {
                return req.__('age.required', { value});
            }),
            
        ];
        return validations;
    },
    //add new vacancyRequest
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let {vacancyId} = req.params;
            let vacancy = await checkExistThenGet(vacancyId,Vacancy,{ deleted: false})
            validatedBody.business = vacancy.business
            validatedBody.vacancy = vacancyId
            validatedBody.owner = req.user._id
            let attachment = await handleImg(req, { attributeName: 'attachment'});
            validatedBody.attachment = attachment;
            let vacancyRequest = await VacancyRequest.create({ ...validatedBody });
            let reports = {
                "action":"Create New vacancyRequest",
                "type":"VACANCY-REQUEST",
                "deepId":vacancyRequest.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:vacancyRequest
            });
        } catch (error) {
            next(error);
        }
    },
    //add new vacancyRequest for waiting list
    async createToWaitingList(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let {businessId} = req.params;
            validatedBody.business = businessId
            validatedBody.owner = req.user._id
            validatedBody.type = "WAITING-LIST"

            let attachment = await handleImg(req, { attributeName: 'attachment'});
            validatedBody.attachment = attachment;
            let vacancyRequest = await VacancyRequest.create({ ...validatedBody });
            let reports = {
                "action":"Create New vacancyRequest",
                "type":"VACANCY-REQUEST",
                "deepId":vacancyRequest.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:vacancyRequest
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async getById(req, res, next) {        
        try {
             //get lang
            let lang = i18n.getLocale(req)
            let { vacancyRequestId } = req.params;
            let vacancyRequest =  await checkExistThenGet(vacancyRequestId,VacancyRequest, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(vacancyRequest.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            await VacancyRequest.findById(vacancyRequestId)
            .populate(populateQuery)
            .then(async(e) => {
                let vacancyRequest = await transformVacancyRequestById(e,lang)
                res.send({
                    success:true,
                    data:vacancyRequest
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update vacancyRequest
    async update(req, res, next) {        
        try {
            let { vacancyRequestId } = req.params;
            let vacancyRequest =  await checkExistThenGet(vacancyRequestId,VacancyRequest, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(vacancyRequest.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            await VacancyRequest.findByIdAndUpdate(vacancyRequestId, { ...validatedBody });
            let reports = {
                "action":"Update vacancyRequest",
                "type":"VACANCY-REQUEST",
                "deepId":vacancyRequestId,
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
            //get lang
            let lang = i18n.getLocale(req)
            let {owner,status,business,vacancy,type} = req.query;
            let query = {deleted: false}
            
            if(owner) {
                if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                    if(req.user.type == "USER"){
                        query.owner = req.user._id
                    }
                }else{
                    query.owner = owner
                }
            }
            if(status) query.status = status
            if(business) query.business = business
            if(vacancy) query.vacancy = vacancy
            if(type) query.type = type
            await VacancyRequest.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformVacancyRequest(e,lang)
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
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {owner,status,business,vacancy,type} = req.query;
            let query = {deleted: false }
            if(owner) {
                if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                    if(req.user.type == "USER"){
                        query.owner = req.user._id
                    }
                }else{
                    query.owner = owner
                }
            }
            if(status) query.status = status
            if(business) query.business = business
            if(vacancy) query.vacancy = vacancy
            if(type) query.type = type

            await VacancyRequest.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformVacancyRequest(e,lang)
                        newdata.push(index)
                    }))
                    const count = await VacancyRequest.countDocuments(query);
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
            let { vacancyRequestId } = req.params;
            let vacancyRequest = await checkExistThenGet(vacancyRequestId, vacancyRequest);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(vacancyRequest.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            vacancyRequest.deleted = true;
            await VacancyRequest.save();
            let reports = {
                "action":"Delete vacancyRequest",
                "type":"VACANCY-REQUEST",
                "deepId":vacancyRequestId,
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
            let { vacancyRequestId } = req.params;
            let vacancyRequest = await checkExistThenGet(vacancyRequestId, VacancyRequest);
            let business = await checkExistThenGet(vacancyRequest.business,Business);
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.vacancy.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            vacancyRequest.interviewDate = req.body.interviewDate
            vacancyRequest.status = "ACCEPTED";
            await vacancyRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: vacancyRequest.owner, 
                fromUser: req.user, 
                text: 'Your business Request Has Been Confirmed ',
                subject: business.id,
                body: businessManagement.acceptanceLetter,
                info:'VACANCY-REQUEST'
            });
            let notif = {
                "description_en":businessManagement.acceptanceLetter,
                "description_ar":businessManagement.acceptanceLetter,
                "title_en":'Your business Request Has Been Confirmed ',
                "title_ar":' تمت الموافقه على طلب  الخاص بك',
                "type":'VACANCY-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:vacancyRequest.owner,vacancyRequest:vacancyRequest.id});
            let reports = {
                "action":"accept vacancyRequest",
                "type":"VACANCY-REQUEST",
                "deepId":vacancyRequestId,
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
            let { vacancyRequestId } = req.params;
            let vacancyRequest = await checkExistThenGet(vacancyRequestId, VacancyRequest);
            let business = await checkExistThenGet(vacancyRequest.business,Business);
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.vacancy.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            vacancyRequest.status = "REJECTED";
            vacancyRequest.rejectReason = req.body.rejectReason

            await vacancyRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: vacancyRequest.owner, 
                fromUser: req.user, 
                text: 'Your business Request Has Been Rejected ',
                subject: business.id,
                body: businessManagement.rejectionLetter,
                info:'VACANCY-REQUEST'
            });
            let notif = {
                "description_en":businessManagement.rejectionLetter,
                "description_ar":businessManagement.rejectionLetter,
                "title_en":'Your business Request Has Been Rejected ',
                "title_ar":' تم رفض الطلب الخاص بك',
                "type":'VACANCY-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:vacancyRequest.owner,vacancyRequest:vacancyRequest.id});
            let reports = {
                "action":"قثتثؤف vacancyRequest",
                "type":"VACANCY-REQUEST",
                "deepId":vacancyRequestId,
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