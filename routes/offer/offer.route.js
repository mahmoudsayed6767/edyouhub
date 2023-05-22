import express from 'express';
import {  requireAuth} from '../../services/passport';
import OfferController from '../../controllers/offer/offer.controller';
import { multerSaveTo } from '../../services/multer-service';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(  
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('offers').fields([
            { name: 'imgs', maxCount: 5, options: false },
        ]),
        OfferController.validateBody(),
        OfferController.create
    ).get(OfferController.findAll);
router.route('/withoutPagenation/get')
    .get(OfferController.getAll);
router.route('/:offerId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('offers').fields([
            { name: 'imgs', maxCount: 5, options: false },
        ]),
        OfferController.validateBody(true),
        OfferController.update
    )
    .get(OfferController.findById)
    .delete(requireAuth,permissions('ADMIN'),OfferController.delete);

router.route('/:offerId/bookOffer')
    .post(
        requireAuth,
        OfferController.bookOffer
    )
router.route('/confirmOffer')
    .post(
        requireAuth,
        OfferController.validateConfirmBody(),
        OfferController.confirmOffer
    )
export default router;
