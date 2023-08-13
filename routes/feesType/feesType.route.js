
import express from 'express';
import feesTypeController from '../../controllers/feesType/feesType.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        feesTypeController.validateBody(),
        feesTypeController.create
    ).get(feesTypeController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(feesTypeController.getAll);

router.route('/:feesTypeId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        feesTypeController.validateBody(true),
        feesTypeController.update
    )
    .get(feesTypeController.getById)
    .delete(requireAuth,permissions('ADMIN'),feesTypeController.delete);






export default router;
