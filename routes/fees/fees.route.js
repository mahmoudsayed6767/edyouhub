import express from 'express';
import {  requireAuth} from '../../services/passport';
import feesController from '../../controllers/fees/fees.controller';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMw } from '../../utils';

const router = express.Router();

router.route('/')
    .post(  
        requireAuth,
        feesController.validateBody(),
        feesController.create
    ).get(requireAuth,feesController.findAllPagenation);
router.route('/addManyFees')
    .post(  
        requireAuth,
        feesController.validateAddMany(),
        feesController.addMany
    )
router.route('/addManyFees/existStudents')
    .post(  
        requireAuth,
        feesController.validateAddManyExistStudents(),
        feesController.addManyExistStudents
    )
router.route('/withoutPagenation/get')
    .get(requireAuth,feesController.findAll);
router.route('/:feesId')
    .get(requireAuth,feesController.findById)
    .delete(requireAuth,feesController.delete);


export default router;
