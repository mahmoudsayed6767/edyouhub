
import express from 'express';
import adminRequestController from '../../controllers/adminRequest/adminRequest.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        adminRequestController.validateBody(),
        adminRequestController.create
    ).get(adminRequestController.getAllPaginated)

router.route('/:adminRequestId')
    .delete(requireAuth,adminRequestController.delete);

router.route('/:adminRequestId/accept')
    .put(
        requireAuth,
        adminRequestController.accept
    )
router.route('/:adminRequestId/reject')
    .put(
        requireAuth,
        adminRequestController.reject
    )






export default router;
