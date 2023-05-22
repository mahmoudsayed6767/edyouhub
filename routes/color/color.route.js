
import express from 'express';
import ColorController from '../../controllers/color/color.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('Colors').single('img'),
        ColorController.validateBody(),
        ColorController.create
    )
    .get(ColorController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(ColorController.getAll);
router.route('/:colorId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('Colors').single('img'),
        ColorController.validateBody(true),
        ColorController.update
    )
    .get(ColorController.getById)
    .delete(requireAuth,permissions('ADMIN'),ColorController.delete);






export default router;
