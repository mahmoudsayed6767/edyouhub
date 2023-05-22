import express from 'express';
import PlaceController from '../../controllers/place/place.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('places').fields([
            { name: 'logo', maxCount: 1, options: false },
            { name: 'cover', maxCount: 1, options: false },
        ]),
        parseStringToArrayOfObjectsMw('categories'),
        parseStringToArrayOfObjectsMw('subCategories'),
        parseStringToArrayOfObjectsMw('location'),
        PlaceController.validateBody(),
        PlaceController.create
    )
    .get(PlaceController.findAllPagenation);
router.route('/withoutPagenation/get')
    .get(PlaceController.findAll);
    
router.route('/:placeId')
    .get(PlaceController.findById)
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('places').fields([
            { name: 'logo', maxCount: 1, options: false },
            { name: 'cover', maxCount: 1, options: false },
        ]),
        parseStringToArrayOfObjectsMw('categories'),
        parseStringToArrayOfObjectsMw('subCategories'),
        parseStringToArrayOfObjectsMw('location'),
        PlaceController.validateBody(true),
        PlaceController.update
    )
    .delete( requireAuth,permissions('ADMIN'),PlaceController.delete);

export default router;