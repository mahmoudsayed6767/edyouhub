import express from 'express';
import { requireAuth } from '../../services/passport';
import eventController from '../../controllers/event/event.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        eventController.validateBody(),
        eventController.create
    )
    .get(eventController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(eventController.getAll);

router.route('/:eventId')
    .put(
        requireAuth,
        eventController.validateBody(true),
        eventController.update
    )
    .get(requireAuth,eventController.getById)
    .delete(requireAuth,eventController.delete);

router.route('/:eventId/attend')
    .put(
        requireAuth,
        eventController.attendEvent
    )
router.route('/:eventId/removeAttendence')
    .put(
        requireAuth,
        eventController.removeAttendance
    )
router.route('/:eventId/getEventAttendance')
    .get(requireAuth,eventController.getEventAttendance);
router.route('/:eventId/follow')
    .put(
        requireAuth,
        eventController.followEvent
    )
router.route('/:eventId/unFollow')
    .put(
        requireAuth,
        eventController.unfollowEvent
    )

 router.route('/:eventId/getEventFollowers')
    .get(requireAuth,eventController.getEventFollowers);


export default router;