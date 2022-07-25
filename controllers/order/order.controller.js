import { checkExistThenGet, isLng, isLat, isArray, isNumeric,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import Order from "../../models/order/order.model";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model"
import { body } from "express-validator/check";
import Product from "../../models/product/product.model";
import { ValidationError } from "mongoose";
import { checkValidations ,convertLang} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import User from "../../models/user/user.model";
import Report from "../../models/reports/report.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import Cart from "../../models/cart/cart.model";
import Coupon from "../../models/coupon/coupon.model";
import i18n from "i18n";

import Setting from "../../models/setting/setting.model"
import Offer from "../../models/product/offer.model";
import { transformOrder, transformOrderById } from "../../models/order/transformOrder";
import moment from 'moment'
const populateQuery = [
    {
        path: 'client', model: 'user',
    },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    { path: 'promoCode', model: 'coupon' },
    {
        path: 'productOrders.product', model: 'product',
        populate: { path: 'category', model: 'category' }
    },
    {
        path: 'productOrders.product', model: 'product',
        populate: { path: 'subCategory', model: 'category' }
    },
    {
        path: 'productOrders.product', model: 'product',
        populate: { path: 'brand', model: 'brand' }
    },
];
function validatedestination(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: 'location[0] is invalid lng' });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: 'location[1] is invalid lat' });
}

export default {
    async findOrders(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20
                ,{search, status,client,paymentSystem ,accept,start,end} = req.query
                , query = {deleted: false };
            if(start && end) {
                let from = start + 'T00:00:00.000Z';
                let to= end + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    createdAt: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {client: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if (status) query.status = status;
            
            if (accept) query.accept = accept;
            if (client) query.client = client;
            if (paymentSystem) query.paymentSystem = paymentSystem;
           
           
            await Order.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).skip((page - 1) * limit).then(async (data) =>{
                    let newdate = [];
                    await Promise.all(data.map(async(e)=>{
                        let index = await transformOrder(e,lang)
                        newdate.push(index)
                    }))
                    const ordersCount = await Order.countDocuments(query);
                    const pageCount = Math.ceil(ordersCount / limit);
        
                    res.send(new ApiResponse(newdate, page, pageCount, limit, ordersCount, req));
                })


           
        } catch (err) {
            next(err);
        }
    },
    async getOrders(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {search, status,client,paymentSystem ,accept,start,end} = req.query
                , query = {deleted: false };
            if(start && end) {
                let from = start + 'T00:00:00.000Z';
                let to= end + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    createdAt: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {client: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if (status) query.status = status;
            

            if (accept) query.accept = accept;
            if (client) query.client = client;
            if (paymentSystem) query.paymentSystem = paymentSystem;
           
           
            await Order.find(query).populate(populateQuery)
                .sort({ createdAt: -1 }).then(async (data) =>{
                    let newdate = [];
                    await Promise.all(data.map(async(e)=>{
                        let index = await transformOrder(e,lang)
                        newdate.push(index)
                    }))
                    res.send({success: true,data:newdate});
                })

            
        } catch (err) {
            next(err);
        }
    },
    
    validateGetPrices() {
        let validations = [
            body('city').not().isEmpty().withMessage((value, { req}) => {
                return req.__('city.required', { value});
            }).isNumeric().isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }),
            body('area').not().isEmpty().withMessage((value, { req}) => {
                return req.__('area.required', { value});
            }).isNumeric().isNumeric().withMessage((value, { req}) => {
                return req.__('area.numeric', { value});
            }),
            body('promoCode').optional(),
            body('productOrders').custom(vals => isArray(vals)).withMessage((value, { req}) => {
                return req.__('productOrders.array', { value});
            })
            .isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('productOrders.atLeastOne', { value});
            })
            .custom(async (productOrders, { req }) => {
                // check if it's duplicated product
                const uniqueValues = new Set(productOrders.map(v => v.product));
                if (uniqueValues.size < productOrders.length) {
                    throw new Error(`Duplicated Product `);
                }
                    
                let prevProductId;
                for (let productOrder of productOrders) {
                    
                    prevProductId = productOrder.product;
                    let productDetail = await checkExistThenGet(productOrder.product, Product);
                    if(productOrder.count > productDetail.quantity)
                            throw new Error(req.__('edit.productCount'));
                    // check if count is a valid number 
                    if (!isNumeric(productOrder.count))
                        throw new Error(`Product: ${productOrder.product} has invalid count: ${productOrder.count}!`);
                    
                }
                return true;
            }),
        ];
        return validations;
    },
    async getPrice(req, res, next) {
        try {
            convertLang(req)
            
            const validatedBody = checkValidations(req);
            let total = 0;
            let delivaryCost =0
            let finalTotal = 0;
            let freeShipping = false;
            for (let singleProduct of validatedBody.productOrders) {
                let productDetail = await checkExistThenGet(singleProduct.product, Product);
                if(productDetail.freeShipping == true) {
                    freeShipping = true;
                }else{
                    freeShipping = false;
                }
                let offer = await Offer.findOne({product:singleProduct.product,deleted:false})
                if(offer){
                    total += offer.offerPrice * singleProduct.count;
                }else{
                    console.log("No offer found",singleProduct.price)
                    total += productDetail.price * singleProduct.count;
                }                
                console.log(singleProduct.count +""+productDetail.quantity)
                if(singleProduct.count > productDetail.quantity){
                    return next(new ApiError(500, i18n.__('edit.productCount')));
                }
 
            }
            console.log("total",total)
            let promoCode = false;
            let discount = 0;
            let discountRatio = 0
            if(validatedBody.promoCode){
                if(await Coupon.findOne({deleted:false,end:false,couponNumber: { $regex: validatedBody.promoCode, '$options' : 'i'  },expireDateMillSec:{$gte:Date.parse(new Date())}})){
                    let coupon = await Coupon.findOne({deleted:false,end:false,couponNumber: { $regex: validatedBody.promoCode, '$options' : 'i'  }})
                    if(coupon.discountType == "RATIO"){
                        discount = (total * coupon.discount) / 100;
                        discountRatio = coupon.discount
                        total = total - discount
                    }else{
                        discount = coupon.discount
                        total = discount > total? 0 :total - discount
                    }
                    promoCode = true
                }else{
                    return next(new ApiError(500, i18n.__('wrong.promoCode')));
                }
            }else{
                validatedBody.total = total;
            }
            let city = await checkExistThenGet(validatedBody.city, City);
            delivaryCost = city.delivaryCost
            let area = await checkExistThenGet(validatedBody.area, Area);
            if(area.delivaryCost != 0){
                delivaryCost = area.delivaryCost;
            }
            let setting = await Setting.findOne({deleted:false})
            if(freeShipping == false){
                if(total >= setting.freeShipping){
                    delivaryCost = 0
                    freeShipping = true;
                }
            }
            finalTotal = total + parseInt(delivaryCost);
            res.send({
                success: true,
                productsCost:total,
                delivaryCost:delivaryCost,
                finalTotal:finalTotal,
                promoCode:promoCode,
                discountRatio:discountRatio,
                discount:discount,
                freeShipping:freeShipping
            });
        } catch (error) {
            next(error)
        }
    }, 
    validateCreatedOrders() {
        let validations = [
            body('destination').not().isEmpty().withMessage((value, { req}) => {
                return req.__('destination.required', { value});
            }),
            body('paymentSystem').not().isEmpty().withMessage((value, { req}) => {
                return req.__('paymentSystem.required', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }),
            
            body('address').not().isEmpty().withMessage((value, { req}) => {
                return req.__('address.required', { value});
            }),
            body('city').not().isEmpty().withMessage((value, { req}) => {
                return req.__('city.required', { value});
            }).isNumeric().isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }),
            body('area').not().isEmpty().withMessage((value, { req}) => {
                return req.__('area.required', { value});
            }).isNumeric().isNumeric().withMessage((value, { req}) => {
                return req.__('area.numeric', { value});
            }),
            body('promoCode').optional(),
            body('productOrders').custom(vals => isArray(vals)).withMessage((value, { req}) => {
                return req.__('productOrders.array', { value});
            })
            .isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('productOrders.atLeastOne', { value});
            })
            .custom(async (productOrders, { req }) => {
                // check if it's duplicated product
                const uniqueValues = new Set(productOrders.map(v => v.product));
                if (uniqueValues.size < productOrders.length) {
                    throw new Error(`Duplicated Product `);
                }
                let prevProductId;
                for (let productOrder of productOrders) {
                    prevProductId = productOrder.product;
                    let productDetail = await checkExistThenGet(productOrder.product, Product);
                    if(productOrder.count > productDetail.quantity)
                            throw new Error(req.__('edit.productCount'));
                    // check if count is a valid number 
                    if (!isNumeric(productOrder.count))
                        throw new Error(`Product: ${productOrder.product} has invalid count: ${productOrder.count}!`);
                    
                }
                return true;
            }),
        ];
        return validations;
    }, 
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            let theUser = await checkExistThenGet(req.user._id, User, { deleted: false })
            //check if user is block
            if (theUser.block == true)
                return next(new ApiError(500, i18n.__('user.block')));
            //check coupon validation
            if(validatedBody.promoCode){
                let promoCode = await Coupon.findOne({deleted:false,end:false,couponNumber: { $regex: validatedBody.promoCode, '$options' : 'i'  }})
                if(promoCode){
                    console.log("theUser",theUser.usedCoupons)
                    var found = theUser.usedCoupons.find((e) => e == promoCode._id)
                    if(found){
                        if(promoCode.singleTime === true)
                            return next(new ApiError(500, i18n.__('used.promoCode'))); 
                    }
                }else{
                    return next(new ApiError(500, i18n.__('wrong.promoCode'))); 
                }
            }
            let freeShipping = false;
            validatedestination(validatedBody.destination);
            validatedBody.destination = { type: 'Point', coordinates: [+req.body.destination[0], +req.body.destination[1]] };
            let total = 0;
            for (let singleProduct of validatedBody.productOrders) {
                let productDetail = await checkExistThenGet(singleProduct.product, Product);
                //check if product has free shipping
                if(productDetail.freeShipping == true) {
                    freeShipping = true;
                }else{
                    freeShipping = false;
                }
                //check offer 
                let offer = await Offer.findOne({product:singleProduct.product,deleted:false})
                if(offer){
                    total += offer.offerPrice * singleProduct.count;
                } else{
                    total += productDetail.price * singleProduct.count;
                }   
                
            }     
            console.log(total)
            //if coupon exist
            if(validatedBody.promoCode){
                let promoCode = await Coupon.findOne({deleted:false,end:false,couponNumber: { $regex: validatedBody.promoCode, '$options' : 'i'  }})
                if(promoCode){
                    console.log("theUser",theUser.usedCoupons)
                    theUser.usedCoupons.push(promoCode)
                    await theUser.save();
                    if(promoCode.discountType == "RATIO"){
                        let discount = (total * promoCode.discount) / 100;
                        total = total - discount
                    }else{
                        let discount = promoCode.discount
                        total = discount > total? 0 :total - discount
                    }
                    validatedBody.promoCode = promoCode.id
                    validatedBody.hasPromoCode = true
                    validatedBody.discount = promoCode.discount
                }else{
                    return next(new ApiError(500, i18n.__('wrong.promoCode'))); 
                }
            }else{
                validatedBody.total = total;
            }
            //delivery cost
            let city = await checkExistThenGet(validatedBody.city, City);
            validatedBody.delivaryCost = city.delivaryCost
            let area = await checkExistThenGet(validatedBody.area, Area);
            if(area.delivaryCost != 0){
                validatedBody.delivaryCost = area.delivaryCost;
            }
            //check if there is free shipping in any order from admin panel
            let setting = await Setting.findOne({deleted:false})
            if(freeShipping ==false){
                if(total >= setting.freeShipping){
                    validatedBody.delivaryCost = 0
                    validatedBody.freeShipping = true;
                    freeShipping = true;
                }
            }
            
            //freeShipping enable ,reason is (total > freeShippingCost or all product in order has freeShipping)
            if(freeShipping == true){
                validatedBody.delivaryCost = 0
                validatedBody.freeShipping = true;
            }
            validatedBody.total = total
            validatedBody.finalTotal = total + validatedBody.delivaryCost;
            validatedBody.paymentSystem = validatedBody.paymentSystem;
            //create order
            let createdOrder = await Order.create({ ...validatedBody,client: req.user});
            //remove user cart
            theUser.carts = [];
            let carts = await Cart.find({ user: req.user._id });
            for (let cart of carts ) {
                cart.deleted = true;
                await cart.save();
            }
            await theUser.save();
            //send notifs to admin
            let users = await User.find({'type':['ADMIN','SUB-ADMIN']});
            users.forEach(async(user) => {
                sendNotifiAndPushNotifi({////////
                    targetUser: user.id, 
                    fromUser: req.user._id, 
                    text: 'new notification',
                    subject: createdOrder.id,
                    subjectType: 'new order',
                    info:'order'
                });
                let notif = {
                    "description_en":'New order ',
                    "description_ar":'طلب جديد',
                    "title_en":"New Order",
                    "title_ar":"طلب جديد",
                    "type":"ORDER"
                }
                await Notif.create({...notif,resource:req.user._id,target:user.id,order:createdOrder.id});
            });
            //send notif to client
            sendNotifiAndPushNotifi({
                targetUser: req.user._id, 
                fromUser: 'سله', 
                text: 'new notification',
                subject: createdOrder.id,
                subjectType: 'your order on progress',
                info:'order'
            });
            let notif = {
                "title_en":'your order on progress',
                "title_ar":'جارى تنفيذ طلبك',
                "description_en":"your order under review ,you will khnow the next updated soon",
                "description_ar":"طلبك تحت المراجعه برجاء الانتظار سيتم اعلامك بحاله الطلب",
                "type":"ORDER"
            }
            await Notif.create({...notif,resource:req.user,target:req.user._id,order:createdOrder.id});
            
            let reports = {
                "action":"Create New Order",
                "type":"ORDERS",
                "deepId":createdOrder.id,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(201).send(await Order.populate(createdOrder, populateQuery));
        } catch (err) {
            next(err);
            
        }
    },
    //find one
    async findById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {orderId } = req.params;
            await Order.findById(orderId).populate(populateQuery)
                .sort({ createdAt: -1 }).then(async (e) =>{
                    let index = await transformOrderById(e,lang)
                    res.send({
                        success: true,
                        data:index
                    });
                })
        } catch (err) {
            next(err);
        }
    },
    //accept
    async accept(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order);
            if (['DELIVERED'].includes(order.status))
                return next(new ApiError(500, i18n.__('status.notPending')));
            for (let singleProduct of order.productOrders) {
                let productDetail = await checkExistThenGet(singleProduct.product, Product);
                //if product quantity is exist in product
                if(singleProduct.count <= productDetail.quantity){
                    let newQuantity = productDetail.quantity - singleProduct.count;
                    productDetail.quantity = newQuantity;
                    productDetail.sallCount = productDetail.sallCount + singleProduct.count
                    await productDetail.save();
                    
                } else{
                    return next(new ApiError(500, i18n.__('edit.productCount')));
                }
            }     
            order.status = 'ACCEPTED';
            await order.save();
            sendNotifiAndPushNotifi({
                targetUser: order.client, 
                fromUser: req.user, 
                text: 'new notification',
                subject: order.id,
                subjectType: 'سله accept your order'
            });
            let notif = {
                "description_en":'سله accept your order',
                "description_ar":'تم قبول طلبك',
                "title_ar":"جارى توصيل الطلب",
                "title_en":"Delivery in Progress",
                "type":"ORDER"
            }
            await Notif.create({...notif,resource:req.user,target:order.client,order:order.id});
            let reports = {
                "action":"Accept Order",
                "type":"ORDERS",
                "deepId":orderId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    //cancel
    async cancel(req, res, next) {
        try {
            convertLang(req)
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order, { deleted: false });
            if (['DELIVERED'].includes(order.status))
                return next(new ApiError(500, i18n.__('notAllow')));
            order.status = 'CANCELED';  
            order.cancelDateMillSec = Date.parse(new Date())
            for (let singleProduct of order.productOrders) {
                let productDetail = await checkExistThenGet(singleProduct.product, Product);
                let newQuantity = productDetail.quantity + singleProduct.count;
                productDetail.quantity = newQuantity;
                productDetail.sallCount = productDetail.sallCount - singleProduct.count
                await productDetail.save();
            }     
            await order.save();
            sendNotifiAndPushNotifi({
                targetUser: order.client, 
                fromUser: req.user, 
                text: 'new notification',
                subject: order.id,
                subjectType: 'The Client cancel the order'
            });
            let notif = {
                "description_en":'The Client cancel the order',
                "description_ar":'قام العميل بالغاء الطلب',
                "title_en": 'The Client cancel the order ',
                "title_ar":'قام العميل بالغاء الطلب' ,
                "type":"ORDER"
            }
            await Notif.create({...notif,resource:req.user,target:order.client,order:order.id});
            let reports = {
                "action":"Cancel Order",
                "type":"ORDERS",
                "deepId":orderId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    //refused
    async refuse(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order);
            if (['DELIVERED'].includes(order.status))
                return next(new ApiError(500, i18n.__('notAllow')));
            order.status = 'REFUSED';
            order.accept = false
            if(req.body.reason) order.reason = req.body.reason
            for (let singleProduct of order.productOrders) {
                let productDetail = await checkExistThenGet(singleProduct.product, Product);
                let newQuantity = productDetail.quantity + singleProduct.count;
                productDetail.quantity = newQuantity;
                productDetail.sallCount = productDetail.sallCount - singleProduct.count
                await productDetail.save();
            }     
            order.refusedDateMillSec = Date.parse(new Date())
            await order.save();
            sendNotifiAndPushNotifi({
                targetUser: order.client, 
                fromUser: req.user, 
                text: 'new notification',
                subject: order.id,
                subjectType: 'سله refused your order'
            });
            let notif = {
                "description_en":'سله refused your order',
                "description_ar":'تم رفض طلبك',
                "title_en": 'سله refuse your order because ',
                "title_ar":'  تم رفض  طلبك بسبب' ,
                "type":"ORDER"
            }
            await Notif.create({...notif,resource:req.user,target:order.client,order:order.id});
            let reports = {
                "action":"Refuse Order",
                "type":"ORDERS",
                "deepId":orderId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    //out for delivery
    async outForDelivery(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order);
            order.status = 'OUT-FOR-DELIVERY';
            order.outForDeliveryDateMillSec = Date.parse(new Date())
            await order.save();
            sendNotifiAndPushNotifi({
                targetUser: order.client, 
                fromUser: req.user, 
                text: 'new notification',
                subject: order.id,
                subjectType: ' your order out for delivery'
            });
            let notif = {
                "description_en":'your order out for delivery',
                "description_ar":' بدأ توصيل طلبك',
                "title_en": 'your order out for delivery',
                "title_ar":' بدأ توصيل طلبك' ,
                "type":"ORDER"
            }
            Notif.create({...notif,resource:req.user,target:order.client,order:order.id});
            let reports = {
                "action":"out for delivery",
                "type":"ORDERS",
                "deepId":orderId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    //order is delivered
    async deliver(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order);
            order.status = 'DELIVERED';
            order.deliveredDateMillSec = Date.parse(new Date())
            await order.save();
            sendNotifiAndPushNotifi({
                targetUser: order.client, 
                fromUser: req.user, 
                text: 'new notification',
                subject: order.id,
                subjectType: ' your order has been arrived'
            });
            let notif = {
                "description_en":'your order has been arrived',
                "description_ar":'تم توصيل طلبك',
                "title_en": 'your order has been arrived',
                "title_ar":' تم توصيل طلبك' ,
                "type":"ORDER"
            }
            Notif.create({...notif,resource:req.user,target:order.client,order:order.id});
            let reports = {
                "action":"Deliveried Order",
                "type":"ORDERS",
                "deepId":orderId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    //delete order
    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order);
            order.deleted = true;
            await order.save();
            let reports = {
                "action":"Delete Order",
            };
            await Report.create({...reports, user: req.user });
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
}