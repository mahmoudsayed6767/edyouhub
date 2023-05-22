
import express from 'express';
import subjectController from '../../controllers/subject/subject.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        subjectController.validateBody(),
        subjectController.create
    ).get(subjectController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(subjectController.getAll);

router.route('/:subjectId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        subjectController.validateBody(true),
        subjectController.update
    )
    .get(subjectController.getById)
    .delete(requireAuth,permissions('ADMIN'),subjectController.delete);






export default router;
