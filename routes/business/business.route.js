import express from 'express';
import {  requireAuth} from '../../services/passport';
import businessController from '../../controllers/business/business.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMwv2 } from '../../utils';

const router = express.Router();

router.route('/')
    .post(  
        requireAuth,
        multerSaveTo('business').single('img'),
        parseStringToArrayOfObjectsMwv2('phones'),
        businessController.validateBody(),
        businessController.create
    ).get(requireAuth,businessController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,businessController.getAll);
router.route('/:businessId')
    .put(
        requireAuth,
        multerSaveTo('business').single('img'),
        parseStringToArrayOfObjectsMwv2('phones'),
        businessController.validateBody(true),
        businessController.update
    )
    .get(requireAuth,businessController.getById)
    .delete(requireAuth,businessController.delete);

router.route('/:businessId/accept')
    .put(
        requireAuth,
        businessController.accept
    )
router.route('/:businessId/reject')
    .put(
        requireAuth,
        businessController.reject
    )
export default router;
