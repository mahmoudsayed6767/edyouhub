import express from 'express';
import FavouriteController from '../../controllers/favourite/favourite.controller';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching';

const router = express.Router();

router.route('/:offer/add')
    .post(
        requireAuth,
        FavouriteController.create
    );
router.route('/')
    .get(requireAuth,FavouriteController.findAll);
    
router.route('/:offer')
    .delete( requireAuth,FavouriteController.unFavourite);







export default router;