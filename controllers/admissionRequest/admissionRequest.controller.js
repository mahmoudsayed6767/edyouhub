import AdmissionRequest from "../../models/admissionRequest/admissionRequest.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import { checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformAdmissionRequest,transformAdmissionRequestById } from "../../models/admissionRequest/transformAdmissionRequest";
import Admission from "../../models/admission/admission.model";
import City from "../../models/city/city.model";
import Country from "../../models/country/country.model";
import Area from "../../models/area/area.model";
import Grade from "../../models/grade/grade.model";
import BusinessManagement from "../../models/business/businessManagement.model"
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Business from "../../models/business/business.model";
const populateQuery = [
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    { path: 'business', model: 'business' },
    { path: 'grade', model: 'grade' },
    { path: 'owner', model: 'user' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('firstName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('firstName.required', { value});
            }),
            body('secondName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('secondName.required', { value});
            }),
            body('familyName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('familyName.required', { value});
            }),
            body('birthday').not().isEmpty().withMessage((value, { req}) => {
                return req.__('birthday.required', { value});
            }),
            body('age').not().isEmpty().withMessage((value, { req}) => {
                return req.__('age.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('age.numeric', { value});
            }),
            body('grade').not().isEmpty().withMessage((value, { req}) => {
                return req.__('grade.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('grade.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Grade.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('grade.invalid'));
                else
                    return true;
            }),
            body('country').not().isEmpty().withMessage((value, { req}) => {
                return req.__('country.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('country.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Country.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').not().isEmpty().withMessage((value, { req}) => {
                return req.__('city.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await City.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').not().isEmpty().withMessage((value, { req}) => {
                return req.__('area.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('area.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Area.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('area.invalid'));
                else
                    return true;
            }),
            body('fatherInfo.firstName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoFirstName.required', { value});
            }),
            body('fatherInfo.secondName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoSecondName.required', { value});
            }),
            body('fatherInfo.familyName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoFamilyName.required', { value});
            }),
            body('fatherInfo.age').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoAge.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('fatherInfoAge.numeric', { value});
            }),
            body('fatherInfo.profession').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoProfession.required', { value});
            }),
            body('fatherInfo.phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoPhone.required', { value});
            }),
            body('fatherInfo.email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fatherInfoEmail.required', { value});
            }),
            body('motherInfo.firstName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoFirstName.required', { value});
            }),
            body('motherInfo.secondName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoSecondName.required', { value});
            }),
            body('motherInfo.familyName').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoFamilyName.required', { value});
            }),
            body('motherInfo.age').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoAge.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('motherInfoAge.numeric', { value});
            }),
            body('motherInfo.profession').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoProfession.required', { value});
            }),
            body('motherInfo.phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoPhone.required', { value});
            }),
            body('motherInfo.email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('motherInfoEmail.required', { value});
            }),
            body('haveSibling').not().isEmpty().withMessage((value, { req}) => {
                return req.__('haveSibling.required', { value});
            }),
            
        ];
        return validations;
    },
    //add new admissionRequest
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let {admissionId} = req.params
            let admission = await checkExistThenGet(admissionId,Admission,{ deleted: false})
            validatedBody.admission = admissionId
            validatedBody.business = admission.business
            validatedBody.owner = req.user._id
            let admissionRequest = await AdmissionRequest.create({ ...validatedBody });
            let reports = {
                "action":"Create New admissionRequest",
                "type":"ADMISSION-REQUEST",
                "deepId":admissionRequest.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:admissionRequest
            });
        } catch (error) {
            next(error);
        }
    },
    //add new admissionRequest to waiting list
    async createToWaitingList(req, res, next) {
        try {
            let {businessId} = req.params
            const validatedBody = checkValidations(req);
            validatedBody.business = businessId
            validatedBody.owner = req.user._id
            validatedBody.type = "WAITING-LIST"
            let admissionRequest = await AdmissionRequest.create({ ...validatedBody });
            let reports = {
                "action":"Create New admissionRequest",
                "type":"ADMISSION-REQUEST",
                "deepId":admissionRequest.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:admissionRequest
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
            let { admissionRequestId } = req.params;
            let admissionRequest = await checkExistThenGet(admissionRequestId,AdmissionRequest, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(admissionRequest.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            await AdmissionRequest.findById(admissionRequestId)
            .populate(populateQuery)
            .then(async(e) => {
                let admissionRequest = await transformAdmissionRequestById(e,lang)
                res.send({
                    success:true,
                    data:admissionRequest
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update admissionRequest
    async update(req, res, next) {
        try {
            let { admissionRequestId } = req.params;
            let admissionRequest = await checkExistThenGet(admissionRequestId,AdmissionRequest, { deleted: false })
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(admissionRequest.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            await AdmissionRequest.findByIdAndUpdate(admissionRequestId, { ...validatedBody });
            let reports = {
                "action":"Update admissionRequest",
                "type":"ADMISSION-REQUEST",
                "deepId":admissionRequestId,
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
            let {country,city,area,grade,business,owner,status,admission} = req.query;

            let query = {deleted: false }
            if(country) query.country = country
            if(city) query.city = city
            if(area) query.area = area
            if(grade) query.grade = grade
            if(business) query.business = business
            if(admission) query.admission = admission
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
            await AdmissionRequest.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformAdmissionRequest(e,lang)
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
            let {country,city,area,grade,business,owner,status,admission} = req.query;
            let query = {deleted: false }
            if(country) query.country = country
            if(city) query.city = city
            if(area) query.area = area
            if(grade) query.grade = grade
            if(business) query.business = business
            if(admission) query.admission = admission

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
            await AdmissionRequest.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformAdmissionRequest(e,lang)
                        newdata.push(index)
                    }))
                    const count = await AdmissionRequest.countDocuments(query);
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
            let { admissionRequestId } = req.params;
            let admissionRequest = await checkExistThenGet(admissionRequestId, AdmissionRequest);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(admissionRequest.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            admissionRequest.deleted = true;
            await AdmissionRequest.save();
            let reports = {
                "action":"Delete admission Request",
                "type":"ADMISSION-REQUEST",
                "deepId":admissionRequestId,
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
            let { admissionRequestId } = req.params;
            let admissionRequest = await checkExistThenGet(admissionRequestId, AdmissionRequest);
            let business = await checkExistThenGet(admissionRequest.business,Business);
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.admission.supervisors)
                }
                if(!isInArray(supervisors,req.user.type))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            admissionRequest.status = "ACCEPTED";
            await admissionRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: admissionRequest.owner, 
                fromUser: req.user, 
                text: ' EdHub',
                subject: business.id,
                subjectType: 'Admission Request Status',
                info:'ADMISSION-REQUEST'
            });
            let notif = {
                "description_en":businessManagement.acceptanceLetter,
                "description_ar":businessManagement.acceptanceLetter,
                "title_en":'Your business Request Has Been Confirmed ',
                "title_ar":' تمت الموافقه على طلب  الخاص بك',
                "type":'ADMISSION-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:admissionRequest.owner,admissionRequest:admissionRequest.id});
            let reports = {
                "action":"accept admissionRequest",
                "type":"ADMISSION-REQUEST",
                "deepId":admissionRequestId,
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
            let { admissionRequestId } = req.params;
            let admissionRequest = await checkExistThenGet(admissionRequestId, AdmissionRequest);
            let business = await checkExistThenGet(admissionRequest.business,Business);
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.admission.supervisors)
                }
                if(!isInArray(supervisors,req.user.type))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            admissionRequest.status = "REJECTED";
            await admissionRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: admissionRequest.owner, 
                fromUser: req.user, 
                text: ' EdHub',
                subject: business.id,
                subjectType: 'Admission Request Status',
                info:'ADMISSION-REQUEST'
            });
            let notif = {
                "description_en":businessManagement.rejectionLetter,
                "description_ar":businessManagement.rejectionLetter,
                "title_en":'Your business Request Has Been Rejected ',
                "title_ar":' تم رفض الطلب الخاص بك',
                "type":'ADMISSION-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:admissionRequest.owner,admissionRequest:admissionRequest.id});
            let reports = {
                "action":"قثتثؤف admissionRequest",
                "type":"ADMISSION-REQUEST",
                "deepId":admissionRequestId,
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