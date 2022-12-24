import ApiResponse from "../../helpers/ApiResponse";
import Setting from "../../models/setting/setting.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';

import { checkExist, checkExistThenGet, isImgUrl,isInArray } from "../../helpers/CheckMethods";
import { handleImg, checkValidations,convertLang } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";

export default {

    async findAll(req, res, next) {

        try {
            convertLang(req)
            let query = {deleted: false };
            let setting = await Setting.findOne(query).sort({ createdAt: -1 })
            res.send({success: true,setting:setting});
        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate = false) {
        let validations = [
            body('androidAppVersion').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('androidAppVersion.required', { value});
            }),
            body('iosAppVersion').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('iosAppVersion.required', { value});
            }),
            
            body('feesCashBackRatio').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('feesCashBackRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('feesCashBackRatio.numeric', { value});
            }),
            body('affiliateRatio').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('affiliateRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('affiliateRatio.numeric', { value});
            }),
            body('monthCount').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('monthCount.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('monthCount.numeric', { value});
            }),
            body('cashBackRatio').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('cashBackRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('cashBackRatio.numeric', { value});
            }),
            body('expensesRatio').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('expensesRatio.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('expensesRatio.numeric', { value});
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
            convertLang(req)
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
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));

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
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
                
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