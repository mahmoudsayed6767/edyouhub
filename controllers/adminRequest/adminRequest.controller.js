import AdminRequest from "../../models/adminRequest/adminRequest.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import Report from "../../models/reports/report.model";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { transformAdminRequest } from "../../models/adminRequest/transformAdminRequest"
import BusinessManagement from "../../models/business/businessManagement.model"
import Business from "../../models/business/business.model";

const populateQuery = [
    {
        path: 'business',model: 'business',
        populate: { path: 'package', model: 'package' },
    },
    { path: 'to', model: 'user' },
];
export default {
    async getAllPaginated(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20 ;
            let {business,to } = req.query

            let query = {deleted: false };
            if(to) query.to = to
            if(business) query.business = business
            await AdminRequest.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformAdminRequest(e,lang)
                        newdata.push(index);
                    }))
                    const count = await AdminRequest.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
    
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                });


        } catch (err) {
            next(err);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('to').not().isEmpty().withMessage((value, { req }) => {
                return req.__('to.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('to.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('to.invalid'));
                else
                    return true;
            }),
            body('business').not().isEmpty().withMessage((value, { req }) => {
                return req.__('business.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('business.numeric', { value });
            }),
            body('service').optional().isIn(['ADMISSION', 'VACANCY', 'EVENT', 'COURSES']).withMessage((value, { req }) => {
                return req.__('service.invalid', { value });
            }),

        ];
        return validations;
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);

            let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (business.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            validatedBody.from = business.owner
            let createdRequest = await AdminRequest.create({ ...validatedBody});

            let reports = {
                "action":"Create Admin Request",
                "type":"BUSINESS",
                "deepId":validatedBody.business,
                "user": req.user._id
            };
            await Report.create({...reports});
            
            res.status(200).send({success: true,data:createdRequest});
        } catch (err) {
            next(err);
        }
    },
    async accept(req, res, next) {        
        try {
            let { adminRequestId } = req.params;
            let adminRequest = await checkExistThenGet(adminRequestId, AdminRequest, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (adminRequest.from != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(adminRequest.status == "PENDING"){
                let businessManagement = await BusinessManagement.findOne({ business: adminRequest.business, deleted: false })
            
                adminRequest.status = 'ACCEPTED';
                //add admin to business management
                let arr   
                if (adminRequest.service == "ADMISSION") arr = businessManagement.admission.supervisors;
                if (adminRequest.service == "VACANCY") arr = businessManagement.vacancy.supervisors;
                if (adminRequest.service == "EVENT") arr = businessManagement.events.supervisors;
                if (adminRequest.service == "COURSE") arr = businessManagement.courses.supervisors;
    
                arr.push(adminRequest.to)
    
                if (validatedBody.service == "ADMISSION")businessManagement.admission.supervisors = arr;
                if (validatedBody.service == "VACANCY")  businessManagement.vacancy.supervisors = arr;
                if (validatedBody.service == "EVENT") businessManagement.events.supervisors = arr;
                if (validatedBody.service == "COURSE") businessManagement.courses.supervisors = arr;
                await businessManagement.save();

                let supervisor = await checkExistThenGet(adminRequest.to,User,{deleted:false});
                arr = supervisor.managmentBusinessAccounts
                var found = arr.find(e => e == adminRequest.business)
                if(!found){
                    supervisor.managmentBusinessAccounts.push(adminRequest.business);
                }
                await supervisor.save()
                await adminRequest.save()
                let reports = {
                    "action":"accept Admin Request",
                    "type":"BUSINESS",
                    "deepId":adminRequestId,
                    "user": req.user._id
                };
                await Report.create({...reports});
            }
            res.status(200).send({success: true});
            
        } catch (err) {
            next(err);
        }
    },
    async reject(req, res, next) {        
        try {
            let { adminRequestId } = req.params;
            let adminRequest = await checkExistThenGet(adminRequestId, AdminRequest, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (adminRequest.from != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(adminRequest.status == "PENDING"){
                adminRequest.status = 'REJECTED'
                await adminRequest.save()
                let reports = {
                    "action":"reject Admin Request",
                    "type":"BUSINESS",
                    "deepId":adminRequestId,
                    "user": req.user._id
                };
                await Report.create({...reports});
                
            }
            res.status(200).send({success: true});
        } catch (err) {
            next(err);
        }
    },
    
    async delete(req, res, next) {        
        try {
            let { adminRequestId } = req.params;
            let adminRequest = await checkExistThenGet(adminRequestId, AdminRequest);
            adminRequest.deleted = true;
            await adminRequest.save();
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}