import express from 'express';
import {  requireAuth} from '../../services/passport';
import IndividualSuppliesController from '../../controllers/individual supplies/individual supplies.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/')
    .post(  
        requireAuth,
        multerSaveTo('attachment').fields([
            { name: 'attachment', maxCount: 6, options: false },
        ]),
        IndividualSuppliesController.validateBody(),
        IndividualSuppliesController.create
    ).get(requireAuth,IndividualSuppliesController.findAll);
router.route('/withoutPagenation/get')
    .get(requireAuth,IndividualSuppliesController.getAll);
router.route('/:IndividualSuppliesId')
    .put(
        requireAuth,
        multerSaveTo('attachment').fields([
            { name: 'attachment', maxCount: 6, options: false },
        ]),
        IndividualSuppliesController.validateBody(true),
        IndividualSuppliesController.update
    )
    .get(requireAuth,IndividualSuppliesController.findById)
    .delete(requireAuth,IndividualSuppliesController.delete);

export default router;
