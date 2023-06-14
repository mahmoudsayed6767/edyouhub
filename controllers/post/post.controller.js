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

const populateQuery = [
    {
        path: 'owner', model: 'user',
        populate: { path: 'package', model: 'package' },
    },
    {
        path: 'business', model: 'business',
        populate: { path: 'package', model: 'package' },
    },
    { path: 'options', model: 'option'},
    { path: 'vacancy', model: 'vacancy'},
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
];
export default {
    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {status,owner,userId,type,business,ownerType,event,dataType,group} = req.query
            let query = {deleted: false,status:'ACCEPTED',group:null };
            if(group) query.group = group
            if(status) query.status = status
            if(status == "ALL") query.status = {$nin:['PENDING', 'ACCEPTED','REJECTED']}
            if(owner) query.owner = owner;
            if(dataType) query.dataType = dataType;
            if (type) {
                let values = type.split(",");
                console.log(values)
                query.type = {$in:values};
            };
            if(business) query.business = business;
            if(ownerType) query.ownerType = ownerType;
            if(event) query.event = event;
            let myUser
            if(userId){
                myUser = await checkExistThenGet(userId, User)
            }
            await Post.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformPost(e,lang,myUser,userId)
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
            let {status,group,owner,type,business,ownerType,event,dataType} = req.query
            let query = {deleted: false,status:'ACCEPTED' ,group:null};
            if(group) query.group = group
            if(status) query.status = status
            if(event) query.event = event;
            if(owner) query.owner = owner;
            if(dataType) query.dataType = dataType;
            if (type) {
                let values = type.split(",");
                console.log(values)
                query.type = {$in:values};
            };
            if(business) query.business = business;
            if(ownerType) query.ownerType = ownerType;
            let myUser = await checkExistThenGet(req.user._id, User)
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
            }).isIn(['ANONCEMENT','GENERAL','VOTE','EXPERICENCE','REQUEST-RECOMMENDATION','GIVE-RECOMMENDATION','HELP','DISCUSSION']).withMessage((value, { req}) => {
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
            body('theOptions').optional()
            .custom(async (options, { req }) => {
                for (let option of options) {
                    body('title').not().isEmpty().withMessage((value) => {
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
                    body('link').not().isEmpty().withMessage((value) => {
                        return req.__('link.required', { value});
                    }),
                    body('link').not().isEmpty().withMessage((value) => {
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
            })
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
                if(group.postedType == "BY-REQUEST"){
                    validatedBody.status = "PENDING"
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
            await createdPost.save();

            let reports = {
                "action":"Add Post",
                "type":"POSTS",
                "deepId":createdPost,
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
                        val.post = createdPost.id
                        let createdRow = await Option.create({...val})
                        options.push(createdRow.id)
                    }
                }));  
            }
            validatedBody.options = options
            let updatedPost = await Post.findByIdAndUpdate(postId, {
                ...validatedBody,
            }, { new: true });
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
            
            post.deleted = true;
            await post.save();
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
        ];
        return validations;
    },
    async addComment(req, res, next) {         
        try {
            const validatedBody = checkValidations(req);
            validatedBody.user = req.user._id;
            validatedBody.post = req.params.postId
            let thePost = await checkExistThenGet(req.params.postId, Post);
            thePost.commentsCount = thePost.commentsCount + 1;
            await thePost.save();
            let createdComment = await Comment.create({ ...validatedBody});
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
            
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                //user is not the owner of post
                if(post.group){
                    let group = await checkExistThenGet(post.group, Group, { deleted: false });
                    if(!isInArray(group.admins,req.user._id))
                        return next(new ApiError(403, i18n.__('admin.auth')));
                }
            }
            
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