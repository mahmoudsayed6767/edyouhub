import ApiResponse from "../../helpers/ApiResponse";
import Premium from "../../models/premium/premium.model";
import Fees from "../../models/fees/fees.model"
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import { checkValidations,convertLang } from "../shared/shared.controller";
import { body } from "express-validator/check";
import i18n from "i18n";
import {transformFees} from "../../models/fees/transformFees"
import EducationInstitution from "../../models/education institution/education institution.model";
import EducationSystem from "../../models/education system/education system.model";
import Student from "../../models/student/student.model"
import Category from "../../models/category/category.model"

const populateQuery = [
    { path: 'educationInstitution', model: 'educationInstitution'},
    {
        path: 'student', model: 'student',
        populate: { path: 'sector', model: 'category' },
    },
    {
        path: 'student', model: 'student',
        populate: { path: 'subSector', model: 'category' },
    },
    {
        path: 'student', model: 'student',
        populate: { path: 'educationSystem', model: 'educationSystem' },
    }
];
export default {

    async findAll(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req) 
            let {educationInstitution,student} = req.query
            let query = {deleted: false};
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(student) query.student = student
            let sortd = {createdAt: -1}
            await Fees.find(query)
            .populate(populateQuery)
            .sort(sortd)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformFees(e,lang)
                    newdata.push(index)
                }))
                res.send({
                    success:true,
                    data:newdata
                });
            })

        } catch (err) {
            next(err);
        }
    },
    async findAllPagenation(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {educationInstitution,student} = req.query
            let query = {deleted: false};
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(student) query.student = student
            let sortd = {createdAt: -1}
            await Fees.find(query)
            .populate(populateQuery)
            .sort(sortd)
            .limit(limit)
            .skip((page - 1) * limit)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformFees(e,lang)
                    newdata.push(index)
                }))
                const count = await Fees.countDocuments(query);
                const pageCount = Math.ceil(count / limit);
                res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
            })

        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {
        try {
            convertLang(req)
            //get lang
            let lang = i18n.getLocale(req)
            let { feesId } = req.params;
            await checkExist(feesId, Fees, { deleted: false });
            await Fees.findById(feesId).populate(populateQuery).then(async(e) => {
                let index = await transformFees(e,lang)
                res.send({
                    success:true,
                    data:index
                });
            })
        } catch (err) {
            next(err);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('educationInstitution').trim().escape().not().isEmpty().withMessage((value, { req}) => {
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
            body('sector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('sector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('sector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('sector.invalid'));
                else
                    return true;
            }),
            body('subSector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('subSector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('subSector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('subSector.invalid'));
                else
                    return true;
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
            //payments
            body('payments').trim().escape().optional()
            .custom(async (payments, { req }) => {
                convertLang(req)
                for (let payment of payments) {
                    body('cost').not().isEmpty().withMessage((value) => {
                        return req.__('cost.required', { value});
                    }).isNumeric().withMessage((value) => {
                        return req.__('cost.numeric', { value});
                    }),
                    body('installmentDate').not().isEmpty().withMessage((value) => {
                        return req.__('installmentDate.required', { value});
                    }).isISO8601().withMessage((value) => {
                        return req.__('installmentDate.invalid', { value});
                    })
                }
                return true;
            }),
           
        ];
        return validations;
    },
    async create(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            //create student
            let theStudent = await Student.create({
                educationInstitution:validatedBody.educationInstitution,
                studentName:validatedBody.studentName,
                sector:validatedBody.sector,
                subSector:validatedBody.subSector,
                educationSystem:validatedBody.educationSystem,
                year:validatedBody.year,
                busFees:validatedBody.busFees,
                tuitionFees:validatedBody.tuitionFees,

            });
            let reports1 = {
                "action":"Create student",
                "type":"STUDENTS",
                "deepId":theStudent.id,
                "user": req.user._id
            };
            await Report.create({...reports1 });
            //create fees
            let fees = await Fees.create({student:theStudent._id,educationInstitution:validatedBody.educationInstitution})
            //////////////////////////create premiums////////////////////////////
            let payments = validatedBody.payments
            for(var i=0; i < payments.length; i++) {
                let payment = payments[i];
                let installmentDate = payment.installmentDate;
                console.log("installmentDate",installmentDate)

                let lastMonth = false
                if(payments.length - 1 == i) lastMonth = true

                let thePremium = await Premium.create({
                    fees:fees.id,
                    type:'FEES',
                    receiptNum:i+1,
                    student: theStudent._id,
                    installmentDate:installmentDate,
                    cost:payment.cost ,
                    lastPremium:lastMonth
                });
                let reports = {
                    "action":"Create premium",
                    "type":"PREMIUMS",
                    "deepId":thePremium.id,
                    "user": req.user._id
                };
                await Report.create({...reports });
            }
            let reports = {
                "action":"Create Fees",
                "type":"FEES",
                "deepId":fees.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    validateAddMany(isUpdate = false) {
        let validations = [
            body('fees').trim().escape().optional()
            .custom(async (fees, { req }) => {
                convertLang(req)
                for (let feesId of fees) {
                    body('educationInstitution').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('educationInstitution.required', { value});
                    }),
                    body('studentName').not().isEmpty().withMessage((value) => {
                        return req.__('studentName.required', { value});
                    }),
                    body('sector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('sector.required', { value});
                    }).isNumeric().withMessage((value, { req}) => {
                        return req.__('sector.numeric', { value});
                    }),
                    body('subSector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('subSector.required', { value});
                    }).isNumeric().withMessage((value, { req}) => {
                        return req.__('subSector.numeric', { value});
                    }),
                    body('educationSystem').not().isEmpty().withMessage((value) => {
                        return req.__('educationSystem.required', { value});
                    }).isNumeric().withMessage((value) => {
                        return req.__('educationSystem.numeric', { value});
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
                    //payments
                    body('payments').trim().escape().optional()
                    .custom(async (payments, { req }) => {
                        convertLang(req)
                        for (let payment of payments) {
                            body('cost').not().isEmpty().withMessage((value) => {
                                return req.__('cost.required', { value});
                            }).isNumeric().withMessage((value) => {
                                return req.__('cost.numeric', { value});
                            }),
                            body('educationSystem').not().isEmpty().withMessage((value) => {
                                return req.__('educationSystem.required', { value});
                            }).isNumeric().withMessage((value) => {
                                return req.__('educationSystem.numeric', { value});
                            }),
                            body('installmentDate').not().isEmpty().withMessage((value) => {
                                return req.__('installmentDate.required', { value});
                            }).isISO8601().withMessage((value) => {
                                return req.__('installmentDate.invalid', { value});
                            })
                        }
                        return true;
                    })
                   
                }
                return true;
            }),
            
        ];
        return validations;
    },
    async addMany(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const data = checkValidations(req);
            for (let validatedBody of data.fees) {
                await checkExist(validatedBody.educationInstitution, EducationInstitution,{ deleted: false})
                await checkExist(validatedBody.sector, Category,{ deleted: false});
                await checkExist(validatedBody.subSector, Category,{ deleted: false});
                await checkExist(validatedBody.educationSystem, EducationSystem,{ deleted: false});
                //create student
                let theStudent = await Student.create({
                    educationInstitution:validatedBody.educationInstitution,
                    studentName:validatedBody.studentName,
                    sector:validatedBody.sector,
                    subSector:validatedBody.subSector,
                    educationSystem:validatedBody.educationSystem,
                    year:validatedBody.year,
                    busFees:validatedBody.busFees,
                    tuitionFees:validatedBody.tuitionFees,

                });
                let reports1 = {
                    "action":"Create student",
                    "type":"STUDENTS",
                    "deepId":theStudent.id,
                    "user": req.user._id
                };
                await Report.create({...reports1 });
                //create fees
                let fees = await Fees.create({student:theStudent._id,educationInstitution:validatedBody.educationInstitution})
                //////////////////////////create premiums////////////////////////////
                let payments = validatedBody.payments
                for(var i=0; i < payments.length; i++) {
                    let payment = payments[i];
                    let installmentDate = payment.installmentDate;
                    console.log("installmentDate",installmentDate)

                    let lastMonth = false
                    if(payments.length - 1 == i) lastMonth = true

                    await Premium.create({
                        fees:fees.id,
                        type:'FEES',
                        receiptNum:i+1,
                        student: theStudent._id,
                        installmentDate:installmentDate,
                        cost:payment.cost ,
                        lastPremium:lastMonth
                    });
                }
                let reports = {
                    "action":"Create Fees",
                    "type":"FEES",
                    "deepId":fees.id,
                    "user": req.user._id
                };
                await Report.create({...reports });
            }
            
            res.status(201).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    validateAddManyExistStudents(isUpdate = false) {
        let validations = [
            body('fees').trim().escape().optional()
            .custom(async (fees, { req }) => {
                convertLang(req)
                for (let feesId of fees) {
                    await checkExist(feesId.educationInstitution,EducationInstitution, { deleted: false })
                    await checkExist(feesId.student, Student,{ deleted: false})
                    body('educationInstitution').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('educationInstitution.required', { value});
                    }),
                    body('student').not().isEmpty().withMessage((value) => {
                        return req.__('student.required', { value});
                    }).isNumeric().withMessage((value) => {
                        return req.__('student.numeric', { value});
                    }),
                    //payments
                    body('payments').trim().escape().optional()
                    .custom(async (payments, { req }) => {
                        convertLang(req)
                        for (let payment of payments) {
                            body('cost').not().isEmpty().withMessage((value) => {
                                return req.__('cost.required', { value});
                            }).isNumeric().withMessage((value) => {
                                return req.__('cost.numeric', { value});
                            }),
                            body('educationSystem').not().isEmpty().withMessage((value) => {
                                return req.__('educationSystem.required', { value});
                            }).isNumeric().withMessage((value) => {
                                return req.__('educationSystem.numeric', { value});
                            }),
                            body('installmentDate').not().isEmpty().withMessage((value) => {
                                return req.__('installmentDate.required', { value});
                            }).isISO8601().withMessage((value) => {
                                return req.__('installmentDate.invalid', { value});
                            })
                        }
                        return true;
                    })
                   
                }
                return true;
            }),
            
        ];
        return validations;
    },
    async addManyExistStudents(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const data = checkValidations(req);
            for (let validatedBody of data.fees) {
                await checkExist(validatedBody.educationInstitution, EducationInstitution,{ deleted: false})
                let theStudent = await checkExistThenGet(validatedBody.student, Student,{ deleted: false});
                //create fees
                let fees = await Fees.create({student:theStudent._id,educationInstitution:validatedBody.educationInstitution})
                //////////////////////////create premiums////////////////////////////
                let payments = validatedBody.payments
                for(var i=0; i < payments.length; i++) {
                    let payment = payments[i];
                    let installmentDate = payment.installmentDate;
                    console.log("installmentDate",installmentDate)

                    let lastMonth = false
                    if(payments.length - 1 == i) lastMonth = true

                    await Premium.create({
                        fees:fees.id,
                        type:'FEES',
                        receiptNum:i+1,
                        student: theStudent._id,
                        installmentDate:installmentDate,
                        cost:payment.cost ,
                        lastPremium:lastMonth
                    });
                }
                let reports = {
                    "action":"Create Fees",
                    "type":"FEES",
                    "deepId":fees.id,
                    "user": req.user._id
                };
                await Report.create({...reports });
            }
            
            res.status(201).send({success:true});
        } catch (err) {
            next(err);
        }
    },

   
    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
                
            let { feesId } = req.params;
            let fees = await checkExistThenGet(feesId, Fees, { deleted: false });
            fees.deleted = true;
            await fees.save();
            
            let reports = {
                "action":"Delete fees",
                "type":"FEES",
                "deepId":feesId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },

};