import Supplies from "../../models/supplies/supplies.model";
import SuppliesItems from "../../models/supplies/suppliesItems.model";
import Alternative from "../../models/supplies/alternatives.model";
import ApiResponse from "../../helpers/ApiResponse";
import {  checkValidations ,convertLang} from "../shared/shared.controller";
import { checkExistThenGet, checkExist,isInArray } from "../../helpers/CheckMethods";
import { body } from "express-validator/check";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import Cart from "../../models/cart/cart.model";
import i18n from "i18n";
import IndividualSupplies from "../../models/individual supplies/individual supplies.model";
import { transformSupplies,transformSuppliesById } from "../../models/supplies/transformSupplies";
import EducationInstitution from "../../models/education institution/education institution.model";
import Product from "../../models/product/product.model";
import Color from "../../models/color/color.model";
import { toImgUrl } from "../../utils";
import Grade from "../../models/grade/grade.model"
const populateQuery = [
    { path: 'educationInstitution', model: 'educationInstitution' },
    { path:'educationSystem', model: 'educationSystem'},
    { path: 'grade', model: 'grade' },

    {
        path: 'existItems', model: 'suppliesItems',
        populate: { 
            path: 'items.product', model: 'product' ,
            populate: { path: 'colors', model: 'color' }
        },
    },
    {
        path: 'existItems', model: 'suppliesItems',
        populate: { path: 'items.color', model: 'color' },
    },

    {
        path: 'existItems', model: 'suppliesItems',
        populate: { 
            path: 'items.alternatives', model: 'alternative' ,
            populate: { 
                path: 'product', model: 'product' ,
                populate: { 
                    path: 'colors', model: 'color' 
                }
            }
        },
    },
    {
        path: 'existItems', model: 'suppliesItems',
        populate: { 
            path: 'items.alternatives', model: 'alternative' ,
            populate: { path: 'color', model: 'color' }
        },
    },
];

export default {
    async findAll(req, res, next) {
        
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            {educationInstitution,subCategory,category,grade,search,type} = req.query;
            let query = {deleted: false ,type:'NORMAL'};
            
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          
                          ] 
                        },
                        {type:'NORMAL'},
                        {deleted: false},
                    ]
                };
            }
            if (type) query.type = type
            if (grade) query.grade = grade
            if (category) query.category = category
            if (subCategory) query.subCategory = subCategory
            if (educationInstitution) query.educationInstitution = educationInstitution
            let sortd = {createdAt: -1}
            await Supplies.find(query).populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let theSupplies =  await checkExistThenGet(e._id,Supplies)
                        if(theSupplies.type != 'INDIVIDUAL')
                            theSupplies.type = 'NORMAL'
                        await theSupplies.save()
                        let index = await transformSupplies(e,lang)
                        newdata.push(index);
                    }))
                    const count = await Supplies.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })

            
        } catch (err) {
            next(err);
        }
    },
    async getAll(req, res, next) {
        
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {educationInstitution,subCategory,category,grade,search,type} = req.query;
            let query = {deleted: false ,type:'NORMAL'};
            
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          
                          ] 
                        },
                        {type: 'NORMAL'},
                        {deleted: false},
                    ]
                };
            }
            if (type) query.type = type
            if (grade) query.grade = grade
            if (category) query.category = category
            if (subCategory) query.subCategory = subCategory
            if (educationInstitution) query.educationInstitution = educationInstitution
            let sortd = {createdAt: -1}
            await Supplies.find(query).populate(populateQuery)
                .sort(sortd).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformSupplies(e,lang)
                        newdata.push(index);
                    }))
                    res.send({success:true,data:newdata});
                })

            
        } catch (err) {
            next(err);
        }
    }, 
    async getSuplliesMobile(req, res, next) {
        
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {educationInstitution,grade,type} = req.query;
            let query = {deleted: false,type:'NORMAL' };
            if (type) query.type = type;
            if (grade) query.grade = grade
            if (educationInstitution) query.educationInstitution = educationInstitution
            let sortd = {createdAt: -1}
            await Supplies.findOne(query).populate(populateQuery)
                .sort(sortd).then(async (e) => {
                    let index = {}
                    if(e){
                        index = await transformSuppliesById(e,lang)
                    }
                    
                    res.send({success:true,data:index});
                })

            
        } catch (err) {
            next(err);
        }
    }, 
    validateBody(isUpdate = false) {
        
        let validations = [
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('grade').not().isEmpty().withMessage((value, { req}) => {
                return req.__('grade.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('grade.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Grade.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('grade.invalid'));
                else
                    return true;
            }),
            body('educationInstitution').not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationInstitution.required', { value});
            })
            .isNumeric().withMessage((value, { req}) => {
                return req.__('educationInstitution.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationInstitution.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationInstitution.invalid'));
                else
                    return true;
            }),
            body('existItems').not().isEmpty().withMessage((value, { req}) => {
                return req.__('existItems.required', { value});
            })
            .custom(async (existItems, { req }) => {
                convertLang(req)
                for (let item of existItems) {
                    body('section_en').optional(),
                    body('section_ar').optional(),
                    body('type').optional().isIn(['STATIONERIES','HEALTH']).withMessage((value, { req}) => {
                        return req.__('wrong.type', { value});
                    }),
                    body('items').not().isEmpty().withMessage((val, { req}) => {
                        return req.__('items.required', { val});
                    })
                    .custom(async (items, { req }) => {
                        convertLang(req)
                        for (let item of items) {
                            body('product').not().isEmpty().withMessage((val, { req}) => {
                                return req.__('product.required', { val});
                            })
                            .isNumeric().withMessage((val, { req}) => {
                                return req.__('product.numeric', { val});
                            }).custom(async (val, { req }) => {
                                if (!await Product.findOne({_id:val,deleted:false}))
                                    throw new Error(req.__('product.invalid'));
                                else
                                    return true;
                            }),
                            body('size').not().isEmpty().withMessage((val, { req}) => {
                                return req.__('size.required', { val});
                            })
                            body('color').optional()
                            .isNumeric().withMessage((val, { req}) => {
                                return req.__('color.numeric', { val});
                            }).custom(async (val, { req }) => {
                                if (!await Color.findOne({_id:val,deleted:false}))
                                    throw new Error(req.__('color.invalid'));
                                else
                                    return true;
                            })
                            body('alternatives').trim().escape().optional()
                            .custom(async (alternatives, { req }) => {
                                convertLang(req)
                                for (let alternative of alternatives) {
                                    body('size').not().isEmpty().withMessage((v, { req}) => {
                                        return req.__('size.required', { v});
                                    })
                                    body('color').optional()
                                    .isNumeric().withMessage((v, { req}) => {
                                        return req.__('color.numeric', { v});
                                    }).custom(async (val, { req }) => {
                                        if (!await Color.findOne({_id:v,deleted:false}))
                                            throw new Error(req.__('color.invalid'));
                                        else
                                            return true;
                                    })
                                    body('count').not().isEmpty().withMessage((v) => {
                                        return req.__('count.required', { v});
                                    }).isLength({ max: 10 }).withMessage((v) => {
                                        return req.__('count.invalid', { v});
                                    })
                                    return true

                                }
                                return true;
                            }),
                            body('count').not().isEmpty().withMessage((val) => {
                                return req.__('count.required', { val});
                            }).isLength({ max: 10 }).withMessage((val) => {
                                return req.__('count.invalid', { val});
                            })
                            return true

                        }
                        return true;
                    })
                    return true

                }
                return true;
            }),
            body('missingItems').trim().escape().optional()
            .custom(async (missingItems, { req }) => {
                convertLang(req)
                for (let item of missingItems) {
                    body('name_en').not().isEmpty().withMessage((value) => {
                        return req.__('name_en.required', { value});
                    }),
                    body('name_ar').not().isEmpty().withMessage((value) => {
                        return req.__('name_ar.required', { value});
                    })
                    body('count').optional().isLength({ max: 10 }).withMessage((value) => {
                        return req.__('count.invalid', { value});
                    })
                    return true

                }
                return true;
            }),
            body('attachment').optional()
            
            
            
        ];
    
        return validations;
    },
    async uploadFile(req, res, next) {
        try {
            convertLang(req)
            let file 
            if (req.files) {
                if (req.files['file']) {
                    let imagesList = [];
                    for (let imges of req.files['file']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    file = imagesList[0];
                }
            }
            res.status(201).send({
                success:true,
                file:file
            });
        } catch (error) {
            next(error);
        }
    },
    async create(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            const validatedBody = checkValidations(req);
            if(validatedBody.existItems){
                let existItems = []
                await Promise.all(validatedBody.existItems.map(async(val) => {
                    //
                    await Promise.all(val.items.map(async(item) => {
                        console.log("theItem",item)
                        let alternatives = []
                        await Promise.all(item.alternatives.map(async(v) => {
                            let createdAlternative = await Alternative.create({...v})
                            alternatives.push(createdAlternative.id)
                        }));  
                        item.alternatives = alternatives
                    }))
                    console.log("items22",val.items)
                    
                    //
                    let createdSuppliesItem = await SuppliesItems.create({...val})
                    existItems.push(createdSuppliesItem.id)
                }));  
                
                validatedBody.existItems = existItems
            }

            console.log("data",validatedBody.existItems)
            let educationInstitution = await checkExistThenGet(validatedBody.educationInstitution, EducationInstitution)
            validatedBody.educationSystem = educationInstitution.educationSystem
            let createdsupplies = await Supplies.create({
                ...validatedBody,
            });

            
            let reports = {
                "action":"Create supplies",
                "type":"SUPPLIES",
                "deepId":createdsupplies.id,
                "user": req.user._id
            };
            await Report.create({...reports}); 
            await Supplies.findById(createdsupplies.id).populate(populateQuery).then(async (e) => {
                let index = await transformSupplies(e,lang)
                res.status(201).send({success: true,data:index});
            })
            
        } catch (err) {
            next(err);
        }
    },
    async createIndividual(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {individualSuppliesId} = req.params
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            const validatedBody = checkValidations(req);
            if(validatedBody.existItems){
                let existItems = []
                await Promise.all(validatedBody.existItems.map(async(val) => {
                    //
                    await Promise.all(val.items.map(async(item) => {
                        console.log("theItem",item)
                        let alternatives = []
                        await Promise.all(item.alternatives.map(async(v) => {
                            let createdAlternative = await Alternative.create({...v})
                            alternatives.push(createdAlternative.id)
                        }));  
                        item.alternatives = alternatives
                    }))
                    console.log("items22",val.items)
                    
                    //
                    let createdSuppliesItem = await SuppliesItems.create({...val})
                    existItems.push(createdSuppliesItem.id)
                }));  
                
                validatedBody.existItems = existItems
            }

            console.log("data",validatedBody.existItems)
            let educationInstitution = await checkExistThenGet(validatedBody.educationInstitution, EducationInstitution)
            validatedBody.educationSystem = educationInstitution.educationSystem
            validatedBody.type = 'INDIVIDUAL'
            
            let createdsupplies = await Supplies.create({
                ...validatedBody,
            });
            let individualSupplies = await checkExistThenGet(individualSuppliesId,IndividualSupplies)
            individualSupplies.status = 'WAITING-COMFIRMATION'
            individualSupplies.supplies = createdsupplies.id
            await individualSupplies.save();
            
            let reports = {
                "action":"Create Individual Supplies",
                "type":"SUPPLIES",
                "deepId":createdsupplies.id,
                "user": req.user._id
            };
            await Report.create({...reports}); 
            await Supplies.findById(createdsupplies.id).populate(populateQuery).then(async (e) => {
                let index = await transformSupplies(e,lang)
                res.status(201).send({success: true,data:index});
            })
            
        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { suppliesId } = req.params;

            await checkExist(suppliesId, Supplies,{ deleted: false });
            await Supplies.findById(suppliesId).populate(populateQuery).then(async (e) => {
                    let index = await transformSuppliesById(e,lang)
                    res.send({success: true,data:index});
                })
            
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {suppliesId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            await checkExist(suppliesId, Supplies,
                {deleted: false });

            
            const validatedBody = checkValidations(req);
            if(validatedBody.existItems){
                let existItems = []
                await Promise.all(validatedBody.existItems.map(async(val) => {
                    //
                    await Promise.all(val.items.map(async(item) => {
                        console.log("theItem",item)
                        let alternatives = []
                        await Promise.all(item.alternatives.map(async(v) => {
                            let createdAlternative = await Alternative.create({...v})
                            alternatives.push(createdAlternative.id)
                        }));  
                        item.alternatives = alternatives
                    }))
                    console.log("items22",val.items)
                    
                    //
                    let createdSuppliesItem = await SuppliesItems.create({...val})
                    existItems.push(createdSuppliesItem.id)
                }));  
                
                validatedBody.existItems = existItems
            }

            await Supplies.findByIdAndUpdate(suppliesId, {
                ...validatedBody,

            }, { new: true }).populate(populateQuery);
            let reports = {
                "action":"Update supplies",
                "type":"SUPPLIES",
                "deepId":suppliesId,
                "user": req.user._id
            };
            await Report.create({...reports});
            await Supplies.findById(suppliesId).populate(populateQuery).then(async (e) => {
                let index = await transformSupplies(e,lang)
                res.status(200).send({success: true,data:index});
            })
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let {suppliesId } = req.params;

            let supplies = await checkExistThenGet(suppliesId, Supplies,{deleted: false });
            let catres = await Cart.find({ supplies: suppliesId });
            if(catres){
                for (let cart of catres ) {
                    cart.deleted = true;
                    await cart.save();
                }
            }
            supplies.deleted = true
            await supplies.save();
            let reports = {
                "action":"Delete supplies",
                "type":"SUPPLIES",
                "deepId":supplies.id,
                "user": req.user._id
            };
            await Report.create({...reports, user: req.user._id });
            res.status(200).send({success: true});
        }
        catch (err) {
            next(err);
        }
    },
   
}