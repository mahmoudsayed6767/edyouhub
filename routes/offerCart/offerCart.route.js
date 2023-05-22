import express from 'express';
import OfferCartController from '../../controllers/offerCart/offerCart.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/:offerId/offers')
    .post(
        requireAuth,
        OfferCartController.create
    );

router.route('/')
    .get(requireAuth,OfferCartController.findAll);
    

router.route('/:offerCartId')
    .delete( requireAuth,OfferCartController.delete);

router.route('/deleteAll')
    .delete( requireAuth,OfferCartController.deleteAll);



export default router;