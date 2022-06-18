import express from 'express';
import {  requireAuth} from '../../services/passport';
import studentController from '../../controllers/student/student.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';

const router = express.Router();
router.route('/')
    .post(  
        requireAuth,
        studentController.validateBody(),
        studentController.create
    ).get(requireAuth,studentController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,studentController.getAll);
router.route('/:studentId')
    .put(
        requireAuth,
        studentController.validateBody(true),
        studentController.update
    )
    .get(requireAuth,studentController.findById)
    .delete(requireAuth,studentController.delete);

export default router;
