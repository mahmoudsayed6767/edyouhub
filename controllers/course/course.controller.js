import Course from "../../models/course/course.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformCourse,transformCourseById } from "../../models/course/transformCourse";
import Business from "../../models/business/business.model";
import User from "../../models/user/user.model";
import { checkExist, checkExistThenGet,isInArray} from "../../helpers/CheckMethods";

import Branch from "../../models/branch/branch.model";
import Specialization from "../../models/specialization/specialization.model"
import CourseParticipant from "../../models/course/courseParticipant.model";
import {transformUser} from "../../models/user/transformUser"
import ApiError from "../../helpers/ApiError";
import BusinessManagement from "../../models/business/businessManagement.model"
import City from "../../models/city/city.model"
import Country from "../../models/country/country.model"
import Area from "../../models/area/area.model"
import { toImgUrl } from "../../utils";

const populateQuery = [
    { path: 'business', model: 'business' },
    { path: 'specializations', model: 'specialization'},
    { path: 'instractors', model: 'business'},
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
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('name_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('name_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('description_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description_en.required', { value});
            }),
            body('description_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description_ar.required', { value});
            }),
            body('sessionsNo').not().isEmpty().withMessage((value, { req}) => {
                return req.__('sessionsNo.required', { value});
            }),
            body('maxApplications').not().isEmpty().withMessage((value, { req}) => {
                return req.__('maxApplications.required', { value});
            }),
            body('maxAcceptance').not().isEmpty().withMessage((value, { req}) => {
                return req.__('maxAcceptance.required', { value});
            }),
            body('specializations').not().isEmpty().withMessage((value, { req}) => {
                return req.__('specializations.required', { value});
            })
            .custom(async (specializations, { req }) => {
                for (let value of specializations) {
                    if (!await Specialization.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('specialization.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('instractors').not().isEmpty().withMessage((value, { req}) => {
                return req.__('instractors.required', { value});
            })
            .custom(async (instractors, { req }) => {
                for (let value of instractors) {
                    if (!await Business.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('instractor.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('fromDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fromDate.required', { value});
            }).isISO8601().withMessage((value, { req}) => {
                return req.__('invalid.date', { value});
            }),
            body('toDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('toDate.required', { value});
            }).isISO8601().withMessage((value, { req}) => {
                return req.__('invalid.date', { value});
            }),
            body('business').not().isEmpty().withMessage((value, { req}) => {
                return req.__('business.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('business.numeric', { value});
            }),
            body('branches').not().isEmpty().withMessage((value, { req}) => {
                return req.__('branches.required', { value});
            })
            .custom(async (branches, { req }) => {
                for (let value of branches) {
                    if (!await Branch.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('branches.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('dailyTimes').not().isEmpty().withMessage((value, { req}) => {
                return req.__('dailyTimes.required', { value});
            }).custom(async (dailyTimes, { req }) => {
                for (let val of dailyTimes) {
                    body('day').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('day.required', { value});
                    }),
                    body('fromDate').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('fromDate.required', { value});
                    }).isISO8601().withMessage((value, { req}) => {
                        return req.__('invalid.date', { value});
                    }),
                    body('toDate').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('toDate.required', { value});
                    }).isISO8601().withMessage((value, { req}) => {
                        return req.__('invalid.date', { value});
                    })
                }
                return true;
            }),
            body('paymentMethod').not().isEmpty().withMessage((value, { req}) => {
                return req.__('paymentMethod.required', { value});
            }).isIn(['CASH','INSTALLMENT'])
            .withMessage((value, { req}) => {
                return req.__('paymentMethod.invalid', { value});
            }),
            body('cashPrice').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('cashPrice.numeric', { value});
            }),
            body('installmentPrice').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('installmentPrice.numeric', { value});
            }),
            body('installments').optional()
            .custom(async (installments, { req }) => {
                for (let val of installments) {
                    body('price').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('price.required', { value});
                    })
                }
                return true;
            }),
            body('imgs').optional(),
            body('ownerType').optional()
            
        ];
        return validations;
    },
    //add new course
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.course.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)
            let course = await Course.create({ ...validatedBody });
            let reports = {
                "action":"Create New course",
                "type":"COURSE",
                "deepId":course.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:course
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
            await checkExist(courseId, Course, { deleted: false });
            await Course.findById(courseId)
            .populate(populateQuery)
            .then(async(e) => {
                let course = await transformCourseById(e,lang)
                res.send({
                    success:true,
                    data:course
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
            await checkExist(courseId,Course, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.course.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)

            await Course.findByIdAndUpdate(courseId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action":"Update course",
                "type":"COURSE",
                "deepId":courseId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({
                success:true
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
            let {search,instractor,paymentMethod,specialization,business,status,ownerType} = req.query;

            let query = {deleted: false }
             /*search  */
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {title: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {description: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(instractor) query.instractors = instractor
            if(paymentMethod) query.paymentMethod = paymentMethod;
            if(specialization) query.specialization = specialization
            if(business) query.business = business
            if(status) query.status = status
            if(ownerType) query.ownerType = ownerType;

            await Course.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCourse(e,lang)
                        newdata.push(index)
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
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {search,instractor,paymentMethod,specialization,business,status,ownerType} = req.query;

            let query = {deleted: false }
            /*search  */
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {title: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {description: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(instractor) query.instractors = instractor
            if(paymentMethod) query.paymentMethod = paymentMethod;
            if(specialization) query.specialization = specialization
            if(business) query.business = business
            if(status) query.status = status
            if(ownerType) query.ownerType = ownerType;

            await Course.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformCourse(e,lang)
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
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:course._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.course.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            course.deleted = true;
            await course.save();
            let reports = {
                "action":"Delete course",
                "type":"COURSE",
                "deepId":courseId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({
                success:true
            });
        } catch (err) {
            next(err);
        }
    },
    validateAddParticipantBody(newUser = false) {
        console.log("newUser",newUser);
        let validations = [
            body('paymentMethod').not().isEmpty().withMessage((value, { req}) => {
                return req.__('paymentMethod.required', { value});
            }).isIn(['CASH','INSTALLMENT'])
            .withMessage((value, { req}) => {
                return req.__('paymentMethod.invalid', { value});
            }),
            body('fawryCode').optional()
        ];
        if (!newUser)
            validations.push([
                body('user').optional().isNumeric().withMessage((value, { req}) => {
                    return req.__('user.numeric', { value});
                }).custom(async (value, { req }) => {
                    if (!await User.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }),
            ])
        if (newUser)
            validations.push([
                body('fullname').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('fullname.required', { value});
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
                body('phone').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('phone.required', { value});
                })
                .custom(async (value, { req }) => {
                    var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                    if(!exp.test(value)){
                        throw new Error(req.__('phone.syntax'));
                    }
                    let userQuery = { phone: value,deleted:false ,accountType:'ACTIVE'};
    
                    if (await User.findOne(userQuery))
                        throw new Error(req.__('phone.duplicated'));
                    else
                        return true;
                    
                }),
                body('email').optional().isEmail().withMessage('email.syntax')
                .custom(async (value, { req }) => {
                    let userQuery = { email: value,deleted:false ,accountType:'ACTIVE'};

                    if (await User.findOne(userQuery))
                        throw new Error(req.__('email.duplicated'));
                    else
                        return true;
                    
                }),
                body('country').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('country.required', { value});
                }).isNumeric().withMessage((value, { req}) => {
                    return req.__('country.numeric', { value});
                }).custom(async (value, { req }) => {
                    if (!await Country.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('country.invalid'));
                    else
                        return true;
                }),
                body('city').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('city.required', { value});
                }).isNumeric().withMessage((value, { req}) => {
                    return req.__('city.numeric', { value});
                }).custom(async (value, { req }) => {
                    if (!await City.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('city.invalid'));
                    else
                        return true;
                }),
                body('area').not().isEmpty().withMessage((value, { req}) => {
                    return req.__('area.required', { value});
                }).isNumeric().withMessage((value, { req}) => {
                    return req.__('area.numeric', { value});
                }).custom(async (value, { req }) => {
                    if (!await Area.findOne({_id:value,deleted:false}))
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
            let {courseId} = req.params
            let course = await checkExistThenGet(courseId, Course);
            //check permission
            let business = await checkExistThenGet(course.business,Business,{ deleted: false})
            let businessManagement = await BusinessManagement.findOne({deleted:false,business:business._id})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [business.owner]
                if(businessManagement){
                    supervisors.push(...businessManagement.course.supervisors)
                }
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            validatedBody.course = courseId;
            //check if user is new or exist
            let attendedUser;
            if(!validatedBody.user){
                validatedBody.type = "USER"
                let unActiveUsers = await User.find({deleted: false,accountType:'SIGNUP-PROCESS',phone: validatedBody.phone})
                for (let id of unActiveUsers) {
                    id.deleted = true;
                    await id.save();
                }
                attendedUser = await User.create({... validatedBody});
            }else{
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
            if(!await CourseParticipant.findOne({ user: validatedBody.user, course: courseId,deleted:false})){
                let arr = attendedUser.attendedCourses;
                var found = arr.find((e) => e == courseId); 
                if(!found){
                    attendedUser.attendedCourses.push(courseId);
                    await attendedUser.save();
                    await CourseParticipant.create({ ...validatedBody });
                    let reports = {
                        "action":"user will attend to course",
                        "type":"COURSE",
                        "deepId":courseId,
                        "user": req.user._id
                    };
                    await Report.create({...reports});
                }
            }
            res.status(201).send({
                success:true,
            });
        } catch (error) {
            next(error);
        }
    },
    async getCourseParticipants(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            
            let ids = await CourseParticipant.find({course:req.params.courseId})
                .distinct('user')
            let query = {deleted: false,_id:ids };
            await User.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformUser(e,lang)
                        newdata.push(index)
                    }))
                    const count = await User.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
}