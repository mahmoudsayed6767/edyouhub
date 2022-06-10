import express from 'express';
import { requireSignIn, requireAuth } from '../../services/passport';
import UserController from '../../controllers/user/user.controller';
import { multerSaveTo } from '../../services/multer-service';
import Logger from "../../services/logger";
const logger = new Logger('login')
const router = express.Router();

//login with phone and password
router.post('/signin',(req, res , next) => {
    logger.info(`${req.ip} || try to login`);
    next();
},requireSignIn, UserController.signIn);
router.route('/signUp')
    .post(
        multerSaveTo('users').single('img'),
        UserController.validateSignUpBody(),
        UserController.signUp
    );
router.route('/verifyPhone')
    .post(
        UserController.validateVerifyPhone(),
        UserController.verifyPhone
    );

router.route('/addUser')
    .post(
        requireAuth,
        multerSaveTo('users').single('img'),
        UserController.validateSignUpBody(),
        UserController.addUser
    );

//get all 
router.route('/getAll')
    .get(requireAuth,UserController.findAll);
router.route('/withoutPagenation/get')
    .get(requireAuth,UserController.getAll);
//get by id  
// router.route('/:id/getUser')
//     .get(UserController.getUser);
router.route('/:id/findById')
    .get(requireAuth,UserController.findById);
router.route('/:userId/delete')
    .delete(requireAuth,UserController.delete);

router.route('/:userId/block')
    .put(
        requireAuth,
        UserController.block
    );
router.route('/:userId/unblock')
    .put(
        requireAuth,
        UserController.unblock
    );

router.route('/logout')
    .post(
        requireAuth,
        UserController.logout
    );
router.route('/addToken')
    .post(
        requireAuth,
        UserController.addToken
    );
router.route('/updateToken')
    .put(
        requireAuth,
        UserController.updateToken
    );
//update profile
router.put('/user/:userId/updateInfo',
    requireAuth,
    multerSaveTo('users').single('img'),
    UserController.validateUpdatedUser(true),
    UserController.updateUser);
//update password
router.put('/user/updatePassword',
    requireAuth,
    UserController.validateUpdatedPassword(),
    UserController.updatePassword);
//send verify code

router.post('/sendCode',
    UserController.validateSendCode(),
    UserController.sendCodeToEmail);

router.post('/confirm-code',
    UserController.validateConfirmVerifyCode(),
    UserController.resetPasswordConfirmVerifyCode);

router.post('/reset-password',
    UserController.validateResetPassword(),
    UserController.resetPassword);

router.post('/sendCode-phone',
    UserController.validateForgetPassword(),
    UserController.forgetPasswordSms);

router.post('/confirm-code-phone',
    UserController.validateConfirmVerifyCodePhone(),
    UserController.resetPasswordConfirmVerifyCodePhone);

router.post('/reset-password-phone',
    UserController.validateResetPasswordPhone(),
    UserController.resetPasswordPhone);

router.route('/addDevice')
    .post(
        requireAuth,
        UserController.validateAddDevice(),
        UserController.addNewDevice
    );
router.route('/getAllDevices')
    .get(
        requireAuth,
        UserController.findAllDevices
    );
export default router;
