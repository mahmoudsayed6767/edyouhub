import { checkExistThenGet ,isInArray} from '../../helpers/CheckMethods';
import { body } from 'express-validator';
import { checkValidations, handleImg } from '../shared/shared.controller';
import { generateToken } from '../../utils/token';
import User from "../../models/user/user.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import { generateVerifyCode ,generateMaxCode} from '../../services/generator-code-service';
import DeviceDetector from "device-detector-js";
import { sendEmail } from "../../services/sendGrid";
import {sendSms} from "../../services/sms"
import i18n from "i18n";
import {transformUserById } from '../../models/user/transformUser';
import Country from "../../models/country/country.model";
import City from "../../models/city/city.model";
import Area from "../../models/area/area.model";
const checkUserExistByPhone = async (phone) => {
    let user = await User.findOne({ phone:phone,deleted:false });
    if (!user)
        throw new ApiError.BadRequest('Phone Not Found');

    return user;
}
const checkUserExistByEmail = async (email) => {
    let user = await User.findOne({ email : email,deleted : false});
    if (!user)
        throw new ApiError.BadRequest('email Not Found');

    return user;
}
const populateQueryById = [
    { path: 'place', model: 'place'},
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    { path: 'affiliate', model: 'user'},
    { path: 'package', model: 'package'},
    { path: 'higherEducation.higherEducation', model: 'higherEducation'},
    { path: 'kids.educationSystem', model: 'educationSystem'}
    
];
export default {
    async addToken(req,res,next){
        try{
            
            let user = req.user;
            let users = await checkExistThenGet(user.id, User);
            let arr2 = users.tokens;
            var found2 = arr2.find(x => x.token == req.body.token)
            if(!found2){
                let theToken = {
                    token: req.body.token,
                    osType:req.body.osType?req.body.osType:"IOS"
                }
                users.tokens.push(theToken);
            }
            await users.save();
            console.log(req.body.token);
            res.status(200).send({
                success: true,
                user:users,
            });
            
        } catch(err){
            next(err);
        }
    },
    async signIn(req, res, next) {
        try{
            
            let lang = i18n.getLocale(req)
            let user = req.user;
            user = await User.findById(user.id).populate(populateQueryById);
           
            if(!user)
                return next(new ApiError(403, ('phone or password incorrect')));
            
            if(user.block == true){
                return next(new ApiError(500, (i18n.__('user.block'))));
            }
            if(user.deleted == true){
                return next(new ApiError(500, (i18n.__('user.delete'))));
            }

            if(req.body.token != null && req.body.token !=""){
                let arr2 = user.tokens; 
                if(!req.body.osType || req.body.osType == ""){
                    const deviceDetector = new DeviceDetector();
                    
                    if(deviceDetector.parse(req.headers['user-agent']).os){
                        let osType = deviceDetector.parse(req.headers['user-agent']).os.name
                        if(isInArray(["Mac","iOS"],osType)){
                            req.body.osType = "IOS"
                        }else{
                            req.body.osType = "ANDROID"
                        }
                    }else{
                        req.body.osType = "WEB"
                    }
                    
                }
                var found2 = arr2.find(x => x.token == req.body.token)
                
                if(!found2){
                    let theToken = {
                        token: req.body.token,
                        osType:req.body.osType
                    }
                    user.tokens.push(theToken);
                    await user.save();
                }
            }
            await User.findById(user.id).populate(populateQueryById)
            .then(async(e)=>{
                let index = await transformUserById(e,lang)
                if(user.accountType === "SIGNUP-PROCESS"){
                    res.status(200).send({
                        success:true,
                        data:index,
                    });
                }else{
                    res.status(200).send({
                        success:true,
                        data:index,
                        token:generateToken(user.id)
                    });
                }
            })
        } catch(err){
            next(err);
        }
    },
    validateSignUpBody(isUpdate = false) {
        let validations = [
            body('token').optional(),
            body('fullname').optional(),
            body('place').optional(),
            body('affiliateCode').optional(),
            body('password').not().isEmpty().withMessage((value, { req}) => {
                return req.__('password.required', { value});
            }).isLength({ min: 8 }).withMessage((value, { req}) => {
                return req.__('password.invalid', { value});
            }).custom(async (value, { req }) => {
                var exp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
                //"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$""
                if(!exp.test(value)){
                    throw new Error(req.__('password.invalid'));
                }
                else
                    return true;
                
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            })//.isLength({ min: 9,max:14 })
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }
                let userQuery = { phone: value,deleted:false ,accountType:'ACTIVE'};
                if (isUpdate && req.user.phone === value)
                    userQuery._id = { $ne: req.user._id };

                if (await User.findOne(userQuery))
                    throw new Error(req.__('phone.duplicated'));
                else
                    return true;
                
            }),
            body('email').optional().isEmail().withMessage('email.syntax')
            .custom(async (value, { req }) => {
                let userQuery = { email: value,deleted:false ,accountType:'ACTIVE'};
                if (isUpdate && req.user.email === value)
                    userQuery._id = { $ne: req.user._id };

                if (await User.findOne(userQuery))
                    throw new Error(req.__('email.duplicated'));
                else
                    return true;
                
            }),
            body('country').not().isEmpty().withMessage((value, { req}) => {
                return req.__('country.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('country.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Country.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await City.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').optional().isNumeric().withMessage((value, { req}) => {
                return req.__('area.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Area.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('area.invalid'));
                else
                    return true;
            }),
            body('type').not().isEmpty().withMessage((value, { req}) => {
                return req.__('type.required', { value});
            }).isIn(['PLACE','SUBERVISOR','ADMIN','USER','AGENCY','AFFILIATE']).withMessage((value, { req}) => {
                    return req.__('type.invalid', { value});
            }),
            body('gender').optional().isIn(['MALE','FEMALE','OTHER']).withMessage((value, { req}) => {
                    return req.__('gender.invalid', { value});
            }),
        ];
        return validations;
    },
    async signUp(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            let unActiveUsers = await User.find({deleted: false,accountType:'SIGNUP-PROCESS',phone: validatedBody.phone})
            for (let id of unActiveUsers) {
                id.deleted = true;
                await id.save();
            }
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            if(validatedBody.affiliateCode){
                let affiliate = await User.findOne({deleted: false,affiliateCode:validatedBody.affiliateCode})
                if(affiliate)
                    validatedBody.affiliate = affiliate
            }
            validatedBody.username = generateMaxCode(8)
            let createdUser = await User.create({
                ...validatedBody
            });
            //send code
            let theUser = await checkExistThenGet(createdUser.id, User,{deleted: false });  
            let realPhone = "+2" + theUser.phone;
          
            let code = "0000"
            if(process.env.environment === 'PRODUCTION'){
                code = generateVerifyCode(); 
                if(code.toString().length < 4){
                    code = generateVerifyCode(); 
                }
                let message =  `رمز التحقيق لتطبيق EDYOUHUB هو ${code} الرجاء استخدامه لتفعيل الحساب الخاص بك.` 
                sendSms(realPhone,message)
            }
            theUser.verifycode = code
            await theUser.save();
            let reports = {
                "action":"User sign Up ",
                "type":"USERS",
                "deepId":createdUser.id,
                "user": createdUser._id
            };
            await Report.create({...reports });
            await User.findById(createdUser.id).populate(populateQueryById)
            .then(async(e)=>{
                let index = await transformUserById(e,lang)
                res.status(201).send({
                    success:true,
                    data:index,
                    //token:generateToken(createdUser.id)
                });
            })
            

        } catch (err) {
            next(err);
        }
    },
    validateVerifyPhone() {
        return [
            body('verifycode').not().isEmpty().withMessage((value, { req}) => {
                return req.__('verifycode.required', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }).custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }else{
                    return true;
                }
            })
        ];
    },
    async verifyPhone(req, res, next) {        
        try {
            let lang = i18n.getLocale(req)
            let validatedBody = checkValidations(req);
            let user = await checkUserExistByPhone(validatedBody.phone);
             if (user.verifycode != validatedBody.verifycode)
                 return next(new ApiError.BadRequest(i18n.__('verifyCode.notMatch')));
            
            user.active = true;
            user.phoneVerify = true;
            user.accountType = "ACTIVE"
            await user.save();
            ////
            let reports = {
                "action":"Verify Phone ",
                "type":"USERS",
                "deepId":user.id,
                "user": user._id
            };
            await Report.create({...reports });
            await User.findById(user.id).populate(populateQueryById)
            .then(async(e)=>{
                let index = await transformUserById(e,lang)
                if(user.accountType == "ACTIVE"){
                    res.send({
                        success:true,
                        data:index,
                        token:generateToken(user.id)
                    });
                }else{
                    res.send({
                        success:true,
                        data:index,
                        accountType:e.accountType,
                    });
                }
            })
           
        } catch (err) {
            next(err);
        }
    },
    //forget password send to email
    validateSendCode() {
        return [
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }).isEmail().withMessage('email.syntax')
        ];
    },
    async sendCodeToEmail(req, res, next) {        
        try {
            let validatedBody = checkValidations(req);
            let user = await checkUserExistByEmail(validatedBody.email);
            let code = "0000"
            if(process.env.environment === 'PRODUCTION'){
                if(code.toString().length < 4){
                    code = generateVerifyCode(); 
                }
            }
            user.verifycode = code; 
            await user.save();
            //send code
            let text = user.verifycode.toString();
            let description = ' verfication code ';
            sendEmail(validatedBody.email, text,description)
            let reports = {
                "action":"Send code to email for forget pass",
                "type":"USERS",
                "deepId":user.id,
                "user": user.id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});
        } catch (error) {
            next(error);
        }
    },
    validateConfirmVerifyCode() {
        return [
            body('verifycode').not().isEmpty().withMessage((value, { req}) => {
                return req.__('verifycode.required', { value});
            }),
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }).isEmail().withMessage('email.syntax')
        ];
    },
    async resetPasswordConfirmVerifyCode(req, res, next) {        
        try {
            let validatedBody = checkValidations(req);
            let user = await checkUserExistByEmail(validatedBody.email);
            if (user.verifycode != validatedBody.verifycode)
                return next(new ApiError.BadRequest(i18n.__('verifyCode.notMatch')));
            /////
            user.active = true;
            await user.save();
            ////
            let reports = {
                "action":"Confirm Verify code for forget password",
                "type":"USERS",
                "deepId":user.id,
                "user": user.id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});
        } catch (err) {
            next(err);
        }
    },
    validateResetPassword() {
        return [
            body('verifycode').not().isEmpty().withMessage((value, { req}) => {
                return req.__('verifycode.required', { value});
            }),
            body('email').not().isEmpty().withMessage((value, { req}) => {
                return req.__('email.required', { value});
            }).isEmail().withMessage('email.syntax'),
            body('newPassword').not().isEmpty().withMessage((value, { req}) => {
                return req.__('newPassword.required', { value});
            }).isLength({ min: 8 }).withMessage((value, { req}) => {
                return req.__('newPassword.invalid', { value});
            }).custom(async (value, { req }) => {
                var exp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
                if(!exp.test(value)){
                    throw new Error(req.__('newPassword.invalid'));
                }
                else
                    return true;
                
            }),
        ];
    },
    async resetPassword(req, res, next) {        
        try {
            let validatedBody = checkValidations(req);
            let user = await checkUserExistByEmail(validatedBody.email);
            if (user.verifycode != validatedBody.verifycode)
                return next(new ApiError.BadRequest(i18n.__('verifyCode.notMatch')));
            user.password = validatedBody.newPassword;
            await user.save();
            let reports = {
                "action":"Reset Password By Email",
                "type":"USERS",
                "deepId":user.id,
                "user": user.id
            };
            await Report.create({...reports });
            res.status(200).send({success: true,msg:i18n.__('done')});

        } catch (err) {
            next(err);
        }
    },
    validateForgetPassword() {
        return [
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }).custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }else{
                    return true;
                }
            })
        ];
    },
    async forgetPasswordSms(req, res, next) {        
        try {
            let validatedBody = checkValidations(req);
            let realPhone = "+2" + validatedBody.phone;
            let user = await checkUserExistByPhone(validatedBody.phone);
            let code = "0000"
            if(process.env.environment === 'PRODUCTION'){
                code = generateVerifyCode(); 
                if(code.toString().length < 4){
                    code = generateVerifyCode(); 
                }
                let message =  `رمز التحقيق لتطبيق EDYOUHUB هو ${code} الرجاء استخدامه لتفعيل الحساب الخاص بك.` 
                console.log("send")
                sendSms(realPhone,message)
            }
            user.verifycode = code
            await user.save();
            let reports = {
                "action":"Send code to phone for forget pass",
                "type":"USERS",
                "deepId":user.id,
                "user": user.id
            };
            await Report.create({...reports });

            res.status(200).send({success: true});
        } catch (error) {
            next(error);
        }
    },
    validateConfirmVerifyCodePhone() {
        return [
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }).custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }else{
                    return true;
                }
            }),
            body('verifycode').not().isEmpty().withMessage((value, { req}) => {
                return req.__('verifycode.required', { value});
            }),
        ];
    },
    async resetPasswordConfirmVerifyCodePhone(req, res, next) {        
        try {
            let validatedBody = checkValidations(req);
            console.log(validatedBody)
            let user = await checkUserExistByPhone(validatedBody.phone);
            if (user.verifycode != validatedBody.verifycode)
                return next(new ApiError.BadRequest(i18n.__('verifyCode.notMatch')));
            user.active = true;
            await user.save();
            let reports = {
                "action":"Confirm code for phone forget pass",
                "type":"USERS",
                "deepId":user.id,
                "user": user.id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});
        } catch (err) {
            next(err);
        }
    },
    validateResetPasswordPhone() {
        return [
            body('verifycode').not().isEmpty().withMessage((value, { req}) => {
                return req.__('verifycode.required', { value});
            }),
            body('phone').not().isEmpty().withMessage((value, { req}) => {
                return req.__('phone.required', { value});
            }),
            body('newPassword').not().isEmpty().withMessage((value, { req}) => {
                return req.__('newPassword.required', { value});
            }).isLength({ min: 8 }).withMessage((value, { req}) => {
                return req.__('newPassword.invalid', { value});
            }).custom(async (value, { req }) => {
                var exp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
                if(!exp.test(value)){
                    throw new Error(req.__('newPassword.invalid'));
                }
                else
                    return true;
                
            }),
        ];
    },
    async resetPasswordPhone(req, res, next) {        
        try {
            let validatedBody = checkValidations(req);
            let user = await checkUserExistByPhone(validatedBody.phone);
            if (user.verifycode != validatedBody.verifycode)
                return next(new ApiError.BadRequest(i18n.__('verifyCode.notMatch')));
            user.password = validatedBody.newPassword;
            await user.save();
            let reports = {
                "action":"rest password by phone",
                "type":"USERS",
                "deepId":user.id,
                "user": user.id
            };
            await Report.create({...reports });
           
            res.status(200).send({success: true,msg:i18n.__("done")});

        } catch (err) {
            next(err);
        }
    },
    async logout(req,res,next){
        try{
            
            
            let user = await checkExistThenGet(req.user._id, User);
            let arr = user.tokens;
            let token = req.body.token;
            console.log(arr);
            arr = arr.filter(v => v.token != token)
            
            console.log(arr);
            user.tokens = arr;
            await user.save();
            res.status(200).send({
                success:true,
                user:await checkExistThenGet(req.user._id, User)
            });
        } catch(err){
            next(err)
        }
    },
};
