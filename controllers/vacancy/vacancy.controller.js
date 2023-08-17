import Vacancy from "../../models/vacancy/vacancy.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import { checkExist, isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { transformVacancy, transformVacancyById } from "../../models/vacancy/transformVacancy";
import Business from "../../models/business/business.model";
import Post from "../../models/post/post.model";
import BusinessManagement from "../../models/business/businessManagement.model"
import VacancyRequest from "../../models/vacancyRequest/vacancyRequest.model";

const populateQuery = [
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' },
    {
        path: 'business',
        model: 'business',
        populate: { path: 'package', model: 'package' },
    },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('profession').not().isEmpty().withMessage((value, { req }) => {
                return req.__('profession.required', { value });
            }),
            body('description').not().isEmpty().withMessage((value, { req }) => {
                return req.__('description.required', { value });
            }),
            body('requirements').not().isEmpty().withMessage((value, { req }) => {
                return req.__('requirements.required', { value });
            }),
            body('business').not().isEmpty().withMessage((value, { req }) => {
                return req.__('business.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('business.numeric', { value });
            }),

        ];
        return validations;
    },
    //add new vacancy
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.vacancy.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            validatedBody.sector = business.sector
            validatedBody.subSector = business.subSector

            let vacancy = await Vacancy.create({...validatedBody });
            await Post.create({
                vacancy: vacancy.id,
                owner: req.user._id,
                business: business.id,
                ownerType: 'BUSINESS',
                type: 'VACANCY',
                content: vacancy.description
            });
            let reports = {
                "action": "Create New vacancy",
                "type": "VACANCY",
                "deepId": vacancy.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success: true,
                data: vacancy
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async getById(req, res, next) {
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let { vacancyId } = req.params;

            await checkExist(vacancyId, Vacancy, { deleted: false });

            await Vacancy.findById(vacancyId)
                .populate(populateQuery)
                .then(async(e) => {
                    let vacancy = await transformVacancyById(e, lang)
                    res.send({
                        success: true,
                        data: vacancy
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //update vacancy
    async update(req, res, next) {
        try {
            let { vacancyId } = req.params;
            await checkExist(vacancyId, Vacancy, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.vacancy.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            validatedBody.sector = business.sector
            validatedBody.subSector = business.subSector
            await Vacancy.findByIdAndUpdate(vacancyId, {...validatedBody });
            let thePost = await Post.findOne({ vacancy: vacancyId })
            thePost.description = validatedBody.description
            await thePost.save();
            let reports = {
                "action": "Update vacancy",
                "type": "VACANCY",
                "deepId": vacancyId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (error) {
            next(error);
        }
    },
    //get without pagenation
    async getAll(req, res, next) {
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let { sector, subSector, search, educationInstitution, educationSystem, business } = req.query;

            let query = { deleted: false }
                /*search  */
            if (search) {
                query = {
                    $and: [{
                            $or: [
                                { profession: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { description: { $regex: '.*' + search + '.*', '$options': 'i' } },
                            ]
                        },
                        { deleted: false },
                    ]
                };
            }
            if (sector) query.sector = sector
            if (subSector) query.subSector = subSector
            if (educationInstitution) query.educationInstitution = educationInstitution
            if (educationSystem) query.educationSystem = educationSystem
            if (business) query.business = business
            await Vacancy.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformVacancy(e, lang)
                        newdata.push(index)
                    }))
                    res.send({
                        success: true,
                        data: newdata
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //get with pagenation
    async getAllPaginated(req, res, next) {
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let { sector, subSector, search, educationInstitution, educationSystem, business } = req.query;

            let query = { deleted: false }
                /*search  */
            if (search) {
                query = {
                    $and: [{
                            $or: [
                                { profession: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { description: { $regex: '.*' + search + '.*', '$options': 'i' } },
                            ]
                        },
                        { deleted: false },
                    ]
                };
            }
            if (sector) query.sector = sector
            if (subSector) query.subSector = subSector

            if (educationInstitution) query.educationInstitution = educationInstitution
            if (educationSystem) query.educationSystem = educationSystem
            if (business) query.business = business
            await Vacancy.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformVacancy(e, lang)
                        newdata.push(index)
                    }))
                    const count = await Vacancy.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (error) {
            next(error);
        }
    },
    //delete 
    async delete(req, res, next) {
        try {
            let { vacancyId } = req.params;
            let vacancy = await checkExistThenGet(vacancyId, vacancy);
            let business = await checkExistThenGet(vacancy.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.vacancy.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            /*delete posts under vacancy */
            let posts = await Post.find({ vacancy: vacancyId });
            for (let id of posts) {
                id.deleted = true;
                await id.save();
            }
            /*delete vacancyRequests under group */
            let vacancyRequests = await VacancyRequest.find({ vacancy: vacancyId });
            for (let id of vacancyRequests) {
                id.deleted = true;
                await id.save();
            }
            vacancy.deleted = true;
            await Vacancy.save();
            let reports = {
                "action": "Delete vacancy",
                "type": "VACANCY",
                "deepId": vacancyId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },



}