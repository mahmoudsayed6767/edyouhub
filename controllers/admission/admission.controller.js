import Admission from "../../models/admission/admission.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations,convertLang} from "../shared/shared.controller";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Grade from "../../models/grade/grade.model";
import { transformAdmission,transformAdmissionById } from "../../models/admission/transformAdmission";
import Business from "../../models/business/business.model";
const populateQuery = [
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' },
    { path: 'business', model: 'business' },
    { path: 'grades', model: 'grade' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('title').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('title.required', { value});
            }),
            body('description').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('description.required', { value});
            }),
            body('fromDate').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('fromDate.required', { value});
            }).isISO8601().withMessage((value, { req})=>{
                return req.__('date.invalid', { value});
            }),
            body('toDate').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('toDate.required', { value});
            }).isISO8601().withMessage((value, { req})=>{
                return req.__('date.invalid', { value});
            }),
            body('maxApplications').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('maxApplications.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('maxApplications.numeric', { value});
            }),
            body('maxAcceptance').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('maxAcceptance.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('maxAcceptance.numeric', { value});
            }),
            body('business').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('business.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('business.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Business.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('business.invalid'));
                else
                    return true;
            }),
            body('grades').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('grades.required', { value});
            })
            .custom(async (grades, { req }) => {
                convertLang(req)
                for (let value of grades) {
                    if (!await Grade.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('grade.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            
        ];
        return validations;
    },
    //add new admission
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            let admission = await Admission.create({ ...validatedBody });
            let reports = {
                "action":"Create New admission",
                "type":"ADMISSION",
                "deepId":admission.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:admission
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
            let { admissionId } = req.params;
            
            await checkExist(admissionId, Admission, { deleted: false });

            await Admission.findById(admissionId)
            .populate(populateQuery)
            .then(async(e) => {
                let admission = await transformAdmissionById(e,lang)
                res.send({
                    success:true,
                    data:admission
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update admission
    async update(req, res, next) {
        try {
            convertLang(req)
            let { admissionId } = req.params;
            await checkExist(admissionId,Admission, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            await Admission.findByIdAndUpdate(admissionId, { ...validatedBody });
            let reports = {
                "action":"Update admission",
                "type":"ADMISSION",
                "deepId":admissionId,
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
            let {search,educationInstitution,educationSystem,business} = req.query;

            let query = {deleted: false }
             /*search  */
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {title: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {description: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(educationSystem) query.educationSystem = educationSystem
            if(business) query.business = business
            await Admission.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformAdmission(e,lang)
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
            let {search,educationInstitution,educationSystem,business} = req.query;

            let query = {deleted: false }
             /*search  */
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {title: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {description: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(educationSystem) query.educationSystem = educationSystem
            if(business) query.business = business
            await Admission.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformAdmission(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Admission.countDocuments(query);
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
            let { admissionId } = req.params;
            
            let admission = await checkExistThenGet(admissionId, Admission);
            admission.deleted = true;
            await Admission.save();
            let reports = {
                "action":"Delete admission",
                "type":"ADMISSION",
                "deepId":admissionId,
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