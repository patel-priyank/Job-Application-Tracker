import express from 'express';

import requireAuth from '../middleware/auth';
import applicationController from '../controllers/application.controller';

const router = express.Router();

router.get('/', requireAuth, applicationController.getApplications);
router.post('/', requireAuth, applicationController.createApplication);
router.patch('/:id', requireAuth, applicationController.updateApplication);
router.delete('/:id', requireAuth, applicationController.deleteApplication);
router.delete('/', requireAuth, applicationController.deleteApplications);
router.post('/:id/status', requireAuth, applicationController.createApplicationStatus);
router.patch('/:id/status/:statusId', requireAuth, applicationController.updateApplicationStatus);
router.delete('/:id/status/:statusId', requireAuth, applicationController.deleteApplicationStatus);

export default router;
