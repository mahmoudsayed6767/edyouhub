import express from 'express';
import BillController from '../../controllers/bill/bill.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/')
    .get(requireAuth,BillController.getAllPaginated)
    .post(
        requireAuth,
        BillController.validateBillBody(),
        BillController.create
    )   
router.route('/withoutPagenation/get')
    .get(requireAuth,BillController.getAll)
router.route('/:billId')
    .get(requireAuth,BillController.findById)
    .delete( requireAuth,BillController.delete)
    .put(
        requireAuth,
        BillController.validateBillBody(true),
        BillController.update
    ) 


export default router;