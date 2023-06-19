import Admission from "../../models/admission/admission.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet ,isInArray} from "../../helpers/CheckMethods";
import i18n from "i18n";
import Grade from "../../models/grade/grade.model";
import { transformAdmission,transformAdmissionById } from "../../models/admission/transformAdmission";
import Business from "../../models/business/business.model";
import Post from "../../models/post/post.model";
import Faculty from "../../models/faculty/faculty.model";
import BusinessManagement from "../../models/business/businessManagement.model"

const populateQuery = [
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' },
    { path: 'business', model: 'business' },
    { path: 'grades', model: 'grade' },
    { path: 'faculties.grades', model: 'grade' },
    { path: 'faculties.faculty', model: 'faculty' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('title').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title.required', { value});
            }),
            body('description').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description.required', { value});
            }),
            body('fromDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fromDate.required', { value});
            }).isISO8601().withMessage((value, { req})=>{
                return req.__('date.invalid', { value});
            }),
            body('toDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('toDate.required', { value});
            }).isISO8601().withMessage((value, { req})=>{
                return req.__('date.invalid', { value});
            }),
            body('maxApplications').not().isEmpty().withMessage((value, { req}) => {
                return req.__('maxApplications.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('maxApplications.numeric', { value});
            }),
            body('maxAcceptance').not().isEmpty().withMessage((value, { req}) => {
                return req.__('maxAcceptance.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('maxAcceptance.numeric', { value});
            }),
            body('business').not().isEmpty().withMessage((value, { req}) => {
                return req.__('business.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('business.numeric', { value});
            }),
            body('grades').optional()
            .custom(async (grades, { req }) => {
                if(grades.length == 0 && !req.body.faculties){
                    throw new Error(req.__('grades.required'));

                }
                for (let value of grades) {
                    if (!await Grade.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('grade.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('allGrades').optional(),
            body('faculties').optional()
            .custom(async (faculties, { req }) => {
                for (let faculty of faculties) {
                    body('grades').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('grades.required', { value});
                    })
                    .custom(async (grades, { req }) => {
                        
                        for (let value of grades) {
                            if (!await Grade.findOne({_id:value,deleted:false}))
                                throw new Error(req.__('grade.invalid'));
                            else
                                return true;
                        }
                        return true;
                    }),
                    body('faculty').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('faculty.required', { value});
                    }).isNumeric().withMessage((value, { req}) => {
                        return req.__('faculty.numeric', { value});
                    }).custom(async (value, { req }) => {
                        if (!await Faculty.findOne({_id:value,deleted:false}))
                            throw new Error(req.__('faculty.invalid'));
                        else
                            return true;
                    })
                }
                return true;
            }),
            body('allFaculties').optional(),
            
        ];
        return validations;
    },
    //add new admission
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.admission.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            let admission = await Admission.create({ ...validatedBody });
            await Post.create({
                admission: admission.id,
                business:business.id,
                owner:req.user._id,
                ownerType:'BUSINESS',
                type:'ADMISSION',
                startDate:admission.fromDate,
                toDate:admission.toDate,
                content:admission.description
            });
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
            let { admissionId } = req.params;
            await checkExist(admissionId,Admission, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.admission.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            await Admission.findByIdAndUpdate(admissionId, { ...validatedBody });
            let thePost  = await Post.findOne({admission:admissionId})
            thePost.startDate = validatedBody.fromDate
            thePost.toDate = validatedBody.toDate
            thePost.description = validatedBody.description
            await thePost.save();
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
            //get lang
            let lang = i18n.getLocale(req)
            let {search,educationInstitution,educationSystem,business,status} = req.query;

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
            if(status) query.status = status

            await Admission.find(query).populate(populateQuery)
                .sort({ _id: -1 })
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
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {search,educationInstitution,educationSystem,business,status} = req.query;

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
            if(status) query.status = status

            await Admission.find(query).populate(populateQuery)
                .sort({ _id: -1 })
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
            let { admissionId } = req.params;
            
            let admission = await checkExistThenGet(admissionId, Admission);
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:admission.business})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.admission.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
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