import express from 'express';
import cashbackPackageController from '../../controllers/cashbackPackage/cashbackPackage.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        cashbackPackageController.validateBody(),
        cashbackPackageController.create
    )
    .get(cashbackPackageController.findAll);
router.route('/withoutPagenation/get')
    .get(cashbackPackageController.findAllWithoutPagenation);
 
router.route('/:cashbackPackageId')
    .put(
        requireAuth,
        cashbackPackageController.validateBody(true),
        cashbackPackageController.update
    )
    .get(cashbackPackageController.findById)
    .delete( requireAuth,cashbackPackageController.delete);

router.route('/:cashbackPackageId/buycashbackPackage')
    .put(
        requireAuth,
        cashbackPackageController.buycashbackPackage
    )

export default router;