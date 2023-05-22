import express from 'express';
import { requireAuth } from '../../services/passport';
import GradeController from '../../controllers/grade/grade.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        GradeController.validateBody(),
        GradeController.create
    )
    .get(GradeController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(GradeController.getAll);

router.route('/:gradeId')
    .put(
        requireAuth,
        GradeController.validateBody(true),
        GradeController.update
    )
    .get(requireAuth,GradeController.getById)
    .delete(requireAuth,GradeController.delete);






export default router;