import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import { checkExist, checkExistThenGet} from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import Package from "../../models/package/package.model";
import {transformPackage} from "../../models/package/transformPackage"
import i18n from "i18n";
import User from "../../models/user/user.model";
import Business from "../../models/business/business.model";
import moment from 'moment'
export default {
    //get with pagenation
    async findAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20 ;
            let {type} = req.query
            
            let query = {deleted: false };
            if(type) query.type = type
            await Package.find(query)
                .sort({ _id: -1 })
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
            let lang = i18n.getLocale(req) 
            let {type} = req.query
            
            let query = {deleted: false };
            if(type) query.type = type
            await Package.find(query)
                .sort({ _id: -1 })
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
            body('title_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_ar.required', { value});
            }),
            body('title_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_en.required', { value});
            }),
            body('durationType').trim().not().isEmpty().withMessage((value,{req}) => {
                return req.__('durationType.required', { value});
            })
            .isIn(['MONTHLY','YEARLY','DAILY']).withMessage((value,{req}) => {
                return req.__('durationType.invalid', { value});
            }),
            body('duration').trim().not().isEmpty().withMessage((value,{req}) => {
                return req.__('duration.required', { value});
            }).isNumeric().withMessage((value,{req}) => {
                return req.__('duration.numeric', { value});
            }),
            body('cost').trim().not().isEmpty().withMessage((value,{req}) => {
                return req.__('cost.required', { value});
            }).isNumeric().withMessage((value,{req}) => {
                return req.__('cost.numeric', { value});
            }),
            body('oldCost').optional().isNumeric().withMessage((value,{req}) => {
                return req.__('oldCost.numeric', { value});
            }),
            body('discount').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('discount.numeric', { value});
            }),
            body('discountType').optional(),

            body('type').not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }).isIn(['FOR-USER','FOR-BUSINESS']).withMessage((value, { req}) => {
                return req.__('type.invalid', { value});
            }),
            body('badgeType').not().isEmpty().withMessage((value, { req}) => {
                return req.__('badgeType.required', { value});
            }).isIn(['GOLD','NORMAL','VERIFIED']).withMessage((value, { req}) => {
                return req.__('badgeType.invalid', { value});
            }),
            body('dataView').not().isEmpty().withMessage((value, { req}) => {
                return req.__('dataView.required', { value});
            }).isIn(['FIRST','TOP','NORMAL']).withMessage((value, { req}) => {
                return req.__('dataView.invalid', { value});
            }),
            body('createEvents').optional(),
            body('createReels').optional(),
            body('createGroups').optional(),
            body('createBusiness').optional(),
            body('createPosts').optional(),
            body('createCourses').optional(),
            body('createVacancies').optional(),
            body('createAdmissions').optional(),
            body('enableFollow').optional(),
            body('sendingMessages').optional(),
            body('enrollCourse').optional(),
            body('enrollOnlineCourse').optional(),
            body('joinEvent').optional(),
            body('feesPayment').optional(),
        ];
    },
    //add package
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            if(!validatedBody.oldCost) validatedBody.oldCost = validatedBody.cost
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
            let { packageId } = req.params;
            await checkExist(packageId, Package, { deleted: false });

            const validatedBody = checkValidations(req);
            if(!validatedBody.oldCost) validatedBody.oldCost = validatedBody.cost

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
    validateBuyPackage() {
        return [
            body('durationType').not().isEmpty().withMessage((value, { req}) => {
                return req.__('durationType.required', { value});
            })
            .isIn(['MONTHLY','YEARLY','DAILY']).not().isEmpty().withMessage((value, { req}) => {
                return req.__('durationType.invalid', { value});
            }),
            body('duration').not().isEmpty().withMessage((value, { req}) => {
                return req.__('duration.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('duration.numeric', { value});
            }),
            body('package').not().isEmpty().withMessage((value, { req}) => {
                return req.__('package.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('package.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Package.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('package.invalid'));
                else
                    return true;
            }),
            body('business').optional().custom(async (value, { req }) => {
                if (!await Business.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('business.invalid'));
                else
                    return true;
            }),
            body('user').optional().custom(async (value, { req }) => {
                if (!await User.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('user.invalid'));
                else
                    return true;
            })
        ];
    },
    async buyPackage(req,res,next){
        try{
            const validatedBody = checkValidations(req);
            let endDateMillSec
            if(validatedBody.durationType == "DAILY"){
                endDateMillSec = Date.parse(moment(new Date()).add(validatedBody.duration, "d").format()) ;
            }
            if(validatedBody.durationType == "MONTHLY"){
                endDateMillSec = Date.parse(moment(new Date()).add(validatedBody.duration, "M").format()) ;
            }
            if(validatedBody.durationType == "YEARLY"){
                endDateMillSec = Date.parse(moment(new Date()).add(validatedBody.duration, "Y").format()) ;
            }
            if(validatedBody.user){
                let user = await checkExistThenGet(validatedBody.user, User, { deleted: false })
                user.hasPackage = true;
                user.packageStartDateMillSec = Date.parse(new Date());
                user.packageEndDateMillSec = endDateMillSec ;
                user.package = validatedBody.package;        
                await user.save();
            }
            if(validatedBody.business){
                let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
                business.hasPackage = true;
                business.packageStartDateMillSec = Date.parse(new Date());
                business.packageEndDateMillSec = endDateMillSec ;
                business.package = validatedBody.package;        
                await business.save();
            }
            res.send({
                success: true,
            });
        }catch(error){
            next(error)
        }
    },
};