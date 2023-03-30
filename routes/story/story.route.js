import express from 'express';
import storyController from '../../controllers/story/story.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('story').fields([
            { name: 'video', maxCount: 1, options: false },
            { name: 'preview', maxCount: 1, options: false },

        ]),
        storyController.validateBody(),
        storyController.create
    )
    .get(storyController.findAllPagenation)
router.route('/withoutPagenation/get')
    .get(storyController.findAll);
    
router.route('/:storyId')
    .put(
        requireAuth,
        multerSaveTo('story').fields([
            { name: 'video', maxCount: 1, options: false },
            { name: 'preview', maxCount: 1, options: false },
        ]),
        storyController.validateBody(true),
        storyController.update
    )
    .get(storyController.getById)
    .delete( requireAuth,storyController.delete);


export default router;