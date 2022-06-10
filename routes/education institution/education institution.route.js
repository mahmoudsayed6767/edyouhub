import express from 'express';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'
import EducationInstitutionController from '../../controllers/education institution/education institution.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('education').single('img'),
        EducationInstitutionController.validateBody(),
        EducationInstitutionController.create
    )
    .get(EducationInstitutionController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(EducationInstitutionController.getAll);

router.route('/:educationInstitutionId')
    .put(
        requireAuth,
        multerSaveTo('education').single('img'),
        EducationInstitutionController.validateBody(true),
        EducationInstitutionController.update
    )
    .get(requireAuth,EducationInstitutionController.getById)
    .delete(requireAuth,EducationInstitutionController.delete);






export default router;