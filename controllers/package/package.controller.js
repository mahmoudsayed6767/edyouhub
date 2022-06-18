import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import { checkValidations,convertLang } from "../shared/shared.controller";
import { body } from "express-validator/check";
import Package from "../../models/package/package.model";
import {transformPackage} from "../../models/package/transformPackage"
import i18n from "i18n";
import User from "../../models/user/user.model";
export default {
    //get with pagenation
    async findAll(req, res, next) {

        try {
            convertLang(req)
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20 ;
            let query = {deleted: false };
            await Package.find(query)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformPackage(e,lang)
                        newdata.push(index);
                    }))
                    const packagesCount = await Package.countDocuments(query);
                    const pageCount = Math.ceil(packagesCount / limit);
    
                    res.send(new ApiResponse(newdata, page, pageCount, limit, packagesCount, req));
                });


        } catch (err) {
            next(err);
        }
    },
    //get without pagenation
    async findAllWithoutPagenation(req, res, next) {

        try {
            convertLang(req)
            let lang = i18n.getLocale(req) 
            let query = {deleted: false };
            await Package.find(query)
                .sort({ _id: 1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformPackage(e,lang)
                        newdata.push(index);
                    }))
    
                    res.send({
                        success: true,
                        packages:newdata
                    });
                });
        } catch (err) {
            next(err);
        }
    },
   //validate body
    validateBody(isUpdate = false) {
        return [
            body('title_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_ar.required', { value});
            }),
            body('title_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_en.required', { value});
            }),
            body('cost').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('cost.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('cost.numeric', { value});
            }),
            body('coins').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('coins.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('coins.numeric', { value});
            })
        ];
    },
    //add package
    async create(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
    
            const validatedBody = checkValidations(req);
            let createdpackage = await Package.create({ ...validatedBody});

            let reports = {
                "action":"Create Package",
                "type":"PACKAGES",
                "deepId":createdpackage.id,
                "user": req.user._id
            };
            await Report.create({...reports});
            
            res.status(200).send({success: true,data:createdpackage});
        } catch (err) {
            next(err);
        }
    },

    //get by id
    async findById(req, res, next) {
        try {
            convertLang(req)
            //get lang
            let lang = i18n.getLocale()
            let { packageId } = req.params;
            await checkExist(packageId, Package, { deleted: false });
            await Package.findById(packageId)
            .then(async(e)=>{
                let packagee = await transformPackage(e,lang)
                res.send({
                    success:true,
                    data:packagee
                });
            })
            
        } catch (err) {
            next(err);
        }
    },
    //update package
    async update(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));

            let { packageId } = req.params;
            await checkExist(packageId, Package, { deleted: false });

            const validatedBody = checkValidations(req);
            let updatedpackage = await Package.findByIdAndUpdate(packageId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update Package",
                "type":"PACKAGES",
                "deepId":packageId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true,data:updatedpackage});
        }
        catch (err) {
            next(err);
        }
    },
    //delete package
    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { packageId } = req.params;
            let packages = await checkExistThenGet(packageId, Package, { deleted: false });
            
            packages.deleted = true;
            await packages.save();
            let reports = {
                "action":"Delete Package",
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
    //buy package
    async buyPackage(req, res, next) {
        try {
            convertLang(req)
            let { packageId } = req.params;
            let packages = await checkExistThenGet(packageId, Package, { deleted: false });
            packages.deleted = true;
            await packages.save();
            let user = await checkExistThenGet(req.user._id,User, { deleted: false });
            user.balance  = user.balance + packages.coins
            await user.save();
            let reports = {
                "action":"Buy Package",
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