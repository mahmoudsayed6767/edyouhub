import ApiResponse from "../../helpers/ApiResponse";
import Coupon from "../../models/coupon/coupon.model";
import Report from "../../models/reports/report.model";
import User from "../../models/user/user.model";
import { checkExist, checkExistThenGet } from "../../helpers/CheckMethods";
import {  checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import EducationInstitution from "../../models/education institution/education institution.model";
import ApiError from "../../helpers/ApiError";

export default {
//get with pagenation
    async findAll(req, res, next) {        
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {deleted: false };
            let {search,type} = req.query
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {couponNumber: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(type) query.type = type;
            console.log(query);
            await Coupon.find(query)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        console.log(e._id)
                        newdata.push({
                            discount:e.discount,
                            discountType:e.discountType,
                            expireDate:e.expireDate,
                            expireDateMillSec:e.expireDateMillSec,
                            couponNumber:e.couponNumber,
                            singleTime:e.singleTime,
                            type:e.type,
                            end:e.end,
                            id:e._id,
                        });
                    }))
                    const count = await Coupon.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    //get with pagenation
    async findAllWithoutPagenation(req, res, next) {        
        try {
            let query = {deleted: false };
            let {search,type} = req.query
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {couponNumber: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(type) query.type = type;

            await Coupon.find(query)
                .sort({ _id: -1 }).then(async(data) => {
                    let newdata = [];
                    await Promise.all(data.map(async(e)=>{
                        let index = {
                            discount:e.discount,
                            discountType:e.discountType,
                            expireDate:e.expireDate,
                            expireDateMillSec:e.expireDateMillSec,
                            couponNumber:e.couponNumber,
                            singleTime:e.singleTime,
                            type:e.type,
                            end:e.end,
                            id:e._id,
                        }
                        newdata.push(index)
                    }))
                    
                    res.send({success:true,data:newdata});
                })
        } catch (err) {
            next(err);
        }
    },
    //validation
   
    validateBody(isUpdate = false) {
        let validations = [
       
            body('discount').not().isEmpty().withMessage((value, { req}) => {
                return req.__('discount.required', { value});
            }),
            body('discountType').not().isEmpty().withMessage((value, { req}) => {
                return req.__('discountType.required', { value});
            }),
            body('expireDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('expireDate.required', { value});
            }),
            body('couponNumber').not().isEmpty().withMessage((value, { req}) => {
                return req.__('couponNumber.required', { value});
            }).custom(async (val, { req }) => {
                    let query = { couponNumber: val, deleted: false };
                    if (isUpdate)
                        query._id = { $ne: req.params.couponId };

                    let coupon = await Coupon.findOne(query).lean();
                    if (coupon)
                        throw req.__('couponNumber.duplicated')

                    return true;
                }),
            body('singleTime').optional(),
            body('educationInstitution').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('educationInstitution.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationInstitution.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationInstitution.invalid'));
                else
                    return true;
            }),
            body('type').optional(),
         
        ];

        return validations;
    },
    //create new coupon
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            validatedBody.expireDateMillSec = Date.parse(validatedBody.expireDate)
            let createdCoupon = await Coupon.create({
                ...validatedBody,
            });
            let reports = {
                "action":"Create New Coupon",
                "type":"COUPONS",
                "deepId":createdCoupon.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success: true,data:createdCoupon});
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {        
        try {
            let { couponId } = req.params;
            await checkExist(couponId, Coupon);
            let coupon = await Coupon.findById(couponId);
            res.send({success: true,data:coupon});
        } catch (err) {
            next(err);
        }
    },
    validateCheckCouponBody(isUpdate = false) {
        let validations = [
       
            body('cost').not().isEmpty().withMessage((value, { req}) => {
                return req.__('cost.required', { value});
            }),
            body('couponNumber').not().isEmpty().withMessage((value, { req}) => {
                return req.__('couponNumber.required', { value});
            }),
            body('type').not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }),
        ];

        return validations;
    },
    async checkValidateCoupon(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let theUser = await checkExistThenGet(req.user._id, User, { deleted: false });
            let coupon = await Coupon.findOne({ couponNumber: { $regex: validatedBody.couponNumber , '$options' : 'i'  },deleted:false,expireDateMillSec:{$gte:Date.parse(new Date())}})
            if(coupon){
                var found = theUser.usedCoupons.find((e) => e == coupon)
                    if(found){
                        if(coupon.singleTime == true){
                            return next(new ApiError(422, i18n.__('coupon.used')));
                        }
                    }else{
                        let cost = validatedBody.cost
                        if(coupon.discountType == "FIXED"){
                            cost = validatedBody.cost - coupon.discount;
                        }else{
                            cost = validatedBody.cost - (coupon.discount * validatedBody.cost) / 100;
                        }
                        if(coupon.type == validatedBody.type){
                            res.send({success: true,msg:i18n.__('Valid.coupon'),cost:cost,coupon:coupon}); 
                        }else{
                            return next(new ApiError(422, i18n.__('InValid.coupon')));
                        }
                        
                    }
                
            }else{
                return next(new ApiError(422, i18n.__('InValid.coupon')));
            }
            
        } catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {        
        try {
            let { couponId } = req.params;
            await checkExist(couponId, Coupon, { deleted: false });

            const validatedBody = checkValidations(req);
            validatedBody.expireDateMillSec = Date.parse(validatedBody.expireDate)
            let updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update Coupon",
                "type":"COUPONS",
                "deepId":couponId,
                "user": req.user._id
            };
            await Report.create({...reports });

            res.status(200).send({success: true,data:updatedCoupon});
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {        
        try {
            let { couponId } = req.params;
            let coupon = await checkExistThenGet(couponId, Coupon, { deleted: false });
            coupon.deleted = true;
            await coupon.save();
            let reports = {
                "action":"Delete Coupon",
                "type":"COUPONS",
                "deepId":couponId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
    
    async end(req, res, next) {        
        try {
            let { couponId } = req.params;
            let coupon = await checkExistThenGet(couponId, Coupon);
            coupon.end = true;
            await coupon.save();
            let reports = {
                "action":"End Coupon",
                "type":"COUPONS",
                "deepId":couponId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
    async reused(req, res, next) {        
        try {
            let { couponId } = req.params;
            let coupon = await checkExistThenGet(couponId, Coupon);
            coupon.end = false;
            await coupon.save();
            let reports = {
                "action":"Reused Coupon",
                "type":"COUPONS",
                "deepId":couponId,
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