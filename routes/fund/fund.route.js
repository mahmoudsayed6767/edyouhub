import express from 'express';
import {  requireAuth} from '../../services/passport';
import fundController from '../../controllers/fund/fund.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';

const router = express.Router();
router.route('/uploads')
    .post(  
        requireAuth,
        multerSaveTo('funds').fields([
            { name: 'personalIdImgs', maxCount: 4, options: false },
            { name: 'contractImgs', maxCount: 4, options: false },
            { name: 'utilityBillsImgs', maxCount: 4, options: false },
            { name: 'proofIncomeImgs', maxCount: 4, options: false },
            { name: 'feesLetter', maxCount: 4, options: false },
        ]),
        fundController.uploadImgs
    )
router.route('/')
    .post(  
        requireAuth,
        fundController.validateBody(),
        fundController.create
    ).get(requireAuth,fundController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,fundController.getAll);
router.route('/:fundId')
    .put(
        requireAuth,
        fundController.validateBody(true),
        fundController.update
    )
    .get(requireAuth,fundController.findById)
    .delete(requireAuth,fundController.delete);
router.route('/:fundId/reviewing')
    .put(
        requireAuth,
        fundController.reviewing
    )

router.route('/:fundId/needAction')
    .put(
        requireAuth,
        fundController.validateTakeActionBody(),
        fundController.needAction
    )
router.route('/:fundId/actionReply')
    .put(
        requireAuth,
        multerSaveTo('fund').single('actionFile'),
        fundController.validateActionReplyBody(),
        fundController.actionReply
    )
router.route('/:fundId/reject')
    .put(
        requireAuth,
        fundController.validateTakeActionBody(),
        fundController.reject
    )
router.route('/:fundId/partialAcceptance')
    .put(
        requireAuth,
        fundController.validatePartialAcceptBody(),
        fundController.partialAcceptance
    )
router.route('/:fundId/accept')
    .put(
        requireAuth,
        fundController.validateTakeActionBody(),
        fundController.accept
    )
router.route('/:fundId/active')
    .put(
        requireAuth,
        multerSaveTo('fund').single('educationFile'),
        fundController.validateActiveBody(),
        fundController.active
    )
router.route('/:fundId/payFirstPaid')
    .put(
        requireAuth,
        fundController.payFirstPaid
    )
export default router;
