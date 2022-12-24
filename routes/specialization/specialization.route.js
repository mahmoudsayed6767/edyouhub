
import express from 'express';
import specializationController from '../../controllers/specialization/specialization.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        specializationController.validateBody(),
        specializationController.create
    ).get(specializationController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(specializationController.getAll);

router.route('/:specializationId')
    .put(
        requireAuth,
        specializationController.validateBody(true),
        specializationController.update
    )
    .get(specializationController.getById)
    .delete(requireAuth,specializationController.delete);






export default router;
