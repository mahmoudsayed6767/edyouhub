import Color from "../../models/color/color.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang,handleImg } from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import Report from "../../models/reports/report.model";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet,isInArray ,isImgUrl} from "../../helpers/CheckMethods";
import i18n from "i18n";
export default {
    validateBody(isUpdate = false) {

        let validations = [
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
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
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));

            const validatedBody = checkValidations(req);
            let image = await handleImg(req);
            validatedBody.img = image;
            let color = await Color.create({ ...validatedBody});
            let reports = {
                "action":"Create New Color",
                "type":"COLORS",
                "deepId":color.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            return res.status(201).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { colorId } = req.params;
            
            await checkExist(colorId, Color, { deleted: false });

            await Color.findById(colorId).then( e => {
                let color = {
                    colorName:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:color
                });
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            convertLang(req)
            let { colorId } = req.params;
            await checkExist(colorId, Color, { deleted: false });
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            await Color.findByIdAndUpdate(colorId, { ...validatedBody });
            let reports = {
                "action":"Update Color",
                "type":"COLORS",
                "deepId":colorId,
                "user": req.user._id
            };
            await Report.create({...reports });
            return res.status(200).send({success: true});
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {search} = req.query;
            let query = { deleted: false };
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                        
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            
            await Color.find(query)
            .then(async (data) => {
                var newdata = [];
                data.map(async(e) =>{
                    newdata.push({
                        colorName:lang=="ar"?e.name_ar:e.name_en,
                        name_ar:e.name_ar,
                        name_en:e.name_en,
                        img:e.img,
                        id: e._id,
                        createdAt: e.createdAt,
                    });
                })
                res.send({success:true,data:newdata});
            })
        } catch (error) {
            next(error);
        }
    },

    async getAllPaginated(req, res, next) {
        try {    
            convertLang(req)
            let lang = i18n.getLocale(req)       
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {search} = req.query;
            let query = { deleted: false };

            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                        
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            await Color.find(query)
                .limit(limit)
                .skip((page - 1) * limit).sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    data.map(async(e) =>{
                        newdata.push({
                            colorName:lang=="ar"?e.name_ar:e.name_en,
                            name_ar:e.name_ar,
                            name_en:e.name_en,
                            img:e.img,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    })
                    const count = await Color.countDocuments({deleted: false });
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },


    async delete(req, res, next) {
        
        try {
            convertLang(req)
            let { colorId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let color = await checkExistThenGet(colorId, Color);
            color.deleted = true;
            await color.save();
            let reports = {
                "action":"Delete Color",
                "type":"COLORS",
                "deepId":colorId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}