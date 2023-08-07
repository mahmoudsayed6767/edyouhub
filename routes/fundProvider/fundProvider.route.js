
import express from 'express';
import fundProviderController from '../../controllers/fundProvider/fundProvider.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('fundProviders').single('logo'),
        fundProviderController.validateBody(),
        fundProviderController.create
    ).get(fundProviderController.getAllPaginated)
router.route('/withoutPagenation/get')
    .get(fundProviderController.getAll);

router.route('/:fundProviderId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('fundProviders').single('logo'),
        fundProviderController.validateBody(true),
        fundProviderController.update
    )
    .get(fundProviderController.getById)
    .delete(requireAuth,permissions('ADMIN'),fundProviderController.delete);






export default router;
