import Group from "../../models/group/group.model";
import { transformGroup, transformGroupById, transformParticipant } from "../../models/group/transformGroup";
import GroupParticipant from "../../models/group/groupParticipant.model";
import { body } from "express-validator";
import { checkValidations, handleImg } from "../shared/shared.controller";
import Report from "../../models/reports/report.model";
import { checkExist, isInArray, checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import User from "../../models/user/user.model"
import ApiError from '../../helpers/ApiError';
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model"
import Post from "../../models/post/post.model";
import Activity from "../../models/user/activity.model"
import { transformGroupAdminRequest } from "../../models/groupAdminRequest/transformGroupAdminRequest"
import GroupAdminRequest from "../../models/groupAdminRequest/groupAdminRequest.model"
const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'admins', model: 'user' },

];
const populateQueryById = [
    { path: 'owner', model: 'user' },
    { path: 'admins', model: 'user' },
    { path: 'sponserPost', model: 'post' },
    { path: 'displayBanars', model: 'anoncement' },
    { path: 'staticBanars', model: 'anoncement' },

];
const populateQueryParticipant = [
    { path: 'user', model: 'user' },
];
const populateQueryGroupAdminRequest = [
    { path: 'group',model: 'group'},
    { path: 'to', model: 'user' },
];
export default {
    validateBody(isUpdate = false) {
        let validations = [
            body('name').not().isEmpty().withMessage((value, { req }) => {
                return req.__('name.required', { value });
            }),
            body('description').optional(),
            body('shortDescription').optional(),
            body('about').optional(),
            body('type').optional().isIn(['PRIVATE', 'PUBLIC'])
            .withMessage((value, { req }) => {
                return req.__('type.invalid', { value });
            }),
            body('postedType').optional().isIn(['OPENED', 'BY-REQUEST'])
            .withMessage((value, { req }) => {
                return req.__('postedType.invalid', { value });
            }),
            body('admins').optional()
            .custom(async(admins, { req }) => {
                for (let value of admins) {
                    if (!await User.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('admin.invalid'));
                    else
                        return true;
                }
                return true;
            }),
        ];
        if (isUpdate)
            validations.push([
                body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req }) => {
                    return req.__('img.syntax', { value });
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
            if (!validatedBody.admins) {
                validatedBody.admins = [req.user._id]
            } else {
                validatedBody.admins.push(req.user._id)
            }
            validatedBody.usersCount = validatedBody.admins.length
            let group = await Group.create({...validatedBody });
            //add admins to group members
            let user = await checkExistThenGet(req.user._id, User)
            user.groups.push(group._id);
            await user.save();
            validatedBody.admins.forEach(async(element) => {
                let admin = await checkExistThenGet(element, User)
                admin.groups.push(group.id);
                await admin.save();
                await GroupParticipant.create({ user: element, status: 'ACCEPTED', group: group._id });
            });
            let activityBody = {user:req.user._id,action:'CREATE-GROUP',group:group._id}
            if(validatedBody.business) activityBody.business = validatedBody.business
            await Activity.create({... activityBody});
            let reports = {
                "action": "Create New group",
                "type": "GROUP",
                "deepId": group.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Group.findById(group.id).populate(populateQuery).then(async(e) => {
                let index = await transformGroupById(e, lang)
                return res.status(201).send({
                    success: true,
                    data: index
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
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (!isInArray(group.admins, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            await Group.findByIdAndUpdate(groupId, {...validatedBody });
            let reports = {
                "action": "Update group",
                "type": "GROUP",
                "deepId": groupId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Group.findById(groupId).populate(populateQuery).then(async(e) => {
                let index = await transformGroupById(e, lang)
                return res.status(200).send({
                    success: true,
                    data: index
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
            let { userId, } = req.query;
            await checkExist(groupId, Group, { deleted: false });
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            await Group.findById(groupId).populate(populateQueryById).then(async(e) => {
                let index = await transformGroupById(e, lang, myUser, userId)
                return res.send({
                    success: true,
                    data: index
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let { search, type, owner, userId, myGroups, otherGroups } = req.query;
            let query = { deleted: false };
            if (search) {
                query = {
                    $and: [{
                            $or: [
                                { about: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { name: { $regex: '.*' + search + '.*', '$options': 'i' } },

                            ]
                        },
                        { deleted: false },
                    ]
                };
            }
            if (type) query.type = type;
            if (owner) query.owner = owner;
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
                if (myGroups == "true") {
                    query._id = myUser.groups
                }
                if (otherGroups == "true") {
                    query._id = { $nin: myUser.groups }
                }
            }
            await Group.find(query).populate(populateQuery)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformGroup(e, lang, myUser, userId)
                        newdata.push(index);

                    }))
                    res.send({ success: true, data: newdata });
                })
        } catch (error) {
            next(error);
        }
    },

    async getAllPaginated(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let { search, type, owner, userId, myGroups, otherGroups } = req.query;
            let query = { deleted: false };
            if (search) {
                query = {
                    $and: [{
                            $or: [
                                { about: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { name: { $regex: '.*' + search + '.*', '$options': 'i' } },

                            ]
                        },
                        { deleted: false },
                    ]
                };
            }
            if (type) query.type = type;
            if (owner) query.owner = owner;
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
                if (myGroups == "true") {
                    query._id = myUser.groups
                }
                if (otherGroups == "true") {
                    query._id = { $nin: myUser.groups }
                }
            }
            await Group.find(query).populate(populateQuery)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformGroup(e, lang, myUser, userId)
                        newdata.push(index);
                    }))
                    const count = await Group.countDocuments({ deleted: false });
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
            /*delete posts under group */
            let posts = await Post.find({ group: groupId });
            for (let id of posts) {
                id.deleted = true;
                //remove activities
                let activities = await Activity.find({ post: id });
                for (let id2 of activities) {
                    id2.deleted = true;
                    await id2.save();
                }
                await id.save();
            }
            //remove user from participant
            let groupParticipant = await GroupParticipant.find({ group: groupId })
            for (let id3 of groupParticipant) {
                id3.deleted = true;
                await id3.save();
            }
            await group.save();
            let reports = {
                "action": "Delete group",
                "type": "GROUP",
                "deepId": groupId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({ success: true });

        } catch (err) {
            next(err);
        }
    },
    validateAddParticipantBody() {
        let validations = [
            body('user').not().isEmpty().withMessage((value, { req }) => {
                return req.__('user.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('user.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
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
            let { groupId } = req.params
            let group = await checkExistThenGet(groupId, Group);

            validatedBody.group = groupId;
            //check if user is new or exist
            let user = await checkExistThenGet(validatedBody.user, User);
            validatedBody.user = user.id
            let admins = group.admins;
            var adminFound = admins.find((e) => e == req.user._id);
            
            if (group.type == "PUBLIC" || adminFound == true) {
                validatedBody.status = 'ACCEPTED'
                group.usersCount = group.usersCount + 1
                if(group.usersCount >= 2) group.isVerified = true
                await group.save()
                if (!await GroupParticipant.findOne({ user: validatedBody.user, group: groupId, status: { $ne: 'REJECTED' }, deleted: false })) {
                    let arr = user.groups;
                    var found = arr.find((e) => e == groupId);
                    if (!found) {
                        user.groups.push(groupId);
                        await user.save();
                        await GroupParticipant.create({...validatedBody });
                    }
                }
            } else {
                if (!await GroupParticipant.findOne({ user: validatedBody.user, group: groupId, status: { $ne: 'REJECTED' }, deleted: false })) {
                    await GroupParticipant.create({...validatedBody });
                    let arr = user.groupJoinRequests;
                    var found = arr.find((e) => e == groupId);
                    if (!found) {
                        user.groupJoinRequests.push(groupId);
                        await user.save();
                    }
                }

            }
            let reports = {
                "action": "user will attend to group",
                "type": "GROUP",
                "deepId": groupId,
                "user": req.user._id
            };
            await Report.create({...reports });

            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    async getGroupParticipants(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let { status } = req.query
            let query = { deleted: false, group: req.params.groupId };
            if (status) query.status = status;
            await GroupParticipant.find(query).populate(populateQueryParticipant)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e) => {
                        let index = await transformParticipant(e, lang)
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
    async acceptMember(req, res, next) {
        try {
            let { groupParticipantId } = req.params;
            let groupParticipant = await checkExistThenGet(groupParticipantId, GroupParticipant);
            let group = await checkExistThenGet(groupParticipant.group, Group);

            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (!isInArray(group.admins, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            groupParticipant.status = "ACCEPTED";
            group.usersCount = group.usersCount + 1
            if(group.usersCount >= 2) group.isVerified = true
            await group.save()
            await groupParticipant.save();
            let user = await checkExistThenGet(groupParticipant.user, User);
            let arr = user.groups;
            var found = arr.find((e) => e == group._id);
            if (!found) {
                user.groups.push(group._id);
            }
            let arr2 = user.groupJoinRequests;
            for (let i = 0; i <= arr2.length; i = i + 1) {
                if (arr2[i] == group._id) {
                    arr2.splice(i, 1);
                }
            }
            user.groupJoinRequests = arr2;
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: groupParticipant.user,
                fromUser: req.user,
                text: 'Join request response',
                subject: groupParticipant.id,
                body: `your request to join group ${group.name} has been accepted`,
                info: 'GROUP-REQUEST'
            });
            let notif = {
                "description_en": `your request to join group ${group.name} has been accepted`,
                "description_ar": ' تم قبول الطلب الانضمام الخاص بك',
                "title_en": 'Join request response',
                "title_ar": ' تم قبول الطلب الانضمام الخاص بك',
                "type": 'GROUP-REQUEST'
            }
            await Notif.create({...notif, resource: req.user, target: groupParticipant.user, groupParticipant: groupParticipant.id });
            let reports = {
                "action": "Accept group join request",
                "type": "GROUP-REQUEST",
                "deepId": groupParticipantId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    async rejectMember(req, res, next) {
        try {
            let { groupParticipantId } = req.params;
            let groupParticipant = await checkExistThenGet(groupParticipantId, GroupParticipant);
            let group = await checkExistThenGet(groupParticipant.group, Group);

            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let admins = [group.owner]
                admins.push(...group.admins)
                if (!isInArray(admins, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            groupParticipant.status = "REJECTED";
            await groupParticipant.save();
            let user = await checkExistThenGet(groupParticipant.user, User)
            let arr2 = user.groupJoinRequests;
            for (let i = 0; i <= arr2.length; i = i + 1) {
                if (arr2[i] == group._id) {
                    arr2.splice(i, 1);
                }
            }
            user.groupJoinRequests = arr2;
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: groupParticipant.user,
                fromUser: req.user,
                text: 'Join request response',
                subject: groupParticipant.id,
                body: `your request to join group ${group.name} has been rejected`,
                info: 'GROUP-REQUEST'
            });
            let notif = {
                "description_en": `your request to join group ${group.name} has been rejected`,
                "description_ar": ' تم رفض الطلب الانضمام الخاص بك',
                "title_en": 'Join request response',
                "title_ar": ' تم رفض الطلب الانضمام الخاص بك',
                "type": 'GROUP-REQUEST'
            }
            await Notif.create({...notif, resource: req.user, target: groupParticipant.user, groupParticipant: groupParticipant.id });
            let reports = {
                "action": "reject group join request",
                "type": "GROUP-REQUEST",
                "deepId": groupParticipantId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    async removeUserFromGroup(req, res, next) {
        try {
            let { groupId, userId } = req.params;
            let user = await checkExistThenGet(userId, User, { deleted: false });
            let group = await checkExistThenGet(groupId, Group);
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let admins = [parseInt(userId)]
                admins.push(...group.admins)
                console.log(admins)

                if (!isInArray(admins, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            //remove user from participant
            let groupParticipant = await GroupParticipant.find({ group: groupId, user: userId })
            for (const id of groupParticipant) {
                id.deleted = true;
                await id.save();
            }
            //reduce group users count
            group.usersCount = group.usersCount - 1;
            await group.save();
            //remove group from user data
            let arr = user.groups;
            for (let i = 0; i <= arr.length; i = i + 1) {
                if (arr[i] == groupId) {
                    arr.splice(i, 1);
                }
            }
            user.groups = arr;
            //remove from pending requests
            let arr2 = user.groupJoinRequests;
            for (let i = 0; i <= arr2.length; i = i + 1) {
                if (arr2[i] == group._id) {
                    arr2.splice(i, 1);
                }
            }
            user.groupJoinRequests = arr2;
            await user.save();
            let reports = {
                "action": "remove user from group",
                "type": "GROUP",
                "deepId": groupParticipant.group,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    validateSendGroupAdminRequestBody() {
        let validations = [
            body('to').not().isEmpty().withMessage((value, { req }) => {
                return req.__('to.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('to.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('to.invalid'));
                else
                    return true;
            }),
        ];
        return validations;
    },
    async sendGroupAdminRequest(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let { groupId } = req.params
            let group = await checkExistThenGet(groupId, Group, { deleted: false })
            let admins = group.admins;
            var adminFound = admins.find((e) => e == req.user._id);
            if (!adminFound) {
                return next(new ApiError(403, i18n.__('notAllow')));
            }
            validatedBody.from = req.user._id
            validatedBody.group = groupId
            let createdRequest = await GroupAdminRequest.create({ ...validatedBody});

            let reports = {
                "action":"Create Admin Request",
                "type":"GROUP",
                "deepId":groupId,
                "user": req.user._id
            };
            await Report.create({...reports});
            
            res.status(200).send({success: true,data:createdRequest});
        } catch (err) {
            next(err);
        }
    },
    async acceptGroupAdminRequest(req, res, next) {        
        try {
            let { groupAdminRequestId } = req.params;
            let groupAdminRequest = await checkExistThenGet(groupAdminRequestId, GroupAdminRequest, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (groupAdminRequest.to != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            let user = await checkExistThenGet(groupAdminRequest.to, User);
            let group = await checkExistThenGet(groupAdminRequest.group, Group);
            if(groupAdminRequest.status == "PENDING"){
                groupAdminRequest.status = 'ACCEPTED'
                await groupAdminRequest.save();
                if (!await GroupParticipant.findOne({ user: groupAdminRequest.to, group: groupAdminRequest.group, status: { $ne: 'REJECTED' }, deleted: false })) {
                    let arr = user.groups;
                    var found = arr.find((e) => e == groupAdminRequest.group);
                    if (!found) {
                        user.groups.push(groupAdminRequest.group);
                        await user.save();
                        await GroupParticipant.create({user: groupAdminRequest.to, group: groupAdminRequest.group, status:'ACCEPTED' });
                    }
                    group.usersCount = group.usersCount + 1
                    if(group.usersCount >= 2) group.isVerified = true
                    group.admins.push(groupAdminRequest.to)
                    await group.save()
                }else{
                    group.admins.push(groupAdminRequest.to)
                    await group.save()  
                }
                let reports = {
                    "action":"accept Admin Request",
                    "type":"GROUP",
                    "deepId":groupAdminRequest.group,
                    "user": req.user._id
                };
                await Report.create({...reports});
            }
            res.status(200).send({success: true});
        } catch (err) {
            next(err);
        }
    },
    async rejectGroupAdminRequest(req, res, next) {        
        try {
            let { groupAdminRequestId } = req.params;
            let groupAdminRequest = await checkExistThenGet(groupAdminRequestId, GroupAdminRequest, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (groupAdminRequest.to != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if(groupAdminRequest.status == "PENDING"){
                groupAdminRequest.status = 'REJECTED'
                await groupAdminRequest.save()
                let reports = {
                    "action":"reject Admin Request",
                    "type":"GROUP",
                    "deepId":groupAdminRequest.group,
                    "user": req.user._id
                };
                await Report.create({...reports});
            }
            res.status(200).send({success: true});
        } catch (err) {
            next(err);
        }
    },
    async getAllGroupAdminRequestsPaginated(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20 ;
            let {group,to,status } = req.query

            
            let query = {deleted: false };
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (to){
                    query.to = req.user._id
                }
                if (group){
                    console.log("group",group)
                    let theGroup  = await checkExistThenGet(group,Group,{deleted: false })
                    let admins = theGroup.admins;
                    var adminFound = admins.find((e) => e == req.user._id);
                    if (adminFound) {
                        query.group = group
                    }else{
                        query.to = req.user._id
                    }
                }
                if (!to && !group){
                    query.to = req.user._id
                }
                if(status) query.status = status
            }else{
                if(to) query.to = to
                if(group) query.group = group
                if(status) query.status = status
            }
            
            await GroupAdminRequest.find(query).populate(populateQueryGroupAdminRequest)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformGroupAdminRequest(e,lang)
                        newdata.push(index);
                    }))
                    const count = await GroupAdminRequest.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
    
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                });


        } catch (err) {
            next(err);
        }
    },
    async deleteGroupAdminRequest(req, res, next) {        
        try {
            let { groupAdminRequestId } = req.params;
            let groupAdminRequest = await checkExistThenGet(groupAdminRequestId, GroupAdminRequest);
            let group = await checkExistThenGet(groupAdminRequest.group, Group, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let admins = group.admins;
                var adminFound = admins.find((e) => e == req.user._id);
                if (!adminFound) {
                    return next(new ApiError(403, i18n.__('notAllow')));
                }
            }
            groupAdminRequest.deleted = true;
            await groupAdminRequest.save();
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}