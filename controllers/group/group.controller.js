import Group from "../../models/group/group.model";
import {transformGroup,transformGroupById,transformParticipant} from "../../models/group/transformGroup";
import GroupParticipant from "../../models/group/groupParticipant.model";
import { body } from "express-validator";
import { checkValidations ,handleImg} from "../shared/shared.controller";
import Report from "../../models/reports/report.model";
import { checkExist,isInArray,checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import User from "../../models/user/user.model"
import ApiError from '../../helpers/ApiError';

const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'admins', model: 'user' },
];
const populateQueryParticipant = [
    { path: 'user', model: 'user' },
];
export default {
    validateBody(isUpdate = false) {
        let validations = [
            body('name').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name.required', { value});
            }),
            body('about').optional(),
            body('type').optional().isIn(['PRIVATE', 'PUBLIC'])
            .withMessage((value, { req}) => {
                return req.__('type.invalid', { value});
            }),
            body('postedType').optional().isIn(['OPENED', 'BY-REQUEST'])
            .withMessage((value, { req}) => {
                return req.__('postedType.invalid', { value});
            }),
            body('admins').optional()
            .custom(async (admins, { req }) => {
                for (let value of admins) {
                    if (!await User.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('admin.invalid'));
                    else
                        return true;
                }
                return true;
            }),
        ];
        if (isUpdate)
        validations.push([
            body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req}) => {
                return req.__('img.syntax', { value});
            })
        ]);

        return validations;
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            //upload img
            let image = await handleImg(req);
            validatedBody.img = image;
            validatedBody.owner = req.user._id
            //add group admins
            if(!validatedBody.admins){
                validatedBody.admins = [req.user._id]
            }else{
                validatedBody.admins.push(req.user._id)
            }
            validatedBody.usersCount = validatedBody.admins.length
            let group = await Group.create({ ...validatedBody});
            //add admins to group members
            let user = await checkExistThenGet(req.user._id,User)
            user.groups.push(group._id);
            await user.save();
            validatedBody.admins.forEach(async(element) => {
                let admin = await checkExistThenGet(element,User)
                admin.groups.push(group.id);
                await admin.save();
                await GroupParticipant.create({ user:element,status:'ACCEPTED',group:group._id });
            });
            let reports = {
                "action":"Create New group",
                "type":"GROUP",
                "deepId":group.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Group.findById(group.id).populate(populateQuery).then(async(e) => {
                let index = await transformGroupById(e,lang)
                return res.status(201).send({
                    success:true,
                    data:index
                });
            })
        } catch (error) {
            next(error);
        }
    },
   
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { groupId } = req.params;
            let group = await checkExistThenGet(groupId, Group, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(!isInArray(group.admins,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            await Group.findByIdAndUpdate(groupId, { ...validatedBody });
            let reports = {
                "action":"Update group",
                "type":"GROUP",
                "deepId":groupId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Group.findById(groupId).populate(populateQuery).then(async(e) => {
                let index = await transformGroupById(e,lang)
                return res.status(200).send({
                    success:true,
                    data:index
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { groupId } = req.params;
            let {userId,} = req.query;
            await checkExist(groupId, Group, { deleted: false });
            let myUser
            if(userId) {
                myUser = await checkExistThenGet(userId,User)
            }
            await Group.findById(groupId).populate(populateQuery).then(async(e) => {
                let index = await transformGroupById(e,lang,myUser,userId)
                return res.send({
                    success:true,
                    data:index
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {search,type,owner,userId,myGroups,otherGroups} = req.query;
            let query = { deleted: false };
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {about: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                        
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(type) query.type = type;
            if(owner) query.owner = owner;
            let myUser
            if(userId) {
                myUser = await checkExistThenGet(userId,User)
                if(myGroups == "true"){
                    query._id = myUser.groups
                }
                if(otherGroups == "true"){
                    query._id = {$nin:myUser.groups}
                }
            }
            await Group.find(query).populate(populateQuery)
            .then(async (data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformGroup(e,lang,myUser,userId)
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
            let {search,type,owner,userId,myGroups,otherGroups} = req.query;
            let query = { deleted: false };
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {about: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                        
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(type) query.type = type;
            if(owner) query.owner = owner;
            let myUser
            if(userId) {
                myUser = await checkExistThenGet(userId,User)
                if(myGroups == "true"){
                    query._id = myUser.groups
                }
                if(otherGroups == "true"){
                    query._id = {$nin:myUser.groups}
                }
            }
            await Group.find(query).populate(populateQuery)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformGroup(e,lang,myUser,userId)
                        newdata.push(index);
                    }))
                    const count = await Group.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },


    async delete(req, res, next) {        
        try {
            let { groupId } = req.params;
            let group = await checkExistThenGet(groupId, Group);
            group.deleted = true;
            await group.save();
            let reports = {
                "action":"Delete group",
                "type":"GROUP",
                "deepId":groupId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },
    validateAddParticipantBody() {
        let validations = [
            body('user').not().isEmpty().withMessage((value, { req}) => {
                return req.__('user.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('user.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await User.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('user.invalid'));
                else
                    return true;
            }),
        ];
        
        return validations;
    },
    async addParticipant(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let {groupId} = req.params
            let group = await checkExistThenGet(groupId, Group);

            validatedBody.group = groupId;
            //check if user is new or exist
            let user = await checkExistThenGet(validatedBody.user, User);
            validatedBody.user = user.id
            if(group.type == "PUBLIC") {
                validatedBody.status = 'ACCEPTED'
                group.usersCount = group.usersCount + 1
                await group.save()
                if(!await GroupParticipant.findOne({ user: validatedBody.user, group: groupId,type:{$ne:'REJECTED'},deleted:false})){
                    let arr = user.groups;
                    var found = arr.find((e) => e == groupId); 
                    if(!found){
                        user.groups.push(groupId);
                        await user.save();
                        await GroupParticipant.create({ ...validatedBody });
                    }
                }
            }else{
                if(!await GroupParticipant.findOne({ user: validatedBody.user, group: groupId,type:{$ne:'REJECTED'},deleted:false})){
                    await GroupParticipant.create({ ...validatedBody });
                }
                let arr = user.groupJoinRequests;
                var found = arr.find((e) => e == groupId); 
                if(!found){
                    user.groupJoinRequests.push(groupId);
                    await user.save();
                    await GroupParticipant.create({ ...validatedBody });
                }
                
            }
            let reports = {
                "action":"user will attend to group",
                "type":"GROUP",
                "deepId":groupId,
                "user": req.user._id
            };
            await Report.create({...reports});
            
            res.status(201).send({
                success:true,
            });
        } catch (error) {
            next(error);
        }
    },
    async getGroupParticipants(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {status} = req.query
            let query = {deleted: false,group:req.params.groupId };
            if(status) query.status = status;
            await GroupParticipant.find(query).populate(populateQueryParticipant)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformParticipant(e,lang)
                        newdata.push(index)
                    }))
                    const count = await GroupParticipant.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    async accept(req, res, next) {
        try {
            let { groupParticipantId } = req.params;
            let groupParticipant = await checkExistThenGet(groupParticipantId, GroupParticipant);
            let group = await checkExistThenGet(groupParticipant.group, Group);

            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(!isInArray(group.admins,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            groupParticipant.status = "ACCEPTED";
            group.usersCount = group.usersCount + 1

            await group.save()
            await groupParticipant.save();
            let user = await checkExistThenGet(groupParticipant.user, User);
            let arr = user.groups;
            var found = arr.find((e) => e == group._id); 
            if(!found){
                user.groups.push(group._id);
            }
            let arr2 = user.groupJoinRequests;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == group._id){
                    arr2.splice(i, 1);
                }
            }
            user.groupJoinRequests = arr2;
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: groupParticipant.user, 
                fromUser: req.user, 
                text: ' EdHub',
                subject: groupParticipant.id,
                subjectType: 'group Request Status',
                info:'GROUP-REQUEST'
            });
            let notif = {
                "description_en":'Your join Request Has Been Accepted ',
                "description_ar":' تم قبول الطلب الانضمام الخاص بك',
                "title_en":'Your join Request Has Been Accepted ',
                "title_ar":' تم قبول الطلب الانضمام الخاص بك',
                "type":'GROUP-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:groupParticipant.عسثق,groupParticipant:GROUPRequest.id});
            let reports = {
                "action":"Accept group join request",
                "type":"GROUP-REQUEST",
                "deepId":groupParticipantId,
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
            let { groupParticipantId } = req.params;
            let groupParticipant = await checkExistThenGet(groupParticipantId, GroupParticipant);
            let group = await checkExistThenGet(groupParticipant.group, Group);

            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let admins = [group.owner]
                admins.push(... group.admins)
                if(!isInArray(admins,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            groupParticipant.status = "REJECTED";
            await groupParticipant.save();
            let user = await checkExistThenGet(groupParticipant.user,User)
            let arr2 = user.groupJoinRequests;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == group._id){
                    arr2.splice(i, 1);
                }
            }
            user.groupJoinRequests = arr2;
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: groupParticipant.user, 
                fromUser: req.user, 
                text: ' EdHub',
                subject: groupParticipant.id,
                subjectType: 'group Request Status',
                info:'GROUP-REQUEST'
            });
            let notif = {
                "description_en":'Your join Request Has Been Rejected ',
                "description_ar":' تم رفض الطلب الانضمام الخاص بك',
                "title_en":'Your join Request Has Been Rejected ',
                "title_ar":' تم رفض الطلب الانضمام الخاص بك',
                "type":'GROUP-REQUEST'
            }
            await Notif.create({...notif,resource:req.user,target:groupParticipant.عسثق,groupParticipant:GROUPRequest.id});
            let reports = {
                "action":"reject group join request",
                "type":"GROUP-REQUEST",
                "deepId":groupParticipantId,
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
    async removeUserFromGroup(req, res, next) {
        try {
            let { groupId,userId } = req.params;
            let user = await checkExistThenGet(userId, User,{ deleted: false});
            let group = await checkExistThenGet(groupId, Group);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let admins = [userId]
                admins.push(... group.admins)
                if(!isInArray(admins,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            //remove user from participant
            let groupParticipant = await GroupParticipant.findOne({group:groupId,deleted: false,user:userId})
            groupParticipant.deleted = true;
            await groupParticipant.save();
            //reduce group users count
            group.usersCount = group.usersCount - 1;
            await group.save();
            //remove group from user data
            let arr = user.groups;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == groupId){
                    arr.splice(i, 1);
                }
            }
            user.groups = arr;
            //remove from pending requests
            let arr2 = user.groupJoinRequests;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == group._id){
                    arr2.splice(i, 1);
                }
            }
            user.groupJoinRequests = arr2;
            await user.save();
            let reports = {
                "action":"remove user from group",
                "type":"GROUP",
                "deepId":groupParticipant,
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