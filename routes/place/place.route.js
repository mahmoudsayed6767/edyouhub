import express from 'express';
import PlaceController from '../../controllers/place/place.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';
const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('users').fields([
            { name: 'logo', maxCount: 1, options: false },
        ]),
        parseStringToArrayOfObjectsMw('categories'),
        parseStringToArrayOfObjectsMw('subCategories'),
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
        multerSaveTo('users').fields([
            { name: 'logo', maxCount: 1, options: false },
        ]),
        parseStringToArrayOfObjectsMw('categories'),
        parseStringToArrayOfObjectsMw('subCategories'),
        PlaceController.validateBody(true),
        PlaceController.update
    )
    .delete( requireAuth,PlaceController.delete);

export default router;