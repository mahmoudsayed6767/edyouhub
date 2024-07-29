import Course from "../../models/course/course.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations, encryptedData } from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformCourse, transformCourseById } from "../../models/course/transformCourse";
import Business from "../../models/business/business.model";
import User from "../../models/user/user.model";
import { checkExist, checkExistThenGet, isInArray } from "../../helpers/CheckMethods";

import Specialization from "../../models/specialization/specialization.model"
import CourseParticipant from "../../models/course/courseParticipant.model";
import ApiError from "../../helpers/ApiError";
import BusinessManagement from "../../models/business/businessManagement.model"
import City from "../../models/city/city.model"
import Country from "../../models/country/country.model"
import Area from "../../models/area/area.model"
import CourseTutorial from "../../models/course/courseTutorial.model";
import { toImgUrl } from "../../utils";
import bcrypt from 'bcryptjs';
import Premium from "../../models/premium/premium.model";
import { transformCourseParticipant } from "../../models/course/transformCourseParticipant";
import Activity from "../../models/user/activity.model";
const populateQuery = [
    { path: 'business', model: 'business' },
    { path: 'specializations', model: 'specialization' },
    { path: 'instractors', model: 'user' },
];
const populateQueryById = [
    { path: 'business', model: 'business' },
    { path: 'specializations', model: 'specialization' },
    { path: 'instractors', model: 'user' },
    { path: 'tutorials', model: 'courseTutorial' },
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
];
const populateParticipantQuery = [
    { path: 'user', model: 'user' },
    { path: 'course', model: 'course' }
]
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('title_en').not().isEmpty().withMessage((value, { req }) => {
                return req.__('title_en.required', { value });
            }),
            body('title_ar').not().isEmpty().withMessage((value, { req }) => {
                return req.__('title_ar.required', { value });
            }),
            body('description_en').not().isEmpty().withMessage((value, { req }) => {
                return req.__('description_en.required', { value });
            }),
            body('description_ar').not().isEmpty().withMessage((value, { req }) => {
                return req.__('description_ar.required', { value });
            }),
            body('sessionsNo').optional(),
            body('maxApplications').optional(),
            body('maxAcceptance').optional(),
            body('type').optional().isIn(['ONLINE', 'ON-SITE']).withMessage((value, { req }) => {
                return req.__('type.invalid', { value });
            }),
            body('specializations').not().isEmpty().withMessage((value, { req }) => {
                return req.__('specializations.required', { value });
            }).custom(async (specializations, { req }) => {
                    for (let value of specializations) {
                        if (!await Specialization.findOne({ _id: value, deleted: false }))
                            throw new Error(req.__('specialization.invalid'));
                        else
                            return true;
                    }
                    return true;
                }),
            body('instractors').not().isEmpty().withMessage((value, { req }) => {
                return req.__('instractors.required', { value });
            }).custom(async (instractors, { req }) => {
                    for (let value of instractors) {
                        if (!await User.findOne({ _id: value, deleted: false }))
                            throw new Error(req.__('instractor.invalid'));
                        else
                            return true;
                    }
                    return true;
                }),
            body('cities').optional()
                .custom(async (cities, { req }) => {
                    for (let value of cities) {
                        if (!await City.findOne({ _id: value, deleted: false }))
                            throw new Error(req.__('city.invalid'));
                        else
                            return true;
                    }
                    return true;
                }),
            body('areas').optional()
                .custom(async (areas, { req }) => {
                    for (let value of areas) {
                        if (!await Area.findOne({ _id: value, deleted: false }))
                            throw new Error(req.__('area.invalid'));
                        else
                            return true;
                    }
                    return true;
                }),
            body('fromDate').optional().isISO8601().withMessage((value, { req }) => {
                return req.__('invalid.date', { value });
            }),
            body('toDate').optional().isISO8601().withMessage((value, { req }) => {
                return req.__('invalid.date', { value });
            }),
            body('business').not().isEmpty().withMessage((value, { req }) => {
                return req.__('business.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('business.numeric', { value });
            }),
            body('branches').optional(),
            body('dailyTimes').optional().custom(async (dailyTimes, { req }) => {
                for (let val of dailyTimes) {
                    body('day').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('day.required', { value });
                    }),
                        body('fromDate').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('fromDate.required', { value });
                        }).isISO8601().withMessage((value, { req }) => {
                            return req.__('invalid.date', { value });
                        }),
                        body('toDate').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('toDate.required', { value });
                        }).isISO8601().withMessage((value, { req }) => {
                            return req.__('invalid.date', { value });
                        })
                }
                return true;
            }),
            body('paymentMethod').optional().isIn(['CASH', 'INSTALLMENT'])
                .withMessage((value, { req }) => {
                    return req.__('paymentMethod.invalid', { value });
                }),
            body('feesType').not().isEmpty().withMessage((value, { req }) => {
                return req.__('feesType.required', { value });
            }).isIn(['NO-FEES', 'WITH-FEES'])
                .withMessage((value, { req }) => {
                    return req.__('feesType.invalid', { value });
                }),
            body('price').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('price.numeric', { value });
            }),
            body('totalDuration').not().isEmpty().withMessage((value, { req }) => {
                return req.__('totalDuration.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('totalDuration.numeric', { value });
            }),
            body('oldPrice').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('oldPrice.numeric', { value });
            }),

            body('installments').optional()
                .custom(async (installments, { req }) => {
                    for (let val of installments) {
                        body('price').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('price.required', { value });
                        })
                    }
                    return true;
                }),
            body('imgs').optional(),
            body('hasCertificate').optional(),
            body('certificateName').optional(),
            body('introVideo').optional(),
            body('ownerType').optional(),
            body('discount').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('discount.numeric', { value });
            }),
            body('discountType').optional()

        ];
        return validations;
    },
    //add new course
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if (validatedBody.type == "ON-SITE") {
                if (!validatedBody.fromDate)
                    return next(new ApiError(422, i18n.__('fromDate.required')));
                if (!validatedBody.toDate)
                    return next(new ApiError(422, i18n.__('toDate.required')));
                if (!validatedBody.branches)
                    return next(new ApiError(422, i18n.__('branches.required')));
                validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)
                validatedBody.fromDateMillSec = Date.parse(validatedBody.fromDate)

            }
            if (validatedBody.feesType == 'WITH-FEES') {
                if (!validatedBody.paymentMethod) {
                    return next(new ApiError(422, i18n.__('paymentMethod.required')));
                }
                if (!validatedBody.price)
                    return next(new ApiError(422, i18n.__('price.required')));
            }
            let course = await Course.create({ ...validatedBody });
            let secretKey = (await bcrypt.hash(course.id.toString(), bcrypt.genSaltSync())).substring(0, 16)
            course.secretKey = secretKey
            await course.save()
            let activityBody = {user:req.user._id,course:course._id,business:validatedBody.business}

            if(validatedBody.type == "ONLINE"){
                activityBody.action = 'CREATE-ONLINE-COURSE'
            }else{
                activityBody.action = 'CREATE-ON-SIE-COURSE'
            }

            await Activity.create({... activityBody});
            let reports = {
                "action": "Create New course",
                "type": "COURSE",
                "deepId": course.id,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.status(201).send({
                success: true,
                data: course
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
            let { courseId } = req.params;
            let { userId } = req.query
            let course = await checkExistThenGet(courseId, Course, { deleted: false });
            let business = await checkExistThenGet(course.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            let myUser
            let owner = false;
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
                let supervisors = [business.owner]
                if (businessManagement) {
                    if (businessManagement.courses) {
                        supervisors.push(...businessManagement.courses.supervisors)
                    }
                }
                if (isInArray(["ADMIN", "SUB-ADMIN"], myUser.type) || isInArray(supervisors, myUser._id)) {
                    owner = true;
                }
            }

            await Course.findById(courseId)
                .populate(populateQueryById)
                .then(async (e) => {
                    let course = await transformCourseById(e, lang, myUser, userId, owner)
                    res.send({
                        success: true,
                        data: course
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //update course
    async update(req, res, next) {
        try {
            let { courseId } = req.params;
            await checkExist(courseId, Course, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            if (validatedBody.type == "ON-SITE") {
                if (!validatedBody.fromDate)
                    return next(new ApiError(422, i18n.__('fromDate.required')));
                if (!validatedBody.toDate)
                    return next(new ApiError(422, i18n.__('toDate.required')));
                if (!validatedBody.branches)
                    return next(new ApiError(422, i18n.__('branches.required')));
                validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)
                validatedBody.fromDateMillSec = Date.parse(validatedBody.fromDate)


            }
            if (validatedBody.feesType == 'WITH-FEES') {
                if (!validatedBody.paymentMethod) {
                    return next(new ApiError(422, i18n.__('paymentMethod.required')));
                }
                if (!validatedBody.price)
                    return next(new ApiError(422, i18n.__('price.required')));
            }
            await Course.findByIdAndUpdate(courseId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action": "Update course",
                "type": "COURSE",
                "deepId": courseId,
                "user": req.user._id
            };
            await Report.create({ ...reports });
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
            let {all,feesType,showingStatus, city, area, userId, myCourses, type, search, instractor, paymentMethod, specialization, business, status, ownerType } = req.query;

            let query = { deleted: false, showingStatus:'APPROVED'}
            /*search  */
            if (search) {
                query = {
                    $and: [{
                        $or: [
                            { title: { $regex: '.*' + search + '.*', '$options': 'i' } },
                            { description: { $regex: '.*' + search + '.*', '$options': 'i' } },
                        ]
                    },
                    { deleted: false },
                    { showingStatus: 'APPROVED' },
                    ]
                };
            }
            if (showingStatus) query.showingStatus = showingStatus;
            if(all == "true") query.showingStatus = {$in:['APPROVED', 'PENNDING','REJECTED']}
            if (feesType) query.feesType = feesType;
            if (city) query.cities = city
            if (area) query.areas = area
            if (instractor) query.instractors = instractor
            if (paymentMethod) query.paymentMethod = paymentMethod;
            if (specialization) query.specializations = specialization
            if (business) query.business = business
            if (status) query.status = status
            if (ownerType) query.ownerType = ownerType;
            if (type) query.type = type
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
                if (myCourses == "true") {
                    query._id = myUser.attendedCourses
                }
            }
            await Course.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async (e) => {
                        let index = await transformCourse(e, lang, myUser, userId)
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
            let { all,showingStatus,feesType, city, area, myCourses, userId, type, search, instractor, paymentMethod, specialization, business, status, ownerType } = req.query;

            let query = { deleted: false}
            /*search  */
            if (search) {
                query = {
                    $and: [{
                        $or: [
                            { title: { $regex: '.*' + search + '.*', '$options': 'i' } },
                            { description: { $regex: '.*' + search + '.*', '$options': 'i' } },
                        ]
                    },
                    { deleted: false },
                    { showingStatus: 'APPROVED' },
                    ]
                };
            }
            if (showingStatus) query.showingStatus = showingStatus;
            if(all == "true") query.showingStatus = {$in:['APPROVED', 'PENNDING','REJECTED']}
            if (feesType) query.feesType = feesType;

            if (type) query.type = type
            if (city) query.cities = city
            if (area) query.areas = area
            if (instractor) query.instractors = instractor
            if (paymentMethod) query.paymentMethod = paymentMethod;
            if (specialization) query.specializations = specialization
            if (business) query.business = business
            if (status) query.status = status
            if (ownerType) query.ownerType = ownerType;
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
                if (myCourses == "true") {
                    query._id = myUser.attendedCourses
                }
            }
            await Course.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async (e) => {
                        let index = await transformCourse(e, lang, myUser, userId)
                        newdata.push(index)
                    }))
                    const count = await Course.countDocuments(query);
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
            let { courseId } = req.params;
            let course = await checkExistThenGet(courseId, Course);
            let business = await checkExistThenGet(course.business, Business, { deleted: false })

            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: course._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            course.deleted = true;
            await course.save();
            let reports = {
                "action": "Delete course",
                "type": "COURSE",
                "deepId": courseId,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    validateAddParticipantBody(newUser = false) {
        let validations = [
            body('paymentMethod').not().isEmpty().withMessage((value, { req }) => {
                return req.__('paymentMethod.required', { value });
            }).isIn(['CASH', 'INSTALLMENT'])
                .withMessage((value, { req }) => {
                    return req.__('paymentMethod.invalid', { value });
                }),
            body('fawryCode').optional()
        ];
        if (!newUser)
            validations.push([
                body('user').optional().isNumeric().withMessage((value, { req }) => {
                    return req.__('user.numeric', { value });
                }).custom(async (value, { req }) => {
                    if (!await User.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }),
            ])
        if (newUser)
            validations.push([
                body('fullname').not().isEmpty().withMessage((value, { req }) => {
                    return req.__('fullname.required', { value });
                }),
                body('password').not().isEmpty().withMessage((value, { req }) => {
                    return req.__('password.required', { value });
                }).isLength({ min: 8 }).withMessage((value, { req }) => {
                    return req.__('password.invalid', { value });
                }).custom(async (value, { req }) => {
                    var exp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
                    if (!exp.test(value)) {
                        throw new Error(req.__('password.invalid'));
                    } else
                        return true;
                }),
                body('phone').not().isEmpty().withMessage((value, { req }) => {
                    return req.__('phone.required', { value });
                })
                    .custom(async (value, { req }) => {
                        var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                        if (!exp.test(value)) {
                            throw new Error(req.__('phone.syntax'));
                        }
                        let userQuery = { phone: value, deleted: false, accountType: 'ACTIVE' };

                        if (await User.findOne(userQuery))
                            throw new Error(req.__('phone.duplicated'));
                        else
                            return true;

                    }),
                body('email').optional().isEmail().withMessage('email.syntax')
                    .custom(async (value, { req }) => {
                        let userQuery = { email: value, deleted: false, accountType: 'ACTIVE' };

                        if (await User.findOne(userQuery))
                            throw new Error(req.__('email.duplicated'));
                        else
                            return true;

                    }),
                body('country').not().isEmpty().withMessage((value, { req }) => {
                    return req.__('country.required', { value });
                }).isNumeric().withMessage((value, { req }) => {
                    return req.__('country.numeric', { value });
                }).custom(async (value, { req }) => {
                    if (!await Country.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('country.invalid'));
                    else
                        return true;
                }),
                body('city').not().isEmpty().withMessage((value, { req }) => {
                    return req.__('city.required', { value });
                }).isNumeric().withMessage((value, { req }) => {
                    return req.__('city.numeric', { value });
                }).custom(async (value, { req }) => {
                    if (!await City.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('city.invalid'));
                    else
                        return true;
                }),
                body('area').not().isEmpty().withMessage((value, { req }) => {
                    return req.__('area.required', { value });
                }).isNumeric().withMessage((value, { req }) => {
                    return req.__('area.numeric', { value });
                }).custom(async (value, { req }) => {
                    if (!await Area.findOne({ _id: value, deleted: false }))
                        throw new Error(req.__('area.invalid'));
                    else
                        return true;
                }),
            ])

        return validations;
    },
    async addParticipant(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let { courseId } = req.params
            let course = await checkExistThenGet(courseId, Course);
            //check permission
            let business = await checkExistThenGet(course.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            validatedBody.course = courseId;
            //check if user is new or exist
            let attendedUser;
            if (!validatedBody.user) {
                validatedBody.type = "USER"
                let unActiveUsers = await User.find({ deleted: false, accountType: 'SIGNUP-PROCESS', phone: validatedBody.phone })
                for (let id of unActiveUsers) {
                    id.deleted = true;
                    await id.save();
                }
                attendedUser = await User.create({ ...validatedBody });
            } else {
                attendedUser = await checkExistThenGet(validatedBody.user, User);
            }
            validatedBody.user = attendedUser.id
            //upload imgs
            if (req.files) {
                if (req.files['receipt']) {
                    let imagesList = [];
                    for (let imges of req.files['receipt']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.receipt = imagesList;
                }
            }
            if (!await CourseParticipant.findOne({ user: validatedBody.user, course: courseId, deleted: false })) {
                let arr = attendedUser.attendedCourses;
                var found = arr.find((e) => e == courseId);
                if (!found) {
                    attendedUser.attendedCourses.push(courseId);
                    await attendedUser.save();
                    await CourseParticipant.create({ ...validatedBody });
                    if (validatedBody.paymentMethod == "INSTALLMENT") {
                        //create premuims
                        let payments = course.installments
                        for (var i = 0; i < payments.length; i++) {
                            let payment = payments[i];
                            let paidDate = new Date()
                            let installmentDate = new Date(paidDate.setMonth(paidDate.getMonth() + i));
                            console.log(installmentDate)
                            let lastMonth = false
                            if (payments.length - 1 == i) lastMonth = true
                            let thePremium = await Premium.create({
                                course: course.id,
                                type: 'COURSE',
                                receiptNum: i + 1,
                                owner: validatedBody.user,
                                installmentDate: installmentDate,
                                cost: payment.price,
                                lastPremium: lastMonth
                            });
                            let reports = {
                                "action": "Create premium",
                                "type": "PREMIUMS",
                                "deepId": thePremium.id,
                                "user": req.user._id
                            };
                            await Report.create({ ...reports });
                        }
                    }
                    course.acceptanceNo = course.acceptanceNo + 1
                    await course.save();
                    let reports = {
                        "action": "user will attend to course",
                        "type": "COURSE",
                        "deepId": courseId,
                        "user": req.user._id
                    };
                    await Report.create({ ...reports });
                }
            }
            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    async enrollFreeCourse(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let { courseId } = req.params
            let course = await checkExistThenGet(courseId, Course);
            if (course.feesType == "WITH-FEES")
                return next(new ApiError(500, i18n.__('courseNotFree')));
            validatedBody.course = courseId;
            //check if user is new or exist
            let user = await checkExistThenGet(req.user._id, User);

            validatedBody.user = req.user._id
            if (!await CourseParticipant.findOne({ user: req.user._id, course: courseId, deleted: false })) {
                let arr = user.attendedCourses;
                var found = arr.find((e) => e == courseId);
                if (!found) {
                    user.attendedCourses.push(courseId);
                    await user.save();
                    await CourseParticipant.create({ ...validatedBody });
                    course.acceptanceNo = course.acceptanceNo + 1
                    await course.save();
                    let reports = {
                        "action": "user enrolled to course",
                        "type": "COURSE",
                        "deepId": courseId,
                        "user": req.user._id
                    };
                    await Report.create({ ...reports });
                }
            }
            res.status(201).send({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    },
    async getCourseParticipants(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;

            let query = { deleted: false, course: req.params.courseId }
            await CourseParticipant.find(query).populate(populateParticipantQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    let newdata = []
                    await Promise.all(data.map(async (e) => {
                        let index = await transformCourseParticipant(e, lang)
                        newdata.push(index)
                    }))
                    const count = await CourseParticipant.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
    //validate body
    validateSectionBody(isUpdate = false) {
        let validations = [
            body('section_en').not().isEmpty().withMessage((value, { req }) => {
                return req.__('section_en.required', { value });
            }),
            body('section_ar').not().isEmpty().withMessage((value, { req }) => {
                return req.__('section_ar.required', { value });
            }),
            body('videos').optional().custom(async (videos, { req }) => {
                for (let val of videos) {
                    body('title_en').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('title_en.required', { value });
                    }),
                        body('title_ar').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('title_ar.required', { value });
                        })
                    body('link').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('link.required', { value });
                    })
                    body('duration').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('duration.required', { value });
                    }).isNumeric().withMessage((value, { req }) => {
                        return req.__('duration.numeric', { value });
                    })
                }
                return true;
            }),
        ];
        return validations;
    },
    //add new course
    async createSection(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let { courseId } = req.params
            validatedBody.course = courseId
            let course = await checkExistThenGet(courseId, Course, { deleted: false })
            let business = await checkExistThenGet(course.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            let videos = [];
            for (let val of validatedBody.videos) {
                let secretKey = course.secretKey + process.env.encryptSecret
                val.link = await encryptedData(val.link, secretKey)
                videos.push(val)
            }
            validatedBody.videos = videos;
            course.sessionsNo = course.sessionsNo + videos.length
            let courseToturial = await CourseTutorial.create({ ...validatedBody });
            let tutorials = course.tutorials
            tutorials.push(courseToturial.id)
            course.tutorials = [...new Set(tutorials)];
            await course.save()
            let reports = {
                "action": "Create New course tutorial",
                "type": "COURSE",
                "deepId": courseToturial.id,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.status(201).send({
                success: true,
                data: courseToturial
            });
        } catch (error) {
            next(error);
        }
    },

    //update course
    async updateSection(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let { sectionId } = req.params
            let section = await checkExistThenGet(sectionId, CourseTutorial, { deleted: false })
            let course = await checkExistThenGet(section.course, Course, { deleted: false })
            let business = await checkExistThenGet(course.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            let videos = [];
            for (let val of validatedBody.videos) {
                let secretKey = course.secretKey + process.env.encryptSecret
                val.link = await encryptedData(val.link, secretKey)
                videos.push(val)
            }
            validatedBody.videos = videos;
            let courseToturial = await CourseTutorial.findByIdAndUpdate(sectionId, { ...validatedBody });

            let reports = {
                "action": "update New course tutorial",
                "type": "COURSE",
                "deepId": courseToturial.id,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.status(201).send({
                success: true,
                data: courseToturial
            });
        } catch (error) {
            next(error);
        }
    },
    //validate body
    validateSectionVideosBody(isUpdate = false) {
        let validations = [
            body('type').not().isEmpty().withMessage((value, { req }) => {
                return req.__('type.required', { value });
            }).isIn(['ADD', 'REMOVE']).withMessage((value, { req }) => {
                return req.__('type.invalid', { value });
            }),
            body('title_en').optional(),
            body('title_ar').optional(),
            body('video').optional(),
            body('duration').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('duration.numeric', { value });
            })
        ];
        return validations;
    },
    async updateSectionVideos(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            if (validatedBody.type == "REMOVE" && !validatedBody.video)
                return next(new ApiError(422, i18n.__('video.required')));
            if (validatedBody.type == "ADD" && !validatedBody.video) {
                if (!validatedBody.title_ar || !validatedBody.title_en || !validatedBody.duration)
                    return next(new ApiError(422, i18n.__('completeData')));

            }
            let { sectionId } = req.params
            let section = await checkExistThenGet(sectionId, CourseTutorial, { deleted: false })
            let course = await checkExistThenGet(section.course, Course, { deleted: false })
            let business = await checkExistThenGet(course.business, Business, { deleted: false })
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: business._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            //add video to section
            let arr = section.videos
            console.log(validatedBody.type)
            if (validatedBody.type == "ADD") {
                if (req.files) {
                    if (req.files['video']) {
                        let videos = [];
                        for (let imges of req.files['video']) {
                            videos.push(await toImgUrl(imges))
                        }
                        let secretKey = course.secretKey + process.env.encryptSecret
                        arr.push({
                            link: await encryptedData(videos[0], secretKey),
                            title_en: validatedBody.title_en,
                            title_ar: validatedBody.title_ar,
                            duration: validatedBody.duration,
                        })
                    }
                    course.sessionsNo = course.sessionsNo + 1
                }
            } else {
                //remove from video
                let index = arr.findIndex(e => e == validatedBody.video);
                for (var i = 0; i <= arr.length; i = i + 1) {
                    if (arr[i].link === arr[index].link) {
                        arr.splice(index, 1);
                    }
                }
                course.sessionsNo = course.sessionsNo - 1
            }
            section.videos = arr;
            await section.save();
            await course.save();
            let reports = {
                "action": "Update section video",
                "type": "COURSES",
                "deepId": course.id,
                "user": req.user._id
            };
            await Report.create({ ...reports });

            res.send({ success: true ,section:await checkExistThenGet(sectionId, CourseTutorial, { deleted: false })});
        } catch (err) {
            next(err);
        }
    },
    //delete 
    async deleteSection(req, res, next) {
        try {
            let { sectionId } = req.params;
            let section = await checkExistThenGet(sectionId, CourseTutorial);

            let course = await checkExistThenGet(section.course, Course);
            let business = await checkExistThenGet(course.business, Business);
            let businessManagement = await BusinessManagement.findOne({ deleted: false, business: course._id })
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                let supervisors = [business.owner]
                if (businessManagement) {
                    supervisors.push(...businessManagement.courses.supervisors)
                }
                if (!isInArray(supervisors, req.user._id))
                    return next(new ApiError(403, i18n.__('notAllow')));
            }
            let arr = course.tutorials;
            for (let i = 0; i <= arr.length; i = i + 1) {
                if (arr[i] == section.id) {
                    arr.splice(i, 1);
                }
            }
            course.sessionsNo = course.sessionsNo + section.videos.length
            course.tutorials = arr;
            await course.save();
            section.deleted = true;
            await section.save();
            let reports = {
                "action": "Delete course section",
                "type": "COURSE",
                "deepId": section.course,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    async approve(req, res, next) {
        try {
            let { courseId } = req.params;
            let course = await checkExistThenGet(courseId, Course);
            course.showingStatus = "APPROVED"
            await course.save();
            let reports = {
                "action": "Approve course ",
                "type": "COURSE",
                "deepId": courseId,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },
    async reject(req, res, next) {
        try {
            let { courseId } = req.params;
            let course = await checkExistThenGet(courseId, Course);
            course.showingStatus = "REJECTED"
            await course.save();
            let reports = {
                "action": "Reject course ",
                "type": "COURSE",
                "deepId": courseId,
                "user": req.user._id
            };
            await Report.create({ ...reports });
            res.send({
                success: true
            });
        } catch (err) {
            next(err);
        }
    },

}