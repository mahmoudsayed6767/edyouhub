import express from 'express';
import { requireAuth } from '../../services/passport';
import courseController from '../../controllers/course/course.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        courseController.validateBody(),
        courseController.create
    )
    .get(courseController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(courseController.getAll);

router.route('/:courseId')
    .put(
        requireAuth,
        courseController.validateBody(true),
        courseController.update
    )
    .get(requireAuth,courseController.getById)
    .delete(requireAuth,courseController.delete);

router.route('/:courseId/addExistUserParticipant')
    .put(
        requireAuth,
        multerSaveTo('courses').fields([
            { name: 'receipt', maxCount: 5, options: false },
        ]),
        courseController.validateAddParticipantBody(false),
        courseController.addParticipant
    )
router.route('/:courseId/addNewUserParticipant')
    .put(
        requireAuth,
        multerSaveTo('courses').fields([
            { name: 'receipt', maxCount: 5, options: false },
        ]),
        courseController.validateAddParticipantBody(true),
        courseController.addParticipant
    )
router.route('/:courseId/getCourseParticipates')
    .get(requireAuth,courseController.getCourseParticipants);



export default router;