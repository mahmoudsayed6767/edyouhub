import {transformStudent} from "../../models/student/transformStudent";
import Student from "../../models/student/student.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Category from "../../models/category/category.model"
import EducationInstitution from "../../models/education institution/education institution.model";
import EducationSystem from "../../models/education system/education system.model";
import Premium from "../../models/premium/premium.model";
import { transformPremium } from "../../models/premium/transformPremium";
const populateQuery = [
    { path: 'owner', model: 'user'},
    { path: 'sector', model: 'category' },
    { path: 'subSector', model: 'category' },
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' }

];
const populatePremiumQuery = [
    { path: 'fees', model: 'fees'},
    {
        path: 'student', model: 'student',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('educationInstitution').not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationInstitution.required', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationInstitution.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationInstitution.invalid'));
                else
                    return true;
            }),
            body('studentName').not().isEmpty().withMessage((value) => {
                return req.__('studentName.required', { value});
            }),
            body('sector').not().isEmpty().withMessage((value, { req}) => {
                return req.__('sector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('sector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('sector.invalid'));
                else
                    return true;
            }),
            body('subSector').not().isEmpty().withMessage((value, { req}) => {
                return req.__('subSector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('subSector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('subSector.invalid'));
                else
                    return true;
            }),
            body('educationSystem').not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('educationSystem.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationSystem.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationSystem.invalid'));
                else
                    return true;
            }),
            body('year').not().isEmpty().withMessage((value) => {
                return req.__('year.required', { value});
            }),
            
            body('busFees').not().isEmpty().withMessage((value) => {
                return req.__('busFees.required', { value});
            }).isNumeric().withMessage((value) => {
                return req.__('busFees.numeric', { value});
            }),
            body('tuitionFees').not().isEmpty().withMessage((value) => {
                return req.__('tuitionFees.required', { value});
            }).isNumeric().withMessage((value) => {
                return req.__('tuitionFees.numeric', { value});
            }),
           
        ];
        return validations;
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let student = await Student.create({ ...validatedBody });
            let reports = {
                "action":"Create New student",
                "type":"STUDENTS",
                "deepId":student.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:student
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async findById(req, res, next) {        
        try {
             //get lang
            let lang = i18n.getLocale(req)
            let { studentId } = req.params;
            
            await checkExist(studentId, Student, { deleted: false });

            await Student.findById(studentId).populate(populateQuery).then(async(e) => {
                let student = await transformStudent(e,lang)
                let tuitionFees = [];
                let busFees = [];
                await Premium.find({deleted:false,student:studentId,type:'FEES'}).populate(populatePremiumQuery)
                    .then(async(data)=>{
                        await Promise.all(data.map(async(premium) =>{
                            let thePremium = await transformPremium(premium,lang)
                            if(thePremium.feesType == "BUS"){
                                busFees.push(thePremium)
                            }
                            if(thePremium.feesType == "TUITION"){
                                tuitionFees.push(thePremium)
                            }
                        }))
                    })
                student.busFees = busFees
                student.tuitionFees = tuitionFees
                res.send({
                    success:true,
                    data:student
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update fund
    async update(req, res, next) {        
        try {
            let { studentId } = req.params;
            await checkExist(studentId,Student, { deleted: false })
            const validatedBody = checkValidations(req);
            await Student.findByIdAndUpdate(studentId, { ...validatedBody });
            let reports = {
                "action":"Update student",
                "type":"STUDENTS",
                "deepId":studentId,
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
            let {type,sector,subSector,educationSystem,educationInstitution} = req.query;
            let query = {  deleted: false }
            if(type) query.type = type
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            if(educationInstitution) query.educationInstitution = educationInstitution
            await Student.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformStudent(e,lang)
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
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            {type,sector,subSector,educationSystem,educationInstitution} = req.query;
            let query = {  deleted: false }
            if(type) query.type = type
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            if(educationInstitution) query.educationInstitution = educationInstitution
            await Student.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformStudent(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Student.countDocuments(query);
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
            let { studentId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let student = await checkExistThenGet(studentId, Student);
            student.deleted = true;
            await student.save();
            let premiums = await Premium.find({student:studentId})
            for (let premium in premiums) {
                premium.deleted = false;
                await premium.save();
            }
            let reports = {
                "action":"Delete student",
                "type":"STUDENTS",
                "deepId":studentId,
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