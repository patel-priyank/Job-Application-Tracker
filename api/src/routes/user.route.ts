import express from 'express';

import requireAuth from '../middleware/auth';
import userController from '../controllers/user.controller';

const router = express.Router();

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);
router.get('/renew-token', requireAuth, userController.renewToken);
router.patch('/account/name', requireAuth, userController.updateName);
router.patch('/account/email', requireAuth, userController.updateEmail);
router.patch('/account/password', requireAuth, userController.updatePassword);
router.delete('/account', requireAuth, userController.deleteAccount);

export default router;
