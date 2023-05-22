import express from 'express';
import AboutController from '../../controllers/about/about.controller';
import { requireAuth } from '../../services/passport';
import { parseStringToArrayOfObjectsMwv2 } from '../../utils';
import { multerSaveTo } from '../../services/multer-service';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('about').single('logo'),
        parseStringToArrayOfObjectsMwv2('location'),
        AboutController.validateBody(),
        AboutController.create
    )
    .get(AboutController.findAll);
    
router.route('/:aboutId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('about').single('logo'),
        parseStringToArrayOfObjectsMwv2('location'),
        AboutController.validateBody(true),
        AboutController.update
    )
    .delete( requireAuth,permissions('ADMIN'),AboutController.delete);


export default router;