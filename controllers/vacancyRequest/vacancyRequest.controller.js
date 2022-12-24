import VacancyRequest from "../../models/vacancyRequest/vacancyRequest.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang,handleImg} from "../shared/shared.controller";
import { checkExist,checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformVacancyRequest,transformVacancyRequestById } from "../../models/vacancyRequest/transformVacancyRequest";
import Vacancy from "../../models/vacancy/vacancy.model";
const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'business', model: 'business' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('fullname').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('fullname.required', { value});
            }),
            body('phone').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }),
            body('age').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('age.required', { value});
            }),
            
        ];
        return validations;
    },
    //add new vacancyRequest
    async create(req, res, next) {
        try {
            convertLang(req)
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
    //get by id
    async getById(req, res, next) {
        try {
            convertLang(req)
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
            convertLang(req)
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
            convertLang(req)
            //get lang
            let lang = i18n.getLocale(req)
            let {owner,status,business} = req.query;
            let {vacancyId} = req.params
            let query = {deleted: false ,vacancy:vacancyId}
            
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
            await VacancyRequest.find(query).populate(populateQuery)
                .sort({ _id: 1 })
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
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {owner,status,business} = req.query;
            let {vacancyId} = req.params
            let query = {deleted: false ,vacancy:vacancyId}
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
            await VacancyRequest.find(query).populate(populateQuery)
                .sort({ _id: 1 })
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
            convertLang(req)
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

   

}