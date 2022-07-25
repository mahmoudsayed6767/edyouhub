import express from 'express';
import {  requireAuth} from '../../services/passport';
import suppliesController from '../../controllers/supplies/supplies.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();
router.route('/upload')
    .post(  
        requireAuth,
        multerSaveTo('files').fields([
            { name: 'file', maxCount: 1, options: false },
        ]),
        suppliesController.uploadFile
    )
router.route('/')
    .post(  
        requireAuth,
        suppliesController.validateBody(),
        suppliesController.create
    ).get(requireAuth,suppliesController.findAll);
router.route('/withoutPagenation/get')
    .get(requireAuth,suppliesController.getAll);
router.route('/:suppliesId')
    .put(
        requireAuth,
        suppliesController.validateBody(true),
        suppliesController.update
    )
    .get(requireAuth,suppliesController.findById)
    .delete(requireAuth,suppliesController.delete);

export default router;
