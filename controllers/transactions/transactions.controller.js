import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import {checkExistThenGet} from "../../helpers/CheckMethods";
import Event from "../../models/event/event.model";
import Transaction from "../../models/transaction/transaction.model";
import {transformTransaction,transformTransactionById} from "../../models/transaction/transformTransaction"
import User from "../../models/user/user.model";
import Fund from "../../models/fund/fund.model";
import Package from "../../models/package/package.model";
import CashbackPackage from "../../models/cashbackPackage/cashbackPackage.model";

import Fees from "../../models/fees/fees.model";
import Order from "../../models/order/order.model"
import i18n from "i18n";
import Setting from "../../models/setting/setting.model";
import {encryptedData,decryptedData} from "../shared/shared.controller"
import Offer from "../../models/offer/offer.model";
import { generateCode } from '../../services/generator-code-service';
import Bill from "../../models/bill/bill.model";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Premium from "../../models/premium/premium.model";
import OfferBooking from "../../models/offerBooking/offerBooking.model"
import OfferCart from "../../models/offerCart/offerCart.model";
import moment from "moment";
import EventAttendance from "../../models/event/eventAttendance.model"
import Business from "../../models/business/business.model"
import CourseParticipant from "../../models/course/courseParticipant.model";
import Course from "../../models/course/course.model";
import FundProgram from "../../models/fundProgram/fundProgram.model";
const populateQuery = [
    { path: 'user', model: 'user'},
    { path:'business', model:'business'},

];
const populateQueryById = [
    { path: 'oldPackage', model: 'package'},
    { path: 'package', model: 'package'},
    { path: 'cashbackPackage', model: 'cashbackPackage'},
    { path: 'order', model: 'order'},
    { path: 'fund', model: 'fund'},
    { path: 'premiums', model: 'premium'},
    { path: 'fees',model: 'fees'},
    { path: 'offer', model: 'offer'},
    { path: 'user', model: 'user'},
    { path: 'event', model: 'event'},
    { path:'business', model:'business'},
    {
        path: 'offerBooking', model: 'offerBooking',
        populate: {  path: 'offers.offer', model: 'offer' },
    },
    {
        path: 'offerBooking', model: 'offerBooking',
        populate: {  path: 'offers.place', model: 'place' },
    },
];
const payPremium = async (premiums,client) => {
    for (let thePremium of premiums) {
        console.log("thePremium",thePremium)
        let premium = await checkExistThenGet(thePremium, Premium,{deleted:false});
        if(premium.status == "PAID")
            throw new ApiError(500, i18n.__('premium.paid'));
        premium.status = 'PAID';
        premium.paidDate = premium.installmentDate;
        await premium.save();
        if(premium.fund){
            let fund = await checkExistThenGet(premium.fund, Fund,{deleted:false});
            if(premium.lastMonth == true){
                fund.status = "COMPLETED"
                await fund.save();
            }
            sendNotifiAndPushNotifi({
                targetUser: fund.owner, 
                fromUser: fund.owner, 
                text: 'EdHub',
                subject: fund.id,
                subjectType: 'fund Premium Paid',
                info:'PREMIUM'
            });
            let notif = {
                "description_en":'Your Fund Premium Has Been Paid ',
                "description_ar":' تم دفع قسط التمويل الخاص بك',
                "title_en":'Your Fund Premium Has Been Paid ',
                "title_ar":' تم دفع قسط التمويل الخاص بك',
                "type":'PREMIUM'
            }
            await Notif.create({...notif,resource:client,target:fund.owner,premium:premium.id});
        }
        if(premium.fees){
            let fees = await checkExistThenGet(premium.fees, Fees,{deleted:false});
            let setting = await Setting.findOne({deleted: false})
            let cashBack = (premium.cost * setting.feesCashBackRatio) / 100 
            console.log("cashBack",cashBack)
            let fundOwner = await checkExistThenGet(client, User,{deleted:false})
            fundOwner.balance = fundOwner.balance + cashBack
            fundOwner.cashBack = true
            await fundOwner.save();
            if(premium.lastMonth == true){
                fees.status = "COMPLETED"
            }else{
                fees.status = "STARTED"
            }
            await fees.save();
            sendNotifiAndPushNotifi({
                targetUser: fees.owner, 
                fromUser: client, 
                text: 'EdHub',
                subject: fees.id,
                subjectType: 'Fees Premium Paid',
                info:'PREMIUM'
            });
            let notif = {
                "description_en":'Your Fees Premium Has Been Paid ',
                "description_ar":'  تم دفع قسط المصاريف الخاصه بك',
                "title_en":'Your Fees Premium Has Been Paid ',
                "title_ar":' تم دف عقسط المصاريف الخاصه بك',
                "type":'PREMIUM'
            }
            await Notif.create({...notif,resource:client,target:client,premium:premium.id});
        }
        if(premium.course){
            let courseParticipant = await CourseParticipant.findOne({ user: client, course: premium.course,deleted:false})
            if(courseParticipant){
                if(premium.lastMonth == true){
                    courseParticipant.status = "DONE"
                    await courseParticipant.save();
                }
            }else{
                let attendedUser = await checkExistThenGet(client, User,{deleted:false});
                let arr = attendedUser.attendedCourses;
                var found = arr.find((e) => e == premium.course); 
                if(!found){
                    attendedUser.attendedCourses.push(premium.course);
                    await attendedUser.save();
                    await CourseParticipant.create({
                        user:client,
                        course:premium.course,
                        status:'PAID',
                        paymentMethod:'CASH'
                    });
                    let reports = {
                        "action":"user will attend to course",
                        "type":"COURSE",
                        "deepId":premium.course,
                        "user": client
                    };
                    await Report.create({...reports});
                }
            }
            
        }
        let reports = {
            "action":"Pay Premium",
            "type":"PREMIUMS",
            "deepId":premium.id,
            "user": client
        };
        await Report.create({...reports});
    }
    
    return true
};
const payFirstPaid = async (theFund,client) => {
    let fund = await checkExistThenGet(theFund, Fund,{deleted:false});
    if(fund.status != "ACCEPTED")
        throw new ApiError(500, i18n.__('fund.accepted'));
    fund.status = 'STARTED';
    
    let fundProgram = await checkExistThenGet(fund.fundProgram,FundProgram)
    let setting = await Setting.findOne({deleted: false})
    
    let total = fund.totalWithMonthlyPercent + fund.firstPaid 
    console.log("total",total)
    let cashBack = (total * setting.cashBackRatio) / 100 
    console.log("cashBack",cashBack)
    
    //add cashBack to fund owner
    let fundOwner = await checkExistThenGet(fund.owner, User,{deleted:false})
    fundOwner.balance = fundOwner.balance + cashBack
    fundOwner.cashBack = true
    await fundOwner.save();
    //add cashBack to affiliate
    if(fundOwner.affiliate){
        let affiliateCashBack = (fund.totalWithMonthlyPercent * setting.affiliateRatio) / 100 
        let affiliate = await checkExistThenGet(fundOwner.affiliate, User,{deleted:false})
        affiliate.balance = affiliate.balance + affiliateCashBack
        await affiliate.save();
    }

    let date = new Date();
    if(fund.startDate){
        date = fund.startDate
    }else{
        date = new Date(date.setMonth(date.getMonth() + 2));
    }
    let monthCount = fundProgram.monthCount;
    let endDate = new Date(date.setMonth(date.getMonth() + monthCount));
    fund.endDate = endDate;
    let cost = (fund.totalWithMonthlyPercent * monthCount) / 12
    //////////////////////////create premiums////////////////////////////
    for(var i=0; i < monthCount; i++){
        let installmentDate = new Date(date.setMonth(date.getMonth() + i));
        console.log("installmentDate",installmentDate)

        let lastMonth = false
        if(monthCount - 1 == i) lastMonth = true
        
        await Premium.create({
            fund:fund.id,
            owner: fund.user,
            receiptNum:i+1,
            student: fund.students,
            installmentDate:installmentDate,
            cost:cost ,
            lastPremium:lastMonth
        });
    }
    await fund.save();
    let reports = {
        "action":"Pay Fund FirstPaid",
        "type":"FUND",
        "deepId":fund,
        "user": client
    };
    await Report.create({...reports});
};
const payOfferBooking = async (theOfferBooking,client) => {
    let offerBooking = await checkExistThenGet(theOfferBooking, OfferBooking,{deleted:false}, { deleted: false})
    console.log(offerBooking)
    let user = await checkExistThenGet(client, User, { deleted: false})
    for (let theOffer of offerBooking.offers) {
        console.log(theOffer.offer)
        let offerId = theOffer.offer;
        console.log(`Offer ${offerId}`)
        let offer = await checkExistThenGet(offerId, Offer, { deleted: false });
        if(user.balance < offer.coins)
            return next(new ApiError(500, i18n.__('balance.notEnough')));
        let arr = offer.bookedUsers;
        var found = arr.find(e => e == client)
        if(!found){
            offer.bookedUsers.push(client);
            offer.bookedUsersCount = offer.bookedUsersCount + 1
            await offer.save();
            //get coins from user balance 
            user.balance = user.balance - offer.coins
            await Bill.create({
                client:client,
                offer:offerId,
                place:offer.place,
                offerCode:theOffer.code
            })
            let reports = {
                "action":"User Book Offer",
                "type":"OFFERS",
                "deepId":offerId,
                "user": client
            };
            await Report.create({...reports});

        }
        //remove offer from offer cart
        let offerCarts = await OfferCart.find({deleted: false,user:client,offer:offerId})
        for (let offerCart of offerCarts ) {
            offerCart.deleted = true;
            await offerCart.save();
        }
        let arr2 = user.offerCarts;
        console.log(arr2);
        for(let i = 0;i<= arr.length;i=i+1){
            if(arr[i] == offerId){
                arr.splice(i, 1);
            }
        }
        user.offerCarts = arr2;
        await user.save();
    }
    return true;
};
const payPackage = async (thePackage,userId,businessId) => {
    let newPackage = await checkExistThenGet(thePackage, Package, { deleted: false });
    let endDateMillSec
    if(newPackage.durationType == "DAILY"){
        endDateMillSec = Date.parse(moment(new Date()).add(newPackage.duration, "d").format()) ;
    }
    if(newPackage.durationType == "MONTHLY"){
        endDateMillSec = Date.parse(moment(new Date()).add(newPackage.duration, "M").format()) ;
    }
    if(newPackage.durationType == "YEARLY"){
        endDateMillSec = Date.parse(moment(new Date()).add(newPackage.duration, "Y").format()) ;
    }
    if(businessId){
        let theBusiness = await checkExistThenGet(businessId, Business, { deleted: false });
        theBusiness.package = thePackage;
        theBusiness.hasPackage = true;
        theBusiness.packageStartDateMillSec = Date.parse(new Date());
        theBusiness.packageEndDateMillSec = endDateMillSec ;
        await theBusiness.save();
    }else{
        let user = await checkExistThenGet(userId, User, { deleted: false });
        user.package = thePackage;
        user.hasPackage = true;
        user.packageStartDateMillSec = Date.parse(new Date());
        user.packageEndDateMillSec = endDateMillSec ;
        await user.save();
    }
    
    return true;
};
const payEvent = async (theEvent,userId) => {
    let event = await checkExistThenGet(theEvent, Event, { deleted: false });
    //add client to event attendance
    let arr = event.attendance;
    var found = arr.find((e) => e == userId); 
    if(!found){
        event.attendance.push(userId);
        eventAttendance = await EventAttendance.create({ user: userId, event: event });
        let reports = {
            "action":"user will attend to event",
            "type":"EVENT",
            "deepId":event,
            "user": userId
        };
        await Report.create({...reports});
    }else{
        eventAttendance = await EventAttendance.findOne({ user: userId, event: event });
    }
    //remove user from under payment list
    let arr2 = event.waitToPaid;
    var found2 = arr2.find((e) => e == userId); 
    if(found2){
        for(let i = 0;i<= arr2.length;i=i+1){
            if(arr2[i] == userId){
                arr2.splice(i, 1);
            }
        }
        event.waitToPaid = arr2;
    }
    await event.save();
    return eventAttendance._id;
};
const payCourse = async (courseId,userId,paymentMethod) => {
    let theCourse = await checkExistThenGet(courseId, Course,{deleted:false});
    let attendedUser = await checkExistThenGet(userId, User,{deleted:false});
    let arr = attendedUser.attendedCourses;
    var found = arr.find((e) => e == courseId); 
    let courseParticipant
    if(!found){
        attendedUser.attendedCourses.push(courseId);
        
        courseParticipant = await CourseParticipant.create({
            user:userId,
            course:courseId,
            status:'PAID',
            paymentMethod:paymentMethod
        });
        if(paymentMethod == "INSTALLMENT"){
            //create premuims
            console.log(theCourse.installments)
            let payments = theCourse.installments
            for(var i=0; i < payments.length; i++) {
                let payment = payments[i];
                let paidDate = new Date()
                let installmentDate = new Date(paidDate.setMonth(paidDate.getMonth() + i));
                console.log(installmentDate)
                let lastMonth = false
                if(payments.length - 1 == i) lastMonth = true
                let thePremium = await Premium.create({
                    course:courseId,
                    type:'COURSE',
                    receiptNum:i+1,
                    owner: userId,
                    installmentDate:installmentDate,
                    cost:payment.price,
                    lastPremium:lastMonth,
                    status:i==0?'PAID':'PENDING'
                });
                let reports = {
                    "action":"Create premium",
                    "type":"PREMIUMS",
                    "deepId":thePremium.id,
                    "user": userId
                };
                await Report.create({...reports });
            }
        }
        await attendedUser.save();
        let reports = {
            "action":"user will attend to course",
            "type":"COURSE",
            "deepId":courseId,
            "user": userId
        };
        await Report.create({...reports});
    }else{
        courseParticipant = await CourseParticipant.findOne({
            user:userId,
            course:courseId
        })
    }
    return courseParticipant._id;
};
const callBack = async (merchantRefNumber,status,paymentMethod,data) => {
   
    let theTransaction = await Transaction.findOne({transactionId:merchantRefNumber})
    if(!theTransaction)
        throw new ApiError(400, i18n.__('transaction not exist'))

    let doneTransaction = await Transaction.findOne({status:{$ne:'PENDING'},transactionId:merchantRefNumber})
    if(doneTransaction)
        throw new ApiError(400, i18n.__('transaction is done'))

    if(status == "PAID"){
        theTransaction.status = "SUCCESS"
        theTransaction.paymentMethod = paymentMethod
        theTransaction.paymentObject = data?JSON.stringify(data):null
        let userId = theTransaction.user

        let user = await checkExistThenGet(userId, User,{deleted:false})
        
        if(theTransaction.type =="USER-PACKAGE" || theTransaction.type == "BUSINESS-PACKAGE"){
            await payPackage(theTransaction.package,userId,theTransaction.business)
        }
        if(theTransaction.type =="EVENT"){
            let eventAttendance = await payEvent(theTransaction.event,userId)
            theTransaction.eventAttendance = eventAttendance
        }
        if(theTransaction.type =="ON-SITE-COURSE" || theTransaction.type == "ONLINE-COURSE"){
            console.log("course")
            let courseParticipant = await payCourse(theTransaction.course,userId,theTransaction.coursePaymentMethod)
            theTransaction.courseParticipant = courseParticipant
        }
        if(theTransaction.type =="COURSE-PREMIUM" || theTransaction.type =="FUND" || theTransaction.type == "FEES"){
            await payPremium(theTransaction.premiums,userId)
        }
        if(theTransaction.type =="FUND-FIRSTPAID"){
            await payFirstPaid(theTransaction.fund,userId)
        }
        if(theTransaction.type =="CASHBACK-PACKAGE"){
            let cashbackPackage = await checkExistThenGet(theTransaction.cashbackPackage, CashbackPackage, { deleted: false });
            user.balance  = user.balance + cashbackPackage.coins
            await user.save();
        }
        if(theTransaction.type =="OFFER"){
            await payOfferBooking(theTransaction.offerBooking,userId)
        }
        if(theTransaction.type =="ORDER"){
            let order = await checkExistThenGet(theTransaction.order, Order, { deleted: false });
            order.status  = 'ACCEPTED'
            await order.save();
        }
        let transactionId = theTransaction.id;
        let encryptedId = await encryptedData(transactionId.toString(),process.env.Securitykey)
        let url = 'https://edyouhub.com/tax-invoice/'+encryptedId;
        let text = 'رابط الفاتوره الضريبيه الخاصه بك هو : '
        //sendEmail(user.email,url, text)
        theTransaction.billUrl = url;
        await theTransaction.save();
        let reports = {
            "action":"Payment Process 2",
            "type":"PAYMENT",
            "deepId":theTransaction._id,
            "user": theTransaction.user
        };
        await Report.create({...reports });
    }
    return true;
};
export default {
    
    async payment(req,res,next){
        try{
            let lang = i18n.getLocale(req)
            let data = req.body
            console.log("data",data)
            console.log(await Transaction.findOne({transactionId:data.id}))
            if(await Transaction.findOne({transactionId:data.id}))
                return next(new ApiError(400, i18n.__('transaction exist')))

            const validatedBody = data
            let transactionData={
                "cost":validatedBody.cost,
                "tax":validatedBody.tax,
                "totalCost": parseInt(validatedBody.cost) + parseInt(validatedBody.tax),
                "user":validatedBody.client,
                "type":validatedBody.type,
                "transactionId":data.id,
                "paymentObject":JSON.stringify(data)
            }
            if(validatedBody.business) transactionData.business = validatedBody.business
            if(validatedBody.coupon) transactionData.coupon = validatedBody.coupon
            
            if(validatedBody.type =="PACKAGE"){
                transactionData.package = validatedBody.package
                let thePackage = await checkExistThenGet(validatedBody.package,Package,{deleted:false})
                if(thePackage.type == "FOR-USER"){
                    transactionData.type = "USER-PACKAGE"
                    let theUser = await checkExistThenGet(validatedBody.client,User,{deleted:false})
                    transactionData.oldPackage = theUser.package
                }
                if(thePackage.type == "FOR-BUSINESS"){
                    transactionData.type = "BUSINESS-PACKAGE"
                    let theBusiness = await checkExistThenGet(validatedBody.business,Business,{deleted:false})
                    transactionData.oldPackage = theBusiness.package
                }
            }
            
            if(validatedBody.type =="PREMIUM"){
                transactionData.premiums = validatedBody.premiums
                let premium = await checkExistThenGet(validatedBody.premiums[0],Premium,{deleted:false})
                if(premium.type === "FUND"){
                    transactionData.fund = premium.fund
                    transactionData.type = "FUND"
                }
                if(premium.type === "FEES"){
                    transactionData.fees = premium.fees
                    transactionData.type = "FEES"
                }
                if(premium.type === "COURSE"){
                    transactionData.course = premium.course
                    transactionData.type = "COURSE-PREMIUM"
                }
            }
            if(validatedBody.type =="EVENT"){
                transactionData.event = validatedBody.event
                let event = await checkExistThenGet(validatedBody.event, Event, { deleted: false });
                let arr = event.waitToPaid;
                var found = arr.find((e) => e == validatedBody.client); 
                if(!found){
                    event.waitToPaid.push(validatedBody.client);
                    await event.save();
                }
            }
            if(validatedBody.type =="COURSE"){
                transactionData.course = validatedBody.course
                let course = await checkExistThenGet(validatedBody.course, Course, { deleted: false });
                if(course.type == "ONLINE") transactionData.type = "ONLINE-COURSE"
                if(course.type == "ON-SITE") transactionData.type = "ON-SITE-COURSE"
                if(validatedBody.coursePaymentMethod)
                    transactionData.coursePaymentMethod = validatedBody.coursePaymentMethod;
                
            }
            
            if(validatedBody.type =="FUND-FIRSTPAID"){
                transactionData.fund = validatedBody.fund
                let fund = await checkExistThenGet(validatedBody.fund, Fund,{deleted:false});
                fund.active = true;
                await fund.save();
            }
            if(validatedBody.type =="OFFER"){
                let offers = []
                let coins = 0
                await Promise.all(validatedBody.offers.map(async(offer) => {
                    offer.code = generateCode(8);
                    offers.push(offer)
                    let theOffer = await checkExistThenGet(offer.offer,Offer, { deleted: false })
                    coins = coins + theOffer.coins
                    let offerCarts = await OfferCart.find({deleted: false,user:validatedBody.client,offer:offer.offer})
                    for (let offerCart of offerCarts ) {
                        offerCart.paymentProgress = true;
                        await offerCart.save();
                    }
                }));
                let offerBooking = await OfferBooking.create({
                    user:validatedBody.client,
                    offers:offers,
                })
                transactionData.offerBooking = offerBooking.id
                transactionData.coins = coins
            }
            if(validatedBody.type =="CASHBACK-PACKAGE"){
                transactionData.cashbackPackage = validatedBody.cashbackPackage
            }
            if(validatedBody.type =="ORDER"){
                transactionData.order = validatedBody.order
            }
            let createdTransaction = await Transaction.create({... transactionData})
            let reports = {
                "action":"Payment Process 1",
                "type":"PAYMENT",
                "deepId":createdTransaction._id,
                "user": validatedBody.client
            };
            await Report.create({...reports });

            if(validatedBody.totalCost == 0 &&validatedBody.coupon){
                console.log("Payment free : ", data.id)
                await callBack(data.id,'PAID',null)
            }
            await Transaction.findById(createdTransaction.id).populate(populateQueryById)
            .then(async(e)=>{
                let index = await transformTransaction(e,lang)
                res.send({
                    success:true,
                    data:index
                });
            })
        }catch(error){
            next(error)
        }
    },
    async findAllTransactions(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = req.query.page || 1, limit = +req.query.limit || 20 ;
            let {thePackage,type,user,fund,fees,status} = req.query;
            
            let query = {deleted: false };
           
            if (type =="CASHBACK") {
                query.type = {$in:['PACKAGE','OFFER']}
            }
            else if (type =="FUND") {
                Object.assign(query, {
                    $and: [{
                            $or: [
                                { type: "FUND"},
                                { type: "FUND-FIRSTPAID"},
                                { fund: {$ne:null}},

                            ]
                        },
                        { deleted: false },
                    ]
                })
            }else{
                query.type = type;
            }
            
            if (fund) query.fund = fund;
            if (fees) query.fees = fees;
            if (thePackage) query.package = thePackage
            if (status) query.status = status;
            if (user) query.user = user;
            let sortd = {_id: -1}
            await Transaction.find(query).populate(populateQuery)
            .sort(sortd)
            .limit(limit)
            .skip((page - 1) * limit)
            .then(async(data)=>{
                let newdata = []
                await Promise.all(data.map(async(e)=>{
                    let index = await transformTransaction(e,lang)
                    newdata.push(index)
                    
                }))
                const count = await Transaction.countDocuments(query);
                const pageCount = Math.ceil(count / limit);
                res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
            })
            
        } catch (err) {
            next(err);
        }
    },
    async getAllTransactions(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {thePackage,type,user,fund,fees,status} = req.query;
            
            let query = {deleted: false };
           
            if (type) query.type = type;
            if (type =="CASHBACK") query.type = {$in:['PACKAGE','OFFER','FEES','FUND-FIRSTPAID']}
            if (fund) query.fund = fund;
            if (fees) query.fees = fees;
            if (thePackage) query.package = thePackage
            if (status) query.status = status;
            if (user) query.user = user;
            let sortd = {createdAt: -1}
            await Transaction.find(query).populate(populateQuery2)
            .sort(sortd)
            .then(async(data)=>{
                let newdata = []
                await Promise.all(data.map(async(e)=>{
                    let index = await transformTransaction(e,lang)
                    newdata.push(index)
                }))
                res.send({success:true,data:newdata});
            })
            
        } catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {transactionId} = req.params
            // const Securitykey =  process.env.Securitykey
            // console.log(transactionId.toString())
            // let decreptId = await decryptedData(transactionId.toString(),Securitykey)
            // console.log(decreptId)
            await Transaction.findById(transactionId).populate(populateQueryById)
            .then(async(e)=>{
                let index = await transformTransactionById(e,lang)
                res.send({success:true,data:index});
            })
            
        } catch (err) {
            next(err);
        }
    },
    async fawryCallBack(req, res, next) {
        try{
            let data = req.body
            console.log("data",data)
            await callBack(data.merchantRefNumber,data.orderStatus,data.paymentMethod,data)
            res.send({
                success: true,
            });
        }catch(error){
            next(error)
        }
    },
};