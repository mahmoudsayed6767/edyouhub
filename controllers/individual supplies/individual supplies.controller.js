import IndividualSupplies from "../../models/individual supplies/individual supplies.model";
import ApiResponse from "../../helpers/ApiResponse";
import {  checkValidations ,convertLang} from "../shared/shared.controller";
import { checkExistThenGet, checkExist,isInArray } from "../../helpers/CheckMethods";
import { body } from "express-validator";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import i18n from "i18n";
import { transformIndividualSupplies } from "../../models/individual supplies/transformIndividualSupplies";
import { toImgUrl } from "../../utils";
const populateQuery = [
    { path: 'user', model: 'user' },
    { path: 'grade', model: 'grade' },
    { path: 'educationInstitution', model: 'educationInstitution' },
];

export default {
    async findAll(req, res, next) {
        
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            {educationInstitution,grade,search,user} = req.query;
            let query = {deleted: false };
            
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {educationInstitution: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {grade: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if (user) query.user = user;
            if (grade) query.grade = grade
            if (educationInstitution) query.educationInstitution = educationInstitution
            let sortd = {createdAt: -1}
            await IndividualSupplies.find(query).populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformIndividualSupplies(e,lang)
                        newdata.push(index);
                    }))
                    const count = await IndividualSupplies.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);
                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })

            
        } catch (err) {
            next(err);
        }
    },
    async getAll(req, res, next) {
        
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {educationInstitution,grade,search,user} = req.query;
            let query = {deleted: false };
            
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {educationInstitution: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                            {grade: { $regex: '.*' + search + '.*' , '$options' : 'i' }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if (user) query.user = user;
            if (grade) query.grade = grade
            if (educationInstitution) query.educationInstitution = educationInstitution
            let sortd = {createdAt: -1}
            await IndividualSupplies.find(query).populate(populateQuery)
                .sort(sortd).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformIndividualSupplies(e,lang)
                        newdata.push(index);
                    }))
                    res.send({success:true,data:newdata});
                })

            
        } catch (err) {
            next(err);
        }
    }, 

    validateBody(isUpdate = false) {
        
        let validations = [
            body('fullname').not().isEmpty().withMessage((value, { req}) => {
                return req.__('fullname.required', { value});
            }),
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }).isEmail().withMessage('email.syntax'),
            body('phone').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            })
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }
                return true;
                
            }),
            body('educationInstitution').not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationInstitution.required', { value});
            }),
            body('grade').not().isEmpty().withMessage((value, { req}) => {
                return req.__('grade.required', { value});
            }),
            
        ];
    
        return validations;
    },

    async create(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            validatedBody.user = req.user
            if (req.files) {
                if (req.files['attachment']) {
                    let imagesList = [];
                    for (let imges of req.files['attachment']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.attachment = imagesList;
                }else{
                    return next(new ApiError(422, i18n.__('attachment.required'))); 
                }
            }else{
                return next(new ApiError(422, i18n.__('attachment.required'))); 
            }
            let createdIndividualSupplies = await IndividualSupplies.create({
                ...validatedBody,
            });

            
            let reports = {
                "action":"Create IndividualSupplies",
                "type":"INDIVIDUAL-SUPPLIES",
                "deepId":createdIndividualSupplies.id,
                "user": req.user._id
            };
            await Report.create({...reports}); 
            await IndividualSupplies.findById(createdIndividualSupplies.id).populate(populateQuery).then(async (e) => {
                let index = await transformIndividualSupplies(e,lang)
                res.status(201).send({success: true,data:index});
            })
            
        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { IndividualSuppliesId } = req.params;

            await checkExist(IndividualSuppliesId, IndividualSupplies,{ deleted: false });
            await IndividualSupplies.findById(IndividualSuppliesId).populate(populateQuery).then(async (e) => {
                    let index = await transformIndividualSupplies(e,lang)
                    res.send({success: true,data:index});
                })
            
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let {IndividualSuppliesId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            await checkExist(IndividualSuppliesId, IndividualSupplies,
                {deleted: false });

            
            const validatedBody = checkValidations(req);
            if (req.files) {
                if (req.files['attachment']) {
                    let imagesList = [];
                    for (let imges of req.files['attachment']) {
                        imagesList.push(await toImgUrl(imges))
                    }
                    validatedBody.attachment = imagesList;
                }
            }

            await IndividualSupplies.findByIdAndUpdate(IndividualSuppliesId, {
                ...validatedBody,

            }, { new: true }).populate(populateQuery);
            let reports = {
                "action":"Update IndividualSupplies",
                "type":"INDIVIDUAL-SUPPLIES",
                "deepId":IndividualSuppliesId,
                "user": req.user._id
            };
            await Report.create({...reports});
            await IndividualSupplies.findById(IndividualSuppliesId).populate(populateQuery).then(async (e) => {
                let index = await transformIndividualSupplies(e,lang)
                res.status(200).send({success: true,data:index});
            })
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let {IndividualSuppliesId } = req.params;

            let individualSupplies = await checkExistThenGet(IndividualSuppliesId, IndividualSupplies,{deleted: false });
            individualSupplies.deleted = true
            await individualSupplies.save();
            let reports = {
                "action":"Delete IndividualSupplies",
                "type":"INDIVIDUAL-SUPPLIES",
                "deepId":individualSupplies.id,
                "user": req.user._id
            };
            await Report.create({...reports, user: req.user._id });
            res.status(200).send({success: true});
        }
        catch (err) {
            next(err);
        }
    },
    async confirm(req, res, next) {
        try {
            convertLang(req)
            let {IndividualSuppliesId } = req.params;
            let individualSupplies = await checkExistThenGet(IndividualSuppliesId, IndividualSupplies,{deleted: false });
            
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(req.user._id != individualSupplies.user){
                    return next(new ApiError(403, i18n.__('admin.auth')));
                }
            }individualSupplies.status = 'CONFIRMED'
            await individualSupplies.save();
            let reports = {
                "action":"Confirm IndividualSupplies",
                "type":"INDIVIDUAL-SUPPLIES",
                "deepId":individualSupplies.id,
                "user": req.user._id
            };
            await Report.create({...reports, user: req.user._id });
            res.status(200).send({success: true});
        }
        catch (err) {
            next(err);
        }
    },
   
}