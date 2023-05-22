
import express from 'express';
import BrandController from '../../controllers/brand/brand.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('brands').single('img'),
        BrandController.validateBody(),
        BrandController.create
    ).get(BrandController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(BrandController.getAll);

router.route('/:brandId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('brands').single('img'),
        BrandController.validateBody(true),
        BrandController.update
    )
    .get(BrandController.getById)
    .delete(requireAuth,permissions('ADMIN'),BrandController.delete);






export default router;
