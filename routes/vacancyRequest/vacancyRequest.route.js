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
router.route('/:vacancyId/getAll')
    .get(requireAuth,vacancyRequestController.getAllPaginated);

router.route('/:vacancyId/withoutPagenation/get')
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






export default router;