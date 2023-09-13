import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist, isInArray, isLat, isLng } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Country from "../../models/country/country.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import Category from "../../models/category/category.model"
import EducationSystem from "../../models/education system/education system.model";
import EducationInstitution from "../../models/education institution/education institution.model";
import { transformBusiness, transformBusinessById } from "../../models/business/transformBusiness";
import Grade from "../../models/grade/grade.model"
import Branch from "../../models/branch/branch.model";
import Specialization from "../../models/specialization/specialization.model"
import Faculty from "../../models/faculty/faculty.model"
import BusinessManagement from "../../models/business/businessManagement.model"
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import Business from "../../models/business/business.model";
import Subject from "../../models/subject/subject.model";
import { transformUser } from '../../models/user/transformUser';
import User from "../../models/user/user.model";
import { ValidationError } from "mongoose";
import Follow from "../../models/follow/follow.model";
import Post from "../../models/post/post.model";
import Activity from "../../models/user/activity.model";
import BusinessRequest from "../../models/business/businessRequest.model";
//validate location
function validatedLocation(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lng.validate") });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lat.validate") });
}
const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'package', model: 'package' },
    { path: 'sector', model: 'category' },
    { path: 'subSector', model: 'category' },
];
const populateQueryById = [
    { path: 'owner', model: 'user' },
    { path: 'package', model: 'package' },
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' },
    { path: 'sector', model: 'category' },
    { path: 'subSector', model: 'category' },
    { path: 'specializations', model: 'specialization' },
    { path: 'subjects', model: 'subject' },
    { path: 'grades', model: 'grade' },
    {
        path: 'branches',
        model: 'branch',
        populate: { path: 'country', model: 'country' },
    },
    {
        path: 'branches',
        model: 'branch',
        populate: { path: 'city', model: 'city' },
    },
    {
        path: 'branches',
        model: 'branch',
        populate: { path: 'area', model: 'area' },
    },
    {
        path: 'faculties',
        model: 'faculty',
        populate: { path: 'grades', model: 'grade' },
    },

];
export default {
    //validate body

    validateBody(isUpdate = false) {
        let validations = [
            body('name_en').not().isEmpty().withMessage((value, { req }) => {
                return req.__('name_en.required', { value });
            }),
            body('name_ar').not().isEmpty().withMessage((value, { req }) => {
                return req.__('name_ar.required', { value });
            }),
            body('bio_en').not().isEmpty().withMessage((value, { req }) => {
                return req.__('bio_en.required', { value });
            }),
            body('bio_ar').not().isEmpty().withMessage((value, { req }) => {
                return req.__('bio_ar.required', { value });
            }),
            body('educationSystem').optional()
            .custom(async(value, { req }) => {
                if (!await EducationSystem.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('educationSystem.invalid'));
                else
                    return true;
            }),
            body('webSite').optional(),
            body('facebook').optional(),
            body('twitter').optional(),
            body('youTube').optional(),
            body('instagram').optional(),
            body('linkedin').optional(),
            body('email').optional(),
            body('phones').optional(),
            body('sector').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('sector.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!value) {
                    if (!req.body.educationType)
                        throw new Error(req.__('sector.required'))
                    else
                        return true;
                } else {
                    if (!await Category.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('sector.invalid'));
                    else
                        return true;
                }
            }),
            body('subSector').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('subSector.numeric', { value });
            }).custom(async(value, { req }) => {

                if (!value) {
                    if (!req.body.educationType)
                        throw new Error(req.__('subSector.required'))
                    else
                        return true;
                } else {
                    if (!await Category.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('subSector.invalid'));
                    else
                        return true;
                }
            }),
            body('educationType').optional()
            .isIn(['SCHOOL', 'UNIVERSITY', 'HIGH-ACADEMY', 'NURSERY', 'HIGH-CENTER', 'BASIC-CENTER', 'HIGH-TUTOR', 'BASIC-TUTOR', 'SERVICE-PROVIDER', 'INSTITUTE', 'BASIC-ACADEMY', 'HIGH', 'BASIC'])
            .withMessage((value, { req }) => {
                return req.__('educationType.invalid', { value });
            }),
            body('owner').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('owner.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('owner.invalid'));
                else
                    return true;
            }),
            body('studyType').optional().isIn(['LOCAL', 'ABROAD']).withMessage((value, { req }) => {
                return req.__('studyType.invalid', { value });
            }),
            //for academy
            body('specializations').optional()
            .custom(async(specializations, { req }) => {
                for (let value of specializations) {
                    if (!await Specialization.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('specialization.invalid'));
                    else
                        return true;
                }
                return true;
            }),

            body('theGrades').optional()
            .custom(async(grades, { req }) => {

                for (let grade of grades) {
                    body('name_en').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('name_en.required', { value });
                        }),
                        body('name_ar').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('name_ar.required', { value });
                        }),
                        body('cost').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('cost.required', { value });
                        }),
                        body('gradeId').optional()
                }
                return true;
            }),
            //for univeristy
            body('theFaculties').optional()
            .custom(async(faculties, { req }) => {

                for (let faculty of faculties) {
                    body('name_en').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('name_en.required', { value });
                        }),
                        body('name_ar').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('name_ar.required', { value });
                        }),
                        body('theGrades').optional()
                        .custom(async(grades, { req }) => {

                            for (let grade of grades) {
                                body('name_en').not().isEmpty().withMessage((value, { req }) => {
                                        return req.__('name_en.required', { value });
                                    }),
                                    body('name_ar').not().isEmpty().withMessage((value, { req }) => {
                                        return req.__('name_ar.required', { value });
                                    }),
                                    body('cost').not().isEmpty().withMessage((value, { req }) => {
                                        return req.__('cost.required', { value });
                                    }),
                                    body('gradeId').optional()
                            }
                            return true;
                        }),
                        body('facultyId').optional()
                }
                return true;
            }),
            body('theBranches').optional()
            .custom(async(branches, { req }) => {

                for (let branche of branches) {
                    body('address_ar').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('address_ar.required', { value });
                        }),
                        body('address_en').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('address_en.required', { value });
                        }),
                        body('country').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('country.required', { value });
                        }).custom(async(value, { req }) => {
                            if (!await Country.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('country.invalid'));
                            else
                                return true;
                        }),
                        body('city').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('city.required', { value });
                        }).custom(async(value, { req }) => {
                            if (!await City.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('city.invalid'));
                            else
                                return true;
                        }),
                        body('area').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('area.required', { value });
                        }).custom(async(value, { req }) => {
                            if (!await Area.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('area.invalid'));
                            else
                                return true;
                        }),

                        body('phone').optional()
                        .custom(async(value, { req }) => {
                            var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                            if (!exp.test(value))
                                throw new Error(req.__('branchPhone.syntax'));
                            else
                                return true;
                        }),
                        body('location').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('location.required', { value });
                        }).custom(async(value, { req }) => {
                            validatedLocation(value)
                            return true;
                        }),
                        body('email').optional(),
                        body('branchId').optional()
                }
                return true;
            }),
            //for tutors
            body('sessionsPrices').optional()
            .custom(async(sessions, { req }) => {
                for (let val of sessions) {
                    body('studentGroup').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('studentGroup.required', { value });
                        }).isIn(['FOR-ONE', 'FOR-TWO', 'FOR-THREE', 'FOR-FOUR']).withMessage((value, { req }) => {
                            return req.__('studentGroup.invalid', { value });
                        }),
                        body('price').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('price.required', { value });
                        })
                }
                return true;
            }),
            body('subjects').optional()
            .custom(async(subjects, { req }) => {
                for (let value of subjects) {
                    if (!await Subject.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('subject.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('gallery').optional(),
            body('img').optional(),
        ];
        return validations;
    },
    //add new education Institution
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            if (validatedBody.educationType) {
                let subSector = await Category.findOne({ deleted: false, educationType: validatedBody.educationType })
                validatedBody.subSector = subSector._id
                validatedBody.sector = subSector.parent

            }
            if(!validatedBody.owner) validatedBody.type = 'NOT-ASSIGNED'
            let business = await Business.create({...validatedBody });
            let branches = []
            if (validatedBody.theBranches) {
                let cities = [];
                let areas = [];
                await Promise.all(validatedBody.theBranches.map(async(val) => {
                    val.location = { type: 'Point', coordinates: [+val.location[0], +val.location[1]] };

                    val.business = business.id
                    val.type = "BUSINESS"
                    let createdRow = await Branch.create({...val })
                    branches.push(createdRow.id)
                    cities.push(val.city)
                    areas.push(val.area)
                }));
                business.cities = cities
                business.areas = areas
            }

            let grades = []
            if (validatedBody.theGrades) {
                await Promise.all(validatedBody.theGrades.map(async(val) => {
                    if (validatedBody.educationSystem) {
                        val.educationSystem = validatedBody.educationSystem
                    }
                    val.business = business.id
                    let createdRow = await Grade.create({...val })
                    grades.push(createdRow.id)
                }));
            }
            let faculties = []
            if (validatedBody.theFaculties) {
                await Promise.all(validatedBody.theFaculties.map(async(val) => {
                    //add faculty
                    let faculty = {
                        'name_ar': val.name_ar,
                        'name_en': val.name_en
                    }
                    if (validatedBody.educationSystem) {
                        faculty.educationSystem = validatedBody.educationSystem
                    }
                    faculty.business = business.id
                    let createdFaculty = await Faculty.create({...faculty })
                    faculties.push(createdFaculty.id)
                        //add grades
                    let facultyGrades = [];
                    await Promise.all(val.theGrades.map(async(value) => {
                        if (validatedBody.educationSystem) {
                            value.educationSystem = validatedBody.educationSystem
                        }
                        value.business = business.id
                        let createdRow = await Grade.create({...value })
                            //add faculty key in grade obj
                        createdRow.faculty = createdFaculty.id
                        await createdRow.save();
                        facultyGrades.push(createdRow.id)
                    }));
                    //add grades key in faculty obj
                    createdFaculty.grades = facultyGrades
                    await createdFaculty.save();
                }));
            }
            business.faculties = faculties
            business.branches = branches
            business.grades = grades
            if (req.user.type == "ADMIN") {
                let educationInstitution = await EducationInstitution.create({
                    name_en: business.name_en,
                    name_ar: business.name_ar,
                    educationSystem: business.educationSystem ? business.educationSystem : null,
                    sector: business.sector,
                    subSector: business.subSector,
                    img: business.img,
                    business: business.id
                });
                business.status = "ACCEPTED"
                business.educationInstitution = educationInstitution

                let allGrades = await Grade.find({ business: business.id });
                for (let id of allGrades) {
                    id.educationInstitution = educationInstitution;
                    await id.save();
                }
                let allFaculties = await Faculty.find({ business: business.id });
                for (let id of allFaculties) {
                    id.educationInstitution = educationInstitution;
                    await id.save();
                }
            }

            await business.save();
            let reports = {
                "action": "Create New business",
                "type": "BUSINESS",
                "deepId": business.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success: true,
                data: business
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
            let { businessId } = req.params;
            let { userId } = req.query
            await checkExist(businessId, Business, { deleted: false });
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            await Business.findById(businessId)
                .populate(populateQueryById)
                .then(async(e) => {
                    let business = await transformBusinessById(e, lang, myUser, userId)
                    business.management = await BusinessManagement.findOne({ deleted: false, business: e._id })
                    business.followersCount = await Follow.countDocuments({ business: e._id, deleted: false })
                    res.send({
                        success: true,
                        data: business
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //update business
    async update(req, res, next) {
        try {
            let { businessId } = req.params;
            let business = await checkExistThenGet(businessId, Business, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (business.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);
            let branches = []
            if (validatedBody.theBranches) {
                let cities = []
                let areas = []
                await Promise.all(validatedBody.theBranches.map(async(val) => {
                    val.location = { type: 'Point', coordinates: [+val.location[0], +val.location[1]] };

                    if (val.branchId) {
                        await Branch.findByIdAndUpdate(val.branchId, {...val });
                        branches.push(val.branchId)
                    } else {
                        val.business = businessId
                        val.type = "BUSINESS"
                        let createdRow = await Branch.create({...val })
                        branches.push(createdRow.id)

                    }
                    cities.push(val.city)
                    areas.push(val.area)
                }));

                validatedBody.cities = cities
                validatedBody.areas = areas
            }
            let grades = []
            if (validatedBody.theGrades) {
                await Promise.all(validatedBody.theGrades.map(async(val) => {
                    if (val.gradeId) {
                        await Grade.findByIdAndUpdate(val.gradeId, {...val });
                        grades.push(val.gradeId)
                    } else {

                        if (validatedBody.educationSystem) {
                            val.educationSystem = validatedBody.educationSystem
                        }
                        val.business = businessId
                        let createdRow = await Grade.create({...val })
                        grades.push(createdRow.id)
                    }
                }));
            }
            let faculties = []
            if (validatedBody.theFaculties) {
                await Promise.all(validatedBody.theFaculties.map(async(val) => {
                    if (val.facultyId) {
                        await Faculty.findByIdAndUpdate(val.facultyId, {...val });
                        faculties.push(val.facultyId)
                    } else {
                        //add faculty
                        let faculty = {
                            'name_ar': val.name_ar,
                            'name_en': val.name_en
                        }
                        if (validatedBody.educationSystem) {
                            faculty.educationSystem = validatedBody.educationSystem
                        }
                        faculty.business = business.id
                        let createdFaculty = await Faculty.create({...faculty })
                        faculties.push(createdFaculty.id)
                            //add grades
                        await Promise.all(val.theGrades.map(async(value) => {
                            if (validatedBody.educationSystem) {
                                value.educationSystem = validatedBody.educationSystem
                            }
                            value.business = business.id
                            let createdRow = await Grade.create({...value })
                                //add faculty key in grade obj
                            createdRow.faculty = createdFaculty.id
                            await createdRow.save();
                            grades.push(createdRow.id)
                        }));
                        //add grades key in faculty obj
                        createdFaculty.grades = grades
                        await createdFaculty.save();
                    }

                }));
            }
            validatedBody.branches = branches
            validatedBody.grades = grades
            await Business.findByIdAndUpdate(businessId, {...validatedBody });

            let reports = {
                "action": "Update Business ",
                "type": "BUSINESS",
                "deepId": businessId,
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
            let {type,specialization, city, area, userId, educationType, owner, search, sector, subSector, educationSystem, status } = req.query;

            let query = { deleted: false }
                /*search by name */
            if (search) {
                query = {
                    $and: [{
                            $or: [
                                { name_ar: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { name_en: { $regex: '.*' + search + '.*', '$options': 'i' } },

                            ]
                        },
                        { deleted: false },
                    ]
                };
            }
            if (specialization) query.specializations = specialization
            if (type) query.type = type

            if (city) query.cities = city
            if (area) query.areas = area
            if (owner) query.owner = owner
            if (sector) query.sector = sector
            if (subSector) query.subSector = subSector
            if (educationSystem) query.educationSystem = educationSystem
            if (status) query.status = status
            if (educationType) {
                if (educationType == "TUTOR") {
                    educationType = ['HIGH-TUTOR', 'BASIC-TUTOR']
                }
                let catIds = await Category.find({ deleted: false, educationType: educationType }).distinct('_id')
                query.subSector = { $in: catIds }
            }
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            await Business.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then(async(data) => {
                    var newdata = [];
                    await Promise.allSettled(data.map(async(e) => {
                        let index = await transformBusiness(e, lang, myUser, userId)
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
            let {all,type,specialization, city, area, userId, educationType, owner, search, sector, subSector, educationSystem, status } = req.query;

            let query = { deleted: false }
                /*search by name */
            if (search) {
                query = {
                    $and: [{
                            $or: [
                                { name_ar: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { name_en: { $regex: '.*' + search + '.*', '$options': 'i' } },

                            ]
                        },
                        { deleted: false },
                    ]
                };
            }
            if (type) query.type = type
            if (specialization) query.specializations = specialization

            if (city) query.cities = city
            if (area) query.areas = area
            if (owner) query.owner = owner
            if (sector) query.sector = sector
            if (subSector) query.subSector = subSector
            if (educationSystem) query.educationSystem = educationSystem
            if (status) query.status = status
            if (educationType) {
                if (educationType == "TUTOR") {
                    educationType = ['HIGH-TUTOR', 'BASIC-TUTOR']
                }
                let catIds = await Category.find({ deleted: false, educationType: educationType }).distinct('_id')
                query.subSector = { $in: catIds }
            }
            
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            if(all && userId){
                let businessQuery = {
                    $and: [{
                        $or: [
                            { owner: userId },
                            { _id: myUser.managmentBusinessAccounts },

                        ]
                    },
                    { deleted: false },
                ]
                }
                let businessIds = await Business.find(businessQuery).distinct('_id')
                let businessRequestsIds = await BusinessRequest.find({owner:userId}).distinct('business')
                businessIds.push(...businessRequestsIds)
                query._id = { $in: businessIds }
            }
            await Business.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformBusiness(e, lang, myUser, userId)
                        newdata.push(index)
                    }))
                    const count = await Business.countDocuments(query);
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
            let { businessId } = req.params;
            let business = await checkExistThenGet(businessId, Business);
            business.deleted = true;
            /*delete posts under group */
            let posts = await Post.find({ business: businessId });
            for (let id of posts) {
                id.deleted = true;
                //remove activities
                let activities = await Activity.find({ post: id });
                for (let id2 of activities) {
                    id2.deleted = true;
                    await id2.save();
                }
                await id.save();
            }
            await business.save();
            let reports = {
                "action": "Delete Business",
                "type": "BUSINESS",
                "deepId": businessId,
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
    async accept(req, res, next) {
        try {
            let { businessId } = req.params;
            let business = await checkExistThenGet(businessId, Business);
            business.status = 'ACCEPTED';

            if (!business.educationInstitution) {
                let educationInstitution = await EducationInstitution.create({
                    name_en: business.name_en,
                    name_ar: business.name_ar,
                    educationSystem: business.educationSystem,
                    sector: business.sector,
                    subSector: business.subSector,
                    img: business.img,

                });
                business.educationInstitution = educationInstitution
            }

            let grades = await Grade.find({ business: businessId });
            for (let id of grades) {
                id.educationInstitution = business.educationInstitution;
                await id.save();
            }
            let allFaculties = await Faculty.find({ business: business.id });
            for (let id of allFaculties) {
                id.educationInstitution = business.educationInstitution;
                await id.save();
            }

            await business.save();
            sendNotifiAndPushNotifi({
                targetUser: business.owner,
                fromUser: business.owner,
                text: ' EdHub',
                subject: business.id,
                subjectType: 'Business Status',
                info: 'BUSINESS'
            });
            let notif = {
                "description_en": 'Your business Request Has Been Confirmed ',
                "description_ar": '  تمت الموافقه على طلب  الخاص بك',
                "title_en": 'Your business Request Has Been Confirmed ',
                "title_ar": ' تمت الموافقه على طلب  الخاص بك',
                "type": 'BUSINESS'
            }
            await Notif.create({...notif, resource: req.user, target: business.owner, business: business.id });
            let reports = {
                "action": "Accept business Request",
                "type": "BUSINESS",
                "deepId": businessId,
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
    async reject(req, res, next) {
        try {
            let { businessId } = req.params;
            let business = await checkExistThenGet(businessId, Business);
            business.status = 'REJECTED';
            business.reason = req.body.reason
            await business.save();

            sendNotifiAndPushNotifi({
                targetUser: business.owner,
                fromUser: business.owner,
                text: ' EdHub',
                subject: business.id,
                subjectType: 'business Status',
                info: 'BUSINESS'
            });
            let notif = {
                "description_en": 'Your business Request Has Been Rejected ',
                "description_ar": '   تم رفض  طلب الانضمام الخاص بك',
                "title_en": 'Your business Request Has Been Rejected ',
                "title_ar": ' تم رفض على طلب الانضمام الخاص بك',
                "type": 'BUSINESS'
            }
            await Notif.create({...notif, resource: req.user, target: business.owner, business: business.id });
            let reports = {
                "action": "Reject business Request",
                "type": "BUSINESS",
                "deepId": businessId,
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
    validateBusinessManagementBody(isUpdate = false) {
        let validations = [
            body('events.supervisors').optional()
            .custom(async(value, { req }) => {
                for (const user of value) {
                    if (!await User.findOne({ _id: user, deleted: false }))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }

            }),
            body('vacancy.acceptanceLetter').optional(),
            body('vacancy.rejectionLetter').optional(),
            body('vacancy.supervisors').optional()
            .custom(async(value, { req }) => {
                for (const user of value) {
                    if (!await User.findOne({ _id: user, deleted: false }))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }

            }),
            body('admission.acceptanceLetter').optional(),
            body('admission.rejectionLetter').optional(),
            body('admission.supervisors').optional()
            .custom(async(value, { req }) => {
                for (const user of value) {
                    if (!await User.findOne({ _id: user, deleted: false }))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }

            }),
            body('courses.supervisors').optional()
            .custom(async(value, { req }) => {
                for (const user of value) {
                    if (!await User.findOne({ _id: user, deleted: false }))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }

            })

        ];
        return validations;
    },
    //business setting
    async businessManagement(req, res, next) {
        try {
            let { businessId } = req.params
            const validatedBody = checkValidations(req);
            validatedBody.business = businessId
            let business = await checkExistThenGet(businessId, Business, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (business.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            let setting = await BusinessManagement.findOne({ business: businessId, deleted: false })
            if (setting) {
                await BusinessManagement.findByIdAndUpdate(setting.id, {...validatedBody });
            } else {
                await BusinessManagement.create({...validatedBody });
            }
            let allSupervisors = [...validatedBody.admission.supervisors,...validatedBody.events.supervisors
                ,...validatedBody.vacancy.supervisors,...validatedBody.courses.supervisors];
            for (let item of allSupervisors) {
                let supervisor = await checkExistThenGet(item,User,{deleted:false});
                let arr = supervisor.managmentBusinessAccounts
                var found = arr.find(e => e == businessId)
                if(!found){
                    supervisor.managmentBusinessAccounts.push(businessId);
                }
                await supervisor.save()
            }
            let reports = {
                "action": "Update Business Setting",
                "type": "ADMISSION",
                "deepId": businessId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    async getServiceSupervisors(req, res, next) {
        try {
            let { businessId } = req.params
                //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let { service } = req.query
            let business = await checkExistThenGet(businessId, Business, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (business.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            let businessManagement = await BusinessManagement.findOne({ business: businessId, deleted: false })
            let usersId = []
            if (service == "ADMISSION") {
                if (businessManagement.vacancy.supervisors) {
                    usersId = businessManagement.admission.supervisors
                }
            } else if (service == "VACANCY") {
                if (businessManagement.vacancy.supervisors) {
                    usersId = businessManagement.vacancy.supervisors
                }
            } else {
                if (businessManagement.events.supervisors) {
                    usersId = businessManagement.events.supervisors
                }
            }
            await User.find({ _id: usersId })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e) => {
                        let index = await transformUser(e, lang)
                        newdata.push(index)
                    }))

                    const usersCount = await User.countDocuments({ _id: usersId });
                    const pageCount = Math.ceil(usersCount / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, usersCount, req));
                })
        } catch (error) {
            next(error);
        }
    },
    validateUpdateServiceSupervisorsBody(isUpdate = false) {
        let validations = [
            body('supervisor').not().isEmpty().withMessage((value, { req }) => {
                return req.__('supervisor.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('supervisor.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await User.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('supervisor.invalid'));
                else
                    return true;
            }),
            body('service').optional().isIn(['ADMISSION', 'VACANCY', 'EVENT', 'COURSES']).withMessage((value, { req }) => {
                return req.__('service.invalid', { value });
            }),
            body('type').optional().isIn(['ADD', 'REMOVE']).withMessage((value, { req }) => {
                return req.__('type.invalid', { value });
            }),

        ];
        return validations;
    },
    async updateServiceSupervisors(req, res, next) {
        try {
            let { businessId } = req.params
            let business = await checkExistThenGet(businessId, Business, { deleted: false })
            if (!isInArray(["ADMIN", "SUB-ADMIN", "USER"], req.user.type)) {
                if (business.owner != req.user._id)
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            const validatedBody = checkValidations(req);

            let businessManagement = await BusinessManagement.findOne({ business: businessId, deleted: false })
                //add admin to business management
            let arr
            if (validatedBody.type == "ADD") {
                if (validatedBody.service == "ADMISSION") arr = businessManagement.admission.supervisors;
                if (validatedBody.service == "VACANCY") arr = businessManagement.vacancy.supervisors;
                if (validatedBody.service == "EVENT") arr = businessManagement.events.supervisors;
                if (validatedBody.service == "COURSE") arr = businessManagement.courses.supervisors;

                arr.push(validatedBody.supervisor)

                if (validatedBody.service == "ADMISSION") arr = businessManagement.admission.supervisors = arr;
                if (validatedBody.service == "VACANCY") arr = businessManagement.vacancy.supervisors = arr;
                if (validatedBody.service == "EVENT") arr = businessManagement.events.supervisors = arr;
                if (validatedBody.service == "COURSE") arr = businessManagement.courses.supervisors = arr;
                
                let supervisor = await checkExistThenGet(validatedBody.supervisor,User,{deleted:false});
                let arr = supervisor.managmentBusinessAccounts
                var found = arr.find(e => e == businessId)
                if(!found){
                    supervisor.managmentBusinessAccounts.push(businessId);
                }
                await supervisor.save()
            } else {
                //remove admin to business management
                if (validatedBody.service == "ADMISSION") arr = businessManagement.admission.supervisors;
                if (validatedBody.service == "VACANCY") arr = businessManagement.vacancy.supervisors;
                if (validatedBody.service == "EVENT") arr = businessManagement.events.supervisors;
                if (validatedBody.service == "COURSE") arr = businessManagement.courses.supervisors;
                let index = arr.findIndex(e => e == req.body.supervisor);

                for (var i = 0; i <= arr.length; i = i + 1) {
                    if (arr[i] === arr[index]) {
                        arr.splice(index, 1);
                    }
                }

                if (validatedBody.service == "ADMISSION") arr = businessManagement.admission.supervisors = arr;
                if (validatedBody.service == "VACANCY") arr = businessManagement.vacancy.supervisors = arr;
                if (validatedBody.service == "EVENT") arr = businessManagement.events.supervisors = arr;
                if (validatedBody.service == "COURSE") arr = businessManagement.courses.supervisors = arr;
                
                let supervisor = await checkExistThenGet(validatedBody.supervisor,User,{deleted:false});
                let allSupervisors = [...businessManagement.admission.supervisors,...businessManagement.vacancy.supervisors
                ,...businessManagement.events.supervisors,...businessManagement.courses.supervisors]
                
                var found = allSupervisors.find(e => e == validatedBody.supervisor)
                if(!found){
                    arr = supervisor.managmentBusinessAccounts
                    for(let i = 0;i<= arr.length;i=i+1){
                        if(arr[i] == businessId){
                            arr.splice(i, 1);
                        }
                    }
                    supervisor.managmentBusinessAccounts = arr;
                    await supervisor.save()
                }
                
            }
            await businessManagement.save();
            let reports = {
                "action": "Update service supervisors",
                "type": "BUSINESS",
                "deepId": businessId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({ success: true });
        } catch (err) {
            next(err);
        }
    },
    async getSupervisorPermissions(req, res, next) {
        try {
            let { businessId } = req.params
            let business = await checkExistThenGet(businessId, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ business: businessId, deleted: false })
            let services = []
            let supervisors = [business.owner]
            if (businessManagement){
                if (businessManagement.vacancy.supervisors) {
                    supervisors.push(... businessManagement.vacancy.supervisors)
                    if (isInArray(supervisors, req.user._id))
                        services.push('VACANCY')
                }
                if (businessManagement.admission.supervisors) {
                    supervisors.push(... businessManagement.admission.supervisors)
                    if (isInArray(supervisors, req.user._id))
                        services.push('ADMISSION')
                }
                if (businessManagement.events.supervisors) {
                    supervisors.push(... businessManagement.events.supervisors)
                    if (isInArray(supervisors, req.user._id))
                        services.push('EVENTS')
                }
                if (businessManagement.courses.supervisors) {
                    supervisors.push(... businessManagement.courses.supervisors)
                    if (isInArray(supervisors, req.user._id))
                        services.push('COURSES')
                }
            }
            res.status(201).send({
                success: true,
                services:services,
            });
        } catch (error) {
            next(error);
        }
    },
    
}