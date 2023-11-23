import ApiResponse from "../../helpers/ApiResponse";
import Gallery from "../../models/gallery/gallery.model";
import Business from "../../models/business/business.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import { transformGallery } from "../../models/gallery/transformGallery";
import { toImgUrl } from "../../utils";
import Activity from "../../models/user/activity.model";

const populateQuery = [
    //{ path: 'business', model: 'business'},
];
export default {

    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let {businessId} = req.params;
            let query = {deleted: false,business:businessId};
            await Gallery.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformGallery(e,lang)
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
            let {businessId} = req.params;
            let query = {deleted: false,business:businessId};
            await Gallery.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformGallery(e,lang)
                    newdata.push(index)
                }))
                const count = await Gallery.countDocuments(query);
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
            let { galleryId } = req.params;
            await checkExist(galleryId, Gallery, { deleted: false });

            await Gallery.findById(galleryId).populate(populateQuery)
            .then(async(e) => {
                let index = await transformGallery(e,lang)
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
            body('title_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_ar.required', { value});
            }),
            body('title_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title_en.required', { value});
            })
        ];
        return validations;
    },

    async create(req, res, next) {        
        try {
            let {businessId} = req.params
            const validatedBody = checkValidations(req);
            validatedBody.business = businessId
            let business = await checkExistThenGet(businessId,Business,{deleted:false})
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(business.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }

            //upload imgs
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('imgs.required')));
                }
            }else{
                return next(new ApiError(422, i18n.__('imgs.required')));
            }
            let theGallery = await Gallery.create({ ...validatedBody});
            let activityBody = {user:req.user._id,action:'CREATE-GALLERY',business:businessId,gallery:theGallery._id}
            await Activity.create({... activityBody});
            let reports = {
                "action":"Create gallery",
                "type":"GALLERY",
                "deepId":theGallery.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true,data:theGallery});
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {        
        try {
            let { galleryId } = req.params;
            let gallery = await checkExistThenGet(galleryId, Gallery, { deleted: false });
            let business = await checkExistThenGet(gallery.business,Business,{deleted:false})
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(business.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            //upload imgs
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }
            }
            await Gallery.findByIdAndUpdate(galleryId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update gallery",
                "type":"GALLERY",
                "deepId":galleryId,
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
            let { galleryId } = req.params;
            let gallery = await checkExistThenGet(galleryId, Gallery, { deleted: false });
            let business = await checkExistThenGet(gallery.business,Business,{deleted:false})
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type)){
                if(business.owner != req.user._id)
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            gallery.deleted = true;
            await gallery.save();

            let reports = {
                "action":"Delete gallery",
                "type":"GALLERY",
                "deepId":galleryId,
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