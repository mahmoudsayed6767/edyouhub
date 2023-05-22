import express from 'express';
import OrderController from '../../controllers/order/order.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/:userId/users')
    .post(
        requireAuth,
        OrderController.validateCreatedOrders(),
        OrderController.create
    );

router.route('/')
    .get(requireAuth,OrderController.findOrders)

router.route('/withoutPagenation/get')
    .get(requireAuth,OrderController.getOrders)
router.route('/:orderId')
    .get(requireAuth,OrderController.findById)
    .delete( requireAuth,OrderController.delete);


router.route('/:orderId/accept')
    .put( requireAuth,permissions('ADMIN'),OrderController.accept)

router.route('/:orderId/refuse')
    .put( requireAuth,permissions('ADMIN'),OrderController.refuse)
router.route('/:orderId/cancel')
    .put( requireAuth,OrderController.cancel)
router.route('/:orderId/outForDelivery')
    .put( requireAuth,permissions('ADMIN'),OrderController.outForDelivery)

router.route('/:orderId/delivered')
    .put( requireAuth,permissions('ADMIN'),OrderController.deliver)

router.route('/getDelivaryPrice')
    .post(
        requireAuth,
        OrderController.validateGetPrices(),
        OrderController.getPrice
    );

export default router;
