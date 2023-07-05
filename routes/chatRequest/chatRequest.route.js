import express from 'express';
import {  requireAuth} from '../../services/passport';
import chatRequestController from '../../controllers/chatRequest/chatRequest.controller';

const router = express.Router();

router.route('/:toId/add')
    .post(  
        requireAuth,
        chatRequestController.create
    )
router.route('/')
    .get(requireAuth,chatRequestController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,chatRequestController.getAll);
router.route('/:toId')
    .delete(requireAuth,chatRequestController.delete);

router.route('/:fromId/accept')
    .put(
        requireAuth,
        chatRequestController.accept
    )
router.route('/:fromId/reject')
    .put(
        requireAuth,
        chatRequestController.reject
    )
export default router;
