import { checkExist, checkExistThenGet,isInArray,isArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import Offer from "../../models/offer/offer.model";
import { checkValidations,convertLang } from "../shared/shared.controller";

import OfferCart from "../../models/offerCart/offerCart.model";
import ApiError from '../../helpers/ApiError';
import Notif from "../../models/notif/notif.model";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import { body } from "express-validator";
import i18n from "i18n";
import {transformOfferCart} from "../../models/offerCart/transformOfferCart"

const populateQuery = [
    {
        path: 'offer', model: 'offer' , 
        populate: { path: 'place', model: 'place' },      
    },
];
export default {
    async findAll(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { user: req.user._id,deleted:false };
            await OfferCart.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .skip((page - 1) * limit).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformOfferCart(e,lang)
                        newdata.push(index)
                    }))
                    const count = await OfferCart.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })

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
            let {offerId} = req.params;
            const validatedBody = checkValidations(req);
            validatedBody.offer = offerId;
            validatedBody.user = req.user._id;
            let user = await checkExistThenGet(req.user._id, User);
            let arr = user.offerCarts;
            var found = arr.find(e=>e == offerId); 
            if(!found){
                user.offerCarts.push(offerId);
                await OfferCart.create({ ...validatedBody});
            }
            await user.save();
            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error)
        }
    },
    async delete(req, res, next) {
        try {
            convertLang(req)
            let {offerCartId} = req.params;
            let offerCart = await checkExistThenGet(offerCartId, OfferCart, { deleted: false });
            if (offerCart.user != req.user._id)
                return next(new ApiError(403, i18n.__('notAllow')));
            offerCart.deleted = true;
            await offerCart.save();
            let user = await checkExistThenGet(req.user._id, User);

            let arr = user.offerCarts;
            console.log(arr);
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == offerCart.offer){
                    arr.splice(i, 1);
                }
            }
            user.offerCarts = arr;
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
            theUser.offerCarts = [];
            let offerCarts = await OfferCart.find({ user: req.user._id });
            for (let offerCart of offerCarts ) {
                offerCart.deleted = true;
                await offerCart.save();
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