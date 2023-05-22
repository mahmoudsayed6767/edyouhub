import express from 'express';
import { requireAuth } from '../../services/passport';
import EducationInstitutionController from '../../controllers/education institution/education institution.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('education').single('img'),
        parseStringToArrayOfObjectsMw('services'),
        EducationInstitutionController.validateBody(),
        EducationInstitutionController.create
    )
    .get(EducationInstitutionController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(EducationInstitutionController.getAll);
router.route('/:educationInstitutionId/getSuppliesTotal')
    .get(EducationInstitutionController.getSuppliesTotal);
router.route('/:educationInstitutionId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('education').single('img'),
        parseStringToArrayOfObjectsMw('services'),
        EducationInstitutionController.validateBody(true),
        EducationInstitutionController.update
    )
    .get(requireAuth,permissions('ADMIN'),EducationInstitutionController.getById)
    .delete(requireAuth,permissions('ADMIN'),EducationInstitutionController.delete);






export default router;