import { checkExistThenGet, checkExist ,isInArray} from '../../helpers/CheckMethods';
import { body } from 'express-validator/check';
import { checkValidations, handleImg,convertLang } from '../shared/shared.controller';
import { generateToken } from '../../utils/token';
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import Report from "../../models/reports/report.model";
import ApiError from '../../helpers/ApiError';
import bcrypt from 'bcryptjs';
import { generateVerifyCode,generateCode } from '../../services/generator-code-service';
import DeviceDetector from "device-detector-js";
import { sendEmail } from "../../services/sendGrid";
import { sendNotifiAndPushNotifi } from "../../services/notification-service";
import i18n from "i18n";
import {transformUser,transformUserById } from '../../models/user/transformUser';
import UserDevice from "../../models/user devices/user devices.model";
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
const populateQuery = [
    { path: 'place', model: 'place'},
    { path: 'country', model: 'country' },
    { path: 'city', model: 'city' },
    { path: 'area', model: 'area' },
    
];

export default {
    async addToken(req,res,next){
        try{
            convertLang(req)
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
            convertLang(req)
            let lang = i18n.getLocale(req)
            let user = req.user;
            user = await User.findById(user.id).populate(populateQuery);
           
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
            await User.findById(user.id).populate(populateQuery)
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
            body('phone').trim().escape().not().isEmpty().withMessage((value, { req}) => {
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
            body('country').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('country.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('country.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Country.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('city.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await City.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('area.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
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
            convertLang(req)
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
            let createdUser = await User.create({
                ...validatedBody
            });
            //send code
            let theUser = await checkExistThenGet(createdUser.id, User,{deleted: false });
            if(validatedBody.token != null && validatedBody.token !=""){
                let arr2 = theUser.tokens; 
                if(!validatedBody.osType || validatedBody.osType == ""){
                    const deviceDetector = new DeviceDetector();
                    if(deviceDetector.parse(req.headers['user-agent']).os){
                        let osType = deviceDetector.parse(req.headers['user-agent']).os.name
                        if(isInArray(["Mac","iOS"],osType)){
                            validatedBody.osType = "IOS"
                        }else{
                            validatedBody.osType = "ANDROID"
                        }
                    }else{
                        validatedBody.osType = "WEB"
                    }
                }
                var found2 = arr2.find(x => x.token == validatedBody.token)
                
                if(!found2){
                    let theToken = {
                        token: validatedBody.token,
                        osType:validatedBody.osType
                    }
                    theUser.tokens.push(theToken);
                }
            }
            let code =  generateVerifyCode();
            if(code.toString().length < 4){
                code = generateVerifyCode(); 
            }else{
                theUser.verifycode = code
            }
            console.log(code)
            theUser.verifycode = "0000" 
            await theUser.save();
            let realPhone =  validatedBody.phone;
            let message =  ' رمز الدخول الخاص ب Noor هو ' + theUser.verifycode
            //sendSms(realPhone,message)
            let reports = {
                "action":"User sign Up ",
                "type":"USERS",
                "deepId":createdUser.id,
                "user": createdUser._id
            };
            await Report.create({...reports });
            await User.findById(createdUser.id).populate(populateQuery)
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
            convertLang(req)
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
            await User.findById(user.id).populate(populateQuery)
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
    async addUser(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403,  i18n.__('notAllow')));

            if(req.user.type =="PLACE" && validatedBody.type !="SUBERVISOR"){
                return next(new ApiError(403,  i18n.__('notAllow')));
            }
            if(validatedBody.type =="SUBERVISOR" && !validatedBody.place){
                return next(new ApiError(422,  i18n.__('place.required')));
            }
            if(validatedBody.type =="affiliate"){
                validatedBody.affiliateCode = generateCode(6)
            }
            
            
            //delete un active users with the same phone
            let unActiveUsers = await User.find({deleted: false,accountType:'SIGNUP-PROCESS',phone: validatedBody.phone})
            for (let id of unActiveUsers) {
                id.deleted = true;
                await id.save();
            }
            
            validatedBody.accountType = "ACTIVE"
            validatedBody.phoneVerify = true;
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                validatedBody.img = image;
            }
            let createdUser = await User.create({
                ...validatedBody
            });
            let reports = {
                "action":"Add User",
                "type":"USERS",
                "deepId":createdUser.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await User.findById(createdUser.id).populate(populateQuery)
            .then(async(e)=>{
                let index = await transformUserById(e,lang)
                res.status(201).send({
                    success:true,
                    data:index,
                });
            })
        } catch (err) {
            next(err);
        }
    },
    async block(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 

            let { userId} = req.params;
            let user = await checkExistThenGet(userId,User);
            user.block = true;
            await user.save();
            sendNotifiAndPushNotifi({
                targetUser: userId, 
                fromUser: user._id, 
                text: 'Noor ',
                subject: userId,
                subjectType: 'logout',
                info:'LOGOUT',
                content_available:true
            });
            let reports = {
                "action":"Block User",
                "type":"USERS",
                "deepId":userId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});
        } catch (error) {
            next(error);
        }
    },
    async unblock(req, res, next) {
        try {
            convertLang(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 

            let { userId} = req.params;
            let user = await checkExistThenGet(userId,User);
            user.block = false;
            await user.save();
            let reports = {
                "action":"remove Block User",
                "type":"USERS",
                "deepId":userId,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.send({success: true});
        } catch (error) {
            next(error);
        }
    },
    validateUpdatedPassword(isUpdate = false) {
        let validation = [
            body('newPassword').not().isEmpty().withMessage((value, { req}) => {
                return req.__('newPassword.required', { value});
            }).isLength({ min: 6 }).withMessage((value, { req}) => {
                return req.__('newPassword.invalid', { value});
            }),
            body('currentPassword').not().isEmpty().withMessage((value, { req}) => {
                return req.__('currentPassword.required', { value});
            }).isLength({ min: 6 }).withMessage((value, { req}) => {
                return req.__('currentPassword.invalid', { value});
            }),
           
        ];

        return validation;
    },
    async updatePassword(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let user = await checkExistThenGet(req.user._id, User);
            if (req.body.newPassword) {
                if (req.body.currentPassword) {
                    if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
                        user.password = req.body.newPassword;
                    }
                    else {
                        res.status(400).send({
                            errors: [
                                {
                                    location: 'body',
                                    param: 'currentPassword',
                                    msg: i18n.__('currentPassword.invalid')
                                }
                            ]
                        });
                    }
                }
            }
            await user.save();
            await User.findById(req.user._id).populate(populateQuery)
            .then(async(e)=>{
                let index = await transformUserById(e,lang)
                res.send({
                    success:true,
                    data:index,
                    token:generateToken(req.user._id)
                });
            })

        } catch (error) {
            next(error);
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
            convertLang(req)
            let validatedBody = checkValidations(req);
            let user = await checkUserExistByEmail(validatedBody.email);
            user.verifycode = "0000"//generateVerifyCode(); 
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
            convertLang(req)
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
            convertLang(req)
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
            convertLang(req)
            let validatedBody = checkValidations(req);
            let realPhone = validatedBody.phone;
            let user = await checkUserExistByPhone(validatedBody.phone);

            user.verifycode = "0000"//generateVerifyCode();
            await user.save();
             //send code
            let message =  ' رمز الدخول الخاص ب Noor هو ' + user.verifycode
            //sendSms(realPhone,message)
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
            convertLang(req)
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
            convertLang(req)
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
    async updateToken(req,res,next){
        try{
            convertLang(req)
            
            let users = await checkExistThenGet(req.user._id, User);
            let arr2 = users.tokens;
            var found2 = arr2.find(x => x.token == req.body.token)
            if(!found2){
                let theToken = {
                    token: req.body.newToken,
                    osType:req.body.osType?req.body.osType:"IOS"
                }
                users.tokens.push(theToken);
            }
            await users.save();
            
            /*let oldtoken = req.body.oldToken;
            console.log(arr);
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == oldtoken){
                    arr.splice(arr[i], 1);
                }
            }
            users.token = arr;*/
            await users.save();
            res.status(200).send({
                success:true,
                user:await checkExistThenGet(req.user._id, User)
            });
        } catch(err){
            next(err)
        }
    },
    async logout(req,res,next){
        try{
            convertLang(req)
            
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
    async findById(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            let { id } = req.params;
            await checkExist(id, User, { deleted: false });
            let {userId} = req.params;
            let myUser
            if(userId){
                myUser= await checkExistThenGet(userId, User)
            }
            await User.findById(id).populate(populateQuery)
            .then(async(e)=>{
                let index = await transformUserById(e,lang,myUser,userId)
                res.send({success:true,data:index});
            })
            
        } catch (error) {
            next(error);
        }
    },
    async findAll(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            let page = +req.query.page || 1, limit = +req.query.limit || 20,
            {phoneVerify,search,accountType,type, active,place} = req.query;
            
            let query = {deleted: false };
            if (place) query.place = place
            if (phoneVerify=="true") query.phoneVerify = true;
            if (phoneVerify=="false") query.phoneVerify = false;
            if (type) query.type = type;
            if (accountType) query.accountType = accountType;
            if (active=="true") query.active = true;
            if (active=="false") query.active = false;
            if(search) {
                Object.assign(query ,{
                    $and: [
                        { $or: [
                            {fullname: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {phone: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                })
            }
            let sortd = {createdAt: -1}
            await User.find(query).populate(populateQuery)
            .sort(sortd)
            .limit(limit)
            .skip((page - 1) * limit)
            .then(async(data)=>{
                let newdata = []
                await Promise.all(data.map(async(e)=>{
                    let index = await transformUser(e,lang)
                    newdata.push(index)
                }))
                
                const usersCount = await User.countDocuments(query);
                const pageCount = Math.ceil(usersCount / limit);
                res.send(new ApiResponse(newdata, page, pageCount, limit, usersCount, req));
            })
           
        } catch (err) {
            next(err);
        }
    },
    async getAll(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            let {phoneVerify,search,accountType,type, active,place} = req.query;
            
            let query = {deleted: false };
            if (phoneVerify=="true") query.phoneVerify = true;
            if (phoneVerify=="false") query.phoneVerify = false;
            if (type) query.type = type;
            if (place) query.place = place;
            if (accountType) query.accountType = accountType;
            if (active=="true") query.active = true;
            if (active=="false") query.active = false;
            if(search) {
                Object.assign(query ,{
                    $and: [
                        { $or: [
                            {fullname: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                            {phone: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                          ] 
                        },
                        {deleted: false},
                    ]
                })
            }
            let sortd = {createdAt: -1}
            
            await User.find(query).populate(populateQuery)
            .sort(sortd)
            .then(async(data)=>{
                let newdata = []
                await Promise.all(data.map(async(e)=>{
                    let index = await transformUser(e,lang)
                    newdata.push(index)
                }))
                res.send({success: true,data:newdata});
            });
        } catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            convertLang(req)
            let {userId } = req.params;
            let user = await checkExistThenGet(userId, User,{deleted: false });

            if(!isInArray(["ADMIN","SUB-ADMIN","PLACE"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            //place delete SUBERVISOR
            console.log(req.user.place)
            console.log(user)
            if(req.user.type=="PLACE" && req.user.place != user.place){
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            }
            
            
            user.deleted = true
            await user.save();
            let reports = {
                "action":"Delete User",
                "type":"USERS",
                "deepId":user.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            res.status(200).send({success: true});
        }
        catch (err) {
            next(err);
        }
    },
    validateUpdatedUser(isUpdate = true) {
        let validation = [
            body('fullname').optional(),
            body('phone').optional()
            .custom(async (value, { req }) => {
                var exp = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[s/./0-9]*$/g
                if(!exp.test(value)){
                    throw new Error(req.__('phone.syntax'));
                }
                let {userId} = req.params;
                let user = await checkExistThenGet(userId, User);
                let userQuery = { phone: value ,deleted:false};
                if (isUpdate && user.phone === value)
                    userQuery._id = { $ne: userId };

                if (await User.findOne(userQuery))
                    throw new Error(req.__('phone.duplicated'));
                else
                    return true;
            }),
            body('email').optional().isEmail().withMessage('email.syntax')
                .custom(async (value, { req }) => {
                    let {userId} = req.params;
                    let user = await checkExistThenGet(userId, User);
                    let userQuery = { email: { $regex: value , '$options' : 'i'  },deleted:false };
                    if (isUpdate && user.email == value)
                        userQuery._id = { $ne: userId };

                    if (await User.findOne(userQuery))
                        throw new Error(req.__('email.duplicated'));
                    else
                        return true;
            }),
            body('country').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('country.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('country.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Country.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('country.invalid'));
                else
                    return true;
            }),
            body('city').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('city.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('city.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await City.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('city.invalid'));
                else
                    return true;
            }),
            body('area').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('area.required', { value});
            }).isNumeric().withMessage((value, { req}) => {
                return req.__('area.numeric', { value});
            }).custom(async (value, { req }) => {
                if (!await Area.findOne({_id:value,deleted:false}))
                    throw new Error(req.__('area.invalid'));
                else
                    return true;
            }),
            body('type').optional().isIn(['PLACE','SUBERVISOR','ADMIN','USER','AGENCY','AFFILIATE']).withMessage((value, { req}) => {
                return req.__('wrong.type', { value});
            }),
        ];
        if (isUpdate)
            validation.push([
                body('img').optional().custom(val => isImgUrl(val)).withMessage((value, { req}) => {
                    return req.__('image.invalid', { value});
                })
            ]);

        return validation;
    },
    async updateUser(req, res, next) {
        try {
            convertLang(req)
            let lang = i18n.getLocale(req)
            const validatedBody = checkValidations(req);
            let {userId} = req.params;
            let user = await checkExistThenGet(userId, User);
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
                if(user.type =="SUBERVISOR" && req.user.type =="PLACE"){
                    if(user.place != req.user.place)
                        return next(new ApiError(403,  i18n.__('notAllow')));
                }else{
                    if (userId!= req.user._id)
                        return next(new ApiError(403,  i18n.__('notAllow')));
                    
                }
                
            }
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'img', isUpdate: true });
                user.img = image;
            }
            if(validatedBody.country){
                user.country = validatedBody.country;
            }
            if(validatedBody.city){
                user.city = validatedBody.city;
            }
            if(validatedBody.area){
                user.area = validatedBody.area;
            }
            if(validatedBody.phone){
                user.phone = validatedBody.phone;
            }
            if(validatedBody.fullname){
                user.fullname = validatedBody.fullname;
            }
            if(validatedBody.age){
                user.age = validatedBody.age;
            }
            if(validatedBody.city){
                user.city = validatedBody.city;
            }
            if(validatedBody.area){
                user.area = validatedBody.area;
            }
            if(validatedBody.email){
                user.email = validatedBody.email;
            }
            if(validatedBody.type){
                user.type = validatedBody.type;
            }
            if(validatedBody.gender){
                user.gender = validatedBody.gender;
            }
           
            await user.save();
            let reports = {
                "action":"Update User",
                "type":"USERS",
                "deepId":user.id,
                "user": req.user._id
            };
            await Report.create({...reports });
            await User.findById(userId).populate(populateQuery)
            .then(async(e)=>{
                let index = await transformUserById(e,lang)
                res.send({
                    success:true,
                    data:index,
                    token:generateToken(userId)
                });
            })


        } catch (error) {
            next(error);
        }
    },
    validateAddDevice(isUpdate = false) {
        let validations = [
            body('deviceType').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('deviceType.required', { value});
            }),
            body('deviceModel').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('deviceModel.required', { value});
            }),
            body('deviceVersion').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('deviceVersion.required', { value});
            }),
            body('appVersion').trim().escape().not().isEmpty().withMessage((value, { req}) => {
                return req.__('appVersion.required', { value});
            }),
                
        ];
        return validations;
    },
    async addNewDevice(req, res, next) {
        try{
            convertLang(req)
            let validatedBody = checkValidations(req);
            validatedBody.user = req.user
            await UserDevice.create({
                ...validatedBody
            });
            
            res.status(201).send({success:true});

        } catch(err){
            next(err);
        }
    },
    async findAllDevices(req, res, next) {
        try {
            convertLang(req)
            //get the language selected
            let lang = i18n.getLocale(req)
            if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type))
                return next(new ApiError(403, i18n.__('admin.auth'))); 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {deleted: false };
            let {deviceType,user,appVersion,deviceVersion,deviceModel} = req.query
            if(user) query.user = user;
            if(appVersion) query.appVersion = { $regex: '.*' + appVersion + '.*' , '$options' : 'i'  };
            if(deviceVersion) query.deviceVersion = { $regex: '.*' + deviceVersion + '.*' , '$options' : 'i'  };
            if(deviceModel) query.deviceModel = { $regex: '.*' + deviceModel + '.*' , '$options' : 'i'  };
            if(deviceType) query.deviceType = { $regex: '.*' + deviceType + '.*' , '$options' : 'i'  };
            await UserDevice.find(query).populate('user')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        newdata.push({
                            deviceType:e.deviceType,
                            deviceModel: e.deviceModel,
                            deviceVersion:e.deviceVersion,
                            appVersion:e.appVersion,
                            user:{
                                fullname:e.user.fullname?e.user.fullname:"",
                                phone:e.user.phone,
                                img:e.user.img,
                                id:e.user._id
                            },
                            id: e._id,
                            createdAt: e.createdAt,
                        });
                    }))
                    const count = await UserDevice.countDocuments(query);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
            
        } catch (err) {
            next(err);
        }
    },

};
