import ApiResponse from "../../helpers/ApiResponse";
import Premium from "../../models/premium/premium.model";
import Fees from "../../models/fees/fees.model"
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import {transformPremium} from "../../models/premium/transformPremium"
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Fund from "../../models/fund/fund.model";
import User from "../../models/user/user.model";
import Setting from "../../models/setting/setting.model";
const populateQuery = [
    { path: 'fund', model: 'fund'},
    { path: 'fees', model: 'fees'},
    {
        path: 'student', model: 'student',
        populate: { path: 'educationInstitution', model: 'educationInstitution' },
    },
];
export default {

    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let {fund,student,fees,type,course} = req.query
            let query = {deleted: false};
            if(fund) query.fund = fund
            if(fees) query.fees = fees
            if(course) query.course = course
            if(type) query.type = type
            if(student) query.student = student
            let sortd = {createdAt: -1}
            await Premium.find(query)
            .populate(populateQuery)
            .sort(sortd)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformPremium(e,lang)
                    newdata.push(index)
                }))
                res.send({
                    success:true,
                    data:newdata
                });
            })

        } catch (err) {
            next(err);
        }
    },
    async findAllPagenation(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {fund,student,fees,type,course} = req.query
            let query = {deleted: false};
            if(fund) query.fund = fund
            if(fees) query.fees = fees
            if(course) query.course = course
            if(type) query.type = type
            if(student) query.student = student
            let sortd = {createdAt: -1}
            await Premium.find(query)
            .populate(populateQuery)
            .sort(sortd)
            .limit(limit)
            .skip((page - 1) * limit)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformPremium(e,lang)
                    newdata.push(index)
                }))
                const count = await Premium.countDocuments(query);
                const pageCount = Math.ceil(count / limit);
                res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
            })

        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {        
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let { premiumId } = req.params;
            await checkExist(premiumId, Premium, { deleted: false });
            await Premium.findById(premiumId).populate(populateQuery).then(async(e) => {
                let premium = await transformPremium(e,lang)
                res.send({
                    success:true,
                    data:premium
                });
            })
        } catch (err) {
            next(err);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('fund').optional(),
            body('fees').optional(),
            body('student').not().isEmpty().withMessage((value, { req}) => {
                return req.__('student.required', { value});
            }),
            body('cost').not().isEmpty().withMessage((value, { req}) => {
                return req.__('cost.required', { value});
            }),
            body('installmentDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('installmentDate.required', { value});
            }),
           
        ];
        return validations;
    },

    async create(req, res, next) {
        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            validatedBody.owner = req.user._id
            let thePremium = await Premium.create({ ...validatedBody});
            let reports = {
                "action":"Create premium",
                "type":"PREMIUMS",
                "deepId":thePremium.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true,data:thepremium});
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { premiumId } = req.params;
            await checkExist(premiumId, Premium, { deleted: false });
            const validatedBody = checkValidations(req);

            await Premium.findByIdAndUpdate(premiumId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update premium",
                "type":"PREMIUMS",
                "deepId":premiumId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success:true});
        }
        catch (err) {
            next(err);
        }
    },
   
    async delete(req, res, next) {        
        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
                
            let { premiumId } = req.params;
            let premium = await checkExistThenGet(premiumId, Premium, { deleted: false });
            premium.deleted = true;
            await premium.save();
            
            let reports = {
                "action":"Delete premium",
                "type":"PREMIUMS",
                "deepId":premiumId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
    async paid(req, res, next) {
        try {
            let { premiumId } = req.params;
           
            let premium = await checkExistThenGet(premiumId, Premium);
            premium.status = 'PAID';
            premium.paidDate = req.body.paidDate?req.body.paidDate:premium.installmentDate;
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
                    "description_ar":'   تم دفع قسط التمويل الخاص بك',
                    "title_en":'Your Fund Premium Has Been Paid ',
                    "title_ar":' تم دفع قسط التمويل الخاص بك',
                    "type":'PREMIUM'
                }
                await Notif.create({...notif,resource:req.user,target:fund.owner,premium:premium.id});
            }
            if(premium.fees){
                let fees = await checkExistThenGet(premium.fees, Fees);
                let setting = await Setting.findOne({deleted: false})
                let cashBack = (premium.cost * setting.feesCashBackRatio) / 100 
                console.log("cashBack",cashBack)
                let fundOwner = await checkExistThenGet(req.user._id, User)
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
                await Notif.create({...notif,resource:req.user,target:req.user._id,premium:premium.id});
            }
            let reports = {
                "action":"Pay Premium",
                "type":"PREMIUMS",
                "deepId":premiumId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({
                success:true
            });
        } catch (err) {
            next(err);
        }
    },
    async paidMulti(req, res, next) {
        try {
            for (let premiumId of req.body.premiums) {
                console.log("premium",premiumId)
                let premium = await checkExistThenGet(premiumId, Premium);
                premium.status = 'PAID';
                premium.paidDate = req.body.paidDate?req.body.paidDate:premium.installmentDate;
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
                        "description_ar":'   تم دفع قسط التمويل الخاص بك',
                        "title_en":'Your Fund Premium Has Been Paid ',
                        "title_ar":' تم دفع قسط التمويل الخاص بك',
                        "type":'PREMIUM'
                    }
                    await Notif.create({...notif,resource:req.user,target:fund.owner,premium:premium.id});
                }
                if(premium.fees){
                    let fees = await checkExistThenGet(premium.fees, Fees);
                    let setting = await Setting.findOne({deleted: false})
                    let cashBack = (premium.cost * setting.feesCashBackRatio) / 100 
                    console.log("cashBack",cashBack)
                    let fundOwner = await checkExistThenGet(req.user._id, User)
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
                    await Notif.create({...notif,resource:req.user,target:req.user._id,premium:premium.id});
                }
                let reports = {
                    "action":"Pay Premium",
                    "type":"PREMIUMS",
                    "deepId":premiumId,
                    "user": req.user._id
                };
                await Report.create({...reports});
            }
            
            
            res.send({
                success:true
            });
        } catch (err) {
            next(err);
        }
    },

};