import ApiResponse from "../../helpers/ApiResponse";
import { checkExist, checkExistThenGet, isImgUrl,isInArray } from "../../helpers/CheckMethods";
import { handleImg, checkValidations ,convertLang} from "../shared/shared.controller";
import { body } from "express-validator/check";
import category from "../../models/category/category.model";
import subCategory from "../../models/category/sub-category.model";
import Report from "../../models/reports/report.model";
import i18n from "i18n";

const populateQuery = [ 
    { path: 'child', model: 'category' },
];

export default {

    //find main category pagenation
    async findcategoryPagenation(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            { main,orderByPriority,} = req.query;
            
            let query = { deleted: false, parent: { $exists: false }};
            if (main)
                query.main = main;
            let sortd = { createdAt: 1 }
            if(orderByPriority){
                sortd = { priority: 1 }
            }
           
            await category.find(query)
                .populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let childs = []
                        await Promise.all(e.child.map((e)=>{
                            childs.push({
                                name:lang=="ar"?e.name_ar:e.name_en,
                                name_en:e.name_en,
                                name_ar:e.name_ar,
                                img:e.img,
                                parent:e.parent,
                                hasChild:e.hasChild,
                                id: e._id,
                                createdAt: e.createdAt,
                            });
                        }))
                        newdata.push({
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_en:e.name_en,
                            name_ar:e.name_ar,
                            img:e.img,
                            hasChild:e.hasChild,
                            child:childs,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    }))
                    const count = await category.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
           
        } catch (err) {
            next(err);
        }
    },
    //get subCategory under category with pagenation
    async findsubCategoryPagenation(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { categoryId ,orderByPriority} = req.params,
                page = +req.query.page || 1,
                limit = +req.query.limit || 20;

            await checkExist(categoryId, category);

            let query = { parent: categoryId, deleted: false };
            let sortd = { createdAt: 1 }
            if(orderByPriority){
                sortd = { priority: 1 }
            }
            await subCategory.find(query)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        newdata.push({
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_en:e.name_en,
                            name_ar:e.name_ar,
                            img:e.img,
                            hasChild:e.hasChild,
                            parent:e.parent,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    }))
                    const count = await subCategory.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })

        } catch (error) {
            next(error);
        }
    },
    //get main categories without pagenation
    async findcategory(req, res, next) {
        try {         
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)   
            let {orderByPriority,main} = req.query
            let query = { deleted: false, parent: { $exists: false }};
            let sortd = { createdAt: 1 }
            if(orderByPriority){
                sortd = { priority: 1 }
            }
            if (main)
                query.main = main;
            await category.find(query)
                .populate(populateQuery)
                .sort(sortd)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let childs = []
                        await Promise.all(e.child.map((e)=>{
                            childs.push({
                                name:lang=="ar"?e.name_ar:e.name_en,
                                name_en:e.name_en,
                                name_ar:e.name_ar,
                                img:e.img,
                                parent:e.parent,
                                hasChild:e.hasChild,
                                id: e._id,
                                createdAt: e.createdAt,
                            });
                        }))
                        newdata.push({
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_en:e.name_en,
                            name_ar:e.name_ar,
                            img:e.img,
                            hasChild:e.hasChild,
                            child:childs,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
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
    //get subCategories under category without pagenation
    async findsubCategory(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let {orderByPriority,ids} = req.query
            let { categoryId } = req.params;
            await checkExist(categoryId, category);
            let query = { parent: categoryId, deleted: false};
            if(ids){
                let values = ids.split(",");
                console.log(values)
                query.parent = {$in:values};
            }
            let sortd = { createdAt: 1 }
            if(orderByPriority){
                sortd = { priority: 1 }
            }
            await subCategory.find(query)
                .sort(sortd)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        newdata.push({
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_en:e.name_en,
                            name_ar:e.name_ar,
                            img:e.img,
                            hasChild:e.hasChild,
                            parent:e.parent,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    }))
                    res.send({
                        success:true,
                        data:newdata
                    });
                })

        } catch (error) {
            next(error);
        }
    },
    validateBody(isUpdate = false) {
        let validations = [
            body('name_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }).custom(async (val, { req }) => {
                    let query = { name_en: val, deleted: false };

                    if (isUpdate)
                        query._id = { $ne: req.params.categoryId };

                    let category = await category.findOne(query).lean();
                    console.log(category)
                    if (category)
                        throw req.__('name_en.duplicated')

                    return true;
                }),
            body('name_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }).custom(async (val, { req }) => {
                    let query = { name_en: val, deleted: false };

                    if (isUpdate)
                        query._id = { $ne: req.params.categoryId };

                    let category = await category.findOne(query).lean();
                    if (category)
                        throw req.__('name_ar.duplicated')

                    return true;
                }),
            body('parent').trim().escape().optional(),
            body('main').trim().escape().optional(),
            
        ];
        if (isUpdate)
            validations.push([
                body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req}) => {
                    return req.__('img.syntax', { value});
                })
            ]);

        return validations;
    },
    //create new record
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let model;
            if(validatedBody.main){
                validatedBody.main = true
            }
            //if parent exist use sub-category modal
            if (validatedBody.parent) {
                let parentcategory = await checkExistThenGet(validatedBody.parent, category);
                parentcategory.hasChild = true;
                await parentcategory.save();
                model = subCategory;
            }
            else {
                model = category;
            }
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img'});
                validatedBody.img = image;
            }
           

            let createdcategory = await model.create({ ...validatedBody});
            if(model == subCategory){
                let parentcategory = await checkExistThenGet(validatedBody.parent, category);
                parentcategory.child.push(createdcategory._id);
                await parentcategory.save();
            }
            let reports = {
                "action":"Create New category",
                "type":"CATEGORIES",
                "deepId":createdcategory.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:createdcategory
            });
        } catch (err) {
            next(err);
        }
    },

    //find by id
    async findById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { categoryId } = req.params;
            await checkExist(categoryId, category, { deleted: false });
            await category.findById(categoryId).populate(populateQuery)
            .then( e => {
                let category = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_en:e.name_en,
                    name_ar:e.name_ar,
                    img:e.img,
                    hasChild:e.hasChild,
                    parent:e.parent,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:category,
                });
                
            })
        } catch (err) {
            next(err);
        }
    },
    //update category
    async update(req, res, next) {

        try {
            convertLang(req)
            let { categoryId } = req.params, model;
            await checkExist(categoryId, category, { deleted: false });

            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
            return next(new ApiError(403, i18n.__('admin.auth')));

            if (validatedBody.parent) {
                let parentcategory = await checkExistThenGet(validatedBody.parent, category);
                parentcategory.hasChild = true;
                await parentcategory.save();
                model = subCategory;
            }
            else {
                model = category;
            }

            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }

            let updatedcategory = await model.findByIdAndUpdate(categoryId, {
                ...validatedBody,
            }, { new: true });
            if(model == subCategory){
                let parentcategory = await checkExistThenGet(validatedBody.parent, category);
                parentcategory.child.push(updatedcategory._id);
                await parentcategory.save();
            }
            let reports = {
                "action":"Update  category",
                "type":"CATEGORIES",
                "deepId":updatedcategory.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success:true,
                data:updatedcategory
            });
        }
        catch (err) {
            next(err);
        }
    },
    //delete category
    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { categoryId } = req.params;

            let category = await checkExistThenGet(categoryId, category, { deleted: false });
             /* delete category from her parent child array */
            if(typeof category.parent == 'number'){
                let parentcategory = await checkExistThenGet(category.parent, category, { deleted: false });
                let arr = parentcategory.child;
                console.log(arr);
                for(let i = 0;i<= arr.length;i=i+1){
                    console.log(category.id);
                    if(arr[i] == category.id){
                        arr.splice(i, 1);
                    }
                }
                parentcategory.child = arr;
                await parentcategory.save();
            }
            /* delete all category children */
            if(category.hasChild == true){
                let childs = await subCategory.find({parent : categoryId });
                for (let child of childs ) {
                    console.log(child)
                    child.deleted = true;
                    await child.save();
                }
            }
            category.deleted = true;

            await category.save();
            let reports = {
                "action":"Delete  category",
                "type":"CATEGORIES",
                "deepId":categoryId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success:true});

        }
        catch (err) {
            next(err);
        }
    },

};