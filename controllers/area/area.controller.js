import Area from "../../models/area/area.model";
import City from "../../models/city/city.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator/check";
import { checkValidations,convertLang } from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist ,checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";

export default {
    //body validate
    validateAreaBody() {
        return [
            body('name_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('name_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('delivaryCost').not().isEmpty().withMessage((value, { req}) => {
                return req.__('delivaryCost.required', { value});
            }),
            
        ];
    },
    //create new record
    async create(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { cityId } = req.params;
            await checkExist(cityId, City);
             if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            
            validatedBody.city = cityId;
            let theCity = await checkExistThenGet(validatedBody.city,City,{ deleted: false })
            validatedBody.country = theCity.country
            let area = await Area.create({ ...validatedBody });
            let reports = {
                "action":"Create New Area",
                "type":"AREAS",
                "deepId":area.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Area.findById(area.id).then( e => {
                let area = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    delivaryCost:e.delivaryCost,
                    city:e.city,
                    country:e.country,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.status(201).send({
                    success:true,
                    data:area,
                });
                
            })
        } catch (error) {
            next(error);
        }
    },
    async createMulti(req, res, next) {
        try {
            convertLang(req)
            let data = req.body.data
            console.log("ggg")
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                await Area.create({ ...item });
                
            }
            res.status(201).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async getById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
               return next(new ApiError(403, i18n.__('admin.auth')));            
            let { areaId } = req.params;
            await checkExist(areaId, Area, { deleted: false });

            await Area.findById(areaId).then( e => {
                let area = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    delivaryCost:e.delivaryCost,
                    city:e.city,
                    country:e.country,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:area,
                });
                
            })
        } catch (error) {
            next(error);

        }
    },
    //update record
    async update(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { areaId } = req.params;
            await checkExist(areaId,Area, { deleted: false })
            //check on user type
             if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            let theCity = await checkExistThenGet(validatedBody.city,City,{ deleted: false })
            validatedBody.country = theCity.country
            await Area.findByIdAndUpdate(areaId, { ...validatedBody });

            let reports = {
                "action":"Update Area",
                "type":"AREAS",
                "deepId":areaId,
                "user": req.user._id
            };
            await Report.create({...reports });
            await Area.findById(areaId).then( e => {
                let area = {
                    name:lang=="ar"?e.name_ar:e.name_en,
                    name_ar:e.name_ar,
                    name_en:e.name_en,
                    delivaryCost:e.delivaryCost,
                    city:e.city,
                    country: e.country,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({
                    success:true,
                    data:area,
                });
                
            })
        } catch (error) {
            next(error);
        }
    },
    //get without pagenation
    async getAll(req, res, next) {
        try {
            convertLang(req)
            let{name} = req.query
             //get lang
            let lang = i18n.getLocale(req)
            let { cityId } = req.params;
            await checkExist(cityId, City, { deleted: false });
            let query = { 'city': cityId, deleted: false }
            /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                        {city: cityId},
                    ]
                };
            }
            console.log(query)
            await Area.find(query)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        newdata.push({
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_ar:e.name_ar,
                            name_en:e.name_en,
                            delivaryCost:e.delivaryCost,
                            country:e.country,
                            city:e.city,
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
    //get with pagenation
    async getAllPaginated(req, res, next) {
        try {
            convertLang(req)
            //get lang
            let lang = i18n.getLocale(req)
            let { cityId } = req.params;
            let {name} = req.query
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { 'city': cityId, deleted: false }
            /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                        {city: cityId},
                    ]
                };
            }
            await Area.find(query)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        newdata.push({
                            name:lang=="ar"?e.name_ar:e.name_en,
                            name_en:e.name_en,
                            delivaryCost:e.delivaryCost,
                            country:e.country,
                            name_ar:e.name_ar,
                            city:e.city,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    }))
                    const count = await Area.countDocuments({ 'city': cityId, deleted: false });
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },
    //delete record
    async delete(req, res, next) {
        try {
            convertLang(req)
            let { areaId } = req.params;
             if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
               return next(new ApiError(403, i18n.__('admin.auth')));
            let area = await checkExistThenGet(areaId, Area);
            
            area.deleted = true;
            await area.save();
            let reports = {
                "action":"Delete Area",
                "type":"AREAS",
                "deepId":areaId,
                "user": req.user._id
            };
            await Report.create({...reports });
            return res.send({
                success:true,
            });

        } catch (err) {
            next(err);
        }
    },


}