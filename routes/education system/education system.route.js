import express from 'express';
import { requireAuth } from '../../services/passport';
import EducationSystemController from '../../controllers/education system/education system.controller';
import { multerSaveTo } from '../../services/multer-service';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('education').single('img'),
        EducationSystemController.validateBody(),
        EducationSystemController.create
    )
    .get(EducationSystemController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(EducationSystemController.getAll);

router.route('/:educationSystemId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('education').single('img'),
        EducationSystemController.validateBody(true),
        EducationSystemController.update
    )
    .get(requireAuth,permissions('ADMIN'),EducationSystemController.getById)
    .delete(requireAuth,permissions('ADMIN'),EducationSystemController.delete);






export default router;