import express from 'express';
import AnoncementController from '../../controllers/anoncement/anoncement.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { cache } from '../../services/caching'
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('anoncements').fields([
            { name: 'imgs', maxCount: 8, options: false },
        ]),
        AnoncementController.validateBody(),
        AnoncementController.create
    )
    .get(cache(10),AnoncementController.findAll);
router.route('/withoutPagenation/get')
    .get(cache(10),AnoncementController.findSelection);
    
router.route('/:anonId')
    .put(
        requireAuth,
        multerSaveTo('anoncements').fields([
            { name: 'imgs', maxCount: 8, options: false },
        ]),
        AnoncementController.validateBody(true),
        AnoncementController.update
    )
    .get(cache(10),AnoncementController.findById)
    .delete( requireAuth,AnoncementController.delete);




export default router;