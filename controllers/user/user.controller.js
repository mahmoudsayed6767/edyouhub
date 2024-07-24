import { checkExistThenGet, checkExist, isInArray } from '../../helpers/CheckMethods';
import { body } from 'express-validator';
import { checkValidations, handleImg } from '../shared/shared.controller';
import { generateToken } from '../../utils/token';
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import bcrypt from 'bcryptjs';
import { generateCode, generateMaxCode } from '../../services/generator-code-service';
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import i18n from "i18n";
import { transformUser, transformUserById, transformUserShort } from '../../models/user/transformUser';
import Business from "../../models/business/business.model";
import Country from "../../models/country/country.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import Address from "../../models/address/address.model"
import { transformAddress } from "../../models/address/transformAddress"
import Fund from "../../models/fund/fund.model";
import HigherEducation from "../../models/higherEducation/higherEducation.model"
import EducationSystem from "../../models/education system/education system.model"
import Activity from "../../models/user/activity.model";
import { transformActivity } from "../../models/user/transformActivity"
import AdmissionRequest from "../../models/admissionRequest/admissionRequest.model";
import Follow from "../../models/follow/follow.model";
import VacancyRequest from "../../models/vacancyRequest/vacancyRequest.model";
import Post from "../../models/post/post.model";
import Connection from "../../models/connection/connection.model";
import Notif from "../../models/notif/notif.model";
import Message from "../../models/message/message.model";
import Order from "../../models/order/order.model";

const populateQuery = [
    { path: 'package', model: 'package' },
];
const populateQueryById = [
    { path: 'place', model: 'place' },
    { path: 'package', model: 'package' },
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    { path: 'affiliate', model: 'user' },
    { path: 'package', model: 'package' },
    { path: 'higherEducation.higherEducation', model: 'higherEducation' },
    { path: 'kids.educationSystem', model: 'educationSystem' }

];
const populateQuery2 = [
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
];
const populateActivityQuery = [{
        path: 'user',
        model: 'user',
        populate: { path: 'package', model: 'package' },
    },
    { path: 'post', model: 'post' },
];

export default {
    async addUser(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);

            if (!isInArray(["ADMIN", "SUB-ADMIN", "PLACE"], req.user.type))
                return next(new ApiError(403, i18n.__('notAllow')));

            if (req.user.type == "PLACE" && validatedBody.type != "SUBERVISOR") {
                return next(new ApiError(403, i18n.__('notAllow')));
            }
            if (validatedBody.type == "SUBERVISOR" && !validatedBody.place) {
                return next(new ApiError(422, i18n.__('place.required')));
            }
            if (validatedBody.type == "affiliate") {
                validatedBody.affiliateCode = generateCode(6)
            }
            validatedBody.username = generateMaxCode(8)

            //delete un active users with the same phone
            let unActiveUsers = await User.find({ deleted: false, accountType: 'SIGNUP-PROCESS', phone: validatedBody.phone })
            for (let id of unActiveUsers) {
                id.deleted = true;
                await id.save();
            }

            validatedBody.accountType = "ACTIVE"
            validatedBody.phoneVerify = true;
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            let createdUser = await User.create({
                ...validatedBody
            });
            let reports = {
                "action": "Add User",
                "type": "USERS",
                "deepId": createdUser.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await User.findById(createdUser.id).populate(populateQueryById)
                .then(async(e) => {
                    let index = await transformUserById(e, lang)
                    res.status(201).send({
                        success: true,
                        data: index,
                    });
                })
        } catch (err) {
            next(err);
        }
    },
    async block(req, res, next) {
        try {
            let { userId } = req.params;
            let user = await checkExistThenGet(userId, User);
            user.block = true;
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: userId,
                fromUser: user._id,
                text: 'logout',
                subject: userId,
                body: 'logout',
                info: 'LOGOUT',
                content_available: true
            });
            let reports = {
                "action": "Block User",
                "type": "USERS",
                "deepId": userId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({ success: true });
        } catch (error) {
            next(error);
        }
    },
    async unblock(req, res, next) {
        try {
            let { userId } = req.params;
            let user = await checkExistThenGet(userId, User);
            user.block = false;
            await user.save();
            let reports = {
                "action": "remove Block User",
                "type": "USERS",
                "deepId": userId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({ success: true });
        } catch (error) {
            next(error);
        }
    },
    validateUpdatedPassword(isUpdate = false) {
        let validation = [
            body('newPassword').not().isEmpty().withMessage((value, { req }) => {
                return req.__('newPassword.required', { value });
            }).isLength({ min: 6 }).withMessage((value, { req }) => {
                return req.__('newPassword.invalid', { value });
            }),
            body('currentPassword').not().isEmpty().withMessage((value, { req }) => {
                return req.__('currentPassword.required', { value });
            }).isLength({ min: 6 }).withMessage((value, { req }) => {
                return req.__('currentPassword.invalid', { value });
            }),

        ];

        return validation;
    },
    async updatePassword(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let user = await checkExistThenGet(req.user._id, User);
            if (req.body.newPassword) {
                if (req.body.currentPassword) {
                    if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
                        user.password = req.body.newPassword;
                    } else {
                        res.status(400).send({
                            errors: [{
                                location: 'body',
                                param: 'currentPassword',
                                msg: i18n.__('currentPassword.invalid')
                            }]
                        });
                    }
                }
            }
            await user.save();
            await User.findById(req.user._id).populate(populateQueryById)
                .then(async(e) => {
                    let index = await transformUserById(e, lang)
                    res.send({
                        success: true,
                        data: index,
                        token: generateToken(req.user._id)
                    });
                })

        } catch (error) {
            next(error);
        }
    },
    async findById(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let { id } = req.params;
            await checkExist(id, User, { deleted: false });
            let { userId } = req.query;
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            await User.findById(id).populate(populateQueryById)
                .then(async(e) => {
                    let index = await transformUserById(e, lang, myUser, userId)
                    let funds = await Fund.find({ deleted: false, status: { $in: ['ACCEPTED', 'STARTED', 'COMPLETED'] }, owner: id }).distinct('totalFees')
                    let totalFunds = 0;
                    funds.forEach(element => {
                        totalFunds += element
                    });
                    index.totalFunds = totalFunds
                    index.business = await Business.countDocuments({ deleted: false, status: 'ACCEPTED', owner: id })
                    index.connections = e.connections.length
                    res.send({ success: true, data: index });
                })

        } catch (error) {
            next(error);
        }
    },
    async findAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20,
                { thePackage,name, email, phone, userId, cashBack, phoneVerify, search, accountType, type, active, place } = req.query;

            let query = { deleted: false };
            if (place) query.place = place
            if (phoneVerify == "true") query.phoneVerify = true;
            if (phoneVerify == "false") query.phoneVerify = false;
            if (type) query.type = type;
            if (accountType) query.accountType = accountType;
            if (active == "true") query.active = true;
            if (active == "false") query.active = false;
            if (cashBack == "true") query.cashBack = true;
            if (cashBack == "false") query.cashBack = false;
            if (search) {
                Object.assign(query, {
                    $and: [{
                            $or: [
                                { fullname: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { phone: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { email: { $regex: '.*' + search + '.*', '$options': 'i' } },
                            ]
                        },
                        { deleted: false },
                    ]
                })
            }
            if (name) {
                Object.assign(query, {
                    fullname: { $regex: '.*' + name + '.*', '$options': 'i' },
                })
            }
            if (email) {
                Object.assign(query, {
                    email: { $regex: '.*' + email + '.*', '$options': 'i' },
                })
            }
            if (phone) {
                Object.assign(query, {
                    phone: { $regex: '.*' + phone + '.*', '$options': 'i' },
                })
            }
            if(thePackage) query.package = thePackage
            let sortd = { createdAt: -1 }
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            await User.find(query).populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e) => {
                        let index = await transformUser(e, lang, myUser, userId)
                        newdata.push(index)
                    }))

                    const usersCount = await User.countDocuments(query);
                    const pageCount = Math.ceil(usersCount / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, usersCount, req));
                })

        } catch (err) {
            next(err);
        }
    },
    async getAll(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let { thePackage,name, email, phone, userId, cashBack, phoneVerify, search, accountType, type, active, place } = req.query;

            let query = { deleted: false };
            if (phoneVerify == "true") query.phoneVerify = true;
            if (phoneVerify == "false") query.phoneVerify = false;
            if (type) query.type = type;
            if (place) query.place = place;
            if (accountType) query.accountType = accountType;
            if (active == "true") query.active = true;
            if (active == "false") query.active = false;
            if (cashBack == "true") query.cashBack = true;
            if (cashBack == "false") query.cashBack = false;
            if (search) {
                Object.assign(query, {
                    $and: [{
                            $or: [
                                { fullname: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { phone: { $regex: '.*' + search + '.*', '$options': 'i' } },
                                { email: { $regex: '.*' + search + '.*', '$options': 'i' } },

                            ]
                        },
                        { deleted: false },
                    ]
                })
            }
            if (name) {
                Object.assign(query, {
                    fullname: { $regex: '.*' + name + '.*', '$options': 'i' },
                })
            }
            if (email) {
                Object.assign(query, {
                    email: { $regex: '.*' + email + '.*', '$options': 'i' },
                })
            }
            if (phone) {
                Object.assign(query, {
                    phone: { $regex: '.*' + phone + '.*', '$options': 'i' },
                })
            }
            if(thePackage) query.package = thePackage
            let sortd = { createdAt: -1 }
            let myUser
            if (userId) {
                myUser = await checkExistThenGet(userId, User)
            }
            await User.find(query).populate(populateQuery)
                .sort(sortd)
                .then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e) => {
                        let index = await transformUserShort(e, lang, myUser, userId)
                        newdata.push(index)
                    }))
                    res.send({ success: true, data: newdata });
                });
        } catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            let { userId } = req.params;
            let user = await checkExistThenGet(userId, User, { deleted: false });
            //place delete SUBERVISOR
            if (req.user.type == "PLACE" && req.user.place != user.place) {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            /*delete posts under event */
            let posts = await Post.find({ owner: userId });
            for (let id of posts) {
                id.deleted = true;
                await id.save();
            }
            /*delete admissionRequests under group */
            let admissionRequests = await AdmissionRequest.find({ owner: userId });
            for (let id of admissionRequests) {
                id.deleted = true;
                await id.save();
            }
            /*delete vacancyRequests under group */
            let vacancyRequests = await VacancyRequest.find({ owner: userId });
            for (let id of vacancyRequests) {
                id.deleted = true;
                await id.save();
            }
            //remove messages
            let msgs = await Message.find({ $or: [{ to: userId }, { from: userId }] });
            for (let id of msgs) {
                id.deleted = true;
                await id.save();
            }
            //remove connection
            let connections = await Connection.find({ $or: [{ to: userId }, { from: userId }] });
            for (let id of connections) {
                id.deleted = true;
                await id.save();
            }
            //remove follow
            let follows = await Follow.find({ user: userId });
            for (let id of follows) {
                id.deleted = true;
                await id.save();
            }
            //remove notifs
            let notifs = await Notif.find({ $or: [{ resource: userId }, { target: userId }] });
            for (let id7 of notifs) {
                id7.deleted = true;
                await id7.save();
            }
            //remove activities
            let activities = await Activity.find({ user: userId });
            for (let id7 of activities) {
                id7.deleted = true;
                await id7.save();
            }
            //remove orders
            let orders = await Order.find({ client: userId });
            for (let id7 of orders) {
                id7.deleted = true;
                await id7.save();
            }
            //remove business
            let business = await Business.find({ owner: userId });
            for (let id7 of business) {
                id7.deleted = true;
                await id7.save();
            }
            user.deleted = true
            await user.save();
            let reports = {
                "action": "Delete User",
                "type": "USERS",
                "deepId": user.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({ success: true });
        } catch (err) {
            next(err);
        }
    },
    validateUpdatedUser(isUpdate = true) {
        let validation = [
            body('bio').optional(),
            body('affiliateCode').optional(),
            body('fullname').optional(),
            body('phone').optional()
            .custom(async(value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if (!exp.test(value)) {
                    throw new Error(req.__('phone.syntax'));
                }
                let { userId } = req.params;
                let user = await checkExistThenGet(userId, User);
                let userQuery = { phone: value, deleted: false };
                if (isUpdate && user.phone === value)
                    userQuery._id = { $ne: userId };

                if (await User.findOne(userQuery))
                    throw new Error(req.__('phone.duplicated'));
                else
                    return true;
            }),
            body('email').optional().isEmail().withMessage('email.syntax')
            .custom(async(value, { req }) => {
                let { userId } = req.params;
                let user = await checkExistThenGet(userId, User);
                let userQuery = { email: { $regex: value, '$options': 'i' }, deleted: false };
                if (isUpdate && user.email == value)
                    userQuery._id = { $ne: userId };

                if (await User.findOne(userQuery))
                    throw new Error(req.__('email.duplicated'));
                else
                    return true;
            }),
            body('country').not().isEmpty().withMessage((value, { req }) => {
                return req.__('country.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('country.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await Country.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').not().isEmpty().withMessage((value, { req }) => {
                return req.__('city.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('city.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await City.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').not().isEmpty().withMessage((value, { req }) => {
                return req.__('area.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('area.numeric', { value });
            }).custom(async(value, { req }) => {
                if (!await Area.findOne({ _id: value, deleted: false }))
                    throw new Error(req.__('area.invalid'));
                else
                    return true;
            }),
            body('type').optional().isIn(['PLACE', 'SUBERVISOR', 'ADMIN', 'USER', 'AGENCY', 'AFFILIATE']).withMessage((value, { req }) => {
                return req.__('wrong.type', { value });
            }),

        ];
        if (isUpdate)
            validation.push([
                body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req }) => {
                    return req.__('image.invalid', { value });
                })
            ]);

        return validation;
    },
    async updateUser(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);

            let { userId } = req.params;
            let user = await checkExistThenGet(userId, User);
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (user.type == "SUBERVISOR" && req.user.type == "PLACE") {
                    if (user.place != req.user.place)
                        return next(new ApiError(403, i18n.__('notAllow')));
                } else {
                    if (userId != req.user._id)
                        return next(new ApiError(403, i18n.__('notAllow')));

                }

            }
            if (user.affiliateCode) {
                let affiliate = await User.findOne({ deleted: false, affiliateCode: user.affiliateCode })
                if (affiliate)
                    validatedBody.affiliate = affiliate
            }
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            await User.findByIdAndUpdate(userId, {...validatedBody }, { new: true });
            let activityBody = {user:req.user._id,action:'UPDATE-USER-ACCOUNT'}
            await Activity.create({... activityBody});
            let reports = {
                "action": "Update User",
                "type": "USERS",
                "deepId": user.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await User.findById(userId).populate(populateQueryById)
                .then(async(e) => {
                    let index = await transformUserById(e, lang)
                    res.send({
                        success: true,
                        data: index,
                        token: generateToken(userId)
                    });
                })


        } catch (error) {
            next(error);
        }
    },
    validateCompleteProfile(isUpdate = true) {
        let validation = [

            //additional info 
            body('educationPhase').optional().isIn(['STUDENT', 'GRADUATED']).withMessage((value, { req }) => {
                return req.__('wrong.educationPhase', { value });
            }),
            body('schoolInfo.schoolName').optional(),
            body('schoolInfo.year').optional(),
            body('schoolInfo.graduated').optional(),
            body('schoolInfo.graduationDate').optional(),

            body('universityInfo.universityName').optional(),
            body('universityInfo.facultyName').optional(),
            body('universityInfo.year').optional(),
            body('universityInfo.graduated').optional(),
            body('universityInfo.graduationDate').optional(),

            body('higherEducation').optional()
            .custom(async(higherEducation, { req }) => {
                for (let val of higherEducation) {
                    body('higherEducation').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('higherEducation.required', { value });
                        }).isNumeric().withMessage((value, { req }) => {
                            return req.__('higherEducation.numeric', { value });
                        }).custom(async(value, { req }) => {
                            if (!await HigherEducation.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('higherEducation.invalid'));
                            else
                                return true;
                        }),
                        body('faculty').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('faculty.required', { value });
                        })
                }
                return true;
            }),
            body('courses').optional()
            .custom(async(courses, { req }) => {

                for (let course of courses) {
                    body('organization').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('organization.required', { value });
                        }),
                        body('courseName').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('courseName.required', { value });
                        })
                }
                return true;
            }),
            body('job.workType').optional().isIn(['EDUCATION', 'OTHER']).withMessage((value, { req }) => {
                return req.__('wrong.workType', { value });
            }),
            body('job.educationField').optional().isIn(['TEACHING', 'NON-TEACHING']).withMessage((value, { req }) => {
                return req.__('wrong.workType', { value });
            }),
            body('job.subject').optional(),
            body('job.organization').optional(),
            body('job.jobTitle').optional(),


            body('experiencesType').optional().isIn(['EDUCATION', 'OTHER']).withMessage((value, { req }) => {
                return req.__('wrong.experiencesType', { value });
            }),
            body('experiencesOrganization').optional(),
            body('experiencesProfession').optional(),
            body('workExperiences').optional()
            .custom(async(workExperiences, { req }) => {
                for (let val of workExperiences) {
                    body('organization').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('organization.required', { value });
                        }),
                        body('jobTitle').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('jobTitle.required', { value });
                        }),
                        body('startDate').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('startDate.required', { value });
                        }),
                        body('endDate').optional()
                }
                return true;
            }),
            body('kids').optional()
            .custom(async(kids, { req }) => {

                for (let kid of kids) {
                    body('fullname').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('fullname.required', { value });
                        }),
                        body('age').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('age.required', { value });
                        }),
                        body('educationSystem').not().isEmpty().withMessage((value, { req }) => {
                            return req.__('educationSystem.required', { value });
                        }).isNumeric().withMessage((value, { req }) => {
                            return req.__('educationSystem.numeric', { value });
                        }).custom(async(value, { req }) => {
                            if (!await EducationSystem.findOne({ _id: value, deleted: false }))
                                throw new Error(req.__('educationSystem.invalid'));
                            else
                                return true;
                        }),
                        body('educationInstitutionName').optional(),
                        body('year').optional()
                }
                return true;
            }),
        ];
        if (isUpdate)
            validation.push([
                body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req }) => {
                    return req.__('image.invalid', { value });
                })
            ]);

        return validation;
    },
    async completeProfile(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);

            let { userId } = req.params;
            let user = await checkExistThenGet(userId, User);
            if (!isInArray(["ADMIN", "SUB-ADMIN"], req.user.type)) {
                if (user.type == "SUBERVISOR" && req.user.type == "PLACE") {
                    if (user.place != req.user.place)
                        return next(new ApiError(403, i18n.__('notAllow')));
                } else {
                    if (userId != req.user._id)
                        return next(new ApiError(403, i18n.__('notAllow')));

                }

            }
            await User.findByIdAndUpdate(userId, {...validatedBody }, { new: true });

            let reports = {
                "action": "complete User profile",
                "type": "USERS",
                "deepId": user.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await User.findById(userId).populate(populateQueryById)
                .then(async(e) => {
                    let index = await transformUserById(e, lang)
                    res.send({
                        success: true,
                        data: index
                    });
                })


        } catch (error) {
            next(error);
        }
    },
    validateAddAddress(isUpdate = false) {
        let validations = [
            body('address').not().isEmpty().withMessage((value, { req }) => {
                return req.__('address.required', { value });
            }),
            body('street').not().isEmpty().withMessage((value, { req }) => {
                return req.__('street.required', { value });
            }),
            body('floor').not().isEmpty().withMessage((value, { req }) => {
                return req.__('floor.required', { value });
            }),
            body('buildingNumber').not().isEmpty().withMessage((value, { req }) => {
                return req.__('buildingNumber.required', { value });
            }),
            body('city').not().isEmpty().withMessage((value, { req }) => {
                return req.__('city.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('city.numeric', { value });
            }),
            body('area').not().isEmpty().withMessage((value, { req }) => {
                return req.__('area.required', { value });
            }).isNumeric().withMessage((value, { req }) => {
                return req.__('area.numeric', { value });
            }),

        ];
        return validations;
    },
    async addAddress(req, res, next) {
        try {

            let validatedBody = checkValidations(req);
            validatedBody.user = req.user
            await Address.create({
                ...validatedBody
            });

            res.status(201).send({ success: true });

        } catch (err) {
            next(err);
        }
    },
    async getAddress(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let userId = req.user._id;
            let query = { deleted: false, user: userId };

            await Address.find(query).populate(populateQuery2)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformAddress(e, lang)
                        newdata.push(index);
                    }))
                    const count = await Address.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })


        } catch (err) {
            next(err);
        }
    },
    async getActivities(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let {userId} = req.params;
            let query = { deleted: false, user:userId };
            await Activity.find(query).populate(populateActivityQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformActivity(e, lang)
                        newdata.push(index);
                    }))
                    const count = await Activity.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })


        } catch (err) {
            next(err);
        }
    },
    async transferCoins(req, res, next) {
        try {
            let user = await checkExistThenGet(req.user._id, User);
            user.balance = 0;
            await user.save();
            let reports = {
                "action": "transfer Coins",
                "type": "USERS",
                "deepId": req.user._id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({ success: true });
        } catch (error) {
            next(error);
        }
    },
};