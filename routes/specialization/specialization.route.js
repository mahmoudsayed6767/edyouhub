
import express from 'express';
import specializationController from '../../controllers/specialization/specialization.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        specializationController.validateBody(),
        specializationController.create
    ).get(specializationController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(specializationController.getAll);

router.route('/:specializationId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        specializationController.validateBody(true),
        specializationController.update
    )
    .get(specializationController.getById)
    .delete(requireAuth,permissions('ADMIN'),specializationController.delete);






export default router;
