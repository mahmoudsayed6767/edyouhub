import User from "../../models/user/user.model";
import { checkExistThenGet, checkExist,istence} from "../../helpers/CheckMethods";
import Notif from "../../models/notif/notif.model";
import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import i18n from "i18n";
import {checkValidations,handleImg} from "../shared/shared.controller";
import { body } from "express-validator";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";

const populateQuery = [
    { path: 'resource', model: 'user',},
];
export default {
    async find(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let user = req.user._id;
            await checkExist(req.user._id, User);
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { deleted: false,target:user };
            let myUser = await checkExistThenGet( req.user._id, User)
            await Notif.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata = [];
                    await Promise.all(data.map(async(e)=>{
                        let index = {
                            type:e.type,
                            description:lang=="ar"?e.description_ar:e.description_en,
                            title:lang=="ar"?e.title_ar:e.title_en,
                            read:e.read,
                            createdAt:e.createdAt,
                            id:e._id
                        }
                        if(e.resource){
                            index.resource={
                                fullname:e.resource.fullname,
                                phone:e.resource.phone,
                                img:e.resource.img,
                                id:e.resource._id,
                            }
                        }
                        if(e.rate){
                            index.deepId = e.rate
                        }
                        if(e.bill){
                            index.deepId = e.bill
                        }
                        if(e.favourite){
                            index.deepId = e.favourite
                        }
                        if(e.offer){
                            index.deepId = e.offer
                        }
                        if(e.fund){
                            index.deepId = e.fund
                        }
                        if(e.fees){
                            index.deepId = e.fees
                        }
                        if(e.premium){
                            index.deepId = e.premium
                        }
                        if(e.order){
                            index.deepId = e.order
                        }
                        newdata.push(index)
                        
                    }))
                    const notifsCount = await Notif.countDocuments(query);
                    const pageCount = Math.ceil(notifsCount / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, notifsCount, req));
                })


            
        } catch (err) {
            next(err);
        }
    },
    async unreadCount(req, res, next) {        
        try {
            let user = req.user._id;
            await checkExist(req.user._id, User);
            let query = { deleted: false,target:user,read:false };
            const unreadCount = await Notif.countDocuments(query);
            res.status(200).send({
                unread:unreadCount,
            });
        } catch (err) {
            next(err);
        }
    },
    async read(req, res, next) {        
        try {
            let { notifId} = req.params;
            let notif = await checkExistThenGet(notifId, Notif);
            notif.read = true;
            await notif.save();
            let reports = {
                "action":"Read Notif",
                "type":"NOTIFS",
                "deepId":notifId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});
        } catch (error) {
            next(error);
        }
    },
    async unread(req, res, next) {        
        try {
            let { notifId} = req.params;
            let notif = await checkExistThenGet(notifId, Notif);
            notif.read = false;
            await notif.save();
            let reports = {
                "action":"UnRead Notif",
                "type":"NOTIFS",
                "deepId":notifId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});
        } catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {        
        try {
            let { notifId} = req.params;
            let notif = await checkExistThenGet(notifId, Notif);
            notif.deleted = true;
            await notif.save();
            let reports = {
                "action":"Delete Notif",
                "type":"NOTIFS",
                "deepId":notifId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send('notif deleted');
        } catch (error) {
            next(error);
        }
    },
    async deleteAll(req, res, next) {        
        try {
            let notifs = await Notif.find({target :req.user._id });
            for (let notif of notifs ) {
                notif.deleted = true;
                await notif.save();
            }
            let reports = {
                "action":"Delete All Notif",
                "type":"NOTIFS",
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send('notifs deleted');
        } catch (error) {
            next(error);
        }
    },
    validateNotif() {
        let validations = [
            body('description').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description.required', { value});
            }),
            body('title').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title.required', { value});
            }),
            body('userType').optional(),
            body('users').optional(),
        ];
        return validations;
    },
    async SendNotif(req, res, next) {        
        try { 
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            //if determine the user type to send notifs to them
            let adminNotif = true
            if(validatedBody.userType){
                let users = await User.find({'type':validatedBody.userType});
                users.forEach(user => {
                    sendNotifiAndPushNotifi({
                        targetUser: user.id, 
                        fromUser: req.user._id, 
                        text: validatedBody.title,
                        subject: validatedBody.title,
                        body: validatedBody.description,
                        image:validatedBody.img,
                        info:'APP'
                    });
                    let notif = {
                        "description_en":validatedBody.description,
                        "description_ar":validatedBody.description,
                        "title_en":validatedBody.title,
                        "title_ar":validatedBody.title,
                        "adminNotif":adminNotif,
                        "type":"APP"
                    }
                    if(validatedBody.img) notif.img = validatedBody.img
                    adminNotif = false
                    Notif.create({...notif,resource:req.user._id,target:user.id});
                    
                });
            } else{
                //if determine the users ids to send notifs to them
                let users = await User.find({'_id':validatedBody.users});
                users.forEach(user => {
                    sendNotifiAndPushNotifi({
                        targetUser: user.id, 
                        fromUser: req.user._id, 
                        text:  validatedBody.title,
                        subject: validatedBody.title,
                        body:validatedBody.description ,
                        image:validatedBody.img,
                        info:'APP'
                    });
                    let notif = {
                        "description_en":validatedBody.description,
                        "description_ar":validatedBody.description,
                        "title_en":validatedBody.title,
                        "title_ar":validatedBody.title,
                        "type":"APP"
                    }
                    if(validatedBody.img) notif.img = validatedBody.img
                    Notif.create({...notif,resource:req.user._id,target:user.id});
                });
            }
            
            let reports = {
                "action":"send notification to all users",
                "type":"USERS",
                //"deepId":user.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },

}