import express from 'express';
import ContactController from '../../controllers/contact/contact.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions'
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMwv2 } from '../../utils';

const router = express.Router();


router.route('/')
    .post(
        multerSaveTo('attachment').fields([
            { name: 'attachment', maxCount: 6, options: false },
        ]),
        parseStringToArrayOfObjectsMwv2('contactFor'),
        ContactController.validateContactCreateBody(),
        ContactController.createContactMessage
    )
    .get(requireAuth,ContactController.findAll);

router.route('/:contactId')
    .get(requireAuth,ContactController.findById)
    .delete(requireAuth,permissions('ADMIN'),ContactController.delete)

router.route('/:contactId/reply')
    .post(
        requireAuth,
        permissions('ADMIN'),
        ContactController.validateContactReplyBody(),
        ContactController.reply
    );
router.route('/:contactId/checked')
    .put(
        requireAuth,
        permissions('ADMIN'),
        ContactController.checked
    );



export default router;