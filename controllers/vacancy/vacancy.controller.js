import Vacancy from "../../models/vacancy/vacancy.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations} from "../shared/shared.controller";
import { checkExist } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import { transformVacancy,transformVacancyById } from "../../models/vacancy/transformVacancy";
import Business from "../../models/business/business.model";
import Post from "../../models/post/post.model";

const populateQuery = [
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'educationInstitution', model: 'educationInstitution' },
    { path: 'business', model: 'business' },
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('profession').not().isEmpty().withMessage((value, { req}) => {
                return req.__('profession.required', { value});
            }),
            body('description').not().isEmpty().withMessage((value, { req}) => {
                return req.__('description.required', { value});
            }),
            body('requirements').not().isEmpty().withMessage((value, { req}) => {
                return req.__('requirements.required', { value});
            }),
            body('business').not().isEmpty().withMessage((value, { req}) => {
                return req.__('business.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('business.numeric', { value});
            }),
            
        ];
        return validations;
    },
    //add new vacancy
    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            let vacancy = await Vacancy.create({ ...validatedBody });
            await Post.create({
                vacancy: vacancy.id,
                owner:req.user._id,
                business:business.id,
                ownerType:'BUSINESS',
                type:'VACANCY',
                content:vacancy.description
            });
            let reports = {
                "action":"Create New vacancy",
                "type":"VACANCY",
                "deepId":vacancy.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:vacancy
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
            let { vacancyId } = req.params;
            
            await checkExist(vacancyId, Vacancy, { deleted: false });

            await Vacancy.findById(vacancyId)
            .populate(populateQuery)
            .then(async(e) => {
                let vacancy = await transformVacancyById(e,lang)
                res.send({
                    success:true,
                    data:vacancy
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update vacancy
    async update(req, res, next) {
        try {
            let { vacancyId } = req.params;
            await checkExist(vacancyId,Vacancy, { deleted: false })
            const validatedBody = checkValidations(req);
            let business = await checkExistThenGet(validatedBody.business,Business,{ deleted: false})
            validatedBody.educationInstitution = business.educationInstitution
            validatedBody.educationSystem = business.educationSystem
            await Vacancy.findByIdAndUpdate(vacancyId, { ...validatedBody });
            let thePost  = await Post.findOne({vacancy:vacancyId})
            thePost.description = validatedBody.description
            await thePost.save();
            let reports = {
                "action":"Update vacancy",
                "type":"VACANCY",
                "deepId":vacancyId,
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
            let {search,educationInstitution,educationSystem,business} = req.query;

            let query = {deleted: false }
             /*search  */
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {profession: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {description: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(educationSystem) query.educationSystem = educationSystem
            if(business) query.business = business
            await Vacancy.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformVacancy(e,lang)
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
            let {search,educationInstitution,educationSystem,business} = req.query;

            let query = {deleted: false }
             /*search  */
            if(search) {
                query = {
                    $and: [
                        { $or: [
                            {profession: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {description: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(educationInstitution) query.educationInstitution = educationInstitution
            if(educationSystem) query.educationSystem = educationSystem
            if(business) query.business = business
            await Vacancy.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformVacancy(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Vacancy.countDocuments(query);
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
            let { vacancyId } = req.params;
            
            let vacancy = await checkExistThenGet(vacancyId, vacancy);
            vacancy.deleted = true;
            await Vacancy.save();
            let reports = {
                "action":"Delete vacancy",
                "type":"VACANCY",
                "deepId":vacancyId,
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