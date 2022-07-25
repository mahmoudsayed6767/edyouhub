import { checkExist, checkExistThenGet,isInArray,isArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import Product from "../../models/product/product.model";
import { checkValidations,convertLang } from "../shared/shared.controller";

import Cart from "../../models/cart/cart.model";
import ApiError from '../../helpers/ApiError';
import Notif from "../../models/notif/notif.model";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import { body } from "express-validator/check";
import i18n from "i18n";

const populateQuery = [
    {
        path: 'product', model: 'product' ,
        populate: { path: 'category', model: 'category' },
       
    },
    {
        path: 'product', model: 'product' ,
        populate: { path: 'brand', model: 'brand' },
       
    },
    {
        path: 'product', model: 'product' ,
        populate: { path: 'subCategory', model: 'category' },
       
    },
];
export default {
    async findAll(req, res, next) {
        try {
            convertLang(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { userId } = req.params;
            let query = { user: userId,deleted:false };
            let Carts = await Cart.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)


            const CartsCount = await Cart.countDocuments(query);
            const pageCount = Math.ceil(CartsCount / limit);

            res.send(new ApiResponse(Carts, page, pageCount, limit, CartsCount, req));
        } catch (err) {
            next(err);
        }
    },
    validateBody() {
        let validations = [
            
        ]
        return validations;
    },
    async create(req, res, next) {
        try {
            convertLang(req)
            let {productId} = req.params;
            const validatedBody = checkValidations(req);
            validatedBody.product = productId;
            validatedBody.user = req.user._id;
            let user = await checkExistThenGet(req.user._id, User);
            let arr = user.carts;
            var found = arr.find(e=>e == productId); 
            if(!found){
                user.carts.push(productId);
                await Cart.create({ ...validatedBody});
            }
            await user.save();
            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },
    async unCart(req, res, next) {
        try {
            convertLang(req)
            let {productId,cartId} = req.params;
            let cart = await checkExistThenGet(cartId, Cart, { deleted: false });
            if (cart.user != req.user._id)
                return next(new ApiError(403, i18n.__('notAllow')));
            cart.deleted = true;
            await cart.save();
            let user = await checkExistThenGet(req.user._id, User);

            let arr = user.carts;
            console.log(arr);
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == productId){
                    arr.splice(i, 1);
                }
            }
            user.carts = arr;
            await user.save();
            res.send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },
    async deleteAll(req, res, next) {
        try {
            convertLang(req)
            let theUser = await checkExistThenGet(req.user._id, User);
            theUser.carts = [];
            let carts = await Cart.find({ user: req.user._id });
            for (let cart of carts ) {
                cart.deleted = true;
                await cart.save();
            }
            await theUser.save()
            res.send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },

}