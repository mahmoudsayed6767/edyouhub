import Connection from "../../models/connection/connection.model";
import {transformConnection} from "../../models/connection/transformConnection"
import { convertLang} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import Report from "../../models/reports/report.model";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import User from "../../models/user/user.model";
const populateQuery = [
    {
        path: 'from', model: 'user',
        populate: { path: 'package', model: 'package' },
    },
    {
        path: 'to', model: 'user',
        populate: { path: 'package', model: 'package' },
    },
];
export default {
    async create(req, res, next) {        
        try {
            let{toId} = req.params
            let query = {
                $and: [
                    { $or: [
                        {$and: [
                            {to: toId}, 
                            {from: req.user._id}, 
                        ]},
                        {$and: [
                            
                            {to: req.user._id}, 
                            {from: toId}, 
                        ]},
                      ] 
                    },
                    {deleted: false},
                    {status:{$ne:'REJECTED'}}
                ]
            }
            if(await Connection.findOne(query))
                return next(new ApiError(403, i18n.__('connectionRequest.exist')));

            let connection = await Connection.create({
                from:req.user._id,
                to: toId
            });
            let user = await checkExistThenGet(req.user._id,User)
            var found = user.pendingConnections.find(e => e == toId)
            if(!found) user.pendingConnections.push(toId)
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: connection.to, 
                fromUser: connection.from, 
                text: ' EdHub',
                subject: connection.id,
                subjectType: 'connection Status',
                info:'connection'
            });
            let notif = {
                "description_en":`New connection Request from  ${req.user.fullname}`,
                "description_ar":`لديك طلب تواصل جديد من ${req.user.fullname}`,
                "title_en":'New connection Request',
                "title_ar":'لديك طلب تواصل جديد',
                "type":'CONNECTION'
            }
            await Notif.create({...notif,resource:req.user,target:connection.to,connection:connection.id});
            let reports = {
                "action":"Create New connection",
                "type":"CONNECTION",
                "deepId":connection.id,
                "user": req.user._id
            };
            await Report.create({...reports });                
            return res.status(201).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let query = { deleted: false };
            let {status,from,to} = req.query
            if(from) query.from = from
            if(to) query.to = to
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                query = {
                    $and: [
                        { $or: [
                            {to: req.user._id}, 
                            {from: req.user._id}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                }
            }
            if(status) query.status = status
            await Connection.find(query).populate(populateQuery)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformConnection(e,lang,req.user._id,req.user)
                    newdata.push(index);
                    
                }))
                res.send({success:true,data:newdata});
            })
        } catch (error) {
            next(error);
        }
    },
    async getAllPaginated(req, res, next) {        
        try {    
            
            let lang = i18n.getLocale(req)       
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { deleted: false };
            let {status,from,to} = req.query
            if(from) query.from = from
            if(to) query.to = to
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                query = {
                    $and: [
                        { $or: [
                            {to: req.user._id}, 
                            {from: req.user._id}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                }
            }
            if(status) query.status = status
            await Connection.find(query).populate(populateQuery)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformConnection(e,lang,req.user._id,req.user)
                        newdata.push(index);
                    }))
                    const count = await Connection.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {        
        try {
            let{toId} = req.params
            let query = {
                $and: [
                    { $or: [
                        {$and: [
                            {to: toId}, 
                            {from: req.user._id}, 
                        ]},
                        {$and: [
                            {to: req.user._id}, 
                            {from: toId}, 
                        ]},
                      ] 
                    },
                    {deleted: false},
                    {status:{$ne:'REJECTED'}}
                ]
            }
            console.log(await Connection.findOne(query))
            if(await Connection.findOne(query))
                return next(new ApiError(500, i18n.__('connectionRequest.exist')));

            let connection = await Connection.create({
                from:req.user._id,
                to: toId
            });
            let user = await checkExistThenGet(req.user._id,User)
            var found = user.pendingConnections.find(e => e == toId)
            if(!found) user.pendingConnections.push(toId)
            await user.save();

            let to = await checkExistThenGet(toId,User)
            console.log(toId);

            var found2 = to.recievedConnectionsList.find(e => e == req.user._id)
            if(!found2) to.recievedConnectionsList.push(req.user._id)
            console.log("rec ",to.recievedConnectionsList);
            await to.save();
            sendNotifiAndPushNotifi({
                targetUser: connection.to, 
                fromUser: connection.from, 
                text: ' EdHub',
                subject: connection.id,
                subjectType: 'connection Status',
                info:'connection'
            });
            let notif = {
                "description_en":`New connection Request from  ${req.user.fullname}`,
                "description_ar":`لديك طلب تواصل جديد من ${req.user.fullname}`,
                "title_en":'New connection Request',
                "title_ar":'لديك طلب تواصل جديد',
                "type":'CONNECTION'
            }
            await Notif.create({...notif,resource:req.user,target:connection.to,connection:connection.id});
            let reports = {
                "action":"Create New connection",
                "type":"CONNECTION",
                "deepId":connection.id,
                "user": req.user._id
            };
            await Report.create({...reports });                
            return res.status(201).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {
        try {
            let { fromId } = req.params;
            let query = {
                from: fromId,
                to: req.user._id,
                deleted: false
            }
            
            let connection = await Connection.findOne(query);
            if(!connection)
                return next(new ApiError(500, i18n.__('connectionRequest.notFound')));

            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != connection.from)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            connection.deleted = true;
            await connection.save();
            let user =  await checkExistThenGet(req.user._id,User)
            //remove from  connection list
            let arr1 = user.connections;
            for(let i = 0;i<= arr1.length;i=i+1){
                if(arr1[i] == connection.to){
                    arr1.splice(i, 1);
                }
            }
            user.connections = arr1;
            //remove from pending connections list
            let arr = user.pendingConnections;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == connection.to){
                    arr.splice(i, 1);
                }
            }
            user.pendingConnections = arr;
            await user.save();
            let to = await checkExistThenGet(connection.to,User)
            //remove from pending connections list
            let arr2 = to.recievedConnectionsList;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == req.user._id){
                    arr2.splice(i, 1);
                }
            }
            to.recievedConnectionsList = arr;
            await to.save();
            let reports = {
                "action":"Delete connection",
                "type":"CONNECTION",
                "deepId":connection.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },
    async accept(req, res, next) {
        try {
            let { fromId } = req.params;
            let query = {
                from: fromId,
                to: req.user._id,
                deleted: false
            }
            console.log(query);
            let connection = await Connection.findOne(query);
            if(!connection)
                return next(new ApiError(500, i18n.__('connectionRequest.notFound')));
            if(connection.status != "PENDING"){
                return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != connection.to)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            connection.status = 'ACCEPTED';
            let user =  await checkExistThenGet(req.user._id,User)
            //add to connection list
            var found = user.connections.find(e => e == connection.to)
            if(!found) user.connections.push(connection.to)
            //remove from pending connections list
            let arr = user.pendingConnections;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == connection.to){
                    arr.splice(i, 1);
                }
            }
            user.pendingConnections = arr;
            await user.save();
            
            let to = await checkExistThenGet(connection.to,User)
            //remove from pending connections list
            let arr2 = to.recievedConnectionsList;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == req.user._id){
                    arr2.splice(i, 1);
                }
            }
            to.recievedConnectionsList = arr;
            await to.save();
            await connection.save();
            sendNotifiAndPushNotifi({
                targetUser: connection.from, 
                fromUser: connection.to, 
                text: ' EdHub',
                subject: connection.id,
                subjectType: 'connection Status',
                info:'connection'
            });
            let notif = {
                "description_en":'Your connection Request Has Been Accepted ',
                "description_ar":'   تم قبول  طلب التواصل الخاص بك',
                "title_en":'Your connection Request Has Been Accepted ',
                "title_ar":' تم قبول على طلب التواصل الخاص بك',
                "type":'CONNECTION'
            }
            await Notif.create({...notif,resource:req.user,target:connection.from,connection:connection.id});
            let reports = {
                "action":"Reject Connection Request",
                "type":"CONNECTION",
                "deepId":connection.id,
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
    async reject(req, res, next) {
        try {
            let { fromId } = req.params;
            let query = {
                from: fromId,
                to: req.user._id,
                deleted: false
            }
            
            let connection = await Connection.findOne(query);
            if(!connection)
                return next(new ApiError(500, i18n.__('connectionRequest.notFound')));
            if(connection.status != "PENDING"){
                return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != connection.to)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            connection.status = 'REJECTED';
            
            let user =  await checkExistThenGet(req.user._id,User)
            //remove from pending connections list
            let arr = user.pendingConnections;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == connection.to){
                    arr.splice(i, 1);
                }
            }
            user.pendingConnections = arr;
            await user.save();
            
            let to = await checkExistThenGet(connection.to,User)
            //remove from pending connections list
            let arr2 = to.recievedConnectionsList;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == req.user._id){
                    arr2.splice(i, 1);
                }
            }
            to.recievedConnectionsList = arr;
            await to.save();
            await connection.save();
            sendNotifiAndPushNotifi({
                targetUser: connection.from, 
                fromUser: connection.to, 
                text: ' EdHub',
                subject: connection.id,
                subjectType: 'connection Status',
                info:'connection'
            });
            let notif = {
                "description_en":'Your connection Request Has Been Rejected ',
                "description_ar":'   تم رفض  طلب التواصل الخاص بك',
                "title_en":'Your connection Request Has Been Rejected ',
                "title_ar":' تم رفض على طلب التواصل الخاص بك',
                "type":'CONNECTION'
            }
            await Notif.create({...notif,resource:req.user,target:connection.from,connection:connection.id});
            let reports = {
                "action":"Reject Connection Request",
                "type":"CONNECTION",
                "deepId":connection.id,
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

}