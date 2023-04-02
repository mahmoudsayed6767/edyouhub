
import express from 'express';
import subjectController from '../../controllers/subject/subject.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        subjectController.validateBody(),
        subjectController.create
    ).get(subjectController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(subjectController.getAll);

router.route('/:subjectId')
    .put(
        requireAuth,
        subjectController.validateBody(true),
        subjectController.update
    )
    .get(subjectController.getById)
    .delete(requireAuth,subjectController.delete);






export default router;
