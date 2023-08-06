import ApiResponse from "../../helpers/ApiResponse";
import Report from "../../models/reports/report.model";
import { checkExist, checkExistThenGet} from "../../helpers/CheckMethods";
import { handleImgs, checkValidations } from "../shared/shared.controller";
import { body } from "express-validator";
import Anoncement from "../../models/anoncement/anoncement.model";
import moment from "moment";
import { toImgUrl } from "../../utils";

export default {
    //find all data with pagenation
    async findAll(req, res, next) {
        try {
            //get lang
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {deleted: false };
            await Anoncement.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    let newdata = [];
                    await Promise.all(data.map(async(e)=>{
                        newdata.push({
                            imgs:e.imgs,
                            link:e.link,
                            viewOn:e.viewOn,
                            openPeriod:e.openPeriod,
                            startDate:moment(e.startDateMillSec).format(),
                            endDate:moment(e.endDateMillSec).format(),
                            id:e._id, 
                        })
                    }))
                    const anoncementsCount = await Anoncement.countDocuments(query);
                    const pageCount = Math.ceil(anoncementsCount / limit);
        
                    res.send(new ApiResponse(newdata, page, pageCount, limit, anoncementsCount, req));
                })
            
        } catch (err) {
            next(err);
        }
    },
    //get without pagenation
    async findSelection(req, res, next) {
        try {
            //get lang
            let query = { deleted: false };
            await Anoncement.find(query)
                .sort({ createdAt: -1 }).then(async(data)=>{
                    let newdata = []
                    await Promise.all(data.map(async(e)=>{
                        newdata.push({
                            imgs:e.imgs,
                            link:e.link,
                            viewOn:e.viewOn,
                            startDate:moment(e.startDateMillSec).format(),
                            endDate:moment(e.endDateMillSec).format(),
                            openPeriod:e.openPeriod,
                            id:e._id,
                        })
                    }))
                    res.send({
                        success: true,
                        data:newdata,
                    })
                })
        } catch (err) {
            next(err);
        }
    },
    //validation on body
    validateBody(isUpdate = false) {
        let validations = [
            body('link').optional().isURL().withMessage((value, { req}) => {
                return req.__('invalid.link', { value});
            }),
            body('startDate').not().isEmpty().withMessage((value, { req}) => {
                return req.__('startDate.required', { value});
            }).isISO8601().withMessage((value, { req}) => {
                return req.__('invalid.date', { value});
            }),
            body('endDate').optional().isISO8601().withMessage((value, { req}) => {
                return req.__('invalid.date', { value});
            }),
            body('viewOn').optional()
            

        ];

        return validations;
    },
    //create new iteam
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            //convert human date to dateMilleSec
            
            if(validatedBody.endDate){
                if(!validatedBody.startDate ) validatedBody.startDate = new Date();
                validatedBody.startDateMillSec = Date.parse(validatedBody.startDate)
                validatedBody.endDateMillSec = Date.parse(validatedBody.endDate)
                validatedBody.openPeriod = false
            }
           
            //upload img
            //upload imgs
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('imgs.required')));
                }
            }else{
                return next(new ApiError(422, i18n.__('imgs.required')));
            }
            let createdAnoncement = await Anoncement.create({ ...validatedBody});
            //reports
            let reports = {
                "action":"Create New Anoncement",
                "type":"ANONCEMENTS",
                "deepId":createdAnoncement.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:createdAnoncement
            });
        } catch (err) {
            next(err);
        }
    },
    //find by id
    async findById(req, res, next) {
        try {
            let { anonId } = req.params;
            await checkExist(anonId, Anoncement, { deleted: false });
            await Anoncement.findById(anonId)
            .then(function (e) {
                let anoncement = {
                    link:e.link,
                    viewOn:e.viewOn,
                    openPeriod:e.openPeriod,
                    imgs:e.imgs,
                    startDate:moment(e.startDateMillSec).format(),
                    endDate:moment(e.endDateMillSec).format(),
                    id:e._id,
                }
                res.send({
                    success:true,
                    data:anoncement,
                });
            })
            
        } catch (err) {
            next(err);
        }
    },
    //update record
    async update(req, res, next) {
        try {
            let { anonId } = req.params;
            await checkExist(anonId, Anoncement, { deleted: false });

            const validatedBody = checkValidations(req);
            //convert human date to milliseconds
            if(validatedBody.endDate){
                if(!validatedBody.startDate ) validatedBody.startDate = new Date();
                validatedBody.startDateMillSec = Date.parse(validatedBody.startDate)
                validatedBody.endDateMillSec = Date.parse(validatedBody.endDate)
                validatedBody.openPeriod = false
            }
            //upload imgs
            if (req.files) {
                if (req.files['imgs']) {
                    let imagesList = [];
                    for (let imges of req.files['imgs']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.imgs = imagesList;
                }
            }
            let updatedAnoncement = await Anoncement.findByIdAndUpdate(anonId, {
                ...validatedBody,
            }, { new: true });
            //report
            let reports = {
                "action":"Update Anoncement",
                "type":"ANONCEMENTS",
                "deepId":anonId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success:true,
                data:updatedAnoncement
            });
        }
        catch (err) {
            next(err);
        }
    },
    //delete record
    async delete(req, res, next) {
        try {
            let { anonId } = req.params;
            let anoncement = await checkExistThenGet(anonId, Anoncement, { deleted: false });
            anoncement.deleted = true;
            await anoncement.save();
            let reports = {
                "action":"Delete Anoncement",
                "type":"ANONCEMENTS",
                "deepId":anonId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({
                success:true
            });

        }
        catch (err) {
            next(err);
        }
    },
};