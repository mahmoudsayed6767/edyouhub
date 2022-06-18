import express from 'express';
import { requireAuth } from '../../services/passport';
import premiumController from '../../controllers/premium/premium.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        premiumController.validateBody(),
        premiumController.create
    )
    .get(requireAuth,premiumController.findAllPagenation);

router.route('/withoutPagenation/get')
    .get(requireAuth,premiumController.findAll);

router.route('/:premiumId')
    .put(
        requireAuth,
        premiumController.validateBody(true),
        premiumController.update
    )
    .get(requireAuth,premiumController.findById)
    .delete(requireAuth,premiumController.delete);

router.route('/:premiumId/paid')
    .put(
        requireAuth,
        premiumController.paid
    )




export default router;