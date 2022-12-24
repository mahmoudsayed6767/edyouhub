import express from 'express';
import { requireAuth } from '../../services/passport';
import vacancyController from '../../controllers/vacancy/vacancy.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        vacancyController.validateBody(),
        vacancyController.create
    )
    .get(vacancyController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(vacancyController.getAll);

router.route('/:vacancyId')
    .put(
        requireAuth,
        vacancyController.validateBody(true),
        vacancyController.update
    )
    .get(requireAuth,vacancyController.getById)
    .delete(requireAuth,vacancyController.delete);






export default router;