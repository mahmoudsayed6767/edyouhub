
import express from 'express';
import fundProviderController from '../../controllers/fundProvider/fundProvider.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';
import { parseStringToArrayOfObjectsMw } from '../../utils';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('fundProviders').single('logo'),
        parseStringToArrayOfObjectsMw('programsPercent'),
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
        parseStringToArrayOfObjectsMw('programsPercent'),
        fundProviderController.validateBody(true),
        fundProviderController.update
    )
    .get(fundProviderController.getById)
    .delete(requireAuth,permissions('ADMIN'),fundProviderController.delete);


router.route('/:fundProviderId/addOffer')
    .post(
        requireAuth,
        permissions('ADMIN'),
        fundProviderController.validateOfferBody(),
        fundProviderController.addOffer
    )

router.route('/:fundProviderOfferId/removeOffer')
    .delete(requireAuth,permissions('ADMIN'),fundProviderController.removeOffer);

export default router;
