import express from 'express';
import { requireAuth } from '../../services/passport';
import groupController from '../../controllers/group/group.controller';

const router = express.Router();

router.route('/')
    .get(requireAuth,groupController.getAllPaginated)
    .post(
        requireAuth,
        groupController.validateBody(),
        groupController.create
    )

router.route('/withoutPagenation/get')
    .get(requireAuth,groupController.getAll);

router.route('/:groupId')
    .put(
        requireAuth,
        groupController.validateBody(true),
        groupController.update
    )
    .get(requireAuth,groupController.getById)
    .delete(requireAuth,groupController.delete);

router.route('/:groupId/addParticipant')
    .put(
        requireAuth,
        groupController.validateAddParticipantBody(),
        groupController.addParticipant
    )
router.route('/:groupId/getParticipants')
    .get(requireAuth,groupController.getGroupParticipants);
router.route('/:groupParticipantId/accept')
    .put(
        requireAuth,
        groupController.accept
    )
router.route('/:groupParticipantId/reject')
    .put(
        requireAuth,
        groupController.reject
    )



export default router;