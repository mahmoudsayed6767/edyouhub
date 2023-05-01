import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import CashbackPackage from "../../models/cashbackPackage/cashbackPackage.model";
import {transformCashbackPackage} from "../../models/cashbackPackage/transformCashbackPackage"
import i18n from "i18n";
import User from "../../models/user/user.model";
export default {
    //get with pagenation
    async findAll(req, res, next) {

        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20 ;
            let query = {deleted: false };
            await CashbackPackage.find(query)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCashbackPackage(e,lang)
                        newdata.push(index);
                    }))
                    const count = await CashbackPackage.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
    
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                });


        } catch (err) {
            next(err);
        }
    },
    //get without pagenation
    async findAllWithoutPagenation(req, res, next) {

        try {
            let lang = i18n.getLocale(req) 
            let query = {deleted: false };
            await CashbackPackage.find(query)
                .sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCashbackPackage(e,lang)
                        newdata.push(index);
                    }))
    
                    res.send({
                        success: true,
                        data:newdata
                    });
                });
        } catch (err) {
            next(err);
        }
    },
   //validate body
    validateBody(isUpdate = false) {
        return [
            body('title_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_ar.required', { value});
            }),
            body('title_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_en.required', { value});
            }),
            body('cost').not().isEmpty().withMessage((value, { req}) => {
                return req.__('cost.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('cost.numeric', { value});
            }),
            body('coins').not().isEmpty().withMessage((value, { req}) => {
                return req.__('coins.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('coins.numeric', { value});
            })
        ];
    },
    //add cashbackPackage
    async create(req, res, next) {

        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
    
            const validatedBody = checkValidations(req);
            let createdPackage = await CashbackPackage.create({ ...validatedBody});

            let reports = {
                "action":"Create cashbackPackage",
                "type":"PACKAGES",
                "deepId":createdPackage.id,
                "user": req.user._id
            };
            await Report.create({...reports});
            
            res.status(200).send({success: true,data:createdPackage});
        } catch (err) {
            next(err);
        }
    },

    //get by id
    async findById(req, res, next) {
        try {
            //get lang
            let lang = i18n.getLocale()
            let { packageId } = req.params;
            await checkExist(packageId, CashbackPackage, { deleted: false });
            await CashbackPackage.findById(packageId)
            .then(async(e)=>{
                let cashbackPackagee = await transformCashbackPackage(e,lang)
                res.send({
                    success:true,
                    data:cashbackPackagee
                });
            })
            
        } catch (err) {
            next(err);
        }
    },
    //update cashbackPackage
    async update(req, res, next) {

        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));

            let { packageId } = req.params;
            await checkExist(packageId, CashbackPackage, { deleted: false });

            const validatedBody = checkValidations(req);
            let updatedCashbackPackage = await CashbackPackage.findByIdAndUpdate(packageId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update cashbackPackage",
                "type":"PACKAGES",
                "deepId":packageId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true,data:updatedCashbackPackage});
        }
        catch (err) {
            next(err);
        }
    },
    //delete cashbackPackage
    async delete(req, res, next) {
        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { packageId } = req.params;
            let cashbackPackages = await checkExistThenGet(packageId, CashbackPackage, { deleted: false });
            
            cashbackPackages.deleted = true;
            await cashbackPackages.save();
            let reports = {
                "action":"Delete cashbackPackage",
                "type":"PACKAGES",
                "deepId":packageId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success:true});

        }
        catch (err) {
            next(err);
        }
    },
    //buy cashbackPackage
    async buycashbackPackage(req, res, next) {
        try {
            let { packageId } = req.params;
            let cashbackPackages = await checkExistThenGet(packageId, CashbackPackage, { deleted: false });
            let user = await checkExistThenGet(req.user._id,User, { deleted: false });
            user.balance  = user.balance + cashbackPackages.coins
            await user.save();
            let reports = {
                "action":"Buy cashbackPackage",
                "type":"PACKAGES",
                "deepId":packageId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success:true});

        }
        catch (err) {
            next(err);
        }
    },
};