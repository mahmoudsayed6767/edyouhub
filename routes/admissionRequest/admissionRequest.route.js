import express from 'express';
import { requireAuth } from '../../services/passport';
import admissionRequestController from '../../controllers/admissionRequest/admissionRequest.controller';

const router = express.Router();

router.route('/:admissionId/apply')
    .post(
        requireAuth,
        admissionRequestController.validateBody(),
        admissionRequestController.create
    )
router.route('/:admissionId/getAll')
    .get(requireAuth,admissionRequestController.getAllPaginated);

router.route('/:admissionId/withoutPagenation/get')
    .get(requireAuth,admissionRequestController.getAll);

router.route('/:admissionRequestId')
    .put(
        requireAuth,
        admissionRequestController.validateBody(true),
        admissionRequestController.update
    )
    .get(requireAuth,admissionRequestController.getById)
    .delete(requireAuth,admissionRequestController.delete);


router.route('/:admissionRequestId/accept')
    .put(
        requireAuth,
        admissionRequestController.accept
    )
router.route('/:admissionRequestId/reject')
    .put(
        requireAuth,
        admissionRequestController.reject
    )



export default router;