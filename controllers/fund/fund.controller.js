import Fund from "../../models/fund/fund.model";
import { transformFund, transformFundById } from "../../models/fund/transformFund";
import Student from "../../models/student/student.model";
import Premium from "../../models/premium/premium.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist, isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import EducationInstitution from "../../models/education institution/education institution.model";
import EducationSystem from "../../models/education system/education system.model";
import Setting from "../../models/setting/setting.model"
import i18n from "i18n";
import { toImgUrl } from "../../utils";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import User from "../../models/user/user.model";
import Country from "../../models/country/country.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import FundProvider from "../../models/fundProvider/fundProvider.model";
import FundProgram from "../../models/fundProgram/fundProgram.model";
import Grade from "../../models/grade/grade.model";
const populateQuery = [
    { path: 'owner', model: 'user' },
    {
        path: 'students',
        model: 'student',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
];
const populateQueryById = [
    { path: 'owner', model: 'user' },
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    { path: 'fundProvider', model: 'fundProvider' },
    { path: 'fundProgram', model: 'fundProgram' },
    {
        path: 'students',
        model: 'student',
        populate: { path: 'sector', model: 'category' },
    },
    {
        path: 'students',
        model: 'student',
        populate: { path: 'subSector', model: 'category' },
    },
    {
        path: 'students',
        model: 'student',
        populate: { path: 'educationSystem', model: 'educationSystem' },
    },
    {
        path: 'students',
        model: 'student',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
];
export default {
    async uploadImgs(req, res, next) {
        try {
            let personalIdImgs = []
            let utilityBillsImgs = []
            let proofIncomeImgs = []
            let feesLetter = [];
            let files = [];
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
                    if (req.body.type) {
                        let obj = {
                            "type": req.body.type,
                            "img": imagesList
                        };
                        proofIncomeImgs = obj;
                    } else {

                        proofIncomeImgs = imagesList;
                    }
                }
                if (req.files['files']) {
                    let imagesList = [];
                    for (let imges of req.files['files']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    if (req.body.type) {
                        let obj = {
                            "type": req.body.type,
                            "img": imagesList
                        };
                        files = obj;
                    } else {

                        files = imagesList;
                    }
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
                success: true,
                personalIdImgs: personalIdImgs,
                utilityBillsImgs: utilityBillsImgs,
                proofIncomeImgs: proofIncomeImgs,
                feesLetter: feesLetter,
                files: files,
            });
        } catch (error) {
            next(error);
        }
    },
    //validate un completedbody
    validateBody() {
        let validations = [
            body('totalFees').not().isEmpty().withMessage((value, { req }) => {
                return req.__('totalFees.required', { value });
            }),
            body('selectedFundProviders').not().isEmpty().withMessage((value, { req }) => {
                return req.__('selectedFundProviders.required', { value });
            })
            .custom(async(selectedFundProviders, { req }) => {
                for (let value of selectedFundProviders) {
                    if (!await FundProvider.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('selectedFundProviders.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('fundProgram').not().isEmpty().withMessage((value, { req }) => {
                return req.__('fundProgram.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('fundProgram.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await FundProgram.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('fundProgram.invalid'));
                else
                    return true;
            }),
        ];
        return validations;
    },
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            validatedBody.owner = req.user._id
            let fund = await Fund.create({...validatedBody });
            let reports = {
                "action": "Create New fund",
                "type": "FUND",
                "deepId": fund.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success: true,
                data: fund
            });
        } catch (error) {
            next(error);
        }
    },
    //validate Completed body
    validateCompletedBody(isUpdated = false) {
        let validations = [
            body('firstName').not().isEmpty().withMessage((value, { req }) => {
                return req.__('firstName.required', { value });
            }),
            body('secondName').not().isEmpty().withMessage((value, { req }) => {
                return req.__('secondName.required', { value });
            }),
            body('thirdName').not().isEmpty().withMessage((value, { req }) => {
                return req.__('thirdName.required', { value });
            }),
            body('fourthName').not().isEmpty().withMessage((value, { req }) => {
                return req.__('fourthName.required', { value });
            }),
            body('country').not().isEmpty().withMessage((value, { req }) => {
                return req.__('country.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('country.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await Country.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').not().isEmpty().withMessage((value, { req }) => {
                return req.__('city.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('city.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await City.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').not().isEmpty().withMessage((value, { req }) => {
                return req.__('area.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('area.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await Area.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('area.invalid'));
                else
                    return true;
            }),
            body('workStartDate').not().isEmpty().withMessage((value, { req }) => {
                return req.__('workStartDate.required', { value });
            }).isISO8601().withMessage((value, { req }) => {
                return req.__('date.invalid', { value });
            }),
            body('address').not().isEmpty().withMessage((value, { req }) => {
                return req.__('address.required', { value });
            }),

            body('phone').not().isEmpty().withMessage((value, { req }) => {
                return req.__('phone.required', { value });
            }),
            body('job').not().isEmpty().withMessage((value, { req }) => {
                return req.__('job.required', { value });
            }),
            body('jobAddress').optional(),
            body('workPosition').not().isEmpty().withMessage((value, { req }) => {
                return req.__('workPosition.required', { value });
            }),
            body('personalId').not().isEmpty().withMessage((value, { req }) => {
                return req.__('personalId.required', { value });
            }).isIn(['EGYPTIAN', 'NON-EGYPTIAN']).withMessage((value, { req }) => {
                return req.__('personalId.invalid', { value });
            }),
            body('personalIdImgs').not().isEmpty().withMessage((value, { req }) => {
                return req.__('personalIdImgs.required', { value });
            }),

            body('utilityBills').not().isEmpty().withMessage((value, { req }) => {
                return req.__('utilityBills.required', { value });
            }).isIn(['OWNER', 'RENTER']).withMessage((value, { req }) => {
                return req.__('utilityBills.invalid', { value });
            }),
            body('billType').not().isEmpty().withMessage((value, { req }) => {
                return req.__('billType.required', { value });
            }).isIn(["WATER", "GAS", "TELEPHONE", "ELECTRICITY", "RENT-CONTRACT"]).withMessage((value, { req }) => {
                return req.__('billType.invalid', { value });
            }),
            body('utilityBillsImgs').not().isEmpty().withMessage((value, { req }) => {
                return req.__('utilityBillsImgs.required', { value });
            }),

            body('proofIncome').not().isEmpty().withMessage((value, { req }) => {
                return req.__('proofIncome.required', { value });
            }).isIn(['EMPLOYEE', 'BUSINESS-OWNER']).withMessage((value, { req }) => {
                return req.__('proofIncome.invalid', { value });
            }),
            body('proofIncomeCost').optional(),
            body('proofIncomeImgs').optional()
            .custom(async(proofIncomeImgs, { req }) => {

                for (let img of proofIncomeImgs) {
                    body('img').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('img.required', { value });
                        }),
                        body('type').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('type.required', { value });
                        }).isIn(['WORK-ID', 'HR-LETTER', 'WORK-CONTRACT', 'BANK-ACCOUNT', 'COMMERCIAL-REGISTRATION', 'TAX-ID']).withMessage((value, { req }) => {
                            return req.__('type.invalid', { value });
                        })
                }
                return true;
            }),


            body('totalFees').not().isEmpty().withMessage((value, { req }) => {
                return req.__('totalFees.required', { value });
            }),
            //student
            body('theStudents').optional()
            .custom(async(students, { req }) => {

                for (let student of students) {
                    //await checkExistThenGet(student.educationInstitution, EducationInstitution);
                    body('studentId').optional()
                    body('studentName').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('studentName.required', { value });
                        }),
                        body('type').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('type.required', { value });
                        }).isIn(['INSIDE-INSTITUTION', 'OUTSIDE-INSTITUTION']).withMessage((value, { req }) => {
                            return req.__('type.invalid', { value });
                        }),
                        body('sector').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('sector.required', { value });
                        }).isNumeric().withMessage((value, { req }) => {
                            return req.__('sector.numeric', { value });
                        }),
                        body('subSector').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('subSector.required', { value });
                        }).isNumeric().withMessage((value, { req }) => {
                            return req.__('subSector.numeric', { value });
                        }),
                        body('educationSystem').optional()
                        .custom(async(value, { req }) => {
                            if (!await EducationSystem.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('educationSystem.invalid'));
                            else
                                return true;
                        }),
                        body('educationInstitution').optional().isNumeric().withMessage((value, { req }) => {
                            return req.__('educationInstitution.numeric', { value });
                        }).custom(async(value, { req }) => {
                            if (!await EducationInstitution.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('educationInstitution.invalid'));
                            else
                                return true;
                        }),
                        body('educationInstitutionName').optional(),
                        body('grade').optional().isNumeric().withMessage((value, { req }) => {
                            return req.__('grade.numeric', { value });
                        }).custom(async(value, { req }) => {
                            if (!await Grade.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('grade.invalid'));
                            else
                                return true;
                        }),
                        body('feesDetails').optional()
                        .custom(async(feesDetails, { req }) => {
                            for (let fees of feesDetails) {
                                body('feesCost').not().isEmpty().withMessage((value, { req }) => {
                                        return req.__('feesCost.required', { value });
                                    }).isNumeric().withMessage((value, { req }) => {
                                        return req.__('feesCost.numeric', { value });
                                    }),
                                    body('feesType').not().isEmpty().withMessage((value, { req }) => {
                                        return req.__('feesType.required', { value });
                                    }).isNumeric().withMessage((value, { req }) => {
                                        return req.__('feesType.numeric', { value });
                                    }).custom(async(value, { req }) => {
                                        if (!await FeesType.findOne({ _id: value, deleted: false }))
                                            throw new Error(req.__('feesType.invalid'));
                                        else
                                            return true;
                                    })
                            }
                            return true;
                        }),
                        body('feesLetter').optional()
                }
                return true;
            }),
            body('owner').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('owner.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('owner.invalid'));
                else
                    return true;
            }),
            body('selectedFundProviders').not().isEmpty().withMessage((value, { req }) => {
                return req.__('selectedFundProviders.required', { value });
            })
            .custom(async(selectedFundProviders, { req }) => {
                for (let value of selectedFundProviders) {
                    if (!await FundProvider.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('selectedFundProviders.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('fundProvider').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('fundProvider.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await FundProvider.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('fundProvider.invalid'));
                else
                    return true;
            }),
            body('fundProgram').not().isEmpty().withMessage((value, { req }) => {
                return req.__('fundProgram.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('fundProgram.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await FundProgram.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('fundProgram.invalid'));
                else
                    return true;
            }),
        ];
        return validations;
    },
    //add new fund
    async createCompleted(req, res, next) {
        try {
            const validatedBody = checkValidations(req);

            if (!validatedBody.owner) validatedBody.owner = req.user._id;
            let fund = await Fund.create({...validatedBody });
            let educationInstitutions = []
            if (validatedBody.theStudents) {
                let students = []
                await Promise.all(validatedBody.theStudents.map(async(student) => {
                    let createdStudent = await Student.create({...student })
                    students.push(createdStudent.id)
                    if (student.educationInstitution) educationInstitutions.push(student.educationInstitution)
                }));

                fund.students = students
            }
            let fundProvider = await checkExistThenGet(fund.fundProvider, FundProvider, { deleted: false })
            let fundProgram = await checkExistThenGet(fund.fundProgram, FundProgram, { deleted: false })
            let setting = await Setting.findOne({deleted: false})
            //مبلغ الفائده
            let providerMonthlyPercent = 0
            let arr = fundProvider.programsPercent;
            var found = arr.find(element => element.fundProgram === fund.fundProgram);
            if(!found){
                providerMonthlyPercent = found.monthlyPercent;
            }
            let providerMonthlyPercentCost = (fund.totalFees * providerMonthlyPercent) / 100;
            //الاجمالى مع مبلغ الفايده
            fund.totalWithMonthlyPercent = fund.totalFees + providerMonthlyPercentCost * fundProgram.monthCount;
            //firstpaid
            let platformExpensesRatio = (fund.totalFees * setting.expensesRatio) / 100
            let providerExpensesRatio = (fund.totalFees * fundProvider.expensesRatio) / 100
            fund.firstPaid = platformExpensesRatio + providerExpensesRatio;
            await fund.save();
            let reports = {
                "action": "Create New fund",
                "type": "FUND",
                "deepId": fund.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success: true,
                data: fund
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
            let { fundId } = req.params;

            await checkExist(fundId, Fund, { deleted: false });

            await Fund.findById(fundId).populate(populateQueryById).then(async(e) => {
                let fund = await transformFundById(e, lang)
                res.send({
                    success: true,
                    data: fund
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update fund
    async update(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (fund.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            if (validatedBody.theStudents) {
                let students = []
                await Promise.all(validatedBody.theStudents.map(async(student) => {
                    if (student.studentId) {
                        let createdStudent = await Student.findByIdAndUpdate(student.studentId, {...student });
                        students.push(createdStudent.id)
                    } else {
                        let createdStudent = await Student.create({...student })
                        students.push(createdStudent.id)
                        if (student.educationInstitution) educationInstitutions.push(student.educationInstitution)
                    }
                }));

                validatedBody.students = students
            }
            await Fund.findByIdAndUpdate(fundId, {...validatedBody });
            let reports = {
                "action": "Update fund",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
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
            let { student, owner, status, educationInstitution, fundProgram, fundProvider } = req.query;
            let query = { deleted: false }
            if (student) query.students = student
            if (educationInstitution) query.educationInstitutions = educationInstitution
            if (owner) query.owner = owner
            if (status) query.status = status
            if (fundProgram) query.fundProgram = fundProgram
            if (fundProvider) query.fundProvider = fundProvider
            await Fund.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformFund(e, lang)
                        newdata.push(index)
                    }))
                    res.send({
                        success: true,
                        data: newdata
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
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20,
                { student, owner, status, educationInstitution, fundProgram, fundProvider } = req.query;
            let query = { deleted: false }
            if (student) query.students = student
            if (owner) query.owner = owner
            if (educationInstitution) query.educationInstitutions = educationInstitution
            if (status) query.status = status
            if (fundProgram) query.fundProgram = fundProgram
            if (fundProvider) query.fundProvider = fundProvider
            await Fund.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformFund(e, lang)
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
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            fund.deleted = true;
            await fund.save();
            let reports = {
                "action": "Delete fund",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },

    async reviewing(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (fund.status != "NEW")
                return next(new ApiError(500, i18n.__('fund.pending')));
            fund.status = 'PENDING';
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner,
                fromUser: fund.owner,
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info: 'FUND'
            });
            let notif = {
                "description_en": 'Your Fund Request is Reviewing ',
                "description_ar": '  جارى مراجعه طلب التمويل الخاص بك',
                "title_en": 'Your Fund Request is Reviewing ',
                "title_ar": '  جارى مراجعه طلب التمويل الخاص بك',
                "type": 'FUND'
            }
            await Notif.create({...notif, resource: req.user, target: fund.owner, fund: fund.id });
            let reports = {
                "action": "Reviewing Fund Request",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    validateAcceptBody() {
        return [
            body('startDate').optional().isISO8601().withMessage((value, { req }) => {
                return req.__('startDate.invalid', { value });
            }),
            body('firstPaid').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('firstPaid.numeric', { value });
            }),
            body('fundProvider').not().isEmpty().withMessage((value, { req }) => {
                return req.__('fundProvider.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('fundProvider.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await FundProvider.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('fundProvider.invalid'));
                else
                    return true;
            }),
        ]
    },
    async accept(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (!isInArray(["PENDING", "NEED-ACTION"], fund.status))
                return next(new ApiError(500, i18n.__('fund.pending')));
            const validatedBody = checkValidations(req);

            fund.status = 'ACCEPTED';
            fund.fundProvider = validatedBody.fundProvider;
            if (validatedBody.startDate) fund.startDate = validatedBody.startDate
            let fundProvider = await checkExistThenGet(fund.fundProvider, FundProvider)
            let fundProgram = await checkExistThenGet(fund.fundProgram, FundProgram, { deleted: false })
            let setting = await Setting.findOne({deleted: false})

            if (validatedBody.firstPaid) {
                fund.firstPaid = validatedBody.firstPaid
            } else {
                let platformExpensesRatio = (fund.totalFees * fundProvider.platformExpensesRatio) / 100
                let providerExpensesRatio = (fund.totalFees * setting.expensesRatio) / 100
                fund.firstPaid = platformExpensesRatio + providerExpensesRatio;
            }
            //مبلغ الفائده
            let providerMonthlyPercent = 0
            let arr = fundProvider.programsPercent;
            var found = arr.find(element => element.fundProgram === fund.fundProgram);
            if(!found){
                providerMonthlyPercent = found.monthlyPercent;
            }
            let providerMonthlyPercentCost = (fund.totalFees * providerMonthlyPercent) / 100;
            //الاجمالى مع مبلغ الفايده
            fund.totalWithMonthlyPercent = fund.totalFees + providerMonthlyPercentCost * fundProgram.monthCount;
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner,
                fromUser: fund.owner,
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info: 'FUND'
            });
            let notif = {
                "description_en": 'Your Fund Request Has Been Confirmed ',
                "description_ar": '  تمت الموافقه على طلب التمويل الخاص بك',
                "title_en": 'Your Fund Request Has Been Confirmed ',
                "title_ar": ' تمت الموافقه على طلب التمويل الخاص بك',
                "type": 'FUND'
            }
            await Notif.create({...notif, resource: req.user, target: fund.owner, fund: fund.id });
            let reports = {
                "action": "Accept Fund Request",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    //need action 
    validateNeedActionBody() {
        return [
            body('actionType').not().isEmpty().withMessage((value, { req }) => {
                return req.__('actionType.required', { value });
            })
            .isIn(['WORK-ID', 'CLUB-ID', 'HR-LETTER', 'WORK-CONTRACT', 'BANK-ACCOUNT', 'BANK DEPOSIT', 'COMMERCIAL-REGISTRATION', 'TAX-ID']).withMessage((value, { req }) => {
                return req.__('actionType.invalid', { value });
            }),
        ]
    },
    async needAction(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (fund.status != "PENDING")
                return next(new ApiError(500, i18n.__('fund.pending')));

            const validatedBody = checkValidations(req);
            fund.status = 'NEED-ACTION';
            fund.actionType = validatedBody.actionType
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner,
                fromUser: fund.owner,
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info: 'FUND'
            });
            let notif = {
                "description_en": 'Your Fund Request Need Some Fix ',
                "description_ar": '  طلب التمويل الخاص بك يحتاج بعض التعديلات',
                "title_en": 'Your Fund Request Need Some Fix ',
                "title_ar": '  طلب التمويل الخاص بك يحتاج بعض التعديلات',
                "type": 'FUND'
            }
            await Notif.create({...notif, resource: req.user, target: fund.owner, fund: fund.id });
            let reports = {
                "action": "Fund Request need to fix",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    //action reply 
    validateActionReplyBody() {
        return [
            body('actionReply').not().isEmpty().withMessage((value, { req }) => {
                return req.__('actionReply.required', { value });
            }),
            body('actionFile').optional()
            .custom(async(actionFile, { req }) => {

                for (let file of actionFile) {
                    body('file').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('file.required', { value });
                        }),
                        body('type').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('type.required', { value });
                        }).isIn(['WORK-ID', 'CLUB-ID', 'HR-LETTER', 'WORK-CONTRACT', 'BANK-ACCOUNT', 'BANK DEPOSIT', 'COMMERCIAL-REGISTRATION', 'TAX-ID']).withMessage((value, { req }) => {
                            return req.__('type.invalid', { value });
                        })
                }
                return true;
            }),
        ]
    },
    async actionReply(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (fund.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if (fund.status != "NEED-ACTION")
                return next(new ApiError(500, i18n.__('fund.pending')));
            const validatedBody = checkValidations(req);
            validatedBody.status = "PENDING";
            if (validatedBody.actionReply == true && !validatedBody.actionFile) {
                return next(new ApiError(422, i18n.__('actionFile.required')));
            }
            await Fund.findByIdAndUpdate(fundId, {...validatedBody });

            let reports = {
                "action": "Fund Request has an action reply",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    //partial accept 
    validatePartialAcceptBody() {
        return [
            body('totalFees').not().isEmpty().withMessage((value, { req }) => {
                return req.__('totalFees.required', { value });
            }),
            body('partialAcceptReason').optional(),
            body('fundProvider').not().isEmpty().withMessage((value, { req }) => {
                return req.__('fundProvider.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('fundProvider.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await FundProvider.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('fundProvider.invalid'));
                else
                    return true;
            }),
        ]
    },
    async partialAcceptance(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (!isInArray(["PENDING", "NEED-ACTION"], fund.status))
                return next(new ApiError(500, i18n.__('fund.pending')));

            const validatedBody = checkValidations(req);
            fund.status = 'PARTIAL-ACCEPTANCE';
            fund.oldTotalFees = fund.totalFees
            fund.totalFees = validatedBody.totalFees
            fund.partialAcceptReason = validatedBody.partialAcceptReason
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner,
                fromUser: fund.owner,
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info: 'FUND'
            });
            let notif = {
                "description_en": 'Your Fund Request has an partial acceptance',
                "description_ar": '  طلب التمويل الخاص بك حاز على موافقه مبدأيه',
                "title_en": 'Your Fund Request has an partial acceptance',
                "title_ar": ' طلب التمويل الخاص بك حاز على موافقه مبدأيه',
                "type": 'FUND'
            }
            await Notif.create({...notif, resource: req.user, target: fund.owner, fund: fund.id });
            let reports = {
                "action": "Fund Request has an partial acceptance",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    //reject 
    validateRejectBody() {
        return [
            body('reason').not().isEmpty().withMessage((value, { req }) => {
                return req.__('reason.required', { value });
            })
        ]
    },
    //reject
    async reject(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (fund.status != "PENDING")
                return next(new ApiError(500, i18n.__('fund.pending')));
            fund.status = 'REJECTED';
            fund.reason = req.body.reason
            await fund.save();
            sendNotifiAndPushNotifi({
                targetUser: fund.owner,
                fromUser: fund.owner,
                text: ' EdHub',
                subject: fund.id,
                subjectType: 'fund Status',
                info: 'FUND'
            });
            let notif = {
                "description_en": 'Your Fund Request Has Been Rejected ',
                "description_ar": '   تم رفض  طلب التمويل الخاص بك',
                "title_en": 'Your Fund Request Has Been Rejected ',
                "title_ar": ' تم رفض على طلب التمويل الخاص بك',
                "type": 'FUND'
            }
            await Notif.create({...notif, resource: req.user, target: fund.owner, fund: fund.id });
            let reports = {
                "action": "Reject Fund Request",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    //active fund
    validateActiveBody() {
        return [
            body('startDate').not().isEmpty().withMessage((value, { req }) => {
                return req.__('startDate.required', { value });
            })
            .isISO8601().withMessage((value, { req }) => {
                return req.__('startDate.invalid', { value });
            }),
            body('educationFile').not().isEmpty().withMessage((value, { req }) => {
                return req.__('educationFile.required', { value });
            })
            .custom(async(educationFile, { req }) => {

                for (let file of educationFile) {
                    body('file').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('file.required', { value });
                        }),
                        body('type').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('type.required', { value });
                        }).isIn(['BIRTH-CERTIFICATE', 'EDUCATION-LETTER']).withMessage((value, { req }) => {
                            return req.__('type.invalid', { value });
                        })
                }
                return true;
            }),
        ]
    },
    async active(req, res, next) {
        try {
            let { fundId } = req.params;
            await checkExist(fundId, Fund);
            const validatedBody = checkValidations(req);
            await Fund.findByIdAndUpdate(fundId, {...validatedBody });
            let reports = {
                "action": "Active Fund Request",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    async cancel(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (fund.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if (isInArray(["STARTED", "COMPLETED"], fund.status))
                return next(new ApiError(500, i18n.__('notAllow')));
            fund.status = 'CANCELED';
            await fund.save();
            let reports = {
                "action": "canceling Fund Request",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    //payFirstPaid 
    async payFirstPaid(req, res, next) {
        try {
            let { fundId } = req.params;
            let fund = await checkExistThenGet(fundId, Fund);
            if (fund.status != "ACCEPTED")
                return next(new ApiError(500, i18n.__('fund.accepted')));

            fund.status = 'STARTED';
            let fundProgram = await checkExistThenGet(fund.fundProgram, FundProgram)
            let setting = await Setting.findOne({ deleted: false })
            let total = fund.totalWithMonthlyPercent + fund.firstPaid
            console.log("total", total)

            let cashBack = (total * setting.cashBackRatio) / 100
            console.log("cashBack", cashBack)
                //add cashBack to fund owner
            let fundOwner = await checkExistThenGet(fund.owner, User)
            fundOwner.balance = fundOwner.balance + cashBack
            await fundOwner.save();
            //add cashBack to affiliate
            if (fundOwner.affiliate) {
                let affiliateCashBack = (fund.totalWithMonthlyPercent * setting.affiliateRatio) / 100
                let affiliate = await checkExistThenGet(fundOwner.affiliate, User)
                affiliate.balance = affiliate.balance + affiliateCashBack
                await affiliate.save();
            }

            let date = new Date();
            if (fund.startDate) {
                date = fund.startDate
            } else {
                date = new Date(date.setMonth(date.getMonth() + 2));
            }
            let monthCount = fundProgram.monthCount;
            let endDate = new Date(date.setMonth(date.getMonth() + monthCount));
            fund.endDate = endDate;
            let cost = (fund.totalWithMonthlyPercent * monthCount) / 12
                //////////////////////////create premiums////////////////////////////
            for (var i = 0; i < monthCount; i++) {
                let installmentDate = new Date(date.setMonth(date.getMonth() + i));
                console.log("installmentDate", installmentDate)

                let lastMonth = false
                if (monthCount - 1 == i) lastMonth = true

                await Premium.create({
                    fund: fund.id,
                    receiptNum: i + 1,
                    student: fund.students,
                    installmentDate: installmentDate,
                    owner: fund.owner,
                    cost: cost,
                    lastPremium: lastMonth
                });
            }
            await fund.save();
            let reports = {
                "action": "Pay Fund FirstPaid",
                "type": "FUND",
                "deepId": fundId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
}