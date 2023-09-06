import express from 'express';
import {  requireAuth} from '../../services/passport';
import businessController from '../../controllers/business/business.controller';
import businessRequestController from '../../controllers/business/businessRequest.controller';

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
export default router;
