import Event from "../../models/event/event.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import { transformEvent,transformEventById } from "../../models/event/transformEvent";
import Business from "../../models/business/business.model";
import Post from "../../models/post/post.model";
import User from "../../models/user/user.model";
import { checkExist, checkExistThenGet,isLat,isLng} from "../../helpers/CheckMethods";
import { ValidationError } from "mongoose";
import FollowEvent from "../../models/event/followEvent.model";
import EventAttendance from "../../models/event/eventAttendance.model";
import {transformUser} from "../../models/user/transformUser"
const populateQuery = [
    { path: 'business', model: 'business' },
    { path: 'businessParticipants', model: 'business' },
    { path: 'usersParticipants', model: 'user' },

];
//validate location
function validatedLocation(location) {
    if (!isLng(location[0]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lng.validate") });
    if (!isLat(location[1]))
        throw new ValidationError.UnprocessableEntity({ keyword: 'location', message: i18n.__("lat.validate") });
}
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('title').not().isEmpty().withMessage((value, { req}) => {
                return req.__('title.required', { value});
            }),
            body('description').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description.required', { value});
            }),
            body('hostname').not().isEmpty().withMessage((value, { req}) => {
                return req.__('hostname.required', { value});
            }),
            body('address').not().isEmpty().withMessage((value, { req}) => {
                return req.__('address.required', { value});
            }),
            body('location').not().isEmpty().withMessage((value, { req}) => {
                return req.__('location.required', { value});
            }),
            body('contactNumbers').not().isEmpty().withMessage((value, { req}) => {
                return req.__('contactNumbers.required', { value});
            }),
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
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
            body('time').not().isEmpty().withMessage((value, { req}) => {
                return req.__('time.required', { value});
            }),
            body('business').not().isEmpty().withMessage((value, { req}) => {
                return req.__('business.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('business.numeric', { value});
            }),
            body('usersParticipants').optional()
            .custom(async (users, { req }) => {
                for (let value of users) {
                    if (!await User.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('user.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('businessParticipants').optional()
            .custom(async (users, { req }) => {
                for (let value of users) {
                    if (!await Business.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('business.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            body('dailyTimes').optional()
            .custom(async (dailyTimes, { req }) => {
                for (let val of dailyTimes) {
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
            
        ];
        return validations;
    },
    //add new event
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            validatedBody.educationInstitution = business.educationInstitution
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };
            let event = await Event.create({ ...validatedBody });
            await Post.create({
                event: event.id,
                owner:req.user._id,
                business:business.id,
                ownerType:'BUSINESS',
                type:'EVENT',
                content:event.description
            });
            let reports = {
                "action":"Create New event",
                "type":"EVENT",
                "deepId":event.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:event
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
            await checkExist(eventId, Event, { deleted: false });
            await Event.findById(eventId)
            .populate(populateQuery)
            .then(async(e) => {
                let event = await transformEventById(e,lang)
                res.send({
                    success:true,
                    data:event
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
            await checkExist(eventId,Event, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            validatedBody.educationInstitution = business.educationInstitution
            validatedLocation(validatedBody.location);
            validatedBody.location = { type: 'Point', coordinates: [+req.body.location[0], +req.body.location[1]] };            await Event.findByIdAndUpdate(eventId, { ...validatedBody });
            let thePost  = await Post.findOne({event:eventId})
            thePost.description = validatedBody.description
            await thePost.save();
            let reports = {
                "action":"Update event",
                "type":"EVENT",
                "deepId":eventId,
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
            let {search,educationInstitution,business,status} = req.query;

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
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(business) query.business = business
            if(status) query.status = status
            await Event.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformEvent(e,lang)
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
            let {search,educationInstitution,business,status} = req.query;

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
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(business) query.business = business
            if(status) query.status = status

            await Event.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformEvent(e,lang)
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
            let event = await checkExistThenGet(eventId, event);
            event.deleted = true;
            await Event.save();
            let reports = {
                "action":"Delete event",
                "type":"EVENT",
                "deepId":eventId,
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
    async attendEvent(req, res, next) { 
        try {
            let {eventId} = req.params
            await checkExist (eventId,Event,{deleted:false})
            let user = await checkExistThenGet(req.user._id, User);
            if(!await EventAttendance.findOne({ user: req.user._id, event: eventId,deleted:false})){
                let arr = user.attendedEvents;
                var found = arr.find((e) => e == eventId); 
                if(!found){
                    user.attendedEvents.push(eventId);
                    await user.save();
                    await EventAttendance.create({ user: req.user._id, event: eventId });
                    let reports = {
                        "action":"user will attend to event",
                        "type":"EVENT",
                        "deepId":eventId,
                        "user": req.user._id
                    };
                    await Report.create({...reports});
                }
            }
            
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    async removeAttendance(req, res, next) {
        try {
            let {eventId } = req.params;
             /*check if  */
            if(!await EventAttendance.findOne({ user: req.user._id, event: eventId,deleted:false})){
                return next(new ApiError(500, i18n.__('event.notFoundInList')));
            }
            let eventAttendance = await EventAttendance.findOne({ user: req.user._id, event: eventId,deleted:false})

            //if the user make the request is not the owner
            if (eventAttendance.user != req.user._id)
                return next(new ApiError(403, i18n.__('notAllow')));
            eventAttendance.deleted = true;
            await eventAttendance.save();
            /*remove event id from user data*/
            let user = await checkExistThenGet(req.user._id, User);
            let arr = user.attendedEvents;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == eventId){
                    arr.splice(i, 1);
                }
            }
            user.eventAttendance = arr;
            await user.save();
            let reports = {
                "action":"user not attend to event",
                "type":"EVENT",
                "deepId":eventId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({success: true});
        } catch (error) {
            next(error)
        }
    },
    async getEventAttendance(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            
            let ids = await EventAttendance.find({event:req.params.eventId})
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
    async followEvent(req, res, next) { 
        try {
            let {eventId} = req.params
            await checkExist (eventId,Event,{deleted:false})
            let user = await checkExistThenGet(req.user._id, User);
            if(!await FollowEvent.findOne({ user: req.user._id, event: eventId,deleted:false})){
                let arr = user.followEvents;
                var found = arr.find((e) => e == eventId); 
                if(!found){
                    user.followEvents.push(eventId);
                    await user.save();
                    await FollowEvent.create({ user: req.user._id, event: eventId });
                    let reports = {
                        "action":"user follow to event",
                        "type":"EVENT",
                        "deepId":eventId,
                        "user": req.user._id
                    };
                    await Report.create({...reports});
                }
            }
            
            res.status(200).send({success: true});
        } catch (error) {
            next(error)
        }
    },
    async unfollowEvent(req, res, next) {
        try {
            let {eventId } = req.params;
             /*check if  */
            if(!await FollowEvent.findOne({ user: req.user._id, event: eventId,deleted:false})){
                return next(new ApiError(500, i18n.__('event.notFoundInList')));
            }
            let followEvent = await FollowEvent.findOne({ user: req.user._id, event: eventId,deleted:false})

            //if the user make the request is not the owner
            if (followEvent.user != req.user._id)
                return next(new ApiError(403, i18n.__('notAllow')));
            followEvent.deleted = true;
            await followEvent.save();
            /*remove post id from user data*/
            let user = await checkExistThenGet(req.user._id, User);
            let arr = user.followEvents;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == eventId){
                    arr.splice(i, 1);
                }
            }
            user.followEvent = arr;
            await user.save();
            let reports = {
                "action":"user un follow to event",
                "type":"EVENT",
                "deepId":eventId,
                "user": req.user._id
            };
            await Report.create({...reports});
            res.send({success: true});
        } catch (error) {
            next(error)
        }
    },
    async getEventFollowers(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            
            let ids = await FollowEvent.find({event:req.params.eventId})
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