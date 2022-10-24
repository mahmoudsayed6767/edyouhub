import ApiResponse from "../../helpers/ApiResponse";
import Branch from "../../models/branch/branch.model";
import Place from "../../models/place/place.model";

import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet,isInArray ,isLat,isLng} from "../../helpers/CheckMethods";
import { handleImg, checkValidations,convertLang } from "../shared/shared.controller";
import { body } from "express-validator/check";
import i18n from "i18n";
import { ValidationError } from "mongoose";

//validate location
function validatedLocation(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lng.validate") });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lat.validate") });
}
const populateQuery = [
    { path: 'country', model: 'country'},
    { path: 'city', model: 'city'},
    { path: 'area', model: 'area'},
];
export default {

    async findAll(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req) 
            let {placeId} = req.params
            let query = {deleted: false,place:placeId };
            await Branch.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                data.map(async(e) =>{
                    let index ={
                        address:lang=="ar"?e.address_ar:e.address_en,
                        address_ar:e.address_ar,
                        address_en:e.address_en,
                        location:e.location,
                        place: e.place,
                        img:e.img,
                        phone: e.phone,
                        id: e._id,
                        createdAt: e.createdAt,
                    }
                    if(e.country){
                        index.country = {
                            name:lang=="ar"?e.country.name_ar:e.country.name_en,
                            id:e.country._id
                        }
                    }
                    if(e.city){
                        index.city = {
                            name:lang=="ar"?e.city.name_ar:e.city.name_en,
                            id:e.city._id
                        }
                    }
                    if(e.area){
                        index.area = {
                            name:lang=="ar"?e.area.name_ar:e.area.name_en,
                            id:e.area._id
                        }
                    }
                    newdata.push(index)
                })
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
            convertLang(req)
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {placeId} = req.params
            let query = {deleted: false,place:placeId };
            await Branch.find(query).populate(populateQuery)
            .then( async(data) => {
                var newdata = [];
                await Promise.all(data.map(async(e) =>{
                    let index ={
                        address:lang=="ar"?e.address_ar:e.address_en,
                        address_ar:e.address_ar,
                        address_en:e.address_en,
                        location:e.location,
                        place: e.place,
                        img:e.img,
                        phone: e.phone,
                        id: e._id,
                        createdAt: e.createdAt,
                    }
                    if(e.country){
                        index.country = {
                            name:lang=="ar"?e.country.name_ar:e.country.name_en,
                            id:e.country._id
                        }
                    }
                    if(e.city){
                        index.city = {
                            name:lang=="ar"?e.city.name_ar:e.city.name_en,
                            id:e.city._id
                        }
                    }
                    if(e.area){
                        index.area = {
                            name:lang=="ar"?e.area.name_ar:e.area.name_en,
                            id:e.area._id
                        }
                    }
                    newdata.push(index)
                }))
                const count = await Branch.countDocuments(query);
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
            convertLang(req)
            let lang = i18n.getLocale(req)          
            let { branchId } = req.params;
            await checkExist(branchId, Branch, { deleted: false });

            await Branch.findById(branchId).populate(populateQuery).then(async(e) => {
                let index ={
                    address:lang=="ar"?e.address_ar:e.address_en,
                    address_ar:e.address_ar,
                    address_en:e.address_en,
                    location:e.location,
                    place: e.place,
                    img:e.img,
                    phone: e.phone,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                if(e.country){
                    index.country = {
                        name:lang=="ar"?e.country.name_ar:e.country.name_en,
                        id:e.country._id
                    }
                }
                if(e.city){
                    index.city = {
                        name:lang=="ar"?e.city.name_ar:e.city.name_en,
                        id:e.city._id
                    }
                }
                if(e.area){
                    index.area = {
                        name:lang=="ar"?e.area.name_ar:e.area.name_en,
                        id:e.area._id
                    }
                }
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
            body('address_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('address_ar.required', { value});
            }),
            body('address_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
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
            
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            })
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value))
                    throw new Error(req.__('phone.syntax'));
                else
                    return true;
            }),
            body('location').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('location.required', { value});
            }),
        ];
        return validations;
    },

    async create(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let {placeId} = req.params
            const validatedBody = checkValidations(req);
            validatedBody.place = placeId
            console.log(validatedBody)
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            //upload img
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            let thebranch = await Branch.create({ ...validatedBody});
            let thePlace = await checkExistThenGet(placeId,Place,{deleted: false})
            thePlace.branches.push(thebranch._id);
            ///add city place cities
            let arr = thePlace.city;
            var found = arr.find(e => e == validatedBody.city)
            if(!found){
                thePlace.city.push(validatedBody.city);
            }
            ///add area place areas
            let arr2 = thePlace.area;
            var found2 = arr2.find(e => e == validatedBody.area)
            if(!found2){
                thePlace.area.push(validatedBody.area);
            }
            await thePlace.save();
            let reports = {
                "action":"Create branch Us",
                "type":"BRANCH",
                "deepId":thebranch.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({success:true,data:thebranch});
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {

        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));

                
            let { branchId } = req.params;
            let theBranch = await checkExistThenGet(branchId, Branch, { deleted: false });
            if(req.user.type == "PLACE" && theBranch.place != req.user.place) 
                 return next(new ApiError(403, i18n.__('admin.auth')));
                 
            const validatedBody = checkValidations(req);
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            let branch = await Branch.findByIdAndUpdate(branchId, {
                ...validatedBody,
            }, { new: true });
            let thePlace = await checkExistThenGet(branch.place,Place,{deleted: false})
            ///add city place cities
            let arr = thePlace.city;
            var found = arr.find(e => e == validatedBody.city)
            if(!found){
                thePlace.city.push(validatedBody.city);
            }
            ///add area place areas
            let arr2 = thePlace.area;
            var found2 = arr2.find(e => e == validatedBody.area)
            if(!found2){
                thePlace.area.push(validatedBody.area);
            }
            await thePlace.save();
            let reports = {
                "action":"Update branch Us",
                "type":"BRANCH",
                "deepId":branchId,
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
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
                
            let { branchId } = req.params;
            let branch = await checkExistThenGet(branchId, Branch, { deleted: false });
            if(req.user.type == "PLACE" && branch.place != req.user.place) 
                 return next(new ApiError(403, i18n.__('admin.auth')));
            branch.deleted = true;
            await branch.save();
            let thePlace = await checkExistThenGet(branch.place,Place,{deleted: false})
            let arr = thePlace.branches;
            console.log("before",arr);
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == branchId){
                    arr.splice(i, 1);
                }
            }
            thePlace.branches = arr;
            //remove branch city from the place cities
            let arr1 = thePlace.city;
            for(let i = 0;i<= arr1.length;i=i+1){
                if(arr1[i] == branch.city){
                    arr1.splice(i, 1);
                }
            }
            thePlace.city = arr1;
            //remove branch area from the place areas
            let arr2 = thePlace.area;
            for(let i = 0;i<= arr2.length;i=i+1){
                if(arr2[i] == branch.area){
                    arr2.splice(i, 1);
                }
            }
            thePlace.area = arr2;
            await thePlace.save();
            let reports = {
                "action":"Delete branch Us",
                "type":"BRANCH",
                "deepId":branchId,
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