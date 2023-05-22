import express from 'express';
import TermsController from '../../controllers/terms/terms.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();


router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        TermsController.validateTermsBody(),
        TermsController.create
    )
    .get(TermsController.getAll);

router.route('/:TermsId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        TermsController.validateTermsBody(true),
        TermsController.update
    )
    .get(TermsController.getById)
    .delete(requireAuth,permissions('ADMIN'),TermsController.delete);




export default router;