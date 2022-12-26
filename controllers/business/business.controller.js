import Business from "../../models/business/business.model";
import Report from "../../models/reports/report.model";
import { body } from "express-validator";
import { checkValidations,convertLang,handleImg} from "../shared/shared.controller";
import ApiError from "../../helpers/ApiError";
import { checkExist,isInArray,isImgUrl } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Country from "../../models/country/country.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
import Category from "../../models/category/category.model"
import EducationSystem from "../../models/education system/education system.model";
import EducationInstitution from "../../models/education institution/education institution.model";
import { transformBusiness,transformBusinessById } from "../../models/business/transformBusiness";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import Notif from "../../models/notif/notif.model";
import User from "../../models/user/user.model";
import Grade from "../../models/grade/grade.model"
import Branch from "../../models/branch/branch.model";
import Specialization from "../../models/specialization/specialization.model"
import Faculty from "../../models/faculty/faculty.model"
const populateQuery = [
    { path: 'owner', model: 'user' },
    { path: 'educationSystem', model: 'educationSystem' },
    { path: 'sector', model: 'category' },
    { path: 'subSector', model: 'category' },
    { path: 'specializations', model: 'specialization' },
    { path: 'grades', model: 'grade' },
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
    {
        path: 'faculties', model: 'faculty',
        populate: { path: 'grades', model: 'grade' },
    },
    
];
export default {
    //validate body
    validateBody(isUpdate = false) {
        let validations = [
            body('name_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_en.required', { value});
            }),
            body('name_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name_ar.required', { value});
            }),
            body('bio_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('bio_en.required', { value});
            }),
            body('bio_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('bio_ar.required', { value});
            }),
            body('educationSystem').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('educationSystem.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('educationSystem.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await EducationSystem.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('educationSystem.invalid'));
                else
                    return true;
            }),
            body('webSite').trim().optional(),
            body('facebook').trim().optional(),
            body('twitter').trim().optional(),
            body('email').trim().not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }),
            body('phones').trim().not().isEmpty().withMessage((value, { req}) => {
                return req.__('phones.required', { value});
            }),
            body('sector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('sector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('sector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('sector.invalid'));
                else
                    return true;
            }),
            body('subSector').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('subSector.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('subSector.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Category.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('subSector.invalid'));
                else
                    return true;
            }),
            body('owner').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('owner.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('owner.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await User.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('owner.invalid'));
                else
                    return true;
            }),
            body('studyType').optional().isIn(['LOCAL','ABROAD']).withMessage((value, { req}) => {
                return req.__('studyType.invalid', { value});
            }),
            body('specializations').trim().escape().optional()
            .custom(async (specializations, { req }) => {
                convertLang(req)
                for (let value of specializations) {
                    if (!await Specialization.findOne({_id:value,deleted:false}))
                        throw new Error(req.__('specialization.invalid'));
                    else
                        return true;
                }
                return true;
            }),
            
            body('theGrades').trim().escape().optional()
            .custom(async (grades, { req }) => {
                convertLang(req)
                for (let grade of grades) {
                    body('name_en').not().isEmpty().withMessage((value) => {
                        return req.__('name_en.required', { value});
                    }),
                    body('name_ar').not().isEmpty().withMessage((value) => {
                        return req.__('name_ar.required', { value});
                    }),
                    body('cost').not().isEmpty().withMessage((value) => {
                        return req.__('cost.required', { value});
                    }),
                    body('gradeId').trim().optional()
                }
                return true;
            }),
            body('theFaculties').trim().escape().optional()
            .custom(async (faculties, { req }) => {
                convertLang(req)
                for (let faculty of faculties) {
                    body('name_en').not().isEmpty().withMessage((value) => {
                        return req.__('name_en.required', { value});
                    }),
                    body('name_ar').not().isEmpty().withMessage((value) => {
                        return req.__('name_ar.required', { value});
                    }),
                    body('theGrades').trim().escape().optional()
                    .custom(async (grades, { req }) => {
                        convertLang(req)
                        for (let grade of grades) {
                            body('name_en').not().isEmpty().withMessage((value) => {
                                return req.__('name_en.required', { value});
                            }),
                            body('name_ar').not().isEmpty().withMessage((value) => {
                                return req.__('name_ar.required', { value});
                            }),
                            body('cost').not().isEmpty().withMessage((value) => {
                                return req.__('cost.required', { value});
                            }),
                            body('gradeId').trim().optional()
                        }
                        return true;
                    }),
                    body('facultyId').trim().optional()
                }
                return true;
            }),
            body('theBranches').trim().escape().optional()
            .custom(async (branches, { req }) => {
                convertLang(req)
                for (let branche of branches) {
                    body('address_ar').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('address_ar.required', { value});
                    }),
                    body('address_en').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('address_en.required', { value});
                    }),
                    body('country').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('country.required', { value});
                    }).custom(async (value, { req }) => {
                        if (!await Country.findOne({_id:value,deleted:false}))
                            throw new Error(req.__('country.invalid'));
                        else
                            return true;
                    }),
                    body('city').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('city.required', { value});
                    }).custom(async (value, { req }) => {
                        if (!await City.findOne({_id:value,deleted:false}))
                            throw new Error(req.__('city.invalid'));
                        else
                            return true;
                    }),
                    body('area').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('area.required', { value});
                    }).custom(async (value, { req }) => {
                        if (!await Area.findOne({_id:value,deleted:false}))
                            throw new Error(req.__('area.invalid'));
                        else
                            return true;
                    }),
                    
                    body('phone').not().isEmpty().withMessage((value, { req}) => {
                        return req.__('phone.required', { value});
                    })
                    .custom(async (value, { req }) => {
                        var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                        if(!exp.test(value))
                            throw new Error(req.__('branchPhone.syntax'));
                        else
                            return true;
                    }),
                    body('location').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                        return req.__('location.required', { value});
                    }).custom(async (value, { req }) => {
                        validatedLocation(value)
                            return true;
                    }),
                    body('branchId').trim().optional()
                }
                return true;
            }),
            body('specializations').trim().optional(),
            body('gallery').trim().optional(),
            body('img').trim().optional(),
        ];
        return validations;
    },
    //add new education Institution
    async create(req, res, next) {
        try {
            convertLang(req)
            const validatedBody = checkValidations(req);
            let business = await Business.create({ ...validatedBody });
            let branches = []
            if(validatedBody.theBranches){
                await Promise.all(validatedBody.theBranches.map(async(val) => {
                    val.location = { type: 'Point', coordinates: [+val.location[0], +val.location[1]] };

                    val.business = business.id
                    val.type = "BUSINESS"
                    let createdRow = await Branch.create({...val})
                    branches.push(createdRow.id)
                }));  
            }
            let grades = []
            if(validatedBody.theGrades){
                await Promise.all(validatedBody.theGrades.map(async(val) => {
                    val.educationSystem = validatedBody.educationSystem
                    val.business = business.id
                    let createdRow = await Grade.create({...val})
                    grades.push(createdRow.id)
                }));  
            }
            let faculties = []
            if(validatedBody.theFaculties){
                await Promise.all(validatedBody.theFaculties.map(async(val) => {
                    //add faculty
                    let faculty = {
                        'name_ar':val.name_ar,
                        'name_en':val.name_en
                    }
                    faculty.educationSystem = validatedBody.educationSystem
                    faculty.business = business.id
                    let createdFaculty = await Faculty.create({...faculty})
                    faculties.push(createdFaculty.id)
                    //add grades
                    await Promise.all(val.theGrades.map(async(value) => {
                        value.educationSystem = validatedBody.educationSystem
                        value.business = business.id
                        let createdRow = await Grade.create({...value})
                        //add faculty key in grade obj
                        createdRow.faculty = createdFaculty.id
                        await createdRow.save();
                        grades.push(createdRow.id)
                    }));
                    //add grades key in faculty obj
                    createdFaculty.grades = grades
                    await createdFaculty.save();
                }));  
            }
            business.faculties = faculties
            business.branches = branches
            business.grades = grades
            if(req.user.type =="ADMIN"){
                let educationInstitution = await EducationInstitution.create({ 
                    name_en:business.name_en,
                    name_ar:business.name_ar,
                    educationSystem:business.educationSystem,
                    educationSystem:business.educationSystem,
                    sector:business.sector,
                    subSector:business.subSector,
                    img:business.img,
                    business:business.id
                });
                business.status = "ACCEPTED"
                business.educationInstitution = educationInstitution

                let allGrades = await Grade.find({ business: business.id });
                for (let id of allGrades) {
                    id.educationInstitution = educationInstitution;
                    await id.save();
                }
                let allFaculties = await Faculty.find({ business: business.id });
                for (let id of allFaculties) {
                    id.educationInstitution = educationInstitution;
                    await id.save();
                }
            }
            
            await business.save();
            let reports = {
                "action":"Create New business",
                "type":"BUSINESS",
                "deepId":business.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(201).send({
                success:true,
                data:business
            });
        } catch (error) {
            next(error);
        }
    },
    //get by id
    async getById(req, res, next) {
        try {
            convertLang(req)
             //get lang
            let lang = i18n.getLocale(req)
            let { businessId } = req.params;
            
            await checkExist(businessId, Business, { deleted: false });
            await Business.findById(businessId)
            .populate(populateQuery)
            .then(async(e) => {
                let business = await transformBusinessById(e,lang)
                res.send({
                    success:true,
                    data:business
                });
            })
        } catch (error) {
            next(error);
        }
    },
    //update business
    async update(req, res, next) {
        try {
            convertLang(req)
            let { businessId } = req.params;
            await checkExist(businessId,Business, { deleted: false })
            const validatedBody = checkValidations(req);
            let branches = []
            if(validatedBody.theBranches){
                await Promise.all(validatedBody.theBranches.map(async(val) => {
                    val.location = { type: 'Point', coordinates: [+val.location[0], +val.location[1]] };

                    if(val.branchId){
                        await Branch.findByIdAndUpdate(val.branchId, { ...val });
                        branches.push(val.branchId)
                    }else{
                        val.business = businessId
                        val.type = "BUSINESS"
                        let createdRow = await Branch.create({...val})
                        branches.push(createdRow.id)
                    }
                }));  
            }
            let grades = []
            if(validatedBody.theGrades){
                await Promise.all(validatedBody.theGrades.map(async(val) => {
                    if(val.gradeId){
                        await Grade.findByIdAndUpdate(val.gradeId, { ...val });
                        grades.push(val.gradeId)
                    }else{
                        val.educationSystem = validatedBody.educationSystem
                        val.business = businessId
                        let createdRow = await Grade.create({...val})
                        grades.push(createdRow.id)
                    }
                }));  
            }
            
            validatedBody.branches = branches
            validatedBody.grades = grades
            await Business.findByIdAndUpdate(businessId, { ...validatedBody });

            let reports = {
                "action":"Update Business ",
                "type":"BUSINESS",
                "deepId":businessId,
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
            let {owner,name,sector,subSector,educationSystem,status} = req.query;

            let query = {deleted: false }
            /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(owner) query.owner = owner
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            if(status) query.status = status
            if(educationType){
                let catIds = await Category.find({deleted:false,educationType:educationType}).distinct('_id')
                query.subSector = {$in: catIds}
            }
            await Business.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .then( async(data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBusiness(e,lang)
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
            let {owner,name,sector,subSector,educationSystem,status} = req.query;

            let query = {deleted: false }
            /*search by name */
            if(name) {
                query = {
                    $and: [
                        { $or: [
                            {name_ar: { $regex: '.*' + name + '.*' , '$options' : 'i'  }}, 
                            {name_en: { $regex: '.*' + name + '.*', '$options' : 'i'  }}, 
                          
                          ] 
                        },
                        {deleted: false},
                    ]
                };
            }
            if(owner) query.owner = owner
            if(sector) query.sector = sector
            if(subSector) query.subSector = subSector
            if(educationSystem) query.educationSystem = educationSystem
            if(status) query.status = status
            if(educationType){
                let catIds = await Category.find({deleted:false,educationType:educationType}).distinct('_id')
                query.subSector = {$in: catIds}
            }
            await Business.find(query).populate(populateQuery)
                .sort({ _id: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBusiness(e,lang)
                        newdata.push(index)
                    }))
                    const count = await Business.countDocuments(query);
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
            let { businessId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let business = await checkExistThenGet(businessId, Business);
            business.deleted = true;
            await business.save();
            let reports = {
                "action":"Delete Business",
                "type":"BUSINESS",
                "deepId":businessId,
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
    async accept(req, res, next) {
        try {
            convertLang(req)
            let { businessId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let business = await checkExistThenGet(businessId, Business);
            business.status = 'ACCEPTED';
            
            if(!business.educationInstitution){
                let educationInstitution = await EducationInstitution.create({ 
                    name_en:business.name_en,
                    name_ar:business.name_ar,
                    educationSystem:business.educationSystem,
                    educationSystem:business.educationSystem,
                    sector:business.sector,
                    subSector:business.subSector,
                    img:business.img,

                });
                business.educationInstitution = educationInstitution
            }
            
            let grades = await Grade.find({ business: businessId });
            for (let id of grades) {
                id.educationInstitution = business.educationInstitution;
                await id.save();
            }
            let allFaculties = await Faculty.find({ business: business.id });
            for (let id of allFaculties) {
                id.educationInstitution = business.educationInstitution;
                await id.save();
            }
            
            await business.save();
            sendNotifiAndPushNotifi({
                targetUser: business.owner, 
                fromUser: business.owner, 
                text: ' EdHub',
                subject: business.id,
                subjectType: 'Business Status',
                info:'BUSINESS'
            });
            let notif = {
                "description_en":'Your business Request Has Been Confirmed ',
                "description_ar":'  تمت الموافقه على طلب  الخاص بك',
                "title_en":'Your business Request Has Been Confirmed ',
                "title_ar":' تمت الموافقه على طلب  الخاص بك',
                "type":'BUSINESS'
            }
            await Notif.create({...notif,resource:req.user,target:business.owner,business:business.id});
            let reports = {
                "action":"Accept business Request",
                "type":"BUSINESS",
                "deepId":businessId,
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
    
    async reject(req, res, next) {
        
        try {
            convertLang(req)
            let { businessId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let business = await checkExistThenGet(businessId, Business);
            business.status = 'REJECTED';
            business.reason  = req.body.reason
            await business.save();
            
            sendNotifiAndPushNotifi({
                targetUser: business.owner, 
                fromUser: business.owner, 
                text: ' EdHub',
                subject: business.id,
                subjectType: 'business Status',
                info:'BUSINESS'
            });
            let notif = {
                "description_en":'Your business Request Has Been Rejected ',
                "description_ar":'   تم رفض  طلب التمويل الخاص بك',
                "title_en":'Your business Request Has Been Rejected ',
                "title_ar":' تم رفض على طلب التمويل الخاص بك',
                "type":'BUSINESS'
            }
            await Notif.create({...notif,resource:req.user,target:business.owner,business:business.id});
            let reports = {
                "action":"Reject business Request",
                "type":"BUSINESS",
                "deepId":businessId,
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