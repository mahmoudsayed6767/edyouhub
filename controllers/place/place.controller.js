import ApiResponse from "../../helpers/ApiResponse";
import Place from "../../models/place/place.model";
import User from "../../models/user/user.model";
import Notif from "../../models/notif/notif.model";
import Offer from "../../models/offer/offer.model";
import Bill from "../../models/bill/bill.model";
import Category from "../../models/category/category.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isLat,isLng} from "../../helpers/CheckMethods";
import { checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import { toImgUrl } from "../../utils";
import {transformPlace,transformPlaceById} from "../../models/place/transformPlace"
import Branch from "../../models/branch/branch.model";
import { ValidationError } from "mongoose";

const populateQuery = [
    { path: 'owner', model: 'user'},
];
const populateQueryById = [
    { path: 'categories', model: 'category'},
    { path: 'subCategories', model: 'category'},
    { path: 'owner', model: 'user'},
    {
        path: 'branches', model: 'branch',
        populate: { path: 'country', model: 'country' },
    },
    {
        path: 'branches', model: 'branch',
        populate: { path: 'city', model: 'city' },
    },
    {
        path: 'branches', model: 'branch',
        populate: { path: 'area', model: 'area' },
    },
];
//validate location
function validatedLocation(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lng.validate") });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lat.validate") });
}
export default {

    async findAll(req, res, next) {        
        try {
            let lang = i18n.getLocale(req) 
            let {search,category,subCategory} = req.query
            let query = {deleted: false};
            
            if (category) {
                let values = category.split(",");
                console.log(values)
                query.categories = {$in:values};
            };
            if (subCategory) {
                let values = subCategory.split(",");
                console.log(values)
                query.subCategories = {$in:values};
            };
            if(search) {
                Object.assign(query ,{
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                })
            }
            let sortd = {createdAt: -1}
            await Place.find(query)
            .populate(populateQuery)
            .sort(sortd)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformPlace(e,lang)
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
            let {search,userId,category,subCategory} = req.query
            let query = {deleted: false};
            
            if (category) {
                let values = category.split(",");
                console.log(values)
                query.categories = {$in:values};
            };
            if (subCategory) {
                let values = subCategory.split(",");
                console.log(values)
                query.subCategories = {$in:values};
            };
            if(search) {
                Object.assign(query ,{
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                })
            }
            let sortd = {createdAt: -1}
            await Place.find(query)
            .populate(populateQuery)
            .sort(sortd)
            .limit(limit)
            .skip((page - 1) * limit)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index = await transformPlace(e,lang)
                    newdata.push(index)
                }))
                const placesCount = await Place.countDocuments(query);
                const pageCount = Math.ceil(placesCount / limit);
                res.send(new ApiResponse(newdata, page, pageCount, limit, placesCount, req));
            })

        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {        
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let {userId} = req.query
            let { placeId } = req.params;
            await checkExist(placeId, Place, { deleted: false });
            let myUser
            if(userId){
                myUser= await checkExistThenGet(userId, User)
            }
            await Place.findById(placeId).populate(populateQueryById).then(async(e) => {
                let place = await transformPlaceById(e,lang,myUser,userId)
                res.send({
                    success:true,
                    data:place
                });
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
            body('categories').not().isEmpty().withMessage((value, { req}) => {
                return req.__('categories.required', { value});
            }).custom(async (categories, { req }) => {
                //category is duplicated
                if(categories.some((val, i) => categories.indexOf(val) !== i))
                    throw new Error(i18n.__('category.duplicated'));
                for (let category of categories) {
                    await checkExistThenGet(category, Category);
                    
                }
                return true;
            }),
            body('subCategories').not().isEmpty().withMessage((value, { req}) => {
                return req.__('subCategories.required', { value});
            }).custom(async (categories, { req }) => {
                if(categories.some((val, i) => categories.indexOf(val) !== i))
                    throw new Error(i18n.__('subCategory.duplicated'));
                for (let category of categories) {
                    await checkExistThenGet(category, Category);
                    
                }
                return true;
            }),

           
        ];
        if(!isUpdate){
            validations.push([
                body('fullname').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('fullname.required', { value});
                }),
                body('phone').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('phone.required', { value});
                })
                .custom(async (value, { req }) => {
                    var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                    if(!exp.test(value)){
                        throw new Error(req.__('phone.syntax'));
                    }
                    let userQuery = { phone: value,deleted:false,accountType:'ACTIVE' };
                    if (isUpdate && req.user.phone === value)
                        userQuery._id = { $ne: req.user._id };
    
                    if (await User.findOne(userQuery))
                        throw new Error(req.__('phone.duplicated'));
                    else
                        return true;
                }),
                body('password').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('password.required', { value});
                }).isLength({ min: 8 }).withMessage((value, { req}) => {
                    return req.__('password.invalid', { value});
                }).custom(async (value, { req }) => {
                    var exp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
                    if(!exp.test(value)){
                        throw new Error(req.__('password.invalid'));
                    }
                    else
                        return true;
                    
                }),

                /////////////////////////////add branch///////////////////////////////
                body('address_ar').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('address_ar.required', { value});
                }),
                body('address_en').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('address_en.required', { value});
                }),
                body('country').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('country.required', { value});
                }),
                body('city').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('city.required', { value});
                }),
                body('area').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('area.required', { value});
                }),
                
                body('branchPhone').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('branchPhone.required', { value});
                })
                .custom(async (value, { req }) => {
                    var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                    if(!exp.test(value))
                        throw new Error(req.__('branchPhone.syntax'));
                    else
                        return true;
                }),
                body('location').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('location.required', { value});
                }),
                
            ])
        }
        return validations;
    },

    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            
            if (req.files) {
                if (req.files['logo']) {
                    let imagesList = [];
                    for (let imges of req.files['logo']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.logo = imagesList[0];
                }else{
                    return next(new ApiError(500, i18n.__('logo.required')));
                }
                if (req.files['cover']) {
                    let imagesList = [];
                    for (let imges of req.files['cover']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.cover = imagesList[0];
                }else{
                    return next(new ApiError(500, i18n.__('cover.required')));
                }
            }else{
                return next(new ApiError(500, i18n.__('imgs.required')))
            }
            let theOwner = await User.create({
                fullname:validatedBody.fullname,
                type:'PLACE',
                accountType :'ACTIVE',
                phoneVerify:true,
                phone:validatedBody.phone,
                country:validatedBody.country,
                city:validatedBody.city,
                area:validatedBody.area,
                password:validatedBody.password
            })
            validatedBody.owner = theOwner._id
            
            let thePlace = await Place.create({ ...validatedBody});
            ///
            let theBranch = await Branch.create({
                city:validatedBody.city,
                area:validatedBody.area,
                country:validatedBody.country,
                address_ar:validatedBody.address_ar,
                address_en:validatedBody.address_en,
                phone:validatedBody.branchPhone,
                place:thePlace.id,
                location:validatedBody.location,

            });
            //// 
            thePlace.branches = theBranch.id;
            await thePlace.save();
            theOwner.place = thePlace._id
            await theOwner.save();
            let reports = {
                "action":"Create place",
                "type":"PLACES",
                "deepId":thePlace.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true,data:thePlace});
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {        
        try {
            let { placeId } = req.params;
            await checkExist(placeId, Place, { deleted: false });
            const validatedBody = checkValidations(req);
            if (req.files) {
                if (req.files['logo']) {
                    let imagesList = [];
                    for (let imges of req.files['logo']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.logo = imagesList[0];
                }
                if (req.files['cover']) {
                    let imagesList = [];
                    for (let imges of req.files['cover']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.cover = imagesList[0];
                }
            }
            await Place.findByIdAndUpdate(placeId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update place",
                "type":"PLACES",
                "deepId":placeId,
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
            let { placeId } = req.params;
            let place = await checkExistThenGet(placeId, Place, { deleted: false });
            place.deleted = true;
            let offers = await Offer.find({ place: placeId });
            for (let id of offers) {
                id.deleted = true;
                await id.save();
            }
            let branches = await Branch.find({ place: placeId });
            for (let id of branches) {
                id.deleted = true;
                await id.save();
            }
            let users = await User.find({ place: placeId });
            for (let id of users) {
                id.deleted = true;
                await id.save();
            }
            let bills = await Bill.find({ place: placeId });
            for (let id of bills) {
                id.deleted = true;
                await id.save();
            }
            let notifs = await Notif.find({  $or: [
                {target: placeId }, 
                {resource: placeId }, 
              ] 
            });
            for (let id of notifs) {
                id.deleted = true;
                await id.save();
            } 
            await place.save();
            
            let reports = {
                "action":"Delete place",
                "type":"PLACES",
                "deepId":placeId,
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