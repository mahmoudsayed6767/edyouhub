import express from 'express';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'
import EducationPhaseController from '../../controllers/education phase/education phase.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        EducationPhaseController.validateBody(),
        EducationPhaseController.create
    )
    .get(EducationPhaseController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(EducationPhaseController.getAll);

router.route('/:educationPhaseId')
    .put(
        requireAuth,
        EducationPhaseController.validateBody(true),
        EducationPhaseController.update
    )
    .get(requireAuth,EducationPhaseController.getById)
    .delete(requireAuth,EducationPhaseController.delete);






export default router;