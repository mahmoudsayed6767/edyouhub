import ApiResponse from "../../helpers/ApiResponse";
import { checkExist, checkExistThenGet, isInArray } from "../../helpers/CheckMethods";
import { checkValidations,convertLang } from "../shared/shared.controller";
import { body } from "express-validator/check";
import Offer from "../../models/offer/offer.model";
import User from "../../models/user/user.model";
import Report from "../../models/reports/report.model";
import Place from "../../models/place/place.model"
import { toImgUrl } from "../../utils";
//import Category from "../../models/category/category.model";
import i18n from "i18n";
import { generateCode } from '../../services/generator-code-service';
import Bill from "../../models/bill/bill.model";
import {transformOffer, transformOfferById} from "../../models/offer/transformOffer";
import ApiError from '../../helpers/ApiError';
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";

const populateQuery = [ 
    
    {
        path: 'place', model: 'place',
    },
];

export default {


    async findAll(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            { all,end,place,type,startDate,endDate,bookedUser,gotUser} = req.query;
            
            let query = { deleted: false,end:false};
            
            if(startDate && endDate) {
                let from = startDate + 'T00:00:00.000Z';
                let to= endDate + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    fromDate: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if (place) query.place = place;
            if (bookedUser) query.bookedUsers = bookedUser;
            if (gotUser) query.gotUsers = gotUser;
            if (type) query.type = type;
            if(all) query.end = {$in:[true, false]};
            if (end == "true") query.end = true;
            if (end == "false") query.end = false;
            
            await Offer.find(query).populate(populateQuery)
                .sort({createdAt: -1})
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformOffer(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Offer.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    //get without pagenation
    async getAll(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let{all, end,place,type,startDate,endDate,bookedUser,gotUser} = req.query;
            
            let query = { deleted: false,end:false};
            if(startDate && endDate) {
                let from = startDate + 'T00:00:00.000Z';
                let to= endDate + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    fromDate: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if (place) query.place = place;
            if (bookedUser) query.bookedUsers = bookedUser;
            if (gotUser) query.gotUsers = gotUser;
            if (type) query.type = type;
            if(all) query.end = {$in:[true, false]};
            if (end == "true") query.end = true;
            if (end == "false") query.end = false;
            
            if(all) query.end = {$in:[true, false]};
            await Offer.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformOffer(e,lang)
                        newdata.push(index)
                    }))
                    res.send({
                        success:true,
                        data:newdata
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('title_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_en.required', { value});
            }),
            body('title_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_ar.required', { value});
            }),
            body('description_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('description_en.required', { value});
            }),
            body('description_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('description_ar.required', { value});
            }),
            body('place').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('place.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('price.numeric', { value});
            }),
            body('type').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }).isIn(['NEW-PRICE','VOUCHER']).withMessage((value, { req}) => {
                return req.__('type.invalid', { value});
            }),
            body('fromDate').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('fromDate.required', { value});
            }).isISO8601().withMessage((value, { req}) => {
                return req.__('invalid.date', { value});
            }),
            body('toDate').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('toDate.required', { value});
            }).isISO8601().withMessage((value, { req}) => {
                return req.__('invalid.date', { value});
            }),
            body('withNotif').trim().escape().optional(),
            body('oldPrice').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('oldPrice.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('oldPrice.numeric', { value});
            }),
            body('newPrice').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('newPrice.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('newPrice.numeric', { value});
            }),
            body('coins').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('coins.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('coins.numeric', { value});
            })

        ];
        return validations;
    },

    async create(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            await checkExist(validatedBody.place, Place, { deleted: false });
            validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)
            if(validatedBody.type === "NEW-PRICE"){
                if (req.files) {
                    if (req.files['imgs']) {
                        let imagesList = [];
                        for (let imges of req.files['imgs']) {
                            imagesList.push(await toImgUrl(imges))
                        }
                        validatedBody.imgs = imagesList;
                    }else{
                        
                        return next(new ApiError(422, i18n.__('imgs.required')));
                    }
                }else{
                    return next(new ApiError(422, i18n.__('imgs.required')));
                }
            }
            
            let createdoffer = await Offer.create({ ...validatedBody});
            let reports = {
                "action":"Create Offer",
                "type":"OFFERS",
                "deepId":createdoffer.id,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(201).send({success:true});
        } catch (err) {
            next(err);
        }
    },


    async findById(req, res, next) {
        try {
            convertLang(req)
            //get lang
            let lang = i18n.getLocale(req)
            let { offerId } = req.params;
            await checkExist(offerId, Offer, { deleted: false });
            await Offer.findById(offerId).populate(populateQuery).then(async(e) => {
                let offer = await transformOfferById(e,lang)
                res.send({
                    success:true,
                    data:offer
                });
            })
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {

        try {
            convertLang(req)
            //get lang
            //let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { offerId } = req.params;
            await checkExist(offerId, Offer, { deleted: false });

            const validatedBody = checkValidations(req);
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }
            }
            await Offer.findByIdAndUpdate(offerId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update Offer",
                "type":"OFFERS",
                "deepId":offerId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { offerId } = req.params;
            let offer = await checkExistThenGet(offerId, Offer, { deleted: false });
            offer.deleted = true;
            await offer.save();
            let reports = {
                "action":"Delete Offer",
                "type":"OFFERS",
                "deepId":offerId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
    async bookOffer(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { offerId } = req.params;
            let offer = await checkExistThenGet(offerId, Offer, { deleted: false });
            let user = await checkExistThenGet(req.user._id, User, { deleted: false})
            if(user.balance < offer.coins)
                return next(new ApiError(500, i18n.__('balance.notEnough')));

            let arr = offer.bookedUsers;
            var found = arr.find(e => e == req.user._id)
            if(!found){
                offer.bookedUsers.push(req.user._id);
                offer.bookedUsersCount = offer.bookedUsersCount + 1
                await offer.save();
                let offerCode = generateCode(8)
                //get coins from user balance 
                user.balance = user.balance - offer.coins
                await user.save();
                await Bill.create({
                    client:req.user._id,
                    offer:offerId,
                    place:offer.place,
                    offerCode:offerCode
                })
                let reports = {
                    "action":"User Book Offer",
                    "type":"OFFERS",
                    "deepId":offerId,
                    "user": req.user._id
                };
                await Report.create({...reports});
                res.status(200).send({
                    success: true,
                    offerCode:offerCode,
                });
            }else{
                return next(new ApiError(400,  i18n.__('you.takeOffer')));
            }

        }
        catch (err) {
            next(err);
        }
    },
    validateConfirmBody() {
        return [
            body('offerCode').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('offerCode.required', { value});
            }),
            
        ]
    },
    async confirmOffer(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE","SUBERVISOR"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            
            const validatedBody = checkValidations(req);
            let bill = await Bill.findOne({deleted:false,offerCode:validatedBody.offerCode})
            if(bill){
                if(isInArray(["SUBERVISOR","PLACE"],req.user.type)){
                    if(req.user.place != bill.place)
                        return next(new ApiError(403, i18n.__('admin.auth')));
                }
                let offer = await checkExistThenGet(bill.offer, Offer, { deleted: false });
               
                console.log("offer",offer)
                ///add user to users how got the offer
                let arr = offer.gotUsers;
                var found = arr.find(e => e == bill.client)
                if(!found){
                    offer.gotUsers.push(bill.client);
                    offer.gotUsersCount = offer.gotUsersCount + 1
                }
                //remove user from users how booked offer
                let arr2 = offer.bookedUsers;
                console.log("before",arr2);
                for(let i = 0;i<= arr2.length;i=i+1){
                    if(arr2[i] == bill.client){
                        arr2.splice(i, 1);
                    }
                }
                offer.bookedUsers = arr2;
                await offer.save();
                bill.status ='DONE';
                bill.actionUser = req.user._id;
                bill.doneDateMillSec = Date.parse(new Date())
                await bill.save();
                let reports = {
                    "action":"User Got Offer",
                    "type":"OFFERS",
                    "deepId":bill.offer,
                    "user": bill.client
                };
                await Report.create({...reports});
                //report for place
                let reports2 = {
                    "action":"Place Confirm Offer",
                    "type":"OFFERS",
                    "deepId":bill.offer,
                    "user": req.user
                };
                await Report.create({...reports2});
                sendNotifiAndPushNotifi({
                    targetUser: bill.client, 
                    fromUser: bill.place, 
                    text: ' Edu Hub',
                    subject: bill.id,
                    subjectType: 'Bill Status',
                    info:'BILL'
                });
                let notif = {
                    "description_en":'Your Order Has Been Confirmed ',
                    "description_ar":'  تمت الموافقه على طلبك',
                    "title_en":'Your Order Has Been Confirmed ',
                    "title_ar":' تمت الموافقه على طلبك',
                    "type":'BILL'
                }
                await Notif.create({...notif,resource:req.user,target:bill.client,bill:bill.id});
                res.status(200).send({success: true});
            }else{
                return next(new ApiError(500, i18n.__('offerCode.incorrect')));
            }
          

        }
        catch (err) {
            next(err);
        }
    },



};