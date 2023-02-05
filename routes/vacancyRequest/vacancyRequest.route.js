import express from 'express';
import { requireAuth } from '../../services/passport';
import vacancyRequestController from '../../controllers/vacancyRequest/vacancyRequest.controller';
import { multerSaveTo } from '../../services/multer-service';

const router = express.Router();

router.route('/:vacancyId/apply')
    .post(
        requireAuth,
        multerSaveTo('education').single('attachment'),
        vacancyRequestController.validateBody(),
        vacancyRequestController.create
    )
router.route('/:businessId/applyForWaiting')
    .post(
        requireAuth,
        multerSaveTo('education').single('attachment'),
        vacancyRequestController.validateBody(),
        vacancyRequestController.createToWaitingList
    )
router.route('/')
    .get(requireAuth,vacancyRequestController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(requireAuth,vacancyRequestController.getAll);

router.route('/:vacancyRequestId')
    .put(
        requireAuth,
        multerSaveTo('education').single('attachment'),
        vacancyRequestController.validateBody(true),
        vacancyRequestController.update
    )
    .get(requireAuth,vacancyRequestController.getById)
    .delete(requireAuth,vacancyRequestController.delete);


router.route('/:vacancyRequestId/accept')
    .put(
        requireAuth,
        vacancyRequestController.accept
    )
router.route('/:vacancyRequestId/reject')
    .put(
        requireAuth,
        vacancyRequestController.reject
    )



export default router;