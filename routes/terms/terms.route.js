import express from 'express';
import TermsController from '../../controllers/terms/terms.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { cache } from '../../services/caching';

const router = express.Router();


router.route('/')
    .post(
        requireAuth,
        TermsController.validateTermsBody(),
        TermsController.create
    )
    .get(cache(10),TermsController.getAll);

router.route('/:TermsId')
    .put(
        requireAuth,
        TermsController.validateTermsBody(true),
        TermsController.update
    )
    .get(cache(10),TermsController.getById)
    .delete(requireAuth,TermsController.delete);




export default router;