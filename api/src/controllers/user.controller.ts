import { Request, Response } from 'express';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import Application from '../models/application.model';
import User from '../models/user.model';

import otpCache from '../utils/otpCache';
import sendEmail from '../utils/sendEmail';

const createToken = (_id: any) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET ?? '', { expiresIn: '30d' });
};

const verificationCodeEmailTemplate = (title: string, name: string | undefined, text: string, code: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container {
            font-family: system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji;
            max-width: 600px;
            margin: 0 auto;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            color: #111827;
          }
          .title {
            font-size: 1.5rem;
            margin-top: 0;
          }
          p {
            font-size: 1rem;
            line-height: 1.5;
          }
          .text {
            color: #374151;
          }
          .code-container {
            background-color: #f3f4f6;
            padding: 1.25rem;
            text-align: center;
            border-radius: 8px;
            margin: 1.5rem 0;
          }
          .code {
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 0.375rem;
          }
          .expiry-text {
            font-size: 0.875rem;
            color: #4b5563;
          }
          .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 1.25rem 0;
          }
          .footer-text {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">${title}</h2>
          <p>Hello${name ? ` <strong>${name}</strong>` : ''},</p>
          <p class="text">${text}</p>
          <div class="code-container">
            <span class="code">${code}</span>
          </div>
          <p class="expiry-text">This code will expire in <strong>15 minutes</strong>.</p>
          <hr class="divider" />
          <p class="footer-text">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;
};

const signinSendOTP = async (req: Request, res: Response) => {
  const { email: inputEmail } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpCache.set(email, otp);

    const user = await User.findOne({ email });

    const subject = 'Your verification code';

    const title = 'Sign in to Job Application Tracker';

    const message = 'Use this verification code to sign in to your account.';

    const text = `${title}\n\n${message}\n\n${otp}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`;

    const html = verificationCodeEmailTemplate(title, user?.name, message, otp);

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: 'Verification code sent successfully.' });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const signin = async (req: Request, res: Response) => {
  const { email: inputEmail, verificationCode } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const otpEntry = otpCache.get(email);

    if (!otpEntry || otpEntry.otp !== verificationCode) {
      return res.status(400).json({ error: 'Verification code is invalid or has expired.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Unable to sign in with the provided details.' });
    }

    otpCache.delete(email);

    const token = createToken(user._id);

    const applicationsCount = await Application.countDocuments({ user: user._id });

    res.status(200).json({
      name: user.name,
      email,
      suggestedEmails: user.suggestedEmails,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'Unable to sign in with the provided credentials.') {
        return res.status(401).json({ error: err.message });
      }
    }

    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const signupSendOTP = async (req: Request, res: Response) => {
  const { name, email: inputEmail } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpCache.set(email, otp, name);

    const subject = 'Your verification code';

    const title = 'Sign up for Job Application Tracker';

    const message = 'Use this verification code to complete your sign up.';

    const text = `${title}\n\n${message}\n\n${otp}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`;

    const html = verificationCodeEmailTemplate(title, name, message, otp);

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: 'Verification code sent successfully.' });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const signup = async (req: Request, res: Response) => {
  const { email: inputEmail, verificationCode } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const otpEntry = otpCache.get(email);

    if (!otpEntry || otpEntry.otp !== verificationCode) {
      return res.status(400).json({ error: 'Verification code is invalid or has expired.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Unable to create an account with the provided details.' });
    }

    const name = otpEntry.name ?? '';

    const user = await User.create({ name, email, password: '123@Abcd' });

    otpCache.delete(email);

    const token = createToken(user._id);

    const applicationsCount = await Application.countDocuments({ user: user._id });

    res.status(201).json({
      name,
      email,
      suggestedEmails: user.suggestedEmails,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === 'Invalid email address.') {
        return res.status(400).json({ error: err.message });
      }

      if (err.message === 'Password does not meet security requirements.') {
        return res.status(400).json({ error: err.message });
      }

      if (err.message === 'Unable to create an account with the provided details.') {
        return res.status(401).json({ error: err.message });
      }
    }

    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const renewToken = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    const token = createToken(user._id);

    const applicationsCount = await Application.countDocuments({ user: req.user?._id });

    res.status(200).json({
      name: user.name,
      email: user.email,
      suggestedEmails: user.suggestedEmails,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const getEmailsInUse = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ user: req.user?._id });

    const emailsInUse = Array.from(new Set(applications.map(application => application.emailUsed)));

    res.status(200).json({ emailsInUse });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const updateName = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { name }, { new: true });

    const token = createToken(user._id);

    const applicationsCount = await Application.countDocuments({ user: req.user?._id });

    res.status(200).json({
      name: user.name,
      email: user.email,
      suggestedEmails: user.suggestedEmails,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const updateEmail = async (req: Request, res: Response) => {
  const { email: inputEmail } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, { email }, { new: true });

    const token = createToken(updatedUser._id);

    const applicationsCount = await Application.countDocuments({ user: req.user?._id });

    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      suggestedEmails: updatedUser.suggestedEmails,
      createdAt: updatedUser.createdAt,
      passwordUpdatedAt: updatedUser.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const updatePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, pwConfirmation } = req.body;

  try {
    if (!currentPassword || !newPassword || !pwConfirmation) {
      return res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
    }

    const user = await User.findById(req.user?._id).select('password');

    const pwMatch = await bcrypt.compare(currentPassword, user.password);

    if (!pwMatch) {
      return res.status(400).json({ error: 'Current password could not be verified.' });
    }

    if (newPassword !== pwConfirmation) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({ error: 'New password does not meet security requirements.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from the current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: hash, passwordUpdatedAt: Date.now() },
      { new: true }
    );

    const token = createToken(updatedUser._id);

    const applicationsCount = await Application.countDocuments({ user: req.user?._id });

    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      suggestedEmails: updatedUser.suggestedEmails,
      createdAt: updatedUser.createdAt,
      passwordUpdatedAt: updatedUser.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const updateSuggestedEmails = async (req: Request, res: Response) => {
  const { emailsToDelete } = req.body;

  try {
    const user = await User.findById(req.user?._id);

    user.suggestedEmails = user.suggestedEmails.filter((email: string) => !emailsToDelete.includes(email));

    await user.save();

    const token = createToken(user._id);

    const applicationsCount = await Application.countDocuments({ user: req.user?._id });

    res.status(200).json({
      name: user.name,
      email: user.email,
      suggestedEmails: user.suggestedEmails,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
      applicationsCount,
      token
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const deleteAccount = async (req: Request, res: Response) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const user = await User.findById(req.user?._id).select('password');

    const pwMatch = await bcrypt.compare(password, user.password);

    if (!pwMatch) {
      return res.status(400).json({ error: 'Password could not be verified.' });
    }

    const applications = await Application.find({ user: req.user?._id });

    await Application.deleteMany({ _id: { $in: applications } });

    const deletedUser = await User.findByIdAndDelete(req.user?._id);

    res.status(200).json(deletedUser);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

export default {
  signinSendOTP,
  signin,
  signupSendOTP,
  signup,
  renewToken,
  getEmailsInUse,
  updateName,
  updateEmail,
  updatePassword,
  updateSuggestedEmails,
  deleteAccount
};
