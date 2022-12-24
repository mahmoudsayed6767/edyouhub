import express from 'express';
import { requireAuth } from '../../services/passport';
import admissionController from '../../controllers/admission/admission.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        admissionController.validateBody(),
        admissionController.create
    )
    .get(admissionController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(admissionController.getAll);

router.route('/:admissionId')
    .put(
        requireAuth,
        admissionController.validateBody(true),
        admissionController.update
    )
    .get(requireAuth,admissionController.getById)
    .delete(requireAuth,admissionController.delete);






export default router;