import express from 'express';
import PackageController from '../../controllers/package/package.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        PackageController.validateBody(),
        PackageController.create
    )
    .get(PackageController.findAll);
router.route('/withoutPagenation/get')
    .get(PackageController.findAllWithoutPagenation);
 
router.route('/:packageId')
    .put(
        requireAuth,
        PackageController.validateBody(true),
        PackageController.update
    )
    .get(PackageController.findById)
    .delete( requireAuth,PackageController.delete);

router.route('/:packageId/buyPackage')
    .put(
        requireAuth,
        PackageController.buyPackage
    )

export default router;