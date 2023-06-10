import express from 'express';
import postController from '../../controllers/post/post.controller';
import { requireAuth } from '../../services/passport';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        postController.validateBody(),
        postController.create
    )
    .get(postController.findAll);

router.route('/withoutPagenation/get')
    .get(requireAuth,postController.findSelection);
    
router.route('/:postId')
    .put(
        requireAuth,
        postController.validateBody(true),
        postController.update
    )
    .get( requireAuth,postController.findById)
    .delete( requireAuth,postController.delete);

router.route('/:optionId/answer')
    .post(
        requireAuth,
        postController.answer
    )

router.route('/:postId/addLike')
    .post(
        requireAuth,
        postController.addLike
    )
router.route('/:postId/removeLike')
    .delete(
        requireAuth,
        postController.removeLike
    )
router.route('/:postId/getPostLikes')
    .get(requireAuth,postController.getPostLikes);
router.route('/:postId/addComment')
    .post(
        requireAuth,
        postController.validateCommentBody(),
        postController.addComment
    )
router.route('/:commentId/removeComment')
    .delete(
        requireAuth,
        postController.removeComment
    )
router.route('/:postId/getPostComments')
    .get(requireAuth,postController.getPostComments);
router.route('/:postId/accept')
    .get(requireAuth,postController.accept);
router.route('/:postId/reject')
    .get(requireAuth,postController.reject);
export default router;