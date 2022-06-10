import express from 'express';
import ContactController from '../../controllers/contact/contact.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching'

const router = express.Router();


router.route('/')
    .post(
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