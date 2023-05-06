import ApiResponse from "../../helpers/ApiResponse";
import { checkExist, checkExistThenGet, isImgUrl,isInArray } from "../../helpers/CheckMethods";
import { handleImg, checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import Category from "../../models/category/category.model";
import subCategory from "../../models/category/sub-category.model";
import User from "../../models/user/user.model";
import Offer from "../../models/offer/offer.model";
import Report from "../../models/reports/report.model";
import i18n from "i18n";
import { transformCategory } from "../../models/category/transformCategory";

const populateQuery = [ 
    { path: 'child', model: 'category' },
];

export default {

    //find main category pagenation
    async findCategoryPagenation(req, res, next) {
        try {
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            { main,orderByPriority,type} = req.query;
            
            let query = { deleted: false, parent: { $exists: false }};
            if (main) query.main = main;
            if (type) query.type = type;
            let sortd = { createdAt: 1 }
            if(orderByPriority) sortd = { priority: 1 }
            await Category.find(query)
                .populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCategory(e,lang)
                        newdata.push(index);
                    }))
                    const count = await Category.countDocuments(query);
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
             //get lang
            let lang = i18n.getLocale(req)
            let { categoryId ,orderByPriority} = req.params,
                page = +req.query.page || 1,
                limit = +req.query.limit || 20;

            await checkExist(categoryId, Category);

            let query = { parent: categoryId, deleted: false };
            let sortd = { createdAt: 1 }
            if(orderByPriority){
                sortd = { priority: 1 }
            }
            await subCategory.find(query)
                .populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCategory(e,lang)
                        newdata.push(index);
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
    async findCategory(req, res, next) {
        try {         
             //get lang
            let lang = i18n.getLocale(req)   
            let {orderByPriority,main,type} = req.query
            let query = { deleted: false, parent: { $exists: false }};
            let sortd = { createdAt: 1 }
            if (orderByPriority) sortd = { priority: 1 }
            if (main) query.main = main;
            if (type) query.type = type;
            await Category.find(query)
                .populate(populateQuery)
                .sort(sortd)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCategory(e,lang)
                        newdata.push(index);
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
             //get lang
            let lang = i18n.getLocale(req)
            let {orderByPriority,ids} = req.query
            let { categoryId } = req.params;
            await checkExist(categoryId, Category);
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
            await subCategory.find(query).populate(populateQuery)
                .sort(sortd)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCategory(e,lang)
                        newdata.push(index);
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
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }).custom(async (val, { req }) => {
                    let query = { name_en: val, deleted: false };

                    if (isUpdate)
                        query._id = { $ne: req.params.categoryId };

                    let category = await Category.findOne(query).lean();
                    console.log(category)
                    if (category)
                        throw req.__('name_en.duplicated')

                    return true;
                }),
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }).custom(async (val, { req }) => {
                    let query = { name_en: val, deleted: false };

                    if (isUpdate)
                        query._id = { $ne: req.params.categoryId };

                    let category = await Category.findOne(query).lean();
                    if (category)
                        throw req.__('name_ar.duplicated')

                    return true;
                }),
            body('parent').optional(),
            body('details').optional(),
            body('main').optional(),
            body('priority').optional(),
            body('type').not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }).isIn(['PLACES','EDUCATION','PRODUCTS']).withMessage((value, { req}) => {
                return req.__('type.invalid', { value});
            }),
            body('educationType').optional()
            .isIn(['SCHOOL','UNIVERSITY','HIGH-ACADEMY','NURSERY','HIGH-CENTER','BASIC-CENTER','HIGH-TUTOR','BASIC-TUTOR','SERVICE-PROVIDER','INSTITUTE','BASIC-ACADEMY','HIGH','BASIC'])
            .withMessage((value, { req}) => {
                return req.__('educationType.invalid', { value});
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
    //create new record
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let model;
            if(validatedBody.main){
                validatedBody.main = true
            }
            //if parent exist use sub-category modal
            if (validatedBody.parent) {
                let parentCategory = await checkExistThenGet(validatedBody.parent, Category);
                parentCategory.hasChild = true;
                await parentCategory.save();
                model = subCategory;
            }
            else {
                model = Category;
            }
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img'});
                validatedBody.img = image;
            }
           

            let createdCategory = await model.create({ ...validatedBody});
            if(model == subCategory){
                let parentCategory = await checkExistThenGet(validatedBody.parent, Category);
                parentCategory.child.push(createdCategory._id);
                await parentCategory.save();
            }
            let reports = {
                "action":"Create New Category",
                "type":"CATEGORIES",
                "deepId":createdCategory.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:createdCategory
            });
        } catch (err) {
            next(err);
        }
    },
    async createMultiCategory(req, res, next) {
        try {
            let data = req.body.data
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                item.main = true
                await Category.create({ ...item });
                
            }
            res.status(201).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async createMultiSubCategory(req, res, next) {
        try {
            let data = req.body.data
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                let parentCategory = await checkExistThenGet(item.parent, Category);
                parentCategory.hasChild = true;

                let createdItem = await subCategory.create({ ...item });
                parentCategory.child.push(createdItem._id);
                await parentCategory.save();

                
            }
            res.status(201).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    //find by id
    async findById(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let { categoryId } = req.params;
            await checkExist(categoryId, Category, { deleted: false });
            await Category.findById(categoryId).populate(populateQuery)
            .then(async(e) => {
                let category = await transformCategory(e,lang)
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
            let { categoryId } = req.params, model;
            await checkExist(categoryId, Category, { deleted: false });

            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
            return next(new ApiError(403, i18n.__('admin.auth')));

            if (validatedBody.parent) {
                let parentCategory = await checkExistThenGet(validatedBody.parent, Category);
                parentCategory.hasChild = true;
                await parentCategory.save();
                model = subCategory;
            }
            else {
                model = Category;
            }

            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }

            let updatedCategory = await model.findByIdAndUpdate(categoryId, {
                ...validatedBody,
            }, { new: true });
            if(model == subCategory){
                let parentCategory = await checkExistThenGet(validatedBody.parent, Category);
                parentCategory.child.push(updatedCategory._id);
                await parentCategory.save();
            }
            let reports = {
                "action":"Update  Category",
                "type":"CATEGORIES",
                "deepId":updatedCategory.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success:true,
                data:updatedCategory
            });
        }
        catch (err) {
            next(err);
        }
    },
    //delete category
    async delete(req, res, next) {
        try {
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { categoryId } = req.params;

            let category = await checkExistThenGet(categoryId, Category, { deleted: false });
             /* delete category from her parent child array */
            if(typeof category.parent == 'number'){
                let parentCategory = await checkExistThenGet(category.parent, Category, { deleted: false });
                let arr = parentCategory.child;
                console.log(arr);
                for(let i = 0;i<= arr.length;i=i+1){
                    console.log(category.id);
                    if(arr[i] == category.id){
                        arr.splice(i, 1);
                    }
                }
                parentCategory.child = arr;
                await parentCategory.save();
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
            /* delete users under category */
            let users = await User.find({
                $or: [
                    {category : categoryId},
                    {subCategory : categoryId}, 
                ]  
            });
            for (let user of users ) {
                user.active = false;
                user.deleted = true;
                await user.save();
            }
             /* delete Offers under category */
             let offers = await Offer.find({
                $or: [
                    {category : categoryId},
                    {subCategory : categoryId}, 
                ]  
            });
            for (let offerId of offers ) {
                offerId.deleted = true;
                await offerId.save();
            }
            category.deleted = true;

            await category.save();
            let reports = {
                "action":"Delete  Category",
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