import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import ApiResponse from "../../helpers/ApiResponse";
import i18n from "i18n";
import Business from "../../models/business/business.model";
import User from "../../models/user/user.model";
import {checkExistThenGet,isInArray} from "../../helpers/CheckMethods";
import SessionReservation from "../../models/sessionReservation/sessionReservation.model"
import {transformSessionReservation} from "../../models/sessionReservation/transformSessionReservation"
import ApiError from "../../helpers/ApiError";

const populateQuery = [
    {path:'user',model:'user'},
    {path:'tutor',model:'business'},

];
export default {
    validateBody() {
        let validations = [
            body('tutor').not().isEmpty().withMessage((value, { req}) => {
                return req.__('tutor.required', { value});
            }),
            body('user').not().isEmpty().withMessage((value, { req}) => {
                return req.__('user.required', { value});
            }),
            body('paymentMethod').not().isEmpty().withMessage((value, { req}) => {
                return req.__('paymentMethod.required', { value});
            }).isIn(['CASH','INSTALLMENT'])
            .withMessage((value, { req}) => {
                return req.__('paymentMethod.invalid', { value});
            }),
            body('sessionNo').not().isEmpty().withMessage((value, { req}) => {
                return req.__('sessionNo.required', { value});
            }),
            body('studentGroup').not().isEmpty().withMessage((value, { req}) => {
                return req.__('studentGroup.required', { value});
            }),
            body('fawryCode').optional()
        ];
        
        return validations;
    },
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            //check permission
            let tutor = await checkExistThenGet(validatedBody.tutor,Business,{ deleted: false})
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                let supervisors = [tutor.owner]
                if(!isInArray(supervisors,req.user._id))
                    return next(new ApiError(403,  i18n.__('notAllow')));
            }
            //check if user is new or exist
            let attendedUser  = await checkExistThenGet(validatedBody.user, User);
            validatedBody.user = attendedUser.id
            await SessionReservation.create({ ...validatedBody });
                let reports = {
                    "action":"session reservation",
                    "type":"BUSINESS",
                    "deepId":tutor,
                    "user": req.user._id
                };
                await Report.create({...reports});
            res.status(201).send({
                success:true,
            });
        } catch (error) {
            next(error);
        }
    },
    async getAllPagenation(req, res, next) {
        try {
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {tutor,user,status,studentGroup} = req.query
            let query = {deleted: false};
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(tutor){
                    let tutor = await checkExistThenGet(tutor,Business,{ deleted: false})
                    if(tutor.owner != req.user._id){
                        return next(new ApiError(403,  i18n.__('notAllow')));
                    }else{
                        query.tutor = tutor
                    }
                }
                if(user) query.user = req.user._id
            }else{
                if(user) query.user = user
                if(tutor) query.tutor = tutor
            }
            if(status) query.status = status
            if(studentGroup) query.studentGroup = studentGroup

            await SessionReservation.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).then(async(data)=>{
                    let newdata =[]
                    await Promise.all( data.map(async(e)=>{
                        let index = await transformSessionReservation(e,lang)
                        newdata.push(index)
                    }))
                    const count = await SessionReservation.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
        } catch (err) {
            next(err);
        }
    },
}