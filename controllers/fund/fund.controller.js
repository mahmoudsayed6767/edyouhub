import Fund from "../../models/fund/fund.model";
import {transformFund,transformFundById} from "../../models/fund/transformFund";
import Student from "../../models/student/student.model";
import Premium from "../../models/premium/premium.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import EducationInstitution from "../../models/education institution/education institution.model";
import Category from "../../models/category/category.model"
import EducationSystem from "../../models/education system/education system.model";
import Setting from "../../models/setting/setting.model"
import i18n from "i18n";
import { toImgUrl } from "../../utils";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import User from "../../models/user/user.model";
const populateQuery = [
    { path: 'owner', model: 'user'},
    {
        path: 'students', model: 'student',
        populate: { path: 'sector', model: 'category' },
    },
    {
        path: 'students', model: 'student',
        populate: { path: 'subSector', model: 'category' },
    },
    {
        path: 'students', model: 'student',
        populate: { path: 'educationSystem', model: 'educationSystem' },
    },
    {
        path: 'students', model: 'student',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('fullname').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('fullname.required', { value});
            }),
            body('address').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('address.required', { value});
            }),

            body('phone').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }),
            body('job').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('job.required', { value});
            }),
            body('workPosition').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('workPosition.required', { value});
            }),
            body('personalId').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('personalId.required', { value});
            }).isIn(['NATIONAL-ID','PASSPORT','RESIDENCE']).withMessage((value, { req}) => {
                return req.__('personalId.invalid', { value});
            }),
            body('personalIdImgs').not().isEmpty().withMessage((value) => {
                return req.__('personalIdImgs.required', { value});
            }),

            body('utilityBills').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('utilityBills.required', { value});
            }).isIn(['OWNER','RENTER']).withMessage((value, { req}) => {
                return req.__('utilityBills.invalid', { value});
            }),
            body('contractImgs').optional(),
            body('billType').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('billType.required', { value});
            }),
            body('utilityBillsImgs').not().isEmpty().withMessage((value) => {
                return req.__('utilityBillsImgs.required', { value});
            }),

            body('proofIncome').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('proofIncome.required', { value});
            }).isIn(['WORK-ID','HR-LETTER','WORK-CONTRACT','BANK-ACCOUNT','COMMERCIAL-REGISTRATION','TAX-ID']).withMessage((value, { req}) => {
                return req.__('proofIncome.invalid', { value});
            }),
            body('proofIncomeImgs').not().isEmpty().withMessage((value) => {
                return req.__('proofIncomeImgs.required', { value});
            }),

            body('totalFees').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('totalFees.required', { value});
            }),
            //student
            body('theStudents').trim().escape().optional()
            .custom(async (students, { req }) => {
                convertLang(req)
                for (let student of students) {
                    await checkExist(student.sector, Category,{ deleted: false});
                    await checkExist(student.subSector, Category,{ deleted: false});
                    await checkExistThenGet(student.educationSystem, EducationSystem);
                    //await checkExistThenGet(student.educationInstitution, EducationInstitution);
                    body('studentName').not().isEmpty().withMessage((value) => {
                        return req.__('studentName.required', { value});
                    }),
                    body('type').not().isEmpty().withMessage((value) => {
                        return req.__('type.required', { value});
                    }).isIn(['INSIDE-INSTITUTION','OUTSIDE-INSTITUTION']).withMessage((value, { req}) => {
                        return req.__('type.invalid', { value});
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
                    body('educationInstitution').optional().isNumeric().withMessage((value) => {
                        return req.__('educationInstitution.numeric', { value});
                    }),
                    body('educationInstitutionName').optional(),
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
                    body('feesLetter').optional()
                }
                return true;
            }),
            
        ];
        return validations;
    },
    //add new fund
    async uploadImgs(req, res, next) {
        try {
            convertLang(req)
            let personalIdImgs = []
            let utilityBillsImgs=[]
            let proofIncomeImgs=[]
            let contractImgs=[]
            let feesLetter=[];
            if (req.files) {
                if (req.files['personalIdImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['personalIdImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    personalIdImgs = imagesList;
                }
                if (req.files['contractImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['contractImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    contractImgs = imagesList;
                }
                if (req.files['utilityBillsImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['utilityBillsImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    utilityBillsImgs = imagesList;
                }
                if (req.files['proofIncomeImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['proofIncomeImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    proofIncomeImgs = imagesList;
                }
                if (req.files['feesLetter']) {
                    let imagesList = [];
                    for (let imges of req.files['feesLetter']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    feesLetter = imagesList;
                }
            }
            res.status(201).send({
                success:true,
                personalIdImgs :personalIdImgs,
                utilityBillsImgs:utilityBillsImgs,
                proofIncomeImgs:proofIncomeImgs,
                feesLetter:feesLetter,
                contractImgs:contractImgs
            });
        } catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            validatedBody.owner = req.user._id;
            let fund = await Fund.create({ ...validatedBody });
            let educationInstitutions = []
            if(validatedBody.theStudents){
                let students = []
                await Promise.all(validatedBody.theStudents.map(async(student) => {
                    let createdStudent = await Student.create({...student})
                    students.push(createdStudent.id)
                    if(student.educationInstitution) educationInstitutions.push(student.educationInstitution)
                }));  
                
                fund.students = students
                await fund.save();
            }
            let reports = {
                "action":"Create New fund",
                "type":"FUND",
                "deepId":fund.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:fund
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async findById(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { fundId } = req.params;
            
            await checkExist(fundId, Fund, { deleted: false });

            await Fund.findById(fundId).populate(populateQuery).then(async(e) => {
                let fund = await transformFundById(e,lang)
                res.send({
                    success:true,
                    data:fund
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update fund
    async update(req, res, next) {
        try {
            convertLang(req)
            let { fundId } = req.params;
            await checkExist(fundId,Fund, { deleted: false })
            const validatedBody = checkValidations(req);
            if(validatedBody.theStudents){
                let students = []
                await Promise.all(validatedBody.theStudents.map(async(student) => {
                    let createdStudent = await Student.create({...student})
                    students.push(createdStudent.id)
                }));  
                
                validatedBody.students = students
            }
            await Fund.findByIdAndUpdate(fundId, { ...validatedBody });
            let reports = {
                "action":"Update fund",
                "type":"FUND",
                "deepId":fundId,
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
            let {student,owner,status,educationInstitution} = req.query;
            let query = {  deleted: false }
            if(student) query.students = student
            if(educationInstitution) query.educationInstitutions = educationInstitution
            if(owner) query.owner = owner
            if(status) query.status = status
            await Fund.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformFund(e,lang)
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
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            {student,owner,status,educationInstitution} = req.query;
            let query = {  deleted: false }
            if(student) query.students = student
            if(owner) query.owner = owner
            if(educationInstitution) query.educationInstitutions = educationInstitution
            if(status) query.status = status
            await Fund.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformFund(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Fund.countDocuments(query);
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
            let { fundId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let fund = await checkExistThenGet(fundId, Fund);
            fund.deleted = true;
            await fund.save();
            let reports = {
                "action":"Delete fund",
                "type":"FUND",
                "deepId":fundId,
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
    //accept 
    validateTakeActionBody() {
        return [
            body('startDate').trim().escape().optional().isISO8601().withMessage((value) => {
                return req.__('startDate.invalid', { value});
            }),
            body('firstPaid').trim().escape().optional().isNumeric().withMessage((value) => {
                return req.__('firstPaid.numeric', { value});
            }),
            body('reason').trim().escape().optional()
        ]
    },
    async accept(req, res, next) {
        try {
            convertLang(req)
            let { fundId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let fund = await checkExistThenGet(fundId, Fund);
            if(fund.status != "PENDING")
                return next(new ApiError(500, i18n.__('fund.pending')));
            fund.status = 'ACCEPTED';
            if(req.body.startDate) fund.startDate = req.body.startDate
            let setting = await Setting.findOne({deleted: false})
            if(req.body.firstPaid) {
                fund.firstPaid = req.body.firstPaid
            }else{
                fund.firstPaid = (fund.totalFees * setting.expensesRatio) / 100
            }
            
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner, 
                fromUser: fund.owner, 
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info:'FUND'
            });
            let notif = {
                "description_en":'Your Fund Request Has Been Confirmed ',
                "description_ar":'  تمت الموافقه على طلب التمويل الخاص بك',
                "title_en":'Your Fund Request Has Been Confirmed ',
                "title_ar":' تمت الموافقه على طلب التمويل الخاص بك',
                "type":'FUND'
            }
            await Notif.create({...notif,resource:req.user,target:fund.owner,fund:fund.id});
            let reports = {
                "action":"Accept Fund Request",
                "type":"FUND",
                "deepId":fundId,
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
    //payFirstPaid 
    async payFirstPaid(req, res, next) {
        try {
            convertLang(req)
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            fund.status = 'STARTED';
            //12 months - 10% firstpaid
            //15 % cashBack
            let setting = await Setting.findOne({deleted: false})
            
            let total = fund.totalFees + (fund.totalFees * setting.expensesRatio) / 100
            console.log("total",total)
            let cashBack = (total * setting.cashBackRatio) / 100 
            console.log("cashBack",cashBack)
            //add cashBack to fund owner
            let fundOwner = await checkExistThenGet(fund.owner, User)
            fundOwner.balance = fundOwner.balance + cashBack
            await fundOwner.save();
            //add cashBack to affiliate
            if(fundOwner.affiliate){
                let affiliateCashBack = (fund.totalFees * setting.affiliateRatio) / 100 
                let affiliate = await checkExistThenGet(fundOwner.affiliate, User)
                affiliate.balance = affiliate.balance + affiliateCashBack
                await affiliate.save();
            }
            
            let date = new Date();
            if(fund.startDate){
                date = fund.startDate
            }else{
                date = new Date(date.setMonth(date.getMonth() + 2));
            }
            let monthCount = setting.monthCount;
            let endDate = new Date(date.setMonth(date.getMonth() + monthCount));
            fund.endDate = endDate;
            let cost = (fund.totalFees * monthCount) / 12
            //////////////////////////create premiums////////////////////////////
            for(var i=0; i < monthCount; i++){
                let installmentDate = new Date(date.setMonth(date.getMonth() + i));
                console.log("installmentDate",installmentDate)

                let lastMonth = false
                if(monthCount - 1 == i) lastMonth = true
                
                await Premium.create({
                    fund:fund.id,
                    receiptNum:i+1,
                    student: fund.students,
                    installmentDate:installmentDate,
                    cost:cost ,
                    lastPremium:lastMonth
                });
            }
            await fund.save();
            let reports = {
                "action":"Pay Fund FirstPaid",
                "type":"FUND",
                "deepId":fundId,
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
            convertLang(req)
            let { fundId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let fund = await checkExistThenGet(fundId, Fund);
            if(fund.status != "PENDING")
                return next(new ApiError(500, i18n.__('fund.pending')));
            fund.status = 'REJECTED';
            fund.reason  = req.body.reason
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner, 
                fromUser: fund.owner, 
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info:'FUND'
            });
            let notif = {
                "description_en":'Your Fund Request Has Been Rejected ',
                "description_ar":'   تم رفض  طلب التمويل الخاص بك',
                "title_en":'Your Fund Request Has Been Rejected ',
                "title_ar":' تم رفض على طلب التمويل الخاص بك',
                "type":'FUND'
            }
            await Notif.create({...notif,resource:req.user,target:fund.owner,fund:fund.id});
            let reports = {
                "action":"Reject Fund Request",
                "type":"FUND",
                "deepId":fundId,
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