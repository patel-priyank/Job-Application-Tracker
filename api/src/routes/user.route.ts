import express from 'express';

import requireAuth from '../middleware/auth';
import userController from '../controllers/user.controller';

const router = express.Router();

router.post('/signin', userController.signin);
router.post('/signup', userController.signup);
router.post('/renew-token', requireAuth, userController.renewToken);
router.get('/emails-in-use', requireAuth, userController.getEmailsInUse);
router.patch('/account/name', requireAuth, userController.updateName);
router.patch('/account/email', requireAuth, userController.updateEmail);
router.patch('/account/password', requireAuth, userController.updatePassword);
router.patch('/account/suggested-emails', requireAuth, userController.updateSuggestedEmails);
router.delete('/account', requireAuth, userController.deleteAccount);

export default router;
