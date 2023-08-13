
import express from 'express';
import academicYearController from '../../controllers/academicYear/academicYear.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        academicYearController.validateBody(),
        academicYearController.create
    ).get(academicYearController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(academicYearController.getAll);

router.route('/:academicYearId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        academicYearController.validateBody(true),
        academicYearController.update
    )
    .get(academicYearController.getById)
    .delete(requireAuth,permissions('ADMIN'),academicYearController.delete);






export default router;
