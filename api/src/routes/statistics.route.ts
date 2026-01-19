import express from 'express';

import requireAuth from '../middleware/auth';
import statisticsController from '../controllers/statistics.controller';

const router = express.Router();

router.get('/', requireAuth, statisticsController.getStatistics);

export default router;
