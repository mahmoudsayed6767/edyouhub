import express from 'express';
import BranchController from '../../controllers/branch/branch.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { parseStringToArrayOfObjectsMwv2 } from '../../utils';

const router = express.Router();

router.route('/:id/createBranch')
    .post(
        requireAuth,
        multerSaveTo('branch').single('img'),
        parseStringToArrayOfObjectsMwv2('location'),
        BranchController.validateBody(),
        BranchController.create
    )
router.route('/:id/getBranches')
    .get(BranchController.findAllPagenation)
router.route('/:id/withoutPagenation/get')
    .get(BranchController.findAll);
    
router.route('/:branchId')
    .put(
        requireAuth,
        multerSaveTo('branch').single('img'),
        parseStringToArrayOfObjectsMwv2('location'),
        BranchController.validateBody(true),
        BranchController.update
    )
    .get(BranchController.getById)
    .delete( requireAuth,BranchController.delete);


export default router;