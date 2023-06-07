import express from 'express';
import { requireAuth } from '../../services/passport';
import groupController from '../../controllers/group/group.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMwv2 } from '../../utils';

const router = express.Router();

router.route('/')
    .get(requireAuth,groupController.getAllPaginated)
    .post(
        requireAuth,
        multerSaveTo('groups').single('img'),
        parseStringToArrayOfObjectsMwv2('admins'),
        groupController.validateBody(),
        groupController.create
    )

router.route('/withoutPagenation/get')
    .get(requireAuth,groupController.getAll);

router.route('/:groupId')
    .put(
        requireAuth,
        multerSaveTo('groups').single('img'),
        parseStringToArrayOfObjectsMwv2('admins'),
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
router.route('/:groupParticipantId/acceptMember')
    .put(
        requireAuth,
        groupController.accept
    )
router.route('/:groupParticipantId/rejectMember')
    .put(
        requireAuth,
        groupController.reject
    )

router.route('/:groupId/removeUser/:userId')
    .delete(
        requireAuth,
        groupController.removeUserFromGroup
    )

export default router;