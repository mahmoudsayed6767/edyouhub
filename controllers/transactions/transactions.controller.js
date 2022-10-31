import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import {checkExistThenGet ,isInArray} from "../../helpers/CheckMethods";
import { convertLang } from "../shared/shared.controller";
import Transaction from "../../models/transaction/transaction.model";
import {transformTransaction} from "../../models/transaction/transformTransaction"
import User from "../../models/user/user.model";
import Fund from "../../models/fund/fund.model";
import Package from "../../models/package/package.model";
import Fees from "../../models/fees/fees.model";
import Order from "../../models/order/order.model"
import i18n from "i18n";
import Setting from "../../models/setting/setting.model";
import {encryptedData,decryptedData} from "../shared/shared.controller"
import config from '../../config'
import { sendEmail } from "../../services/sendGrid";
import Offer from "../../models/offer/offer.model";
import { generateCode } from '../../services/generator-code-service';
import Bill from "../../models/bill/bill.model";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Premium from "../../models/premium/premium.model";
import OfferBooking from "../../models/offerBooking/offerBooking.model"
import OfferCart from "../../models/offerCart/offerCart.model";
const populateQuery2 = [
    {path: 'package', model: 'package'},
    {path: 'order', model: 'order'},
    {path: 'fund', model: 'fund'},
    {path: 'premium', model: 'premium'},
    {path: 'offer', model: 'offer'},
    {path: 'user', model: 'user'},
    {
        path: 'offerBooking', model: 'offerBooking',
        populate: { path: 'offers.offer', model: 'offer' },
    },
    {
        path: 'offerBooking', model: 'offerBooking',
        populate: { path: 'offers.place', model: 'place' },
    },
];
const payPremium = async (premiums,client) => {
    for (let thePremium of premiums) {
        console.log("thePremium",thePremium)
        let premium = await checkExistThenGet(thePremium, Premium);
        if(premium.status == "PAID")
            throw new ApiError(500, i18n.__('premium.paid'));
        premium.status = 'PAID';
        premium.paidDate = premium.installmentDate;
        await premium.save();
        if(premium.fund){
            let fund = await checkExistThenGet(premium.fund, Fund);
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
            let fees = await checkExistThenGet(premium.fees, Fees);
            let setting = await Setting.findOne({deleted: false})
            let cashBack = (premium.cost * setting.feesCashBackRatio) / 100 
            console.log("cashBack",cashBack)
            let fundOwner = await checkExistThenGet(client, User)
            fundOwner.balance = fundOwner.balance + cashBack
            await fundOwner.save();
            if(premium.lastMonth == true){
                fees.status = "COMPLETED"
                await fees.save();
            }else{
                fees.status = "STARTED"
            }
            sendNotifiAndPushNotifi({
                targetUser: fees.owner, 
                fromUser: fees.owner, 
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
    let fund = await checkExistThenGet(theFund, Fund);
    if(fund.status != "PENDING")
        throw new ApiError(500, i18n.__('fund.pending'));
    fund.status = 'STARTED';
    let setting = await Setting.findOne({deleted: false})
    
    let total = fund.totalFees + (fund.totalFees * setting.expensesRatio) / 100
    console.log("total",total)
    let cashBack = (total * setting.cashBackRatio) / 100 
    console.log("cashBack",cashBack)
    //add cashBack to fund owner
    let fundOwner = await checkExistThenGet(fund.owner, User)
    fundOwner.balance = fundOwner.balance + cashBack
    await fundOwner.save();
    //add cashBack to affiliate
    if(fundOwner.affiliate){
        let affiliateCashBack = (fund.totalFees * setting.affiliateRatio) / 100 
        let affiliate = await checkExistThenGet(fundOwner.affiliate, User)
        affiliate.balance = affiliate.balance + affiliateCashBack
        await affiliate.save();
    }

    let date = new Date();
    if(fund.startDate){
        date = fund.startDate
    }else{
        date = new Date(date.setMonth(date.getMonth() + 2));
    }
    let monthCount = setting.monthCount;
    let endDate = new Date(date.setMonth(date.getMonth() + monthCount));
    fund.endDate = endDate;
    let cost = (fund.totalFees * monthCount) / 12
    //////////////////////////create premiums////////////////////////////
    for(var i=0; i < monthCount; i++){
        let installmentDate = new Date(date.setMonth(date.getMonth() + i));
        console.log("installmentDate",installmentDate)

        let lastMonth = false
        if(monthCount - 1 == i) lastMonth = true
        
        await Premium.create({
            fund:fund.id,
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
    let offerBooking = await checkExistThenGet(theOfferBooking, OfferBooking, { deleted: false})
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
            if(validatedBody.type =="PACKAGE"){
                transactionData.package = validatedBody.package
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
            if(validatedBody.type =="PREMIUM"){
                transactionData.premiums = validatedBody.premiums
            }
            if(validatedBody.type =="FUND-FIRSTPAID"){
                transactionData.fund = validatedBody.fund
                let fund = await checkExistThenGet(validatedBody.fund, Fund);
                fund.active = true;
                await fund.save();
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
            await Transaction.findById(createdTransaction.id).populate(populateQuery2)
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
            convertLang(req)
            //get lang
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let lang = i18n.getLocale(req)
            let page = req.query.page || 1, limit = +req.query.limit || 20 ;
            let {thePackage,type,user,fund,fees,status} = req.query;
            
            let query = {deleted: false };
           
            if (type) query.type = type;
            if (type =="CASHBACK") query.type = {$in:['PACKAGE','OFFER']}
            if (fund) query.fund = fund;
            if (fees) query.fees = fees;
            if (thePackage) query.package = thePackage
            if (status) query.status = status;
            if (user) query.user = user;
            let sortd = {_id: -1}
            await Transaction.find(query).populate(populateQuery2)
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
            convertLang(req)
            //get lang
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
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
            convertLang(req)
            let lang = i18n.getLocale(req)
            
            let {transactionId} = req.params
            const Securitykey =  config.Securitykey
            console.log(transactionId.toString())
            let decreptId = await decryptedData(transactionId.toString(),Securitykey)
            console.log(decreptId)
            await Transaction.findById(decreptId).populate(populateQuery2)
            .then(async(e)=>{
                let index = await transformTransaction(e,lang)
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
            let theTransaction = await Transaction.findOne({transactionId:data.merchantRefNumber})

            if(!theTransaction)
                return next(new ApiError(400, i18n.__('transaction not exist')))

            if(data.orderStatus == "PAID"){
                console.log("paymentObject",JSON.stringify(data))
                theTransaction.status = "SUCCESS"
                theTransaction.paymentMethod = data.paymentMethod
                theTransaction.paymentObject = JSON.stringify(data)
                let userId = theTransaction.user
                let user = await checkExistThenGet(userId, User, { deleted: false })
                if(theTransaction.type =="PACKAGE"){
                    let packages = await checkExistThenGet(theTransaction.package, Package, { deleted: false });
                    user.balance  = user.balance + packages.coins
                    await user.save();
                }
                if(theTransaction.type =="OFFER"){
                    await payOfferBooking(theTransaction.offerBooking,userId)

                }
                if(theTransaction.type =="PREMIUM"){
                    await payPremium(theTransaction.premiums,userId)
                }
                if(theTransaction.type =="FUND-FIRSTPAID"){
                    await payFirstPaid(theTransaction.fund,userId)
                }
                if(theTransaction.type =="ORDER"){
                    let order = await checkExistThenGet(theTransaction.order, Order, { deleted: false });
                    order.status  = 'ACCEPTED'
                    await order.save();
                }
                
                let transactionId = theTransaction.id;
                let encryptedId = await encryptedData(transactionId.toString(),config.Securitykey)
                //console.log(req.originalUrl)
                let url = req.protocol + '://edyouhub.com/tax-invoice/'+encryptedId;
                let text = 'رابط الفاتوره الضريبيه الخاصه بك هو : '
                //sendEmail(user.email,url, text)
                theTransaction.billUrl = url;
                await theTransaction.save();
                console.log("url",url)
                let reports = {
                    "action":"Payment Process 2",
                    "type":"PAYMENT",
                    "deepId":theTransaction._id,
                    "user": theTransaction.user
                };
                await Report.create({...reports });
            }
            
            res.send({
                success: true,
            });
        }catch(error){
            next(error)
        }
    },
};