import express from 'express';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'
import EducationSystemController from '../../controllers/education system/education system.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
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
        multerSaveTo('education').single('img'),
        EducationSystemController.validateBody(true),
        EducationSystemController.update
    )
    .get(requireAuth,EducationSystemController.getById)
    .delete(requireAuth,EducationSystemController.delete);






export default router;