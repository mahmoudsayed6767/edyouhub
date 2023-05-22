import express from 'express';
import SettingController from '../../controllers/setting/setting.controller';
import { requireAuth } from '../../services/passport';
import { permissions } from '../../services/permissions';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        SettingController.validateBody(),
        SettingController.create
    )
    .get(SettingController.findAll);
    
router.route('/:SettingId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        SettingController.validateBody(true),
        SettingController.update
    )
    .get(SettingController.findById)
    .delete( requireAuth,permissions('ADMIN'),SettingController.delete);

export default router;