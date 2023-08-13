import Product from "../../models/product/product.model";
import ApiResponse from "../../helpers/ApiResponse";
import Category from "../../models/category/category.model";
import { checkValidations } from "../shared/shared.controller";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods";
import { body } from "express-validator";
import Report from "../../models/reports/report.model";
import { toImgUrl } from "../../utils";
import Cart from "../../models/cart/cart.model";
import i18n from "i18n";
import { transformProduct,transformProductById } from "../../models/product/transformProduct";
import Color from "../../models/color/color.model";
import Brand from "../../models/brand/brand.model"
const populateQuery = [
    { path: 'category', model: 'category' },
    { path: 'subCategory', model: 'category' },
    { path: 'brand', model: 'brand' },
    { path: 'colors', model: 'color' },
];

export default {
    async findAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            {sortBy,color,brand,related,id,subCategory,category,available,search,saleCount,priceFrom,priceTo} = req.query;
            let query = {deleted: false };
            if(priceTo && priceFrom) {
                query = {
                    $and: [
                        {price : {$gte : priceFrom , $lte : priceTo }},
                        {deleted: false } ,
                    ]
                };
            } 
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {description_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {description_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(available =="true") query.available = true;
            if(available =="false") query.available = false;
            if (category) {
                let values = category.split(",");
                console.log(values)
                query.category = {$in:values};
            };
            if (brand) {
                let values = brand.split(",");
                console.log(values)
                query.brand = {$in:values};
            }
            if (color) {
                let values = color.split(",");
                console.log(values)
                query.color = {$in:values};
            }
            if (subCategory) {
                let values = subCategory.split(",");
                console.log(values)
                query.subCategory = {$in:values};
            };
            if (related && id) query._id = {$ne:id};
            
            let sortd = {createdAt: -1}
            if (sortBy =="down") sortd = {price:-1};
            if (sortBy =="up") sortd = {price:1};
            if (saleCount =="down") sortd = {saleCount:-1};
            if (saleCount =="up") sortd = {saleCount:1};
            
            await Product.find(query).populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformProduct(e,lang)
                        newdata.push(index)
                    }))
                    const productsCount = await Product.countDocuments(query);
                    const pageCount = Math.ceil(productsCount / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, productsCount, req));
                })

            
        } catch (err) {
            next(err);
        }
    },
    async getAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let {sortBy,color,brand,related,id,subCategory,category,available,search,saleCount,priceFrom,priceTo} = req.query;
            let query = {deleted: false };
            if(priceTo && priceFrom) {
                query = {
                    $and: [
                        {price : {$gte : priceFrom , $lte : priceTo }},
                        {deleted: false } ,
                    ]
                };
            } 
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {name_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {description_ar: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {description_en: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(available =="true") query.available = true;
            if(available =="false") query.available = false;
            if (category) {
                let values = category.split(",");
                console.log(values)
                query.category = {$in:values};
            };
            if (color) {
                let values = color.split(",");
                console.log(values)
                query.color = {$in:values};
            };
            if (brand) {
                let values = brand.split(",");
                console.log(values)
                query.brand = {$in:values};
            }
            if (subCategory) {
                let values = subCategory.split(",");
                console.log(values)
                query.subCategory = {$in:values};
            };
            if (related && id) query._id = {$ne:id};
            
            let sortd = {createdAt: -1}
            if (sortBy =="down") sortd = {price:-1};
            if (sortBy =="up") sortd = {price:1};
            if (saleCount =="down") sortd = {saleCount:-1};
            if (saleCount =="up") sortd = {saleCount:1};
            
            await Product.find(query).populate(populateQuery)
                .sort(sortd).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformProduct(e,lang)
                        newdata.push(index);
                    }))
                    res.send({success:true,data:newdata});
                })

            
        } catch (err) {
            next(err);
        }
    }, 
    validateCreatedProduct(isUpdate = false) {
        
        let validations = [
            body('sku').optional(),
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('description_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description_ar.required', { value});
            }),
            body('description_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description_en.required', { value});
            }),
            body('brand').optional()
            .isNumeric().withMessage((value, { req}) => {
                return req.__('brand.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Brand.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('brand.invalid'));
                else
                    return true;
            }),
            body('colors').optional()
            .custom(async (colors, { req }) => {
                
                // check if it's duplicated color
                if(colors.some((val, i) => colors.indexOf(val) !== i))
                    throw new Error(i18n.__('color.duplicated'));

                for (let color of colors) {
                    if (!await Color.findOne({_id:color,deleted:false}))
                        throw new Error(req.__('color.invalid'));
                }
                return true;
            }),
            body('quantity').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('quantity.numeric', { value});
            }),
            body('category').not().isEmpty().withMessage((value, { req}) => {
                return req.__('category.required', { value});
            })
            .isNumeric().withMessage((value, { req}) => {
                return req.__('category.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('category.invalid'));
                else
                    return true;
            }),
            body('subCategory').optional()
            .isNumeric().withMessage((value, { req}) => {
                return req.__('subCategory.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('subCategory.invalid'));
                else
                    return true;
            }),
            body('sizes').optional()
            .custom(async (sizes, { req }) => {
                
                for (let size of sizes) {
                    body('name_en').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('name_en.required', { value});
                    }),
                    body('name_ar').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('name_ar.required', { value});
                    })
                    body('retailPrice').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('retailPrice.required', { value});
                    }).isLength({ max: 10 }).withMessage((value,{req}) => {
                        return req.__('retailPrice.invalid', { value});
                    }),
                    body('costPrice').not().isEmpty().withMessage((value,{req}) => {
                        return req.__('costPrice.required', { value});
                    }).isLength({ max: 10 }).withMessage((value,{req}) => {
                        return req.__('costPrice.invalid', { value});
                    }),
                    body('count').optional().isLength({ max: 10 }).withMessage((value,{req}) => {
                        return req.__('count.invalid', { value});
                    })
                    return true

                }
                return true;
            }),
            
            
            
        ];
    
        return validations;
    },
    async create(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            if (req.files) {
                if (req.files['img']) {
                    let imagesList = [];
                    for (let imges of req.files['img']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.img = imagesList;
                }
            }
            let sizes = [];
            await Promise.all(validatedBody.sizes.map(async(v,i) => {
                let size = {
                    "index": i,
                    "name_en":v.name_en,
                    "name_ar":v.name_ar,
                    "retailPrice":v.retailPrice,
                    "costPrice":v.costPrice,
                    //"count":v.count,
                }
                sizes.push(size)
            })); 
            validatedBody.sizes = sizes;
            let createdProduct = await Product.create({
                ...validatedBody,
            });
            
            let reports = {
                "action":"Create Product",
                "type":"PRODUCTS",
                "deepId":createdProduct.id,
                "user": req.user._id
            };
            await Report.create({...reports});
            
            await Product.findById(createdProduct.id).populate(populateQuery).then(async (e) => {
                let index = await transformProduct(e,lang)
                res.status(201).send({success: true,data:index});
            })
            
        } catch (err) {
            next(err);
        }
    },
    async createMulti(req, res, next) {        
        try { 
            let data = req.body.data
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                let sizes = [];
                await Promise.all(item.sizes.map(async(v,i) => {
                    let size = {
                        "index": i,
                        "name_en":v.name_en,
                        "name_ar":v.name_ar,
                        "retailPrice":v.retailPrice,
                        "costPrice":v.costPrice,
                        //"count":v.count,
                    }
                    sizes.push(size)
                })); 
                item.sizes = sizes;
                await Product.create({
                    ...item,
                });
            }
            
            
            res.status(201).send({success: true});
        
            
        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let { productId } = req.params;

            await checkExist(productId, Product,{ deleted: false });
            await Product.findById(productId).populate(populateQuery).then(async (e) => {
                    let index = await transformProductById(e,lang)
                    res.send({success: true,data:index});
                })
            
        } catch (err) {
            next(err);
        }
    },

    async active(req, res, next) {        
        try {
            let {productId} = req.params;
            let product = await checkExistThenGet(productId, Product,
                {deleted: false });
            product.visible = true;
            await product.save();
            let reports = {
                "action":"Active Product",
                "type":"PRODUCTS",
                "deepId":productId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({success: true});
            
        } catch (error) {
            next(error);
        }
    },

    async disactive(req, res, next) { 
        try {
            let {productId } = req.params;
            let product = await checkExistThenGet(productId, Product,
                {deleted: false });

            product.available = false;
            await product.save();
            let reports = {
                "action":"Dis-Active Product",
                "type":"PRODUCTS",
                "deepId":productId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({success: true});
        } catch (error) {
            next(error);
        }
    },
    
    async update(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let {productId } = req.params;
            await checkExist(productId, Product,
                {deleted: false });

            
            const validatedBody = checkValidations(req);
            if(validatedBody.quantity > 0) {
                validatedBody.available = true;
            }
            if (req.files) {
                if (req.files['img']) {
                    let imagesList = [];
                    for (let imges of req.files['img']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.img = imagesList;
                }
            }
            let sizes = [];
            await Promise.all(validatedBody.sizes.map(async(v,i) => {
                let size = {
                    "index": i,
                    "name_en":v.name_en,
                    "name_ar":v.name_ar,
                    "retailPrice":v.retailPrice,
                    "costPrice":v.costPrice,
                    //"count":v.count,
                }
                sizes.push(size)
            })); 
            validatedBody.sizes = sizes;
            await Product.findByIdAndUpdate(productId, {
                ...validatedBody,

            }, { new: true }).populate(populateQuery);
            let reports = {
                "action":"Update Product",
                "type":"PRODUCTS",
                "deepId":productId,
                "user": req.user._id
            };
            await Report.create({...reports});

            await Product.findById(productId).populate(populateQuery).then(async (e) => {
                let index = await transformProduct(e,lang)
                res.send({success: true,data:index});
            })
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {        
        try {
            let {productId } = req.params;

            let product = await checkExistThenGet(productId, Product,
                {deleted: false });
            let catres = await Cart.find({ product: productId });
            if(catres){
                for (let cart of catres ) {
                    cart.deleted = true;
                    await cart.save();
                }
            }
            product.deleted = true
            await product.save();
            let reports = {
                "action":"Delete Product",
                "type":"PRODUCTS",
                "deepId":product.id,
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