import express from 'express';
import PackageController from '../../controllers/package/package.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        PackageController.validateBody(),
        PackageController.create
    )
    .get(PackageController.findAll);
router.route('/withoutPagenation/get')
    .get(PackageController.findAllWithoutPagenation);
 
router.route('/:packageId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        PackageController.validateBody(true),
        PackageController.update
    )
    .get(PackageController.findById)
    .delete( requireAuth,permissions('ADMIN'),PackageController.delete);
router.post('/buyPackage',
    requireAuth,
    permissions('ADMIN'),
    PackageController.validateBuyPackage(),
    PackageController.buyPackage);

export default router;