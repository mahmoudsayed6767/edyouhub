import ApiResponse from "../../helpers/ApiResponse";
import Story from "../../models/story/story.model";
import Business from "../../models/business/business.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import { transformStory } from "../../models/story/transformStory";
import { toImgUrl } from "../../utils";

const populateQuery = [
    { path: 'business', model: 'business'},
];
export default {

    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let query = {deleted: false,end:false};
            await Story.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformStory(e,lang)
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
            let query = {deleted: false,end:false};
            await Story.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformStory(e,lang)
                    newdata.push(index)
                }))
                const count = await Story.countDocuments(query);
                const pageCount = Math.ceil(count / limit);

                res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
            })

        } catch (err) {
            next(err);
        }
    },
    //get by id
    async getById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)          
            let { storyId } = req.params;
            await checkExist(storyId, Story, { deleted: false });

            await Story.findById(storyId).populate(populateQuery)
            .then(async(e) => {
                let index = await transformStory(e,lang)
                return res.send({
                    success:true,
                    data:index,
                });
                
            })
        } catch (error) {
            next(error);

        }
    },

    validateBody(isUpdate = false) {
        let validations = [
            body('title').optional(),
            body('content').optional(),
            body('business').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('business.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Business.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('business.invalid'));
                else
                    return true;
            }),
        ];
        return validations;
    },

    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            if(validatedBody.business) validatedBody.type = "BUSINESS"
            let date = new Date();
            validatedBody.expireDateMillSec = Date.parse(new Date(date.setDate(date.getDate()+1)));
            //upload video
            if (req.files) {
                if (req.files['video']) {
                    let imagesList = [];
                    for (let imges of req.files['video']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.video = imagesList[0];
                }else{
                    return next(new ApiError(422, i18n.__('video.required')));
                }
                if (req.files['preview']) {
                    let imagesList = [];
                    for (let imges of req.files['preview']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.preview = imagesList[0];
                }else{
                    return next(new ApiError(422, i18n.__('preview.required')));
                }
            }else{
                return next(new ApiError(422, i18n.__('video.required')));
            }
            let theStory = await Story.create({ ...validatedBody});
            let reports = {
                "action":"Create story",
                "type":"STORY",
                "deepId":theStory.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true,data:theStory});
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {        
        try {
            let { storyId } = req.params;
            let story = await checkExistThenGet(storyId, Story, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(story.type =="BUSINESS"){
                    let business = await checkExistThenGet(story.business,Business,{deleted:false})
                    if(business.owner != req.user._id)
                        return next(new ApiError(403,  i18n.__('notAllow')));
                }
            }
            const validatedBody = checkValidations(req);
            //upload video
            if (req.files) {
                if (req.files['video']) {
                    let imagesList = [];
                    for (let imges of req.files['video']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.video = imagesList[0];
                }else{
                    return next(new ApiError(422, i18n.__('video.required')));
                }
                if (req.files['preview']) {
                    let imagesList = [];
                    for (let imges of req.files['preview']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.preview = imagesList[0];
                }else{
                    return next(new ApiError(422, i18n.__('preview.required')));
                }
            }
            await Story.findByIdAndUpdate(storyId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update story",
                "type":"STORY",
                "deepId":storyId,
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
            let { storyId } = req.params;
            let story = await checkExistThenGet(storyId, Story, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(story.type =="BUSINESS"){
                    let business = await checkExistThenGet(story.business,Business,{deleted:false})
                    if(business.owner != req.user._id)
                        return next(new ApiError(403,  i18n.__('notAllow')));
                }
            }
            story.deleted = true;
            await story.save();

            let reports = {
                "action":"Delete story",
                "type":"STORY",
                "deepId":storyId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});

        }
        catch (err) {
            next(err);
        }
    },
};