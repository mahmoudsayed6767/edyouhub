import express from 'express';
import {  requireAuth} from '../../services/passport';
import feesController from '../../controllers/fees/fees.controller';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(  
        requireAuth,
        permissions('ADMIN'),
        feesController.validateBody(),
        feesController.create
    ).get(requireAuth,feesController.findAllPagenation);
router.route('/addManyFees')
    .post(  
        requireAuth,
        permissions('ADMIN'),
        feesController.validateAddMany(),
        feesController.addMany
    )
router.route('/addManyFees/existStudents')
    .post(  
        requireAuth,
        permissions('ADMIN'),
        feesController.validateAddManyExistStudents(),
        feesController.addManyExistStudents
    )
router.route('/withoutPagenation/get')
    .get(requireAuth,feesController.findAll);
router.route('/:feesId')
    .get(requireAuth,feesController.findById)
    .delete(requireAuth,permissions('ADMIN'),feesController.delete);


export default router;
