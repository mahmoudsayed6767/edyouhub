import ApiError from "../../helpers/ApiError";
import User from "../../models/user/user.model";
import Bill from "../../models/bill/bill.model";
import Offer from "../../models/offer/offer.model";
import Place from "../../models/place/place.model";
import Anoncement from "../../models/anoncement/anoncement.model";
import {transformUser} from "../../models/user/transformUser";
import {transformBill} from "../../models/bill/transformBill";
import {transformOffer} from "../../models/offer/transformOffer";
import { convertLang } from "../shared/shared.controller";
import {isInArray } from "../../helpers/CheckMethods";
import moment from 'moment';
import i18n from 'i18n'
const populateQuery = [
    { path: 'area', model: 'area' },
    { path: 'city', model: 'city' },
];
const populateQuery2 = [ 
    {
        path: 'place', model: 'place',
        populate: { path: 'area', model: 'area' },
    },
    {
        path: 'user', model: 'user',
        populate: { path: 'area', model: 'area' },
    },
];
const populateQuery3 = [ 
    {
        path: 'place', model: 'place',
        populate: { path: 'area', model: 'area' },
    },
];
export default {
    async getLastUser(req, res, next) {
        try {
            let user = req.user;
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
                    res.send({success: true,users:newdata});
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
         
            let lastOffers = await Offer.find(query).populate(populateQuery2)
                .sort({ fullDate: 1 })
                .limit(10).then(async(data) => {
                    let newdata = []
                    data.map(async(e)=>{
                        console.log(e._id)
                        let index = await transformOffer(e);
                        newdata.push(index)
                    })
                    res.send({success: true,offers:newdata});
                })

            res.send({success:true,data:lastOffers});
        } catch (error) {
            next(error);
        }
    },

    async getLastBills(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN')
                return next(new ApiError(403, 'bad auth'));
            let { status} = req.query
            let query = {deleted: false };
            if (status)
                query.status = status;                
            await Bill.find(query).populate(populateQuery3)
                .sort({ createdAt: -1 })
                .limit(10).then(async(data) => {
                    let newdata = []
                    data.map(async(e)=>{
                        console.log(e._id)
                        let index = await transformBill(e);
                        newdata.push(index)
                    })
                    res.send({success: true,bills:newdata});
                })
        } catch (error) {
            next(error);
        }
    },
   
    async count(req,res, next) {
        try {
            let query = { deleted: false };
            const usersCount = await User.countDocuments({deleted: false,type:'USER'});
            const branchesCount = await Branch.countDocuments({deleted: false});
            const placesCount = await Place.countDocuments({deleted: false});
            const doneBills = await Bill.countDocuments({deleted: false,status:'DONE'});
            const pendingBills = await Bill.countDocuments({deleted: false,status:'PENDING'});
            const offersCount = await Offer.countDocuments({deleted: false});
            const anoncementsCount = await Anoncement.countDocuments({deleted: false});
            res.status(200).send({
                users:usersCount,
                places:placesCount,
                doneBills:doneBills,
                offersCount:offersCount,
                pendingBills:pendingBills,
                anoncementsCount:anoncementsCount,
                branchesCount:branchesCount,
                
            });
        } catch (err) {
            next(err);
        }
        
    },
    async graph(req,res, next) {
        try {
            //convertLang(req)
            //get lang
            let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let {startDate,duration} = req.query
            if (!startDate){
                startDate = new Date()
            }
            console.log(startDate)
            if(duration =="WEEK"){ 
                let d1 = moment(startDate).add(0, 'd').format('YYYY-MM-DD')
                let startDay1 = d1 +'T00:00:00.000Z'
                let endDay1 = d1 +'T23:59:59.000Z'
                let bills1 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte :startDay1 , $lte : endDay1 }
                })
                let users1 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay1 , $lte : endDay1 }
                })
                //////////////////////////////////////////////////////////////////
                let d2 = moment(startDate).add(-1, 'd').format('YYYY-MM-DD')
                let startDay2 = d2 +'T00:00:00.000Z'
                let endDay2 = d2 +'T23:59:00.000Z'
                let bills2 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte :startDay2 , $lte : endDay2 }
                })
                let users2 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay2 , $lte : endDay2 }
                })
                //////////////////////////////////////////////////////////////////
                let d3 = moment(startDate).add(-2, 'd').format('YYYY-MM-DD')
                let startDay3 = d3 +'T00:00:00.000Z'
                let endDay3 = d3 +'T23:59:00.000Z'
                let bills3 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte :startDay3 , $lte : endDay3 }
                })
                let users3 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay3 , $lte : endDay3 }
                })
                //////////////////////////////////////////////////////////////////
                let d4 = moment(startDate).add(-3, 'd').format('YYYY-MM-DD')
                let startDay4 = d4 +'T00:00:00.000Z'
                let endDay4 = d4 +'T23:59:00.000Z'
                let bills4 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay4 , $lte : endDay4 }
                })
                let users4 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay4 , $lte : endDay4 }
                })
                //////////////////////////////////////////////////////////////////
                let d5 = moment(startDate).add(-4, 'd').format('YYYY-MM-DD')
                let startDay5 = d5 +'T00:00:00.000Z'
                let endDay5 = d5 +'T23:59:00.000Z'
                let bills5 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay1 , $lte : endDay5 }
                })
                let users5 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay5 , $lte : endDay5 }
                })
                //////////////////////////////////////////////////////////////////
                let d6 = moment(startDate).add(-5, 'd').format('YYYY-MM-DD')
                let startDay6 = d6 +'T00:00:00.000Z'
                let endDay6 = d6 +'T23:59:00.000Z'
                let bills6 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay6 , $lte : endDay6 }
                })
                let users6 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay6 , $lte : endDay6 }
                })
                //////////////////////////////////////////////////////////////////
                let d7 = moment(startDate).add(-6, 'd').format('YYYY-MM-DD')
                let startDay7 = d7 +'T00:00:00.000Z'
                let endDay7 = d7 +'T23:59:00.000Z'
                let bills7 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay7 , $lte : endDay7 }
                })
                let users7 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay7 , $lte : endDay7 }
                })
                //////////////////////////////////////////////////////////////////
                let users = [users1, users2, users3, users4, users5, users6, users7]
                let bills = [bills1, bills2, bills3, bills4, bills5, bills6, bills7]
                let days = [d1, d2, d3, d4, d5, d6, d7]
                res.status(200).send({
                    users,
                    bills,
                    days
                });
            }
            else{ 
                let d1 = moment(startDate).add(0, 'd').format('YYYY-MM-DD')
                let startDay1 = d1 +'T00:00:00.000Z'
                let endDay1 = d1 +'T23:59:00.000Z'
                let bills1 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay1 , $lte : endDay1 }
                })
                let users1 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay1 , $lte : endDay1 }
                })
                //////////////////////////////////////////////////////////////////
                let d2 = moment(startDate).add(-3, 'd').format('YYYY-MM-DD')
                let startDay2 = d2 +'T00:00:00.000Z'
                let endDay2 = d2 +'T23:59:00.000Z'
                let bills2 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay2 , $lte : endDay2 }
                })
                let users2 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay2 , $lte : endDay2 }
                })
                //////////////////////////////////////////////////////////////////
                let d3 = moment(startDate).add(-6, 'd').format('YYYY-MM-DD')
                let startDay3 = d3 +'T00:00:00.000Z'
                let endDay3 = d3 +'T23:59:00.000Z'
                let bills3 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay3 , $lte : endDay3 }
                })
                let users3 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay3 , $lte : endDay3 }
                })
                //////////////////////////////////////////////////////////////////
                let d4 = moment(startDate).add(-9, 'd').format('YYYY-MM-DD')
                let startDay4 = d4 +'T00:00:00.000Z'
                let endDay4 = d4 +'T23:59:00.000Z'
                let bills4 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay4 , $lte : endDay4 }
                })
                let users4 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay4 , $lte : endDay4 }
                })
                //////////////////////////////////////////////////////////////////
                let d5 = moment(startDate).add(-12, 'd').format('YYYY-MM-DD')
                let startDay5 = d5 +'T00:00:00.000Z'
                let endDay5 = d5 +'T23:59:00.000Z'
                let bills5 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay1 , $lte : endDay5 }
                })
                let users5 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay5 , $lte : endDay5 }
                })
                //////////////////////////////////////////////////////////////////
                let d6 = moment(startDate).add(-15, 'd').format('YYYY-MM-DD')
                let startDay6 = d6 +'T00:00:00.000Z'
                let endDay6 = d6 +'T23:59:00.000Z'
                let bills6 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay6 , $lte : endDay6 }
                })
                let users6 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay6 , $lte : endDay6 }
                })
                //////////////////////////////////////////////////////////////////
                let d7 = moment(startDate).add(-18, 'd').format('YYYY-MM-DD')
                let startDay7 = d7 +'T00:00:00.000Z'
                let endDay7 = d7 +'T23:59:00.000Z'
                let bills7 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay7 , $lte : endDay7 }
                })
                let users7 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay7 , $lte : endDay7 }
                })
                //////////////////////////////////////////////////////////////////
                let d8 = moment(startDate).add(-21, 'd').format('YYYY-MM-DD')
                let startDay8 = d8 +'T00:00:00.000Z'
                let endDay8 = d8 +'T23:59:00.000Z'
                let bills8 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay8 , $lte : endDay8 }
                })
                let users8 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay7 , $lte : endDay8 }
                })
                //////////////////////////////////////////////////////////////////
                let d9 = moment(startDate).add(-24, 'd').format('YYYY-MM-DD')
                let startDay9 = d9 +'T00:00:00.000Z'
                let endDay9 = d9 +'T23:59:00.000Z'
                let bills9 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay9 , $lte : endDay9 }
                })
                let users9 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay9 , $lte : endDay9 }
                })
                //////////////////////////////////////////////////////////////////
                let d10 = moment(startDate).add(-27, 'd').format('YYYY-MM-DD')
                let startDay10 = d10 +'T00:00:00.000Z'
                let endDay10 = d10 +'T23:59:00.000Z'
                let bills10 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay10 , $lte : endDay10 }
                })
                let users10 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay10 , $lte : endDay10 }
                })
                //////////////////////////////////////////////////////////////////
                let d11 = moment(startDate).add(-30, 'd').format('YYYY-MM-DD')
                let startDay11 = d11 +'T00:00:00.000Z'
                let endDay11 = d11 +'T23:59:00.000Z'
                let bills11 = await Bill.countDocuments({
                    deleted: false,
                    status:'DONE',
                    createdAt:{$gte : startDay11 , $lte : endDay11 }
                })
                let users11 = await User.countDocuments({
                    deleted: false,createdAt:{$gte :startDay11 , $lte : endDay11 }
                })
                //////////////////////////////////////////////////////////////////
                let users = [users1,users2,users3,users4,users5,users6,users7,users8,users9,users10,users11]
                let bills = [bills1,bills2,bills3,bills4,bills5,bills6,
                    bills7,bills8,bills9,bills10,bills11]
                let days = [d1, d2, d3, d4, d5, d6, d7,d8, d9, d10, d11]
                res.status(200).send({
                    success: true,
                    users,
                    bills,
                    days
                });
            }
            
        } catch (err) {
            next(err);
        }
        
    },
    
}