import express from 'express';
import ServiceController from '../../controllers/service/service.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/:businessId/createService')
    .post(
        requireAuth,
        multerSaveTo('service').fields([
            { name: 'imgs', maxCount: 5, options: false },
            { name: 'attachment', maxCount: 1, options: false },
        ]),
        ServiceController.validateBody(),
        ServiceController.create
    )
router.route('/')
    .get(ServiceController.findAllPagenation)
router.route('/withoutPagenation/get')
    .get(ServiceController.findAll);
    
router.route('/:serviceId')
    .put(
        requireAuth,
        multerSaveTo('service').fields([
            { name: 'imgs', maxCount: 5, options: false },
            { name: 'attachment', maxCount: 1, options: false },
        ]),
        ServiceController.validateBody(true),
        ServiceController.update
    )
    .get(ServiceController.getById)
    .delete( requireAuth,ServiceController.delete);


export default router;