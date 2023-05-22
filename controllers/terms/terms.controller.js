import Terms from "../../models/terms/terms.model";
import { body } from "express-validator";
import { checkValidations } from "../shared/shared.controller";
import { checkExist } from "../../helpers/CheckMethods";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import i18n from "i18n";
import Report from "../../models/reports/report.model";
export default {
    validateTermsBody() {
        return [
            body('terms_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('terms_ar.required', { value});
            }),
            body('terms_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('terms_en.required', { value});
            }),
            body('privacy_ar').not().isEmpty().withMessage((value, { req}) => {
                return req.__('privacy_ar.required', { value});
            }),
            body('privacy_en').not().isEmpty().withMessage((value, { req}) => {
                return req.__('privacy_en.required', { value});
            }),
        ];
    },
    async create(req, res, next) {        
        try {
            const validatedBody = checkValidations(req);
            let terms = await Terms.create({ ...validatedBody });
            let reports = {
                "action":"Create terms",
                "type":"TERMS",
                "deepId":terms.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            return res.status(201).send({success: true});
        } catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {        
        try {
            //get the language selected
            let lang = i18n.getLocale(req)
            let { TermsId } = req.params;
            
            await checkExist(TermsId, Terms, { deleted: false });
            await Terms.findById(TermsId).then( e => {
                let terms = {
                    terms:lang=="ar"?e.terms_ar:e.terms_en,
                    terms_ar:e.terms_ar,
                    terms_en:e.terms_en,
                    privacy:lang=="ar"?e.privacy_ar:e.privacy_en,
                    privacy_ar:e.privacy_ar,
                    privacy_en:e.privacy_en,
                    id: e._id,
                    createdAt: e.createdAt,
                }
                return res.send({success: true,data:terms});
            })
        } catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {        
        try {
            let { TermsId } = req.params;
            const validatedBody = checkValidations(req);
            let reports = {
                "action":"Update terms",
                "type":"TERMS",
                "deepId":TermsId,
                "user": req.user._id
            };
            await Report.create({...reports });

            await Terms.findByIdAndUpdate(TermsId, { ...validatedBody });
            return res.status(200).send({success: true});
        } catch (error) {
            next(error);
        }
    },

    async getAll(req, res, next) {        
        try {
            //get the language selected
            let lang = i18n.getLocale(req)
            let query = { deleted: false }
            await Terms.find(query)
                .then( data => {
                    var newdata = [];
                    data.map(async(e) =>{
                        newdata.push({
                            terms:lang=="ar"?e.terms_ar:e.terms_en,
                            terms_ar:e.terms_ar,
                            terms_en:e.terms_en,
                            privacy:lang=="ar"?e.privacy_ar:e.privacy_en,
                            privacy_ar:e.privacy_ar,
                            privacy_en:e.privacy_en,
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    })
                    res.send({
                        success:true,
                        data:newdata[0]
                    });
                })
        } catch (error) {
            next(error);
        }
    },
    async delete(req, res, next) {        
        try {
            let { TermsId } = req.params;
            let terms = await checkExistThenGet(TermsId, Terms);
            terms.deleted = true;
            await terms.save();
            let reports = {
                "action":"Delete terms",
                "type":"TERMS",
                "deepId":TermsId,
                "user": req.user._id
            };
            await Report.create({...reports});

            res.send({success: true});

        } catch (err) {
            next(err);
        }
    },


}