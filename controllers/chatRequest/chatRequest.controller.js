import ChatRequest from "../../models/chatRequest/chatRequest.model";
import {transformChatRequest} from "../../models/chatRequest/transformChatRequest"
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
        path: 'from', model: 'user'
    },
    {
        path: 'to', model: 'user'
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
            if(await ChatRequest.findOne(query))
                return next(new ApiError(403, i18n.__('chatRequestRequest.exist')));

            let chatRequest = await ChatRequest.create({
                from:req.user._id,
                to: toId
            });
            let user = await checkExistThenGet(req.user._id,User)
            var found = user.pendingChatRequests.find(e => e == toId)
            if(!found) user.pendingChatRequests.push(toId)
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: chatRequest.to, 
                fromUser: chatRequest.from, 
                text: ' EdHub',
                subject: chatRequest.id,
                subjectType: 'Chat Request Status',
                info:'CHAT-REQUEST'
            });
            let notif = {
                "description_en":`New Chat Request Request from  ${req.user.fullname}`,
                "description_ar":`لديك طلب محادثه جديد من ${req.user.fullname}`,
                "title_en":'New Chat Request Request',
                "title_ar":'لديك طلب محادثه جديد',
                "type":'CHAT-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:chatRequest.to,chatRequest:chatRequest.id});
            let reports = {
                "action":"Create New chatRequest",
                "type":"CHAT-REQUEST",
                "deepId":chatRequest.id,
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
            await ChatRequest.find(query).populate(populateQuery)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformChatRequest(e,lang,req.user._id,req.user)
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
            await ChatRequest.find(query).populate(populateQuery)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformChatRequest(e,lang,req.user._id,req.user)
                        newdata.push(index);
                    }))
                    const count = await ChatRequest.countDocuments(query);
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
            console.log(await ChatRequest.findOne(query))
            if(await ChatRequest.findOne(query))
                return next(new ApiError(500, i18n.__('chatRequestRequest.exist')));

            let chatRequest = await ChatRequest.create({
                from:req.user._id,
                to: toId
            });
            let user = await checkExistThenGet(req.user._id,User)
            var found = user.pendingChatRequests.find(e => e == toId)
            if(!found) user.pendingChatRequests.push(toId)
            await user.save();

            let to = await checkExistThenGet(toId,User)
            console.log(toId);

            var found2 = to.recievedChatRequestsList.find(e => e == req.user._id)
            if(!found2) to.recievedChatRequestsList.push(req.user._id)
            console.log("rec ",to.recievedChatRequestsList);
            await to.save();
            sendNotifiAndPushNotifi({
                targetUser: chatRequest.to, 
                fromUser: chatRequest.from, 
                text: ' EdHub',
                subject: chatRequest.id,
                subjectType: 'chatRequest Status',
                info:'CHAT-REQUEST'
            });
            let notif = {
                "description_en":`New chatRequest Request from  ${req.user.fullname}`,
                "description_ar":`لديك طلب محادثه جديد من ${req.user.fullname}`,
                "title_en":'New chatRequest Request',
                "title_ar":'لديك طلب محادثه جديد',
                "type":'CHAT-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:chatRequest.to,chatRequest:chatRequest.id});
            let reports = {
                "action":"Create New chatRequest",
                "type":"CHAT-REQUEST",
                "deepId":chatRequest.id,
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
            let { toId } = req.params;
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
            
            let chatRequest = await ChatRequest.findOne(query);
            if(!chatRequest)
                return next(new ApiError(500, i18n.__('chatRequestRequest.notFound')));

            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(!isInArray([chatRequest.from,chatRequest.to],req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            chatRequest.deleted = true;
            let sender =  await checkExistThenGet(chatRequest.from,User)
            //remove receiver id from  pending chatRequests list of sender
            let arr = sender.pendingChatRequests;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == chatRequest.to){
                    arr.splice(i, 1);
                }
            }
            sender.pendingChatRequests = arr;
            await sender.save();
            
            let reciever = await checkExistThenGet(chatRequest.to,User)
            //remove sender id from pending chatRequests list of sender
            let arr3 = reciever.recievedChatRequestsList;
            for(let i = 0;i<= arr3.length;i=i+1){
                if(arr3[i] == chatRequest.from){
                    arr3.splice(i, 1);
                }
            }
            reciever.recievedChatRequestsList = arr3;
            await reciever.save();
            
            await chatRequest.save();
            let reports = {
                "action":"Delete chat Request",
                "type":"CHAT-REQUEST",
                "deepId":chatRequest.id,
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
                status:'PENDING',
                deleted: false
            }
            console.log(query);
            let chatRequest = await ChatRequest.findOne(query);
            if(!chatRequest)
                return next(new ApiError(500, i18n.__('chatRequestRequest.notFound')));
            if(chatRequest.status != "PENDING"){
                return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != chatRequest.to)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            chatRequest.status = 'ACCEPTED';
            let sender =  await checkExistThenGet(chatRequest.from,User)
            //remove receiver id from  pending chatRequests list of sender
            let arr = sender.pendingChatRequests;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == chatRequest.to){
                    arr.splice(i, 1);
                }
            }
            sender.pendingChatRequests = arr;
            await sender.save();
            
            let reciever = await checkExistThenGet(chatRequest.to,User)
            //remove sender id from pending chatRequests list of sender
            let arr2 = reciever.recievedChatRequestsList;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == chatRequest.from){
                    arr2.splice(i, 1);
                }
            }
            await reciever.save();
            await chatRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: chatRequest.from, 
                fromUser: chatRequest.to, 
                text: ' EdHub',
                subject: chatRequest.id,
                subjectType: 'chatRequest Status',
                info:'CHAT-REQUEST'
            });
            let notif = {
                "description_en":'Your chat Request Request Has Been Accepted ',
                "description_ar":'   تم قبول  طلب الدردشه الخاص بك',
                "title_en":'Your chat Request Request Has Been Accepted ',
                "title_ar":' تم قبول على طلب الدردشه الخاص بك',
                "type":'CHAT-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:chatRequest.from,chatRequest:chatRequest.id});
            let reports = {
                "action":"Reject Chat Request Request",
                "type":"CHAT-REQUEST",
                "deepId":chatRequest.id,
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
                status:'PENDING',
                deleted: false
            }
            
            let chatRequest = await ChatRequest.findOne(query);
            if(!chatRequest)
                return next(new ApiError(500, i18n.__('chatRequestRequest.notFound')));
            if(chatRequest.status != "PENDING"){
                return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != chatRequest.to)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            chatRequest.status = 'REJECTED';
            
            let sender =  await checkExistThenGet(chatRequest.from,User)
            //remove receiver id from  pending chatRequests list of sender
            let arr = sender.pendingChatRequests;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == chatRequest.to){
                    arr.splice(i, 1);
                }
            }
            sender.pendingChatRequests = arr;
            await sender.save();
            
            let reciever = await checkExistThenGet(chatRequest.to,User)
            //remove sender id from pending chatRequests list of sender
            let arr3 = reciever.recievedChatRequestsList;
            for(let i = 0;i<= arr3.length;i=i+1){
                if(arr3[i] == chatRequest.from){
                    arr3.splice(i, 1);
                }
            }
            reciever.recievedChatRequestsList = arr3;

            await reciever.save();
            
            await chatRequest.save();
            sendNotifiAndPushNotifi({
                targetUser: chatRequest.from, 
                fromUser: chatRequest.to, 
                text: ' EdHub',
                subject: chatRequest.id,
                subjectType: 'chatRequest Status',
                info:'CHAT-REQUEST'
            });
            let notif = {
                "description_en":'Your chat Request Request Has Been Rejected ',
                "description_ar":'   تم رفض  طلب الدردشه الخاص بك',
                "title_en":'Your chat Request Request Has Been Rejected ',
                "title_ar":' تم رفض على طلب الدردشه الخاص بك',
                "type":'CHAT-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:chatRequest.from,chatRequest:chatRequest.id});
            let reports = {
                "action":"Reject Chat Request Request",
                "type":"CHAT-REQUEST",
                "deepId":chatRequest.id,
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