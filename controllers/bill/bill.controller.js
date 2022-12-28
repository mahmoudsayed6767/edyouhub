import Offer from "../../models/offer/offer.model";
import Bill from "../../models/bill/bill.model";
import {transformBill, transformBillById} from "../../models/bill/transformBill";
import User from "../../models/user/user.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations,convertLang} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { generateCode } from '../../services/generator-code-service';
const populateQuery = [ 
    {
        path: 'place', model: 'place',
    },
    {
        path: 'offer', model: 'offer',
    },
    {
        path: 'client', model: 'user',
    },
    {
        path: 'actionUser', model: 'user',
    },
];
export default {
    //validate body
    validateBillBody(isUpdate = false) {
        let validations = [
            body('offer').not().isEmpty().withMessage((value, { req}) => {
                return req.__('offer.required', { value});
            }),
        ];
        return validations;
    },
    //add new bill
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            let offer = await checkExistThenGet(validatedBody.offer,Offer,{deleted: false,end:false})
            validatedBody.client = req.user._id
            validatedBody.place = offer.place
            validatedBody.offerCode = generateCode(8)
            if(!isInArray(["ADMIN","SUB-ADMIN","USER"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let bill = await Bill.create({ ...validatedBody });
            let reports = {
                "action":"Create New Bill",
                "type":"BILLS",
                "deepId":Bill.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:bill
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async findById(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { billId } = req.params;
            
            await checkExist(billId, Bill, { deleted: false });

            await Bill.findById(billId).populate(populateQuery).then(async(e) => {
                let bill = await transformBillById(e,lang)
                res.send({
                    success:true,
                    data:bill
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update offer
    async update(req, res, next) {
        try {
            convertLang(req)
            let { billId } = req.params;
            await checkExist(billId,Bill, { deleted: false })
            if(!isInArray(["USER","ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            const validatedBody = checkValidations(req);
            let offer = await checkExistThenGet(validatedBody.offer,Offer,{deleted: false,end:false})
            validatedBody.client = req.user._id
            validatedBody.place = offer.place
            await Bill.findByIdAndUpdate(billId, { ...validatedBody });
            let reports = {
                "action":"Update Bill",
                "type":"BILLS",
                "deepId":billId,
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
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let {client,actionUser,place,status,startDate,endDate} = req.query;

            let query = {deleted: false }
            if(startDate && endDate) {
                let from = startDate + 'T00:00:00.000Z';
                let to= endDate + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    createdAt: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if(client) query.client = client
            if(actionUser) query.actionUser = actionUser
            if(place) query.place = place
            if(status) query.status = status
            await Bill.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBill(e,lang)
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
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {client,actionUser,place,status,startDate,endDate} = req.query;

            let query = {deleted: false }
            if(startDate && endDate) {
                let from = startDate + 'T00:00:00.000Z';
                let to= endDate + 'T23:59:00.000Z';
                console.log( from)
                query = { 
                    createdAt: { $gt : new Date(from), $lt : new Date(to) }
                };
            } 
            if(client) query.client = client
            if(actionUser) query.actionUser = actionUser
            if(place) query.place = place
            if(status) query.status = status
            await Bill.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBill(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Bill.countDocuments(query);
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
            convertLang(req)
            let { billId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let bill = await checkExistThenGet(billId, Bill);
            bill.deleted = true;
            await bill.save();
            let reports = {
                "action":"Delete Bill",
                "type":"BILLS",
                "deepId":billId,
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

   

}