import { body } from "express-validator";
import FeesRequest from "../../models/feesRequest/feesRequest.model";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkValidations } from "../shared/shared.controller";
import City from "../../models/city/city.model"
import Area from "../../models/area/area.model"
import {transformFeesRequest} from "../../models/feesRequest/transformFeesRequest"
import i18n from "i18n"
const populateQuery = [
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
]
export default {
    validateFeesRequestCreateBody() {
        return [
            body('name').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name.required', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            })
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }
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
            body('amount').not().isEmpty().withMessage((value, { req}) => {
                return req.__('amount.required', { value});
            }),
        ]
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            await FeesRequest.create({ ...validatedBody });
            res.status(200).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async findAll(req, res, next) {        
        try {
            //get lang
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { deleted: false };
            await FeesRequest.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) => {
                        let index = await transformFeesRequest(e, lang)
                        newdata.push(index)
                    }))
                    const feesRequestsCount = await FeesRequest.countDocuments(query);
                    const pageCount = Math.ceil(feesRequestsCount / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, feesRequestsCount, req));
                })
        } catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {        
        try {
            let { feesRequestId } = req.params;
            let feesRequest = await checkExistThenGet(feesRequestId, FeesRequest);
            feesRequest.deleted = true;
            await feesRequest.save();
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
};