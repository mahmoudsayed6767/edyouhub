import Event from "../../models/event/event.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformEvent, transformEventById } from "../../models/event/transformEvent";
import Business from "../../models/business/business.model";
import Post from "../../models/post/post.model";
import User from "../../models/user/user.model";
import { checkExist, checkExistThenGet, isLat, isLng, isInArray } from "../../helpers/CheckMethods";
import { ValidationError } from "mongoose";
import FollowEvent from "../../models/event/followEvent.model";
import EventAttendance from "../../models/event/eventAttendance.model";
import { transformUser } from "../../models/user/transformUser"
import ApiError from "../../helpers/ApiError";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import AccessEvent from "../../models/event/accessEvent.model";
import Activity from "../../models/user/activity.model";

const populateQuery = [
    { path: 'business', model: 'business' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },

];
//validate location
async function validatedLocation(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lng.validate") });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lat.validate") });
    return true;
}

export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('title').not().isEmpty().withMessage((value, { req }) => {
                return req.__('title.required', { value });
            }),
            body('description').not().isEmpty().withMessage((value, { req }) => {
                return req.__('description.required', { value });
            }),
            body('shortDescription').optional(),
            body('privacyType').not().isEmpty().withMessage((value, { req }) => {
                return req.__('privacyType.required', { value });
            }).isIn(['PRIVAET', 'PUBLIC']).withMessage((value, { req }) => {
                return req.__('privacyType.invalid', { value });
            }),
            body('accessCode').optional(),
            body('type').not().isEmpty().withMessage((value, { req }) => {
                return req.__('type.required', { value });
            }).isIn(['ANNONCE', 'TRIP','CAMP','CONCERT','STAGE-EVENT','FAIR','BAZAR']).withMessage((value, { req }) => {
                return req.__('type.invalid', { value });
            }),
            body('owners').not().isEmpty().withMessage((value, { req }) => {
                return req.__('owners.required', { value });
            }).isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('owners.atLeastOne', { value});
            }).custom(async(owners, { req }) => {
                for (let val of owners) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('hosts').not().isEmpty().withMessage((value, { req }) => {
                return req.__('hosts.required', { value });
            }).isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('hosts.atLeastOne', { value});
            }).custom(async(hosts, { req }) => {
                for (let val of hosts) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('organizers').not().isEmpty().withMessage((value, { req }) => {
                return req.__('organizers.required', { value });
            }).isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('organizers.atLeastOne', { value});
            }).custom(async(organizers, { req }) => {
                for (let val of organizers) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('sponsers').optional().isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('sponsers.atLeastOne', { value});
            }).custom(async(sponsers, { req }) => {
                for (let val of sponsers) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('speakers').optional().isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('speakers.atLeastOne', { value});
            }).custom(async(speakers, { req }) => {
                for (let val of speakers) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('partners').optional().isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('partners.atLeastOne', { value});
            }).custom(async(partners, { req }) => {
                for (let val of partners) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('exhibitors').optional().isLength({ min: 1 }).withMessage((value, { req}) => {
                return req.__('exhibitors.atLeastOne', { value});
            }).custom(async(exhibitors, { req }) => {
                for (let val of exhibitors) {
                    body('name').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('name.required', { value });
                    }),
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    }),
                    body('phone').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('phone.required', { value });
                    }),
                    body('email').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('email.required', { value });
                    }),
                    body('website').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('website.required', { value });
                    }),
                    body('logo').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('logo.required', { value });
                    }),
                    body('flag').optional(),
                    body('appLink').optional()
                }
                return true;
            }),
            body('daysCount').optional(),
            body('travelType').optional().isIn(['LOCAL','ABROAD']).withMessage((value, { req }) => {
                return req.__('travelType.invalid', { value });
            }),
            body('transportation').optional(),

            body('nationalityType').optional().isIn(['NATIONAL','INTERNAIONAL']).withMessage((value, { req }) => {
                return req.__('nationalityType.invalid', { value });
            }),
            body('address').not().isEmpty().withMessage((value, { req }) => {
                return req.__('address.required', { value });
            }),
            body('location').not().isEmpty().withMessage((value, { req }) => {
                return req.__('location.required', { value });
            }).custom(async(value, { req }) => {
                await validatedLocation(value);
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
            body('contactNumbers').not().isEmpty().withMessage((value, { req }) => {
                return req.__('contactNumbers.required', { value });
            }),
            body('email').not().isEmpty().withMessage((value, { req }) => {
                return req.__('email.required', { value });
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
            }),
            body('business').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('business.numeric', { value });
            }),
            body('dailyTimes').optional()
            .custom(async(dailyTimes, { req }) => {
                for (let val of dailyTimes) {
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
            body('feesType').not().isEmpty().withMessage((value, { req }) => {
                return req.__('feesType.required', { value });
            }).isIn(['NO-FEES', 'WITH-FEES']).withMessage((value, { req }) => {
                return req.__('feesType.invalid', { value });
            }),
            body('paymentMethod').optional().isIn(['CASH', 'INSTALLMENT', 'BOTH'])
            .withMessage((value, { req }) => {
                return req.__('paymentMethod.invalid', { value });
            }),
            body('tickets').optional()
            .custom(async(tickets, { req }) => {
                for (let val of tickets) {
                    body('type').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('type.required', { value });
                    })
                    body('cashPrice').optional().isNumeric().withMessage((value, { req }) => {
                        return req.__('cashPrice.numeric', { value });
                    }),
                    body('installmentPrice').optional().isNumeric().withMessage((value, { req }) => {
                        return req.__('installmentPrice.numeric', { value });
                    })
                }
                return true;
            }),
            
            
            body('installments').optional()
            .custom(async(installments, { req }) => {
                for (let val of installments) {
                    body('price').not().isEmpty().withMessage((value, { req }) => {
                        return req.__('price.required', { value });
                    })
                }
                return true;
            }),
            body('imgs').optional(),
            body('ownerType').optional(),
            body('discount').optional().isNumeric().withMessage((value, { req }) => {
                return req.__('discount.numeric', { value });
            }),
            body('discountType').optional()

        ];
        return validations;
    },
    //add new event
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            if (validatedBody.feesType == 'WITH-FEES') {
                if (!validatedBody.paymentMethod) {
                    return next(new ApiError(422, i18n.__('paymentMethod.required')));
                } else {
                    if (validatedBody.paymentMethod == "INSTALLMENT" && !validatedBody.installments)
                        return next(new ApiError(422, i18n.__('installments.required')));
                    if (!validatedBody.tickets)
                        return next(new ApiError(422, i18n.__('tickets.required')));
                }
            }
            if(validatedBody.privacyType == "PRIVAET" && !validatedBody.accessCode)
                return next(new ApiError(422, i18n.__('accessCode.required')));

            if(isInArray(validatedBody.type,['TRIP','CAMP']) && !validatedBody.daysCount)
                return next(new ApiError(422, i18n.__('daysCount.required')));

            if(isInArray(validatedBody.type,['TRIP','CAMP']) && !validatedBody.travelType)
                return next(new ApiError(422, i18n.__('travelType.required')));

            if(isInArray(validatedBody.type,['TRIP','CAMP']) && !validatedBody.transportation)
                return next(new ApiError(422, i18n.__('travelType.required')));

            if(isInArray(validatedBody.type,['FAIR','BAZAR']) && !validatedBody.nationalityType)
                return next(new ApiError(422, i18n.__('nationalityType.required')));

            if (validatedBody.business) {
                validatedBody.ownerType = "BUSINESS"
                let business = await checkExistThenGet(validatedBody.business, Business, { deleted: false })
                validatedBody.educationInstitution = business.educationInstitution
            } else {
                validatedBody.ownerType = "APP"
            }
            
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            validatedBody.fromDateMillSec = Date.parse(validatedBody.fromDate)
            validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)

            
                
            let event = await Event.create({...validatedBody });
            await Post.create({
                event: event.id,
                owner: req.user._id,
                business: validatedBody.business,
                ownerType: validatedBody.ownerType,
                type: 'EVENT',
                content: event.description
            });
            let activityBody = {user:req.user._id,action:'CREATE-EVENT',event:event._id}
            if(validatedBody.business) activityBody.business = validatedBody.business
            await Activity.create({... activityBody});
            let reports = {
                "action": "Create New event",
                "type": "EVENT",
                "deepId": event.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success: true,
                data: event
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
            let { eventId } = req.params;
            let { userId } = req.query
            await checkExist(eventId, Event, { deleted: false });

            await Event.findById(eventId)
                .populate(populateQuery)
                .then(async(e) => {
                    let event = await transformEventById(e, lang, userId)
                    res.send({
                        success: true,
                        data: event
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    //update event
    async update(req, res, next) {
        try {
            let { eventId } = req.params;
            await checkExist(eventId, Event, { deleted: false })
            const validatedBody = checkValidations(req);
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            await Event.findByIdAndUpdate(eventId, {...validatedBody });
            validatedBody.fromDateMillSec = Date.parse(validatedBody.fromDate)
            validatedBody.toDateMillSec = Date.parse(validatedBody.toDate)
            await Event.findByIdAndUpdate(eventId, {
                ...validatedBody,
            }, { new: true });
            let reports = {
                "action": "Update event",
                "type": "EVENT",
                "deepId": eventId,
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
            let {startDate,endDate,feesType, city, area, userId, search, educationInstitution, business, status, ownerType } = req.query;

            let query = { deleted: false }
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
                    ]
                };
            }
            if(startDate && endDate) {
                let from = startDate + 'T00:00:00.000Z';
                let to= endDate + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    fromDate: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if (educationInstitution) query.educationInstitution = educationInstitution
            if (business) query.business = business
            if (status) query.status = status
            if (ownerType) query.ownerType = ownerType;
            if (city) query.city = city
            if (area) query.area = area
            if(feesType) query.feesType = feesType
            await Event.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformEvent(e, lang, userId)
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
            let { startDate,endDate,feesType,city, area, userId, search, educationInstitution, business, status, ownerType } = req.query;

            let query = { deleted: false }
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
                    ]
                };
            }
            if(startDate && endDate) {
                let from = startDate + 'T00:00:00.000Z';
                let to= endDate + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    fromDate: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if (educationInstitution) query.educationInstitution = educationInstitution
            if (business) query.business = business
            if (status) query.status = status
            if (ownerType) query.ownerType = ownerType;
            if (city) query.city = city
            if (area) query.area = area
            if(feesType) query.feesType = feesType
            await Event.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformEvent(e, lang, userId)
                        newdata.push(index)
                    }))
                    const count = await Event.countDocuments(query);
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
            let { eventId } = req.params;
            let event = await checkExistThenGet(eventId, Event);
            event.deleted = true;
            /*delete posts under event */
            let posts = await Post.find({ event: eventId });
            for (let id of posts) {
                id.deleted = true;
                await id.save();
            }
            /*delete attendance under event */
            let eventAttendances = await EventAttendance.find({ event: eventId });
            for (let id of eventAttendances) {
                id.deleted = true;
                await id.save();
            }

            await event.save();
            let reports = {
                "action": "Delete event",
                "type": "EVENT",
                "deepId": eventId,
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
    async attendEvent(req, res, next) {
        try {
            let { eventId } = req.params
            let event = await checkExistThenGet(eventId, Event, { deleted: false });
            if (event.feesType == "WITH-FEES")
                return next(new ApiError(500, i18n.__('sorryEventWithFees')));
            //add client to event attendance
            let arr = event.attendance;
            var found = arr.find((e) => e == req.user._id);
            if (!found) {
                event.attendance.push(req.user._id);
                await EventAttendance.create({ user: req.user._id, event: eventId });
                let reports = {
                    "action": "user will attend to event",
                    "type": "EVENT",
                    "deepId": eventId,
                    "user": req.user._id
                };
                await Report.create({...reports });
            }
            await event.save();
            res.status(200).send({ success: true });
        } catch (error) {
            next(error)
        }
    },
    async removeAttend(req, res, next) {
        try {
            let { eventId } = req.params
            let event = await checkExistThenGet(eventId, Event, { deleted: false });
            let attend = await EventAttendance.findOne({ user: req.user._id, event: eventId });
            attend.deleted = true;
            await attend.save()
                //remove user from event attendance
            let arr2 = event.attendance;
            var found2 = arr2.find((e) => e == req.user._id);
            if (found2) {
                for (let i = 0; i <= arr2.length; i = i + 1) {
                    if (arr2[i] == req.user._id) {
                        arr2.splice(i, 1);
                    }
                }
                event.attendance = arr2;
            }
            await event.save();
            res.status(200).send({ success: true });
        } catch (error) {
            next(error)
        }
    },
    async getEventAttendance(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;

            let ids = await EventAttendance.find({ event: req.params.eventId })
                .distinct('user')
            let query = { deleted: false, _id: ids };
            await User.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e) => {
                        let index = await transformUser(e, lang)
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
    async followEvent(req, res, next) {
        try {
            let { eventId } = req.params
            let event = await checkExistThenGet(eventId, Event, { deleted: false })
            if (!await FollowEvent.findOne({ user: req.user._id, event: eventId, deleted: false })) {
                let arr = event.interesting;
                var found = arr.find((e) => e == req.user._id);
                if (!found) {
                    event.interesting.push(req.user._id);
                    await event.save();
                    await FollowEvent.create({ user: req.user._id, event: eventId });
                    let reports = {
                        "action": "user follow to event",
                        "type": "EVENT",
                        "deepId": eventId,
                        "user": req.user._id
                    };
                    await Report.create({...reports });
                }
            }

            res.status(200).send({ success: true });
        } catch (error) {
            next(error)
        }
    },
    async unfollowEvent(req, res, next) {
        try {
            let { eventId } = req.params;
            if (!await FollowEvent.findOne({ user: req.user._id, event: eventId, deleted: false })) {
                return next(new ApiError(500, i18n.__('event.notFoundInList')));
            }
            let followEvent = await FollowEvent.findOne({ user: req.user._id, event: eventId, deleted: false })

            //if the user make the request is not the owner
            if (followEvent.user != req.user._id)
                return next(new ApiError(403, i18n.__('notAllow')));
            followEvent.deleted = true;
            await followEvent.save();
            /*remove post id from user data*/
            let event = await checkExistThenGet(eventId, Event);
            let arr = event.interesting;
            for (let i = 0; i <= arr.length; i = i + 1) {
                if (arr[i] == req.user._id) {
                    arr.splice(i, 1);
                }
            }
            event.followEvent = arr;
            await event.save();
            let reports = {
                "action": "user un follow to event",
                "type": "EVENT",
                "deepId": eventId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({ success: true });
        } catch (error) {
            next(error)
        }
    },
    async getEventFollowers(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;

            let ids = await FollowEvent.find({ event: req.params.eventId })
                .distinct('user')
            let query = { deleted: false, _id: ids };
            await User.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data) => {
                    let newdata = []
                    await Promise.all(data.map(async(e) => {
                        let index = await transformUser(e, lang)
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
    validateAccessEventBody(isUpdate = false) {
        let validations = [
            body('accessCode').not().isEmpty().withMessage((value, { req}) => {
                return req.__('accessCode.required', { value});
            })
        ];
        return validations;
    },
    async accessEvent(req, res, next) {        
        try {
            console.log(req.user._id)
            const validatedBody = checkValidations(req);
            let {eventId} = req.params
            let event = await checkExistThenGet(eventId,Event,{deleted:false})
            if(event.accessCode == validatedBody.accessCode){
                if (!await AccessEvent.findOne({ user: req.user._id, event: eventId, deleted: false })) {
                    let arr = event.canAccess;
                    var found = arr.find((e) => e == req.user._id);
                    if (!found) {
                        event.canAccess.push(req.user._id);
                        await event.save();
                        await AccessEvent.create({ user: req.user._id, event: eventId });
                        let reports = {
                            "action":"Get Access to Event",
                            "type":"EVENT",
                            "deepId":eventId,
                            "user": req.user._id
                        };
                        await Report.create({...reports });
                    }
                }
                
            }else{
                return next(new ApiError(500, i18n.__('code.incorrect')));
            }
            
            return res.status(200).send({success:true});
        } catch (error) {
            next(error);
        }
    },


}