import express from 'express';
import {  requireAuth} from '../../services/passport';
import businessController from '../../controllers/business/business.controller';
import businessRequestController from '../../controllers/business/businessRequest.controller';
import verificationRequestController from '../../controllers/business/verificationRequest.controller';
import adminRequestController from '../../controllers/business/adminRequest.controller';

import { multerSaveTo } from '../../services/multer-service';
import {permissions} from '../../services/permissions';
const router = express.Router();

router.route('/')
    .post(  
        requireAuth,
        businessController.validateBody(),
        businessController.create
    ).get(requireAuth,businessController.getAllPaginated);
router.route('/withoutPagenation/get')
    .get(requireAuth,businessController.getAll);
router.route('/:businessId')
    .put(
        requireAuth,
        businessController.validateBody(true),
        businessController.update
    )
    .get(requireAuth,businessController.getById)
    .delete(requireAuth,businessController.delete);

router.route('/:businessId/accept')
    .put(
        requireAuth,
        permissions('ADMIN'),
        businessController.accept
    )
router.route('/:businessId/reject')
    .put(
        requireAuth,
        permissions('ADMIN'),
        businessController.reject
    )
router.route('/:businessId/businessManagement')
    .post(  
        requireAuth,
        businessController.validateBusinessManagementBody(),
        businessController.businessManagement
    )
router.route('/:businessId/getServiceSupervisors')
    .get(  
        requireAuth,
        businessController.getServiceSupervisors
    )
router.route('/:businessId/updateServiceSupervisors')
    .put(  
        requireAuth,
        businessController.validateUpdateServiceSupervisorsBody(),
        businessController.updateServiceSupervisors
    )
router.route('/:businessId/getSupervisorPermissions')
    .get(  
        requireAuth,
        businessController.getSupervisorPermissions
    )
router.route('/addAssignRequest')
    .post(  
        requireAuth,
        businessRequestController.validateBody(),
        businessRequestController.create
    )
router.route('/assignRequests/getPagenation')
    .get(  
        requireAuth,
        businessRequestController.getAllPaginated
    )
router.route('/:businessRequestId/acceptAssignRequests')
    .put(  
        requireAuth,
        permissions('ADMIN'),
        businessRequestController.accept
    )
router.route('/:businessRequestId/rejectAssignRequests')
    .put(  
        requireAuth,
        permissions('ADMIN'),
        businessRequestController.reject
    )
router.route('/:businessRequestId/deleteAssignRequests')
    .put(  
        requireAuth,
        permissions('ADMIN'),
        businessRequestController.delete
    )
router.route('/:businessId/getActivities')
    .get(  
        requireAuth,
        businessController.getActivities
    )
router.route('/:businessId/payToBusiness')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('business').single('transferImg'),
        businessController.validatePayBody(),
        businessController.payToBusiness
    )
router.route('/businessTransfers/getAll')
    .get(requireAuth,businessController.getAllBusinessTransfers);
router.route('/:businessId/sendVerificationRequest')
    .post(  
        requireAuth,
        multerSaveTo('business').fields([
            { name: 'commercialRegistry', maxCount: 2, options: false },
            { name: 'taxId', maxCount: 2, options: false },
            { name: 'managerId', maxCount: 2, options: false },
        ]),
        verificationRequestController.validateBody(),
        verificationRequestController.create
    )
router.route('/verificationRequests/getAll')
    .get(requireAuth,verificationRequestController.getAllPaginated);
router.route('/:verificationRequestId/acceptVerificationRequest')
    .put(
        requireAuth,
        verificationRequestController.accept
    )
router.route('/:verificationRequestId/rejectVerificationRequest')
    .put(
        requireAuth,
        verificationRequestController.reject
    )

router.route('/:businessId/sendAdminRequest')
    .post(
        requireAuth,
        adminRequestController.validateBody(),
        adminRequestController.create
    )
router.route('/adminRequests/getAll')
    .get(requireAuth,adminRequestController.getAllPaginated)

router.route('/:adminRequestId/acceptAdminRequest')
    .put(
        requireAuth,
        adminRequestController.accept
    )
router.route('/:adminRequestId/rejectAdminRequest')
    .put(
        requireAuth,
        adminRequestController.reject
    )
    
router.route('/:adminRequestId/removeAdminRequest')
    .delete(requireAuth,adminRequestController.delete);
export default router;
