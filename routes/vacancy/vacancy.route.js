import express from 'express';
import { requireAuth } from '../../services/passport';
import vacancyController from '../../controllers/vacancy/vacancy.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('users').single('img'),
        parseStringToArrayOfObjectsMw('grades'),
        parseStringToArrayOfObjectsMw('requirements'),
        parseStringToArrayOfObjectsMw('importantNeeds'),
        vacancyController.validateBody(),
        vacancyController.create
    )
    .get(vacancyController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(vacancyController.getAll);

router.route('/:vacancyId')
    .put(
        requireAuth,
        multerSaveTo('users').single('img'),
        parseStringToArrayOfObjectsMw('grades'),
        parseStringToArrayOfObjectsMw('requirements'),
        parseStringToArrayOfObjectsMw('importantNeeds'),
        vacancyController.validateBody(true),
        vacancyController.update
    )
    .get(requireAuth,vacancyController.getById)
    .delete(requireAuth,vacancyController.delete);






export default router;