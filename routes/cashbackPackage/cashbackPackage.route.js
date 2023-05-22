import express from 'express';
import cashbackPackageController from '../../controllers/cashbackPackage/cashbackPackage.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        cashbackPackageController.validateBody(),
        cashbackPackageController.create
    )
    .get(cashbackPackageController.findAll);
router.route('/withoutPagenation/get')
    .get(cashbackPackageController.findAllWithoutPagenation);
 
router.route('/:cashbackPackageId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        cashbackPackageController.validateBody(true),
        cashbackPackageController.update
    )
    .get(cashbackPackageController.findById)
    .delete( requireAuth,permissions('ADMIN'),cashbackPackageController.delete);

router.route('/:cashbackPackageId/buycashbackPackage')
    .put(
        requireAuth,
        permissions('ADMIN'),
        cashbackPackageController.buycashbackPackage
    )

export default router;