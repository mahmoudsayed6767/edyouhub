import Fund from "../../models/fund/fund.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import EducationInstitution from "../../models/education institution/education institution.model";
import EducationPhase from "../../models/education phase/education phase.model";
import EducationSystem from "../../models/education system/education system.model";

import i18n from "i18n";

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
            }).isIn(['NATIONAL-ID','PASSPORT']).withMessage((value, { req}) => {
                return req.__('personalId.invalid', { value});
            }),

            body('utilityBills').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('utilityBills.required', { value});
            }).isIn(['OWNER','RENTER']).withMessage((value, { req}) => {
                return req.__('utilityBills.invalid', { value});
            }),

            body('proofIncome').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('proofIncome.required', { value});
            }).isIn(['WORK-ID','HR-LETTER','WORK-CONTRACT','BANK-ACCOUNT','COMMERCIAL-REGISTRATION','TAX-ID']).withMessage((value, { req}) => {
                return req.__('proofIncome.invalid', { value});
            }),
            body('totalFees').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('totalFees.required', { value});
            }),
            //student
            body('students').trim().escape().optional()
            .custom(async (students, { req }) => {
                convertLang(req)
                for (let student of students) {
                    await checkExistThenGet(student.educationPhase, EducationPhase);
                    await checkExistThenGet(student.educationSystem, EducationSystem);
                    //await checkExistThenGet(student.educationInstitution, EducationInstitution);
                    body('studentName').not().isEmpty().withMessage((value) => {
                        return req.__('studentName.required', { value});
                    }),
                    body('type').not().isEmpty().withMessage((value) => {
                        return req.__('type.required', { value});
                    }).isNumeric().withMessage((value) => {
                        return req.__('type.numeric', { value});
                    }),
                    body('educationPhase').not().isEmpty().withMessage((value) => {
                        return req.__('educationPhase.required', { value});
                    }).isNumeric().withMessage((value) => {
                        return req.__('educationPhase.numeric', { value});
                    }),
                    body('educationSystem').not().isEmpty().withMessage((value) => {
                        return req.__('educationSystem.required', { value});
                    }).isNumeric().withMessage((value) => {
                        return req.__('educationSystem.numeric', { value});
                    }),
                    body('educationInstitution').optional().isNumeric().withMessage((value) => {
                        return req.__('educationInstitution.numeric', { value});
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
                    })
                    return true

                }
                return true;
            }),
            
        ];
        return validations;
    },
    //add new fund
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            if (req.files) {
                if (req.files['personalIdImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['personalIdImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.personalIdImgs = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('personalIdImgs.required'))); 
                }
                if (req.files['utilityBillsImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['utilityBillsImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.utilityBillsImgs = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('utilityBillsImgs.required'))); 
                }
                if (req.files['proofIncomeImgs']) {
                    let imagesList = [];
                    for (let imges of req.files['proofIncomeImgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.proofIncomeImgs = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('proofIncomeImgs.required'))); 
                }
            }
            let fund = await Fund.create({ ...validatedBody });
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
    async getById(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { fundId } = req.params;
            
            await checkExist(fundId, Fund, { deleted: false });

            await Fund.findById(fundId).then(async(e) => {
                let fund = await transformFund(e,lang)
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
            let query = {deleted: false }
            await Fund.find(query)
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
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {  deleted: false }
           
            await Fund.find(query)
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

   

}