import express from 'express';
import FeesRequestController from '../../controllers/feesRequest/feesRequest.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions'

const router = express.Router();


router.route('/')
    .post(
        FeesRequestController.validateFeesRequestCreateBody(),
        FeesRequestController.create
    )
    .get(requireAuth,permissions('ADMIN'),FeesRequestController.findAll);

router.route('/:feesRequestId')
    .delete(requireAuth,permissions('ADMIN'),FeesRequestController.delete)





export default router;