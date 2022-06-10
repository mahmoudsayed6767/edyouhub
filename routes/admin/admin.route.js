import express from 'express';
import adminController from '../../controllers/admin/admin.controller';
import { cache } from '../../services/caching';

const router = express.Router();
router.route('/lastUsers')
    .get(adminController.getLastUser);

router.route('/lastBills')
    .get(adminController.getLastBills);

router.route('/lastOffers')
    .get(adminController.getLastOffers);

router.route('/count')
    .get(adminController.count);

router.route('/getGraph')
    .get(adminController.graph);
export default router;
