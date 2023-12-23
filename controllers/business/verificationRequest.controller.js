import VerificationRequest from "../../models/verificationRequest/verificationRequest.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import Report from "../../models/reports/report.model";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet ,isInArray} from "../../helpers/CheckMethods";
import i18n from "i18n";
import { transformVerificationRequest } from "../../models/verificationRequest/transformVerificationRequest"
import Business from "../../models/business/business.model";
import Package from "../../models/package/package.model";
import { toImgUrl } from "../../utils";
import ApiError from "../../helpers/ApiError";
import moment from "moment";
const populateQuery = [
    {
        path: 'business',model: 'business',
        populate: { path: 'package', model: 'package' },
    },
    { path: 'owner', model: 'user' },
    { path: 'package', model: 'package' },
];
export default {
    async getAllPaginated(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20 ;
            let {business,status,owner } = req.query

            let query = {deleted: false };
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (req.user.type == "USER" && owner){
                    query.owner = req.user._id
                }
                if (req.user.type == "USER" && business){
                    let theBusiness = await checkExistThenGet(business,Business,{deleted: false })
                    if (req.user._id == theBusiness.owner){
                        query.business = business
                    }
                }
                if (!owner && !business){
                    query.owner = req.user._id
                }
            }else{
                if(status) query.status = status
                if(business) query.business = business
                if(owner) query.owner = owner
            }
            await VerificationRequest.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformVerificationRequest(e,lang)
                        newdata.push(index);
                    }))
                    const count = await VerificationRequest.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
    
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                });


        } catch (err) {
            next(err);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('package').not().isEmpty().withMessage((value, { req }) => {
                return req.__('package.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('package.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await Package.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('package.invalid'));
                else
                    return true;
            }),
            body('accountName').not().isEmpty().withMessage((value, { req }) => {
                return req.__('accountName.required', { value });
            }),
            body('accountNumber').not().isEmpty().withMessage((value, { req }) => {
                return req.__('accountNumber.required', { value });
            }),
            body('bankName').not().isEmpty().withMessage((value, { req }) => {
                return req.__('bankName.required', { value });
            }),
            body('bankBranch').not().isEmpty().withMessage((value, { req }) => {
                return req.__('bankBranch.required', { value });
            }),
            body('iban').not().isEmpty().withMessage((value, { req }) => {
                return req.__('iban.required', { value });
            }),
            body('swiftCode').not().isEmpty().withMessage((value, { req }) => {
                return req.__('swiftCode.required', { value });
            }),
            body('key').not().isEmpty().withMessage((value, { req }) => {
                return req.__('key.required', { value });
            })

        ];
        return validations;
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let { businessId } = req.params;
            let business = await checkExistThenGet(businessId, Business, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (business.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            validatedBody.owner = req.user._id;
            validatedBody.business = business
            if (req.files) {
                if (req.files['commercialRegistry']) {
                    let imagesList = [];
                    for (let imges of req.files['commercialRegistry']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.commercialRegistry = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('commercialRegistry.required')));
                }
                if (req.files['taxId']) {
                    let imagesList = [];
                    for (let imges of req.files['taxId']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.taxId = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('taxId.required')));
                }
                if (req.files['managerId']) {
                    let imagesList = [];
                    for (let imges of req.files['managerId']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.managerId = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('managerId.required')));
                }
            }else{
                return next(new ApiError(422, i18n.__('files.required')));
            }
            let createdRequest = await VerificationRequest.create({ ...validatedBody});

            let reports = {
                "action":"Create Verivication Request",
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
            let { verificationRequestId } = req.params;
            let verificationRequest = await checkExistThenGet(verificationRequestId, VerificationRequest, { deleted: false })
            verificationRequest.status = 'ACCEPTED'
            await verificationRequest.save();
            res.status(200).send({success: true});
            
        } catch (err) {
            next(err);
        }
    },
    async reject(req, res, next) {        
        try {
            let { verificationRequestId } = req.params;
            let verificationRequest = await checkExistThenGet(verificationRequestId, VerificationRequest, { deleted: false })
            verificationRequest.status = 'REJECTED'
            await verificationRequest.save();
            res.status(200).send({success: true});
        } catch (err) {
            next(err);
        }
    },
    
    async delete(req, res, next) {        
        try {
            let { verificationRequestId } = req.params;
            let verificationRequest = await checkExistThenGet(verificationRequestId, VerificationRequest);
            verificationRequest.deleted = true;
            await verificationRequest.save();
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}