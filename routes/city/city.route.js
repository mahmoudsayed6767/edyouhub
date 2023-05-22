import express from 'express';
import AreaController from '../../controllers/area/area.controller';
import { requireAuth } from '../../services/passport';
import CityController from '../../controllers/city/city.controller';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        CityController.validateCityBody(),
        CityController.create
    )

router.route('/createMulti')
    .post(
        requireAuth,
        permissions('ADMIN'),
        CityController.createMulti
    )
router.route('/:country/countries')
    .get(CityController.getAllPaginated);

router.route('/:country/countries/withoutPagenation/get')
    .get(CityController.getAll);

router.route('/:cityId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        CityController.validateCityBody(true),
        CityController.update
    )
    .get(CityController.getById)
    .delete(requireAuth,permissions('ADMIN'),CityController.delete);

router.route('/:cityId/areas')
    .post(
        requireAuth,
        permissions('ADMIN'),
        AreaController.validateAreaBody(),
        AreaController.create
    )
    .get(AreaController.getAllPaginated);

router.route('/createMultiAreas')
    .post(
        requireAuth,
        permissions('ADMIN'),
        AreaController.createMulti
    )

router.route('/:areaId/areas')
    .put(
        requireAuth,
        permissions('ADMIN'),
        AreaController.validateAreaBody(true),
        AreaController.update
    )
    .get(AreaController.getById)
router.route('/:areaId/areas')
    .delete(requireAuth,permissions('ADMIN'),AreaController.delete);

    
router.route('/:cityId/areas/withoutPagenation/get')
    .get(AreaController.getAll);





export default router;