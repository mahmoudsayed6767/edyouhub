import express from 'express';
import followController from '../../controllers/follow/follow.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching';

const router = express.Router();

router.route('/:business/add')
    .post(
        requireAuth,
        followController.create
    );
router.route('/')
    .get(requireAuth,followController.findAll);
    
router.route('/:business')
    .delete( requireAuth,followController.unfollow);







export default router;