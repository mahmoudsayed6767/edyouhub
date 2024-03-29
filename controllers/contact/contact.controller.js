import { body } from "express-validator";
import Contact from "../../models/contact/contact.model";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import { checkValidations } from "../shared/shared.controller";
import { toImgUrl } from "../../utils";
import { sendEmail } from "../../services/sendGrid";

export default {
    validateContactCreateBody() {
        return [
            body('name').not().isEmpty().withMessage((value, { req}) => {
                return req.__('name.required', { value});
            }),
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            })
            .isEmail().withMessage((value, { req}) => {
                return req.__('email.syntax', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            })//.isLength({ min: 9,max:14 })
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }
                return true;
                
            }),
            body('contactFor').optional().isIn(['FEES-PAYMENT','FEES-INSTALLMENT','SUPPLIES','NORMAL']).withMessage((value, { req}) => {
                return req.__('contactFor.invalid', { value});
            }),
            body('educationInstitutionName').optional(),
            body('feesType').optional()
            .isIn(['SCHOOL','UNIVERSITY']).withMessage((value, { req}) => {
                return req.__('feesType.invalid', { value});
            }),
            body('numberOfStudent').optional(),
            body('totalFees').optional(),
            body('message').optional(),
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
            let data = await Contact.create({ ...validatedBody });
            if(data.contactFor == "NORMAL"){
                sendEmail('info@edyouhub.com','New Message',validatedBody.message)
            }
            res.status(200).send({success:true});
        } catch (error) {
            next(error);
        }
    },
    async findAll(req, res, next) {        
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {contactFor,status} = req.query
            let query = { deleted: false };
            if(contactFor) query.contactFor = contactFor
            if(status) query.status = status
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
            let { contactId } = req.params;
            const validatedBody = checkValidations(req);
            let contact = await checkExistThenGet(contactId, Contact);
            contact.comments.push({
                comment:validatedBody.reply,
                user:req.user,
                date:Date.parse(new Date())
            })
            contact.reply = true
            contact.status = "CONTACTED"
            await contact.save();
            let description = 'Edu Hub Reply on your message';
            //sendEmail(contact.email, validatedBody.reply,description)

            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    async checked(req, res, next) {        
        try {
            let { contactId } = req.params;
            let contact = await checkExistThenGet(contactId, Contact);
            contact.status = "CHECKED";
            await contact.save();
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {        
        try {
            let { contactId } = req.params;
            let contact = await checkExistThenGet(contactId, Contact);
            contact.deleted = true;
            await contact.save();
            res.status(200).send({success:true});
        } catch (err) {
            next(err);
        }
    },
};