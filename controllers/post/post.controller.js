import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import {checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import Post from "../../models/post/post.model";
import Like from "../../models/like/like.model";
import Comment from "../../models/comment/comment.model";
import User from "../../models/user/user.model";
import {transformUser} from "../../models/user/transformUser";
import i18n from "i18n";
import { transformPost,transformPostById } from "../../models/post/transformPost";
import { transformComment } from "../../models/comment/transformComment";
import Option from "../../models/post/option.model";
import Event from "../../models/event/event.model";
import Group from "../../models/group/group.model";
import Activity from "../../models/user/activity.model";
import GroupParticipant from "../../models/group/groupParticipant.model";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Vacancy from "../../models/vacancy/vacancy.model";
import EventAttendance from "../../models/event/eventAttendance.model";
const populateQuery = [
    {
        path: 'owner', model: 'user',
        populate: { path: 'package', model: 'package' },
    },
    {
        path: 'business', model: 'business',
        populate: { path: 'subSector', model: 'category' },
    },
    {
        path: 'business', model: 'business',
        populate: { path: 'package', model: 'package' },
    },
    { path: 'options', model: 'option'},
    { path: 'vacancies', model: 'vacancy'},
    { path: 'event', model: 'event'},
    {
        path: 'event', model: 'event',
        populate: { path: 'usersParticipants', model: 'user' },
    },
    {
        path: 'event', model: 'event',
        populate: { path: 'businessParticipants', model: 'business' },
    },
    {
        path: 'admission', model: 'admission',
        populate: { path: 'grades', model: 'grade' },
    },
    {
        path: 'admission', model: 'admission',
        populate: { path: 'faculties.group', model: 'group' },
    },
    {
        path: 'admission', model: 'admission',
        populate: { path: 'faculties.grades', model: 'grade' },
    },
];
const populateQueryUser =[
    { path: 'country', model: 'country'},
    { path: 'city', model: 'city'},
    { path: 'area', model: 'area'}
]
const populateQueryComment = [
    { path: 'user', model: 'user'},
    {
        path: 'business', model: 'business',
        populate: { path: 'package', model: 'package' },
    },
];
export default {
    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {city,area,viewPlaceType,status,owner,type,business,ownerType,event,dataType,group} = req.query
            let query = {deleted: false,status:'ACCEPTED',group:null };
            if(group){
                query.group = group;
                if(group){
                    if(!await GroupParticipant.findOne({ user: req.user._id, group: group,status:'ACCEPTED',deleted:false})){
                        return next(new ApiError(403, i18n.__('notIn.group')));
                    }
                }
            }
            if(status) query.status = status
            if(status == "ALL") query.status = {$nin:['PENDING', 'ACCEPTED','REJECTED']}
            if(owner) query.owner = owner;
            if(dataType) query.dataType = dataType;
            if(business) query.business = business;
            if(ownerType) query.ownerType = ownerType;
            if(event) query.event = event;
            let myUser = await checkExistThenGet(req.user._id, User)
            
            if(viewPlaceType){
                query.viewPlaceType = viewPlaceType
                if(viewPlaceType == "WALL"){
                    let owners = myUser.connections
                    let business = myUser.following
                    let groups = myUser.groups
                    let events = await EventAttendance.find({deleted:false,user:req.user._id}).distinct('event')
                    Object.assign(query ,{
                        $and: [
                            { $or: [
                                {business: {$in:business}}, 
                                {owner: {$in:owners}},
                                {ownerType: 'APP'}, 
                                {group: {$in:groups}}, 
                                {event: {$in:events}}, 
                              ] 
                            },
                            {deleted: false},
                        ]
                    })
                }
            }
            if (type) {
                let values = type.split(",");
                query.type = {$in:values};
                var found = values.find(function(element) {
                    return element == 'EVENT';
                }); 
                if(found){
                    let eventQuery = {deleted:false}
                    if(city) eventQuery.city = city;
                    if(area) eventQuery.area = area;
                    let eventsIds = await Event.find(eventQuery).distinct('_id')
                    let query2 = {event:{$in:eventsIds}}
                    query = { $or: [query, query2] }
                }
            };
            await Post.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformPost(e,lang,myUser,req.user._id)
                        
                        newdata.push(index)
                    }))
                    const count = await Post.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    async findSelection(req, res, next) {        
        try {
            let {city,area,status,group,owner,type,business,ownerType,event,dataType} = req.query
            let query = {deleted: false,status:'ACCEPTED' ,group:null};
            if(group){
                query.group = group;
                if(group){
                    if(!await GroupParticipant.findOne({ user: req.user._id, group: group,status:'ACCEPTED',deleted:false})){
                        return next(new ApiError(403, i18n.__('notIn.group')));
                    }
                }
            }
            if(status) query.status = status
            if(event) query.event = event;
            if(owner) query.owner = owner;
            if(dataType) query.dataType = dataType;
            
            if(business) query.business = business;
            if(ownerType) query.ownerType = ownerType;
            let myUser = await checkExistThenGet(req.user._id, User)
            if(viewPlaceType){
                query.viewPlaceType = viewPlaceType
                if(viewPlaceType == "WALL"){
                    let owners = myUser.connections
                    let business = myUser.following
                    let groups = myUser.groups
                    let events = await EventAttendance.find({deleted:false,user:req.user._id}).distinct('event')
                    Object.assign(query ,{
                        $and: [
                            { $or: [
                                {business: {$in:business}}, 
                                {owner: {$in:owners}},
                                {ownerType: 'APP'}, 
                                {group: {$in:groups}}, 
                                {event: {$in:events}}, 
                              ] 
                            },
                            {deleted: false},
                        ]
                    })
                }
            }
            if (type) {
                let values = type.split(",");
                console.log(values)
                query.type = {$in:values};
                var found = values.find(function(element) {
                    return element == 'EVENT';
                }); 
                if(found){
                    let eventQuery = {deleted:false}
                    if(city) eventQuery.city = city;
                    if(area) eventQuery.area = area;
                    let eventsIds = await Event.find(eventQuery).distinct('_id')
                    let query2 = {event:{$in:eventsIds}}
                    query = { $or: [query, query2] }
                }
            };
            await Post.find(query).populate(populateQuery)
                .sort({ createdAt: -1 }).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformPost(e,lang,myUser)
                        newdata.push(index)
                    }))
                    res.send({success:true,data:newdata});
                })
        } catch (err) {
            next(err);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('type').not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }).isIn(['VACANCY','ADMISSION','EVENT', 'ANONCEMENT','GENERAL','EXPERICENCE','VOTE','REQUEST-RECOMMENDATION','GIVE-RECOMMENDATION','HELP','DISCUSSION']).withMessage((value, { req}) => {
                return req.__('type.invalid', { value});
            }),
            body('dataType').optional().isIn(['IMAGE', 'VIDEO','FILE','TEXT','LINK']).withMessage((value, { req}) => {
                return req.__('dataType.invalid', { value});
            }),
            body('content').not().isEmpty().withMessage((value, { req}) => {
                return req.__('content.required', { value});
            }),
            body('event').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('event.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Event.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('event.invalid'));
                else
                    return true;
            }),
            body('vacancies').optional()
            .custom(async(vacancies, { req }) => {
                for (let value of vacancies) {
                    if (!await Vacancy.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('vacancy.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('theOptions').optional()
            .custom(async (options, { req }) => {
                for (let option of options) {
                    body('title').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('title.required', { value});
                    }),
                    body('optionId').optional()
                }
                return true;
            }),
            body('files').optional()
            .custom(async (files, { req }) => {
                for (let file of files) {
                    body('dataType').optional().isIn(['IMAGE', 'VIDEO','FILE']).withMessage((value, { req}) => {
                        return req.__('dataType.invalid', { value});
                    }),
                    body('link').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('link.required', { value});
                    }),
                    body('link').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('link.required', { value});
                    }),
                    body('preview').optional(),
                    body('title').optional(),
                    body('duration').optional()
                }
                return true;
            }),
            body('business').optional(),
            body('ownerType').optional(),
            body('group').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('group.numeric', { value});
            }),
            body('viewPlaceType').optional().isIn(['WALL', 'BOARD']).withMessage((value, { req}) => {
                return req.__('viewPlaceType.invalid', { value});
            }),
            body('sponser').optional()
        ];
        return validations;
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            validatedBody.owner = req.user._id;
            if(validatedBody.business) validatedBody.ownerType = 'BUSINESS'
            if(validatedBody.group){
                let group = await checkExistThenGet(validatedBody.group,Group)
                let arr = group.admins;
                if(group.postedType == "BY-REQUEST"){
                    var found = arr.find((e) => e == validatedBody.group); 
                    if(!found){
                        validatedBody.status = "PENDING"
                    }
                }
                if(validatedBody.sponser == rue){
                    var found = arr.find((e) => e == validatedBody.group); 
                    if(!found){
                        validatedBody.sponser = true;
                    }
                }else{
                    validatedBody.sponser = false
                }
            }
            let createdPost = await Post.create({ ...validatedBody});
            let options = []
            if(validatedBody.theOptions){
                await Promise.all(validatedBody.theOptions.map(async(val) => {
                    val.post = createdPost.id
                    let createdRow = await Option.create({...val})
                    options.push(createdRow.id)
                }));  
            }
            createdPost.options = options
            if(validatedBody.sponser && validatedBody.group){
                let group = await checkExistThenGet(validatedBody.group,Group)
                group.sponserPost = createdPost._id;
                await group.save();
            }
            await createdPost.save();
            let activityBody = {user:req.user._id,action:'CREATE-POST',post:createdPost._id}
            if(validatedBody.business) activityBody.business = validatedBody.business
            await Activity.create({... activityBody});
            if(validatedBody.event){
                let event = await checkExistThenGet(validatedBody.event,Event)
                let eventAttendances = await EventAttendance.find({event: validatedBody.event }).distinct('user');
                for (let val of eventAttendances) {
                    sendNotifiAndPushNotifi({
                        targetUser: val,
                        fromUser: val,
                        text: ' EdHub',
                        subject: createdPost.id,
                        subjectType: 'A new event activity',
                        info: 'POST'
                    });
                    let notif = {
                        "description_en": `New Post are shared in the event ${event.title}`,
                        "description_ar": ' تم اضافه منشور جديد متعلق باحد احداثك',
                        "title_en": 'A new event activity',
                        "title_ar": 'هناك تفاعل جديد على احد الاحداث المنتظره',
                        "type": 'POST'
                    }
                    await Notif.create({...notif, resource: req.user, target: val, post: createdPost.id });
                    
                }
            }
            let reports = {
                "action":"Add Post",
                "type":"POSTS",
                "deepId":createdPost._id,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(201).send({success:true,data:createdPost});
        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { postId } = req.params;
            await checkExist(postId, Post, { deleted: false });
            let myUser = await checkExistThenGet(req.user._id, User)
            await Post.findById(postId).populate(populateQuery)
                .sort({ createdAt: -1 }).then(async(e)=>{
                    let index = await transformPostById(e,lang,myUser,req.user._id)
                    res.send({success:true,data:index});
                })
        } catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {        
        try {
            let { postId } = req.params;
            let post = await checkExistThenGet(postId, Post, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                //user is not the owner 
                if(req.user._id != post.owner)
                    return next(new ApiError(403, i18n.__('admin.auth')));
            }
            const validatedBody = checkValidations(req);
            let options = []
            if(validatedBody.theOptions){
                await Promise.all(validatedBody.theOptions.map(async(val) => {
                    if(val.optionId){
                        await Option.findByIdAndUpdate(val.optionId, { ...val });
                        options.push(val.optionId)
                    }else{
                        val.post = postId
                        let createdRow = await Option.create({...val})
                        options.push(createdRow.id)
                    }
                }));  
            }
            validatedBody.options = options
            let updatedPost = await Post.findByIdAndUpdate(postId, {
                ...validatedBody,
            }, { new: true });
            let activityBody = {user:req.user._id,action:'UPTDAE-POST',post:postId}
            if(validatedBody.business) activityBody.business = validatedBody.business
            await Activity.create({... activityBody});
            let reports = {
                "action":"Update Post",
                "type":"POSTS",
                "deepId":postId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success:true,data:updatedPost});
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {        
        try {
            let { postId } = req.params;
            let post = await checkExistThenGet(postId, Post, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                //user is not the owner of post
                if(req.user.type =="USER" && req.user._id != post.owner)
                    return next(new ApiError(403, i18n.__('admin.auth')));
            }
            /*delete activites under post */
            let activites = await Activity.find({ post: postId });
            for (let id of activites) {
                id.deleted = true;
                await id.save();
            }
            post.deleted = true;
            await post.save();
            //await Activity.create({user:req.user._id,action:'REMOVE-POST',post:postId});

            let reports = {
                "action":"Delete Post",
                "type":"POSTS",
                "deepId":postId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
    /*answer */
    async answer(req, res, next) {        
        try {
            let {optionId } = req.params;

            let theOption = await checkExistThenGet(optionId, Option);
            let arr = theOption.chosenUsers;
            var found = arr.find((e) => e == req.user._id); 
            if(!found){
                theOption.chosenCount = theOption.chosenCount + 1;
                theOption.chosenUsers.push(req.user._id);
                await theOption.save();
                await Activity.create({user:req.user._id,action:'ANSWER-POST',post:theOption.post});

                let reports = {
                    "action":"Answer On Post",
                    "type":"ANSWER",
                    "deepId":optionId,
                    "user": req.user._id
                };
                await Report.create({...reports});
            }
            res.send({success: true});
        } catch (error) {
            next(error)
        }
    },
    /*like post*/
    async addLike(req, res, next) {         
        try {
            let {postId} = req.params
            let thePost = await checkExistThenGet(postId, Post);

            if(!await Like.findOne({ user: req.user._id, post: postId,deleted:false})){
                let arr = thePost.likedList;
                var found = arr.find((e) => e == req.user._id); 
                if(!found){
                    thePost.likedList.push(req.user._id);
                    thePost.likesCount = thePost.likesCount + 1;
                    let like = await Like.create({ user: req.user._id, post: postId });
                    await thePost.save();
                    await Activity.create({user:req.user._id,action:'ADD-LIKE',post:postId});
                    sendNotifiAndPushNotifi({
                        targetUser: thePost.owner,
                        fromUser: req.user,
                        text: ' EdHub',
                        subject: thePost.id,
                        subjectType: 'Post Like',
                        info: 'POST'
                    });
                    let notif = {
                        "description_en": `${req.user.fullname} liked on your post`,
                        "description_ar": 'لديك اعجاب جديد على احد منشوراتك',
                        "title_en": 'Post Like',
                        "title_ar":'اعجاب على منشورك',
                        "type": 'POST'
                    }
                    await Notif.create({...notif, resource: req.user, target: thePost.owner, post: thePost.id });
                    
                    let reports = {
                        "action":"Add Like",
                        "type":"LIKES",
                        "deepId":like.id,
                        "user": req.user._id
                    };
                    await Report.create({...reports});
                }
            }
            
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    /*remove like  */
    async removeLike(req, res, next) {        
        try {
            let {postId } = req.params;
             /*check if  */
            if(!await Like.findOne({ user: req.user._id, post: postId,deleted:false})){
                return next(new ApiError(500, i18n.__('post.notFoundInList')));
            }
            let like = await Like.findOne({ user: req.user._id, post: postId,deleted:false})

            //if the user make the request is not the owner
            if (like.user != req.user._id)
                return next(new ApiError(403, i18n.__('notAllow')));
            like.deleted = true;
            await like.save();
             /*remove post id from user data*/
            let thePost = await checkExistThenGet(postId, Post);
            let arr = thePost.likedList;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == req.user._id){
                    arr.splice(i, 1);
                }
            }
            thePost.likedList = arr;
            /*reduce the likes count */
            thePost.likesCount = thePost.likesCount - 1;
            await thePost.save();
            //await Activity.create({user:req.user._id,action:'REMOVE-LIKE',post:postId});

            let reports = {
                "action":"Remove Like",
                "type":"LIKES",
                "deepId":like.id,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({success: true});
        } catch (error) {
            next(error)
        }
    },
    async getPostLikes(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {deleted: false,post:req.params.postId };
            let usersIds = await Like.find(query).distinct('user')
            let myUser =  await checkExistThenGet(req.user._id, User)
            await User.find({_id:usersIds}).populate(populateQueryUser)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformUser(e,lang,myUser,req.user._id)
                        newdata.push(index)
                    }))
                    const count = await User.countDocuments({_id:usersIds});
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    /*add comment post*/
    validateCommentBody(isUpdate = false) {
        let validations = [
            body('comment').not().isEmpty().withMessage((value, { req}) => {
                return req.__('comment.required', { value});
            }),
            body('business').optional()
        ];
        return validations;
    },
    async addComment(req, res, next) {         
        try {
            const validatedBody = checkValidations(req);
            validatedBody.user = req.user._id;
            validatedBody.post = req.params.postId
            if(validatedBody.business) validatedBody.ownerType = 'BUSINESS'
            let thePost = await checkExistThenGet(req.params.postId, Post);
            thePost.commentsCount = thePost.commentsCount + 1;
            await thePost.save();
            let createdComment = await Comment.create({ ...validatedBody});

            let activityBody = {user:req.user._id,action:'ADD-COMMENT',post:req.params.postId}
            if(validatedBody.business) activityBody.business = validatedBody.business
            await Activity.create({... activityBody});
            sendNotifiAndPushNotifi({
                targetUser: thePost.owner,
                fromUser: req.user,
                text: ' EdHub',
                subject: thePost.id,
                subjectType: 'Post Comment',
                info: 'POST'
            });
            let notif = {
                "description_en": `${req.user.fullname} commented on your post`,
                "description_ar": 'لديك تعليق جديد على احد منشوراتك',
                "title_en": 'Post Comment',
                "title_ar":'تعليق على منشورك',
                "type": 'POST'
            }
            await Notif.create({...notif, resource: req.user, target: thePost.owner, post: thePost.id });
            
            let reports = {
                "action":"Add Comment",
                "type":"COMMENTS",
                "deepId":createdComment,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    /*remove comment  */
    async removeComment(req, res, next) {        
        try {
            let {commentId } = req.params;
            let comment = await checkExistThenGet(commentId, Comment);
            comment.deleted = true;
            await comment.save();
            /*reduce the likes count */
            let thePost = await checkExistThenGet(comment.post, Post);
            thePost.commentsCount = thePost.commentsCount - 1;
            await thePost.save();
            //await Activity.create({user:req.user._id,action:'REMOVE-COMMENT',post:comment.post});

            let reports = {
                "action":"Remove Comment",
                "type":"COMMENTS",
                "deepId":commentId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({success: true});
        } catch (error) {
            next(error)
        }
    },
    async getPostComments(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {deleted: false,post:req.params.postId };
            await Comment.find(query).populate(populateQueryComment)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformComment(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Comment.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    async accept(req, res, next) {        
        try {
            let { postId } = req.params;
            let post = await checkExistThenGet(postId, Post, { deleted: false });
            let group
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                //user is not the owner of post
                if(post.group){
                    group = await checkExistThenGet(post.group, Group, { deleted: false });
                    if(!isInArray(group.admins,req.user._id))
                        return next(new ApiError(403, i18n.__('admin.auth')));
                }
            }
            sendNotifiAndPushNotifi({
                targetUser: post.owner,
                fromUser: req.user,
                text: ' EdHub',
                subject: post.id,
                subjectType: 'Share post request',
                info: 'POST'
            });
            let notif = {
                "description_en": `your request to share a post in group ${group.name} has been accepted, your post is shared now`,
                "description_ar": ' تم قبول  طلب اضافه منشور الخاص بك',
                "title_en": 'Share post request',
                "title_ar": ' طلب اضافه منشور',
                "type": 'POST'
            }
            await Notif.create({...notif, resource: req.user, target: post.owner, post: post.id });
            
            post.status = 'ACCEPTED';
            await post.save();
            let reports = {
                "action":"Accept Post",
                "type":"POSTS",
                "deepId":postId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
    async reject(req, res, next) {        
        try {
            let { postId } = req.params;
            let post = await checkExistThenGet(postId, Post, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                //user is not the owner of post
                if(post.group){
                    let group = await checkExistThenGet(post.group, Group, { deleted: false });
                    if(!isInArray(group.admins,req.user._id))
                        return next(new ApiError(403, i18n.__('admin.auth')));
                }
            }
            
            post.status = 'REJECTED';
            await post.save();
            let reports = {
                "action":"Reject Post",
                "type":"POSTS",
                "deepId":postId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
};