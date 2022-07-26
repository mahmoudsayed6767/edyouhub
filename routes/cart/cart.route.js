import express from 'express';
import CartController from '../../controllers/cart/cart.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching';

const router = express.Router();

router.route('/:suppliesId/supplies')
    .post(
        requireAuth,
        CartController.validateBody(),
        CartController.create
    );
router.route('/:cartId')
    .put(
        requireAuth,
        CartController.validateBody(),
        CartController.update
    )
    .delete( requireAuth,CartController.unCart);

router.route('/')
    .get(requireAuth,CartController.findAll);

router.route('/deleteAll')
    .delete( requireAuth,CartController.deleteAll);



export default router;