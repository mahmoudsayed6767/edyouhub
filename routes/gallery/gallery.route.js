import express from 'express';
import GalleryController from '../../controllers/gallery/gallery.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/:businessId/createGallery')
    .post(
        requireAuth,
        multerSaveTo('gallery').fields([
            { name: 'imgs', maxCount: 15, options: false },
        ]),
        GalleryController.validateBody(),
        GalleryController.create
    )
router.route('/:businessId/get')
    .get(GalleryController.findAllPagenation)
router.route('/:businessId/withoutPagenation/get')
    .get(GalleryController.findAll);
    
router.route('/:galleryId')
    .put(
        requireAuth,
        multerSaveTo('gallery').fields([
            { name: 'imgs', maxCount: 15, options: false },
        ]),
        GalleryController.validateBody(true),
        GalleryController.update
    )
    .get(GalleryController.getById)
    .delete( requireAuth,GalleryController.delete);


export default router;