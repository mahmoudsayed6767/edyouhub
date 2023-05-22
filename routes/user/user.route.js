import express from 'express';
import { requireSignIn, requireAuth } from '../../services/passport';
import UserController from '../../controllers/user/user.controller';
import { multerSaveTo } from '../../services/multer-service';
import AuthController from '../../controllers/user/auth.controller';
import { permissions } from '../../services/permissions';

const router = express.Router();

//login with phone and password
router.post('/signin',requireSignIn, AuthController.signIn);
router.route('/signUp')
    .post(
        multerSaveTo('users').single('img'),
        AuthController.validateSignUpBody(),
        AuthController.signUp
    );
router.route('/verifyPhone')
    .post(
        AuthController.validateVerifyPhone(),
        AuthController.verifyPhone
    );

router.route('/addUser')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('users').single('img'),
        AuthController.validateSignUpBody(),
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
        permissions('ADMIN'),
        UserController.block
    );
router.route('/:userId/unblock')
    .put(
        requireAuth,
        permissions('ADMIN'),
        UserController.unblock
    );

router.route('/logout')
    .post(
        requireAuth,
        AuthController.logout
    );
router.route('/addToken')
    .post(
        requireAuth,
        AuthController.addToken
    );
//update profile
router.put('/user/:userId/updateInfo',
    requireAuth,
    multerSaveTo('users').single('img'),
    UserController.validateUpdatedUser(true),
    UserController.updateUser);
router.put('/user/:userId/completeProfile',
    requireAuth,
    UserController.validateCompleteProfile(true),
    UserController.completeProfile);
//update password
router.put('/user/updatePassword',
    requireAuth,
    UserController.validateUpdatedPassword(),
    UserController.updatePassword);
//send verify code

router.post('/sendCode',
    AuthController.validateSendCode(),
    AuthController.sendCodeToEmail);

router.post('/confirm-code',
    AuthController.validateConfirmVerifyCode(),
    AuthController.resetPasswordConfirmVerifyCode);

router.post('/reset-password',
    AuthController.validateResetPassword(),
    AuthController.resetPassword);

router.post('/sendCode-phone',
    AuthController.validateForgetPassword(),
    AuthController.forgetPasswordSms);

router.post('/confirm-code-phone',
    AuthController.validateConfirmVerifyCodePhone(),
    AuthController.resetPasswordConfirmVerifyCodePhone);

router.post('/reset-password-phone',
    AuthController.validateResetPasswordPhone(),
    AuthController.resetPasswordPhone);

router.route('/addAddress')
    .post(
        requireAuth,
        UserController.validateAddAddress(),
        UserController.addAddress
    );
router.route('/getAddresses')
    .get(
        requireAuth,
        UserController.getAddress
    );
export default router;
