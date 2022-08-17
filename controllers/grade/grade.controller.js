import Grade from "../../models/grade/grade.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang} from "../shared/shared.controller";
import EducationInstitution from "../../models/education institution/education institution.model";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import EducationSystem from "../../models/education system/education system.model";
import { transformGrade } from "../../models/grade/transformGrade";
const populateQuery = [
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('name_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('name_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('educationSystem').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('educationSystem.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationSystem.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationSystem.invalid'));
                else
                    return true;
            }),
            body('educationInstitution').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationInstitution.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('educationInstitution.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationInstitution.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationInstitution.invalid'));
                else
                    return true;
            }),
            
        ];
        return validations;
    },
    //add new grade
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            let grade = await Grade.create({ ...validatedBody });
            let reports = {
                "action":"Create New grade",
                "type":"GRADE",
                "deepId":grade.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:grade
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
            let { gradeId } = req.params;
            
            await checkExist(gradeId, Grade, { deleted: false });

            await Grade.findById(gradeId)
            .populate(populateQuery)
            .then(async(e) => {
                let grade = await transformGrade(e,lang)
                res.send({
                    success:true,
                    data:grade
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update Grade
    async update(req, res, next) {
        try {
            convertLang(req)
            let { gradeId } = req.params;
            await checkExist(gradeId,Grade, { deleted: false })
            const validatedBody = checkValidations(req);
            await Grade.findByIdAndUpdate(gradeId, { ...validatedBody });
            let reports = {
                "action":"Update grade",
                "type":"GRADE",
                "deepId":gradeId,
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
            let {name,educationInstitution,educationSystem} = req.query;

            let query = {deleted: false }
             /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(educationSystem) query.educationSystem = educationSystem
            await Grade.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformGrade(e,lang)
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
            let {name,educationInstitution,educationSystem} = req.query;
            let query = {deleted: false }
             /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(educationSystem) query.educationSystem = educationSystem
            await Grade.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformGrade(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Grade.countDocuments(query);
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
            let { gradeId } = req.params;
            
            let grade = await checkExistThenGet(gradeId, Grade);
            grade.deleted = true;
            await grade.save();
            let reports = {
                "action":"Delete grade",
                "type":"GRADE",
                "deepId":gradeId,
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