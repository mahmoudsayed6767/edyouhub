import express from 'express';
import ContactController from '../../controllers/contact/contact.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();


router.route('/')
    .post(
        multerSaveTo('attachment').fields([
            { name: 'attachment', maxCount: 6, options: false },
        ]),
        ContactController.validateContactCreateBody(),
        ContactController.createContactMessage
    )
    .get(cache(10),requireAuth,ContactController.findAll);

router.route('/:contactId')
    .get(cache(10),requireAuth,ContactController.findById)
    .delete(requireAuth,ContactController.delete)

router.route('/:contactId/reply')
    .post(
        requireAuth,
        ContactController.validateContactReplyBody(),
        ContactController.reply
    );



export default router;