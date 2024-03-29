import { checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import Product from "../../models/product/product.model";
import { checkValidations } from "../shared/shared.controller";
import Color from "../../models/color/color.model";
import Cart from "../../models/cart/cart.model";
import ApiError from '../../helpers/ApiError';
import { body } from "express-validator";
import i18n from "i18n";
import { transformCart } from "../../models/cart/transformCart";
import Coupon from "../../models/coupon/coupon.model";
const populateQuery = [
    {
        path: 'items.product', model: 'product',
        populate: { path: 'colors', model: 'color' }
    },
    { path: 'items.color', model: 'color' },

    {
        path: 'supplies', model: 'supplies',
        populate: { path: 'educationSystem', model: 'educationSystem' },
    },
    {
        path: 'supplies', model: 'supplies',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
    {
        path: 'supplies', model: 'supplies',
        populate: { path: 'grade', model: 'grade' },
    },
    {path: 'promoCode', model: 'coupon'}
];
export default {
    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { user: req.user._id,deleted:false };
            await Cart.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCart(e,lang)
                        newdata.push(index);
                    }))
                    
                    const CartsCount = await Cart.countDocuments(query);
                    const pageCount = Math.ceil(CartsCount / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, CartsCount, req));
                })
        } catch (err) {
            next(err);
        }
    },
    validateBody() {
        let validations = [
            body('gender').optional().isIn(['MALE','FEMALE','OTHER']).withMessage((value, { req}) => {
                return req.__('gender.invalid', { value});
            }),
            body('total').not().isEmpty().withMessage((val, { req}) => {
                return req.__('total.required', { val});
            })
            .isNumeric().withMessage((val, { req}) => {
                return req.__('total.numeric', { val});
            }),
            body('promoCode').optional()
            .isNumeric().withMessage((val, { req}) => {
                return req.__('coupon.numeric', { val});
            }),
            body('items').not().isEmpty().withMessage((val, { req}) => {
                return req.__('items.required', { val});
            })
            .custom(async (items, { req }) => {
                
                for (let item of items) {
                    body('type').optional().isIn(['STATIONERIES','HEALTH']).withMessage((value, { req}) => {
                        return req.__('type.invalid', { value});
                    }),
                    body('product').not().isEmpty().withMessage((val, { req}) => {
                        return req.__('product.required', { val});
                    })
                    .isNumeric().withMessage((val, { req}) => {
                        return req.__('product.numeric', { val});
                    }).custom(async (val, { req }) => {
                        if (!await Product.findOne({_id:val,deleted:false}))
                            throw new Error(req.__('product.invalid'));
                        else
                            return true;
                    })
                    body('size').not().isEmpty().withMessage((val, { req}) => {
                        return req.__('size.required', { val});
                    })
                    body('color').not().isEmpty().withMessage((val, { req}) => {
                        return req.__('color.required', { val});
                    })
                    .isNumeric().withMessage((val, { req}) => {
                        return req.__('color.numeric', { val});
                    }).custom(async (val, { req }) => {
                        if (!await Color.findOne({_id:val,deleted:false}))
                            throw new Error(req.__('color.invalid'));
                        else
                            return true;
                    })
                    body('count').not().isEmpty().withMessage((val) => {
                        return req.__('count.required', { val});
                    }).isLength({ max: 10 }).withMessage((val) => {
                        return req.__('count.invalid', { val});
                    })
                    return true

                }
                return true;
            }),
        ]
        return validations;
    },
    async create(req, res, next) {        
        try {
            let {suppliesId} = req.params;
            const validatedBody = checkValidations(req);
            validatedBody.supplies = suppliesId;
            validatedBody.user = req.user._id;
            if(validatedBody.promoCode){
                let coupon = await Coupon.findOne({deleted:false,end:false,couponNumber: { $regex: validatedBody.promoCode, '$options' : 'i'  }})
                if(coupon){
                    validatedBody.promoCode = coupon._id
                    validatedBody.hasPromoCode =true
                }else{
                    return next(new ApiError(500, i18n.__('wrong.promoCode'))); 
                }
            }

            await Cart.create({...validatedBody})
            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },
    async update(req, res, next) {        
        try {
            let { cartId } = req.params;
            let cart = await checkExistThenGet(cartId, Cart, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(cart.user != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            await Cart.findByIdAndUpdate(cartId, { ...validatedBody });
            return res.status(200).send({success: true});
        } catch (error) {
            next(error);
        }
    },
    async unCart(req, res, next) {        
        try {
            let {cartId} = req.params;
            let cart = await checkExistThenGet(cartId, Cart, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(cart.user != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            cart.deleted = true;
            await cart.save();
            res.send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },
    async deleteAll(req, res, next) {        
        try {
            let carts = await Cart.find({ user: req.user._id });
            for (let cart of carts ) {
                cart.deleted = true;
                await cart.save();
            }
            res.send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },

}