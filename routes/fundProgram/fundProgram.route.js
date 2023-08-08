
import express from 'express';
import fundProgramController from '../../controllers/fundProgram/fundProgram.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        fundProgramController.validateBody(),
        fundProgramController.create
    ).get(fundProgramController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(fundProgramController.getAll);

router.route('/:fundProgramId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        fundProgramController.validateBody(true),
        fundProgramController.update
    )
    .get(fundProgramController.getById)
    .delete(requireAuth,permissions('ADMIN'),fundProgramController.delete);






export default router;
