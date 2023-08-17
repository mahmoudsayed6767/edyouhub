import ApiResponse from "../../helpers/ApiResponse";
import Branch from "../../models/branch/branch.model";
import Place from "../../models/place/place.model";
import Business from "../../models/business/business.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { checkExist, checkExistThenGet, isInArray, isLat, isLng } from "../../helpers/CheckMethods";
import { handleImg, checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import i18n from "i18n";
import { ValidationError } from "mongoose";
import { transformBranch } from "../../models/branch/transformBranch";

//validate location
function validatedLocation(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lng.validate") });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lat.validate") });
}
const populateQuery = [
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
];
export default {

    async findAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let { id } = req.params;
            let { type } = req.query
            let query = { deleted: false };
            if (type == "BUSINESS") {
                query.business = id
            } else {
                query.place = id
            }
            await Branch.find(query).populate(populateQuery)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformBranch(e, lang)
                        newdata.push(index)
                    }))
                    res.send({
                        success: true,
                        data: newdata
                    });
                })

        } catch (err) {
            next(err);
        }
    },
    async findAllPagenation(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let { id } = req.params;
            let { type } = req.query
            let query = { deleted: false };
            if (type == "BUSINESS") {
                query.business = id
            } else {
                query.place = id
            }
            await Branch.find(query).populate(populateQuery)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformBranch(e, lang)
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
            let lang = i18n.getLocale(req)
            let { branchId } = req.params;
            await checkExist(branchId, Branch, { deleted: false });

            await Branch.findById(branchId).populate(populateQuery)
                .then(async(e) => {
                    let index = await transformBranch(e, lang)
                    return res.send({
                        success: true,
                        data: index,
                    });

                })
        } catch (error) {
            next(error);

        }
    },

    validateBody(isUpdate = false) {
        let validations = [
            body('address_ar').not().isEmpty().withMessage((value, { req }) => {
                return req.__('address_ar.required', { value });
            }),
            body('address_en').not().isEmpty().withMessage((value, { req }) => {
                return req.__('address_en.required', { value });
            }),
            body('country').not().isEmpty().withMessage((value, { req }) => {
                return req.__('country.required', { value });
            }),
            body('city').not().isEmpty().withMessage((value, { req }) => {
                return req.__('city.required', { value });
            }),
            body('area').not().isEmpty().withMessage((value, { req }) => {
                return req.__('area.required', { value });
            }),

            body('phone').not().isEmpty().withMessage((value, { req }) => {
                return req.__('phone.required', { value });
            })
            .custom(async(value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if (!exp.test(value))
                    throw new Error(req.__('phone.syntax'));
                else
                    return true;
            }),
            body('location').not().isEmpty().withMessage((value, { req }) => {
                return req.__('location.required', { value });
            }),
            body('type').optional().isIn(['BUSINESS', 'PLACE']).withMessage((value, { req }) => {
                return req.__('type.invalid', { value });
            }),
        ];
        return validations;
    },

    async create(req, res, next) {
        try {
            let { id } = req.params
            const validatedBody = checkValidations(req);
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            //upload img
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            let model = Place
            if (validatedBody.type == "BUSINESS") {
                validatedBody.business = id

                model = Business
            } else {
                validatedBody.place = id
            }


            let thebranch = await Branch.create({...validatedBody });
            let branchOwner = await checkExistThenGet(id, model, { deleted: false })
            branchOwner.branches.push(thebranch._id);
            ///add city business cities
            let arr = branchOwner.cities;
            var found = arr.find(e => e == validatedBody.city)
            if (!found) {
                branchOwner.cities.push(validatedBody.city);
            }
            ///add area place areas
            let arr2 = branchOwner.areas;
            var found2 = arr2.find(e => e == validatedBody.area)
            if (!found2) {
                branchOwner.areas.push(validatedBody.area);
            }
            await branchOwner.save();
            let reports = {
                "action": "Create branch",
                "type": "BRANCH",
                "deepId": thebranch.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({ success: true, data: thebranch });
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            if (!isInArray(["ADMIN", "SUB-ADMIN", "PLACE", "USER"], req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));


            let { branchId } = req.params;
            await checkExist(branchId, Branch, { deleted: false });

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
            let model = Place
            let id = branch.place
            if (branch.type == "BUSINESS") {
                model = Business
                id = branch.business
            }
            let theOwner = await checkExistThenGet(id, model, { deleted: false })
                ///add city place cities
            let arr = theOwner.cities;
            var found = arr.find(e => e == validatedBody.city)
            if (!found) {
                theOwner.cities.push(validatedBody.city);
            }
            ///add area place areas
            let arr2 = theOwner.areas;
            var found2 = arr2.find(e => e == validatedBody.area)
            if (!found2) {
                theOwner.areas.push(validatedBody.area);
            }
            await theOwner.save();
            let reports = {
                "action": "Update branch",
                "type": "BRANCH",
                "deepId": branchId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({ success: true });
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { branchId } = req.params;
            let branch = await checkExistThenGet(branchId, Branch, { deleted: false });
            branch.deleted = true;

            let model = Place
            let id = branch.place
            if (branch.type == "BUSINESS") {
                model = Business
                id = branch.business
            }
            let theOwner = await checkExistThenGet(id, model, { deleted: false })
            let arr = theOwner.branches;
            for (let i = 0; i <= arr.length; i = i + 1) {
                if (arr[i] == branchId) {
                    arr.splice(i, 1);
                }
            }
            theOwner.branches = arr;
            //remove branch city from the place cities
            let arr1 = theOwner.cities;
            for (let i = 0; i <= arr1.length; i = i + 1) {
                if (arr1[i] == branch.city) {
                    arr1.splice(i, 1);
                }
            }
            theOwner.cities = arr1;
            //remove branch area from the place areas
            let arr2 = theOwner.areas;
            for (let i = 0; i <= arr2.length; i = i + 1) {
                if (arr2[i] == branch.area) {
                    arr2.splice(i, 1);
                }
            }
            theOwner.areas = arr2;
            await theOwner.save();
            await branch.save();

            let reports = {
                "action": "Delete branch",
                "type": "BRANCH",
                "deepId": branchId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({ success: true });

        } catch (err) {
            next(err);
        }
    },
};