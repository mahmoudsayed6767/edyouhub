import { body } from "express-validator/check";
import Contact from "../../models/contact/contact.model";
import { checkExistThenGet,isInArray } from "../../helpers/CheckMethods";
import ApiError from "../../helpers/ApiError";
import ApiResponse from "../../helpers/ApiResponse";
import { checkValidations,convertLang } from "../shared/shared.controller";
import { sendEmail } from "../../services/emailMessage.service";
import i18n from "i18n";
import { toImgUrl } from "../../utils";

export default {
    validateContactCreateBody() {
        return [
            body('name').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('name.required', { value});
            }),
            body('email').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            })
            .isEmail().withMessage((value, { req}) => {
                return req.__('email.syntax', { value});
            }),
            body('phone').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            })//.isLength({ min: 9,max:14 })
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }
                return true;
                
            }),
            body('contactFor').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('contactFor.required', { value});
            }).isIn(['FEES-PAYMENT','FEES-INSTALLMENT','SUPPLIES']).withMessage((value, { req}) => {
                return req.__('contactFor.invalid', { value});
            }),
            body('educationInstitutionName').trim().escape().optional(),
            body('feesType').trim().escape().optional()
            .isIn(['BUS','TUITION','BOTH']).withMessage((value, { req}) => {
                return req.__('feesType.invalid', { value});
            }),
            body('numberOfStudent').trim().escape().optional(),
            body('totalFees').trim().escape().optional(),
        ]
    },
    async createContactMessage(req, res, next) {
        try {
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
            await Contact.create({ ...validatedBody });
            res.status(200).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async findAll(req, res, next) {
        try {
            convertLang(req)
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {contactFor} = req.query
            let query = { deleted: false };
            if(contactFor) query.contactFor = contactFor
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let contacts = await Contact.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit);


            const contactsCount = await Contact.countDocuments(query);
            const pageCount = Math.ceil(contactsCount / limit);

            res.send(new ApiResponse(contacts, page, pageCount, limit, contactsCount, req));
        } catch (err) {
            next(err);
        }
    },
    async findById(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let { contactId } = req.params;
            res.send({success:true,data:await checkExistThenGet(contactId, Contact)});
        } catch (err) {
            next(err);
        }
    },
    validateContactReplyBody() {
        let validation = [
            body('reply').not().isEmpty().withMessage((value, { req}) => {
                return req.__('reply.required', { value});
            }),
        ]
        return validation;
    },
    async reply(req, res, next) {
        try {
            convertLang(req)
            let { contactId } = req.params;
            const validatedBody = checkValidations(req);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let contact = await checkExistThenGet(contactId, Contact);
            contact.reply = true;
            contact.replyText = validatedBody.reply;
            await contact.save();
            let description = 'Edu Hub Reply on your message';
            sendEmail(contact.email, validatedBody.reply,description)

            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            let { contactId } = req.params;
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth')));
            let contact = await checkExistThenGet(contactId, Contact);
            contact.deleted = true;
            await contact.save();
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
};