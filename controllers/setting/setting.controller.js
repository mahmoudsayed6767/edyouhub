import Setting from "../../models/setting/setting.model";
import Report from "../../models/reports/report.model";
import { checkExist, checkExistThenGet } from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";

export default {

    async findAll(req, res, next) {        
        try {
            let query = {deleted: false };
            let setting = await Setting.findOne(query).sort({ createdAt: -1 })
            res.send({success: true,setting:setting});
        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate = false) {
        let validations = [
            body('androidAppVersion').not().isEmpty().withMessage((value, { req}) => {
                return req.__('androidAppVersion.required', { value});
            }),
            body('iosAppVersion').not().isEmpty().withMessage((value, { req}) => {
                return req.__('iosAppVersion.required', { value});
            }),
            
            body('feesCashBackRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('feesCashBackRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('feesCashBackRatio.numeric', { value});
            }),
            body('affiliateRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('affiliateRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('affiliateRatio.numeric', { value});
            }),
            body('monthCount').not().isEmpty().withMessage((value, { req}) => {
                return req.__('monthCount.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('monthCount.numeric', { value});
            }),
            body('cashBackRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('cashBackRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('cashBackRatio.numeric', { value});
            }),
            body('expensesRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('expensesRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('expensesRatio.numeric', { value});
            }),
            body('processingFees').not().isEmpty().withMessage((value, { req}) => {
                return req.__('processingFees.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('processingFees.numeric', { value});
            }),
            body('onlineCoursesRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('onlineCoursesRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('onlineCoursesRatio.numeric', { value});
            }),
            body('onsiteCoursesRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('onsiteCoursesRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('onsiteCoursesRatio.numeric', { value});
            }),
            body('eventsRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('eventsRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('eventsRatio.numeric', { value});
            }),
            body('feesPaymentRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('feesPaymentRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('feesPaymentRatio.numeric', { value});
            }),
            body('fundRatio').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fundRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('fundRatio.numeric', { value});
            }),
           
        ];
        return validations;
    },

    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let createdSetting = await Setting.create({ ...validatedBody});
            let reports = {
                "action":"Create Settings",
                "type":"SETTINGS",
                "deepId":createdSetting.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true});
        } catch (err) {
            next(err);
        }
    },


    async findById(req, res, next) {        
        try {
            let { SettingId } = req.params;
            await checkExist(SettingId, Setting, { deleted: false });
            let setting = await Setting.findById(SettingId);
            res.send({success:true,setting:setting});
        } catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {        
        try {
            let { SettingId } = req.params;
            await checkExist(SettingId, Setting, { deleted: false });

            const validatedBody = checkValidations(req);
            await Setting.findByIdAndUpdate(SettingId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update Setting",
                "type":"SETTINGS",
                "deepId":SettingId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success:true});
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {        
        try {  
            let { SettingId } = req.params;
            let setting = await checkExistThenGet(SettingId, Setting, { deleted: false });
            setting.deleted = true;
            await setting.save();
            let reports = {
                "action":"Delete Setting",
                "type":"SETTINGS",
                "deepId":SettingId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success:true});

        }
        catch (err) {
            next(err);
        }
    },

  
};