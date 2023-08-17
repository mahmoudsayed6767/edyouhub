import express from 'express';
import { requireAuth } from '../../services/passport';
import fundController from '../../controllers/fund/fund.controller';
import { multerSaveTo } from '../../services/multer-service';
import { permissions } from '../../services/permissions';

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
            { name: 'files', maxCount: 10, options: false },
        ]),
        fundController.uploadImgs
    )
router.route('/')
    .post(
        requireAuth,
        fundController.validateBody(),
        fundController.create
    ).get(requireAuth, fundController.getAllPaginated);
router.route('/Completed')
    .post(
        requireAuth,
        fundController.validateCompletedBody(),
        fundController.createCompleted
    )
router.route('/withoutPagenation/get')
    .get(requireAuth, fundController.getAll);
router.route('/:fundId')
    .put(
        requireAuth,
        fundController.validateBody(true),
        fundController.update
    )
    .get(requireAuth, fundController.findById)
    .delete(requireAuth, fundController.delete);
router.route('/:fundId/reviewing')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.reviewing
    )
router.route('/:fundId/cancel')
    .put(
        requireAuth,
        fundController.cancel
    )

router.route('/:fundId/needAction')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.validateNeedActionBody(),
        fundController.needAction
    )
router.route('/:fundId/actionReply')
    .put(
        requireAuth,
        fundController.validateActionReplyBody(),
        fundController.actionReply
    )
router.route('/:fundId/reject')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.validateRejectBody(),
        fundController.reject
    )
router.route('/:fundId/partialAcceptance')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.validatePartialAcceptBody(),
        fundController.partialAcceptance
    )
router.route('/:fundId/accept')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.validateAcceptBody(),
        fundController.accept
    )
router.route('/:fundId/active')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.validateActiveBody(),
        fundController.active
    )
router.route('/:fundId/payFirstPaid')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundController.payFirstPaid
    )
export default router;