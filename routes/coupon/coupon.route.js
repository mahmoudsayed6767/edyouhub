import express from 'express';
import CouponController from '../../controllers/coupon/coupon.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth, 
        permissions('ADMIN'),
        CouponController.validateBody(),
        CouponController.create
    )
    .get(requireAuth,permissions('ADMIN'),CouponController.findAll);
router.route('/withoutPagenation/get')
    .get(requireAuth,permissions('ADMIN'), CouponController.findAllWithoutPagenation);

router.route('/:couponId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        CouponController.validateBody(true),
        CouponController.update
    )
    .get(requireAuth,permissions('ADMIN'),CouponController.findById)
    .delete( requireAuth,permissions('ADMIN'),CouponController.delete);

router.route('/:couponId/end')
    .put(
        requireAuth,
        permissions('ADMIN'),
        CouponController.end
    )
router.route('/:couponId/reused')
    .put(
        requireAuth,
        permissions('ADMIN'),
        CouponController.reused
    )

router.route('/checkValidateCoupon')
    .post(
        requireAuth,
        CouponController.validateCheckCouponBody(),
        CouponController.checkValidateCoupon
    )



export default router;