import express from 'express';
import {  requireAuth} from '../../services/passport';
import connectionController from '../../controllers/connection/connection.controller';

const router = express.Router();

router.route('/:toId/add')
    .post(  
        requireAuth,
        connectionController.create
    )
router.route('/')
    .get(requireAuth,connectionController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,connectionController.getAll);
router.route('/:toId')
    .delete(requireAuth,connectionController.delete);

router.route('/:toId/accept')
    .put(
        requireAuth,
        connectionController.accept
    )
router.route('/:toId/reject')
    .put(
        requireAuth,
        connectionController.reject
    )
export default router;
