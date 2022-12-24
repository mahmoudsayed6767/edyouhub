
import express from 'express';
import higherEducationController from '../../controllers/higherEducation/higherEducation.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        higherEducationController.validateBody(),
        higherEducationController.create
    ).get(higherEducationController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(higherEducationController.getAll);

router.route('/:higherEducationId')
    .put(
        requireAuth,
        higherEducationController.validateBody(true),
        higherEducationController.update
    )
    .get(higherEducationController.getById)
    .delete(requireAuth,higherEducationController.delete);






export default router;
