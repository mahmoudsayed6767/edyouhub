import express from 'express';
import CountryController from '../../controllers/country/country.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();


router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('country').single('img'),
        CountryController.validateCountryBody(),
        CountryController.create
    )
    .get(CountryController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(CountryController.getAll);
router.route('/:countryId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('country').single('img'),
        CountryController.validateCountryBody(true),
        CountryController.update
    )
    .get(CountryController.getById)
    .delete(requireAuth,permissions('ADMIN'),CountryController.delete);





export default router;