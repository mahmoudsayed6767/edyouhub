import express from 'express';
import {  requireAuth } from '../../services/passport';
import TransactionController from '../../controllers/transactions/transactions.controller';

const router = express.Router();

router.post('/payment',requireAuth,TransactionController.payment);
router.post('/fawryCallBack',TransactionController.fawryCallBack);

router.get('/',
    requireAuth,
    TransactionController.findAllTransactions);
    
router.get('/withoutPagenation/get',
    requireAuth,
    TransactionController.getAllTransactions);

router.get('/:transactionId',
    TransactionController.getById);

export default router;
