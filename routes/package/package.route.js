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
    .get(cache(10),PackageController.findAll);
router.route('/withoutPagenation/get')
    .get(cache(10),PackageController.findAllWithoutPagenation);
 
router.route('/:packageId')
    .put(
        requireAuth,
        PackageController.validateBody(true),
        PackageController.update
    )
    .get(cache(10),PackageController.findById)
    .delete( requireAuth,PackageController.delete);

router.route('/:packageId/buyPackage')
    .put(
        requireAuth,
        PackageController.buyPackage
    )

export default router;