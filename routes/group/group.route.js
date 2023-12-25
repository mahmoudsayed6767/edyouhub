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
        groupController.acceptMember
    )
router.route('/:groupParticipantId/rejectMember')
    .put(
        requireAuth,
        groupController.rejectMember
    )

router.route('/:groupId/removeUser/:userId')
    .delete(
        requireAuth,
        groupController.removeUserFromGroup
    )
router.route('/groupAdminRequests/get')
    .get(requireAuth,groupController.getAllGroupAdminRequestsPaginated)
router.route('/:groupId/sendGroupAdminRequest')
    .post(
        requireAuth,
        groupController.validateSendGroupAdminRequestBody(),
        groupController.sendGroupAdminRequest
    )
router.route('/:groupId/acceptGroupAdminRequest/:groupAdminRequestId')
    .put(
        requireAuth,
        groupController.acceptGroupAdminRequest
    )
router.route('/:groupId/rejectGroupAdminRequest/:groupAdminRequestId')
    .put(
        requireAuth,
        groupController.rejectGroupAdminRequest
    )
router.route('/:groupId/deleteGroupAdminRequest/:groupAdminRequestId')
    .delete(
        requireAuth,
        groupController.deleteGroupAdminRequest
    )
export default router;