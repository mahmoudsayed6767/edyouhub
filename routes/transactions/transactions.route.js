import express from 'express';
import {  requireAuth } from '../../services/passport';
import TransactionController from '../../controllers/transactions/transactions.controller';
import { permissions } from '../../services/permissions';

const router = express.Router();
router.route('/payment')
    .post(
        requireAuth,
        TransactionController.payment
    )
router.route('/fawryCallBack')
    .post(
        TransactionController.fawryCallBack
    )
router.route('/')
    .get(
        requireAuth,
        permissions('ADMIN'),
        TransactionController.findAllTransactions
    )
router.route('/withoutPagenation/get')
    .get(
        requireAuth,
        permissions('ADMIN'),
        TransactionController.getAllTransactions
    )
router.route('/:transactionId')
    .get(
        requireAuth,
        permissions('ADMIN'),
        TransactionController.getById
    )

export default router;
