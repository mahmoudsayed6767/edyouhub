import express from 'express';
import AreaController from '../../controllers/area/area.controller';
import { requireAuth } from '../../services/passport';
import CityController from '../../controllers/city/city.controller';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        CityController.validateCityBody(),
        CityController.create
    )
    .get(CityController.getAllPaginated);

router.route('/withoutPagenation/get')
    .get(CityController.getAll);

router.route('/:cityId')
    .put(
        requireAuth,
        CityController.validateCityBody(true),
        CityController.update
    )
    .get(requireAuth,CityController.getById)
    .delete(requireAuth,CityController.delete);

router.route('/:cityId/areas')
    .post(
        requireAuth,
        AreaController.validateAreaBody(),
        AreaController.create
    )
    .get(AreaController.getAllPaginated);

router.route('/:cityId/areas/:areaId')
    .put(
        requireAuth,
        AreaController.validateAreaBody(true),
        AreaController.update
    )
    .get(AreaController.getById)
router.route('/:areaId/areas')
    .delete(requireAuth,AreaController.delete);

    
router.route('/:cityId/areas/withoutPagenation/get')
    .get(AreaController.getAll);





export default router;