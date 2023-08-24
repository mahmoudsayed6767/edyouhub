import express from 'express';
import { requireAuth } from '../../services/passport';
import premiumController from '../../controllers/premium/premium.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        premiumController.validateBody(),
        premiumController.create
    )
    .get(requireAuth,premiumController.findAllPagenation);
router.route('/paidMulti')
    .put(
        requireAuth,
        premiumController.paidMulti
    )
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
        multerSaveTo('premuims').single('paymentProof'),
        premiumController.paid
    )





export default router;