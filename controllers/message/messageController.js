var Message = require('../../models/message/message.model');
import Notif from "../../models/notif/notif.model";
import { checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import {handleImg} from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import ApiError from '../../helpers/ApiError';
import i18n from "i18n";
import Report from "../../models/reports/report.model";
import { transformMessage } from "../../models/message/transformMessage";
import Business from "../../models/business/business.model";
import Logger from "../../services/logger";
const logger = new Logger('message '+ new Date(Date.now()).toDateString())
const populateQuery = [
    { path: 'from', model: 'user'},
    { path: 'to', model: 'user'},
    { path: 'business', model: 'business'},
];

var messageController = {
    async uploadFile(req, res, next) {        
        try {
            let file = await handleImg(req);
            res.send({file:file});
            } catch (error) {
            next(error)
        }
    },
    
    async addnewMessage(io, nsp, data) {
        logger.info(`add message socket data  : ${JSON.stringify(data)}`);
        var toRoom = 'room-' + data.toId; 
        var fromRoom = 'room-' + data.fromId;

        logger.info(`new message to room ${toRoom}`);
        var messData = { //شكل الداتا 
            to: data.toId,
            from: data.fromId,
            sent: true,
            lastMessage: true,
        }
        
        if (data.dataType != null) {
            messData.content = data.content;
            messData.dataType = data.dataType;
        }
        if(data.duration != null) {
            messData.duration = data.duration;
        }
        if(data.business != null) {
            messData.business = data.business;
        }
        var query1 = { 
            to: data.toId,
            from: data.fromId,
            lastMessage: true,
            deleted: false
        }
        var query2 = { 
            to: data.fromId,
            from: data.toId,
            lastMessage: true,
            deleted: false
        }

        var countquery = {
            to : data.toId , 
            deleted : false , 
            seen : false 
        }
        if(data.business != null) {
            query1.business = data.business;
            query2.business = data.business;
            countquery.business = data.business;
        }else{
            query1.business = null;
            query2.business = null;
            countquery.business = null;
        }
        var Count = await Message.countDocuments(countquery);
        Count = Count + 1 ;
        Message.updateMany({ $or: [query1, query2] }, { lastMessage: false })
            .then((result1) => {
                if (io.sockets.adapter.rooms[toRoom]) { //room is open 
                    messData.delivered = true;
                }
                var message = new Message(messData);
                message.save()
                    .then(async(result2) => {
                        let theMessage = await Message.findById(result2._id).populate('from to business')
                        let msg = await transformMessage(theMessage)
                        nsp.to(toRoom).emit('newMessage', msg);
                        nsp.to(fromRoom).emit('newMessage', msg);
                        nsp.to(toRoom).emit('unseenCount',{count : Count});
                        if (io.sockets.adapter.rooms[toRoom]){
                            logger.info(`friend is online`);
                            nsp.to(fromzoom).emit('delivered', { friendId: data.toId });
                        }
                        let senderName = theMessage.to.fulname;
                        if(theMessage.from._id == theMessage.business.owner){
                            senderName = theMessage.business.name_ar
                        }
                        sendNotifiAndPushNotifi({
                            targetUser: data.toId, 
                            fromUser: data.fromId, 
                            text: "New Message",
                            subject: result2._id,
                            body: senderName + ' sent you a new message',
                            info:'MESSAGE'
                        });
                        let notif = {
                            "description_en":senderName + ' sent you a new message',
                            "description_ar":"لديك رساله جديده" ,
                            "title_en":"New Message",
                            "title_ar":"رساله جديده",
                            "type":"MESSAGE"
                        }
                        Notif.create({...notif,resource:data.fromId,target:data.toId,message:result2._id});
                    })
                    .catch(err => {
                        logger.error(`can not save the message : ${JSON.stringify(err)}`);
                        console.log(err);
                    });
            }).catch((err) => {
                logger.error(`can not update Last Message : ${JSON.stringify(err)}`);
                console.log(err);
            });
    },
    async getAllMessages(req, res, next) {
        let page = +req.query.page || 1, limit = +req.query.limit || 20;
        let {userId, friendId,business} = req.query;
        //user try to get other users chat
        if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
            if(req.user._id != userId && req.user._id != friendId)
                return next(new ApiError(403, i18n.__('admin.auth')));
        }
        
        var query1 = {deleted: false };
        var query2 = {deleted: false}
        if (userId) {
            query1.to= userId;
            query2.from= userId;
        }
        if (friendId) {
            query1.from= friendId;
            query2.to= friendId;
        }
        if (business) {
            query1.business = business;
            query2.business = business;
        }else{
            query1.business = null;
            query2.business = null;
        }
        
        Message.find({ $or: [query1, query2] })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate(populateQuery)
            .sort({ _id: -1 })
            .then(async data => {
                var newdata = [];
                await Promise.all(data.map(async(e)=>{
                    let index = await transformMessage(e)
                    newdata.push(index);
                }));
                newdata = newdata.sort((a, b) => b.incommingDate - a.incommingDate);
                const count = await Message.countDocuments({ $or: [query1, query2] });
                const pageCount = Math.ceil(count / limit);
                res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
            })
            .catch(err => {
                next(err);
            });
            
    },
    async unseenCount(req, res, next) {        
        try {
            let {business} = req.query;

            let query = { deleted: false,to:req.user._id,seen:false };
            if (business) {
                query.business = business;
            }else{
                query.business = null;
            }
            const unseenCount = await Message.countDocuments(query);
            res.status(200).send({
                unseen:unseenCount,
            });
        } catch (err) {
            next(err);
        }
    },
    updateSeen(req, res, next) {
        var myId = +req.query.userId || 0;
        var friendId = +req.query.friendId || 0;
        //user try to get other users chat
        if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
            if(req.user._id != myId && req.user._id != friendId)
                return next(new ApiError(403, i18n.__('admin.auth')));
        }
        var toRoom = 'room-' + friendId;
        var query1 = {
            to: myId,
            from: friendId,
            seen: false
        };
        Message.updateMany(query1, { seen: true,informed:true, seendate: Date.now() })
            .exec()
            .then(async(data) => {
                var countquery = {
                    to : myId , 
                    deleted : false , 
                    informed : false 
                }
                var Count = await Message.countDocuments(countquery);
                //emit to update message informed
                notificationNSP.to(toRoom).emit('updateUnInformedMessage',{count : Count});
                res.status(200).send({success:true});
            })
            .catch((err) => {
                next(err);
            });
    },
    updateSeenSocket(nsp, data) { 
        var myId = data.myId || 0;
        var friendId = data.friendId || 0;
        var toRoom = 'room-' + friendId;
        var fromRoom = 'room-' + myId;
        var query1 = {
            to: myId,
            from: friendId,
            seen: false
        };
        Message.updateMany(query1, { seen: true, informed:true , seendate: Date.now() })
            .exec()
            .then(async(result) => {
                 var countquery = {
                    to : myId , 
                    deleted : false , 
                    informed : false 
                }
                var Count = await Message.countDocuments(countquery);
                //notificationNSP.to(toRoom).emit('updateUnInformedMessage',{count : Count});
               
                nsp.to(toRoom).emit('seen', { success: true ,unseenCount:Count});
                nsp.to(fromRoom).emit('seen', { success: true ,unseenCount:Count});
            })
            .catch((err) => {
                console.log(err);
            });
    },
    async findLastContacts(req, res, next) {        
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            { id,business } = req.query;
            let query1 = { deleted: false ,lastMessage: true };
            if (id) query1.to = id;
            let query2 = { deleted: false , lastMessage: true };
            if (id) query2.from = id;
            if(business){
                query1.business = business;
                query2.business = business
            }else{
                let businessIds = await Business.find({owner: req.user._id}).distinct('_id')
                query1.business = {$nin:businessIds};
                query2.business = {$nin:businessIds}
            }
            //user try to get other users chat
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != id)
                    return next(new ApiError(403, i18n.__('admin.auth')));
            }
            
        
            await Message.find({ $or: [query1, query2] })
                .sort({ _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate(populateQuery)
                .then(async (data) => {
                    const messagesCount = await Message.find({ $or: [query1, query2] }).countDocuments();
                    const pageCount = Math.ceil(messagesCount / limit);
                    var queryCount = {
                        deleted: false,
                        to: id,
                        seen: false,
                    }
                    var newdata = [];
                    await Promise.all(data.map(async (e) => {
                        if (e.from._id === id) {
                            queryCount.from = e.to._id;
                        } else {
                            queryCount.from = e.from._id;
                        }
                        if(e.business){
                            queryCount.business = e.business._id
                        }else{
                            queryCount.business = null;
                        }
                        let unseenCount = await Message.countDocuments(queryCount);
                        let index = await transformMessage(e)
                        index.unseenCount = unseenCount
                        newdata.push(index);
                    }));
                    newdata = newdata.sort((a, b) => b.incommingDate - a.incommingDate);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, messagesCount, req));
                })

        } catch (err) {
            next(err);
        };
    },
    getOnlineUsers(nsp,data){ 
        var userId = data.id;
        var myRoom = 'room-'+userId;
        var query={
            deleted:false,
            _id: { $in : data.users } 
        };
        User.find(query).select('firstename username img')
        .then((data1)=>{
            nsp.to(myRoom).emit('onlineUsers', {data: data1});
        })
        .catch((err)=>{
            console.log(err);
        });
    },
    getMyInfo(socket,data){ 
        var userId = data.id;
        User.findByIdAndUpdate(userId,{status:true},{new: true})
        .then((data1)=>{
            if(data1)
            {
                socket.broadcast.emit('UserOnline',data1);
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    },
    changeStatus(socket,data ,check){
        var userId = data.userId;
        User.findByIdAndUpdate(userId,{status:check},{new: true})
        .then((data1)=>{
            if(check){
                socket.broadcast.emit('online',data1);
            }
            else{
                socket.broadcast.emit('offline',data1);
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    },
    
    updateInformed(req,res,next){
        var id = +req.query.id || 0 ;
        if(!id)
        {
            next(new ApiError(404 , ' User Id Not Found . '));
        }
        var query = {
            to : id , 
            informed : false ,
            deleted : false
        }
        Message.updateMany(query , {informed:true})
            .then((data)=>{
                res.status(200).send('Updated Successfully');
            }) 
            .catch((err)=>{
                next(err);
            });
    },
    async delete(req, res, next) {        
        try {
            let { messageId} = req.params;
            let message = await checkExistThenGet(messageId, Message);
            message.deleted = true;
            await message.save();
            let reports = {
                "action":"Delete message",
                "type":"MESSAGE",
                "deepId":messageId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async deleteAll(req, res, next) {        
        try {
            let {friendId} = req.params.friendId;
            var query1 = {deleted: false };
            var query2 = {deleted: false}
            if (req.user._id) {
                query1.to= req.user._id;
                query2.from= req.user._id;
            }
            if (friendId) {
                query1.from= friendId;
                query2.to= friendId;
            }
            
            let messages = await Message.find({ $or: [query1, query2] });
            for (let message of messages ) {
                message.deleted = true;
                await message.save();
            }
            let reports = {
                "action":"Delete All messages",
                "type":"MESSAGE",
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success:true});
        } catch (error) {
            next(error);
        }
    },
    
};

module.exports = messageController;
