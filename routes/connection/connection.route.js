import express from 'express';
import {  requireAuth} from '../../services/passport';
import connectionController from '../../controllers/connection/connection.controller';

const router = express.Router();

router.route('/:toId')
    .post(  
        requireAuth,
        connectionController.create
    )
router.route('/')
    .get(requireAuth,connectionController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,connectionController.getAll);
router.route('/:connectionId')
    .delete(requireAuth,connectionController.delete);

router.route('/:connectionId/accept')
    .put(
        requireAuth,
        connectionController.accept
    )
router.route('/:connectionId/reject')
    .put(
        requireAuth,
        connectionController.reject
    )
export default router;
