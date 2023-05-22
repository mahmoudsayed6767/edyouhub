import express from 'express';
import { requireAuth } from '../../services/passport';
import subscribeServiceController from '../../controllers/subscribeService/subscribeService.controller';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/:businessId')
    .post(
        requireAuth,
        subscribeServiceController.validateBody(),
        subscribeServiceController.create
    )
router.route('/')
    .get(requireAuth,permissions('ADMIN'),subscribeServiceController.findAll);

router.route('/:subscribeServiceId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        subscribeServiceController.validateBody(true),
        subscribeServiceController.update
    )
    .delete(requireAuth,permissions('ADMIN'),subscribeServiceController.delete);


router.route('/:subscribeServiceId/accept')
    .put(
        requireAuth,
        permissions('ADMIN'),
        subscribeServiceController.accept
    )
router.route('/:subscribeServiceId/reject')
    .put(
        requireAuth,
        permissions('ADMIN'),
        subscribeServiceController.reject
    )



export default router;