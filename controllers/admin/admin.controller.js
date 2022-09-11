import ApiError from "../../helpers/ApiError";
import User from "../../models/user/user.model";
import Bill from "../../models/bill/bill.model";
import Offer from "../../models/offer/offer.model";
import Place from "../../models/place/place.model";
import Order from "../../models/order/order.model";
import {transformUser} from "../../models/user/transformUser";
import {transformOrder} from "../../models/order/transformOrder";
import {transformOffer} from "../../models/offer/transformOffer";
import { convertLang } from "../shared/shared.controller";
import {isInArray } from "../../helpers/CheckMethods";
import moment from 'moment';
import i18n from 'i18n'
const populateQuery = [
    { path: 'place', model: 'place'},
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    { path: 'affiliate', model: 'user'}
    
];
const populateQuery2 = [ 
    { path: 'place', model: 'place',},
    { path: 'user', model: 'user'},
];
const populateQueryOrder = [
    { path: 'client', model: 'user'},
    { path: 'suppliesList.promoCode', model: 'coupon' },
    {
        path: 'address', model: 'address',
        populate: { path: 'city', model: 'city' },
    },
    {
        path: 'address', model: 'address',
        populate: { path: 'area', model: 'area' },
    },
    {
        path: 'suppliesList.supplies', model: 'supplies',
        populate: { path: 'educationSystem', model: 'educationSystem' },
    },
    {
        path: 'suppliesList.supplies', model: 'supplies',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
    {
        path: 'suppliesList.supplies', model: 'supplies',
        populate: { path: 'grade', model: 'grade' },
    },
    {
        path: 'suppliesList.items.product', model: 'product',
    },
    {
        path: 'suppliesList.items.color', model: 'color',
    },
    
];
export default {
    async getLastUser(req, res, next) {
        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
               return next(new ApiError(403, i18n.__('admin.auth')));
            let query = {
              deleted: false
            };
            let lastUser = await User.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(10).then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e)=>{
                        console.log(e._id)
                        let index = await transformUser(e);
                        newdata.push(index)
                    }))
                    res.send({success: true,data:newdata});
                })

            res.send(lastUser);
        } catch (error) {
            next(error);
        }
    },
    async getLastOffers(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN')
                return next(new ApiError(403, 'bad auth'));
            let query = {deleted: false};
         
            await Offer.find(query).populate(populateQuery2)
                .sort({ fullDate: 1 })
                .limit(10).then(async(data) => {
                    let newdata = []
                    data.map(async(e)=>{
                        console.log(e._id)
                        let index = await transformOffer(e);
                        newdata.push(index)
                    })
                    res.send({success: true,data:newdata});
                })

        } catch (error) {
            next(error);
        }
    },

    async getLastOrders(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN')
                return next(new ApiError(403, 'bad auth'));
            let { status} = req.query
            let query = {deleted: false };
            if (status)
                query.status = status;                
            await Order.find(query).populate(populateQueryOrder)
                .sort({ createdAt: -1 })
                .limit(10).then(async(data) => {
                    let newdata = []
                    data.map(async(e)=>{
                        console.log(e._id)
                        let index = await transformOrder(e);
                        newdata.push(index)
                    })
                    res.send({success: true,data:newdata});
                })
        } catch (error) {
            next(error);
        }
    },
   
    async count(req,res, next) {
        try {
            let query = { deleted: false };
            const usersCount = await User.countDocuments({deleted: false,type:'USER'});
            const placesCount = await Place.countDocuments({deleted: false});
            const doneBills = await Bill.countDocuments({deleted: false,status:'DONE'});
            const pendingBills = await Bill.countDocuments({deleted: false,status:'PENDING'});
            const offersCount = await Offer.countDocuments({deleted: false});
            const ordersCount = await Order.countDocuments({deleted: false,status:{$nin:["PENDING"]}});
            res.status(200).send({
                users:usersCount,
                places:placesCount,
                doneBills:doneBills,
                offersCount:offersCount,
                pendingBills:pendingBills,
                ordersCount:ordersCount,
                
            });
        } catch (err) {
            next(err);
        }
        
    },
    
}