
import express from 'express';
import higherEducationController from '../../controllers/higherEducation/higherEducation.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        higherEducationController.validateBody(),
        higherEducationController.create
    ).get(higherEducationController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(higherEducationController.getAll);

router.route('/:higherEducationId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        higherEducationController.validateBody(true),
        higherEducationController.update
    )
    .get(higherEducationController.getById)
    .delete(requireAuth,permissions('ADMIN'),higherEducationController.delete);






export default router;
