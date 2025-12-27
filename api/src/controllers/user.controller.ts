import { Request, Response } from 'express';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import Application from '../models/application.model';
import User from '../models/user.model';

const createToken = (_id: any) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET || '', { expiresIn: '30d' });
};

const signin = async (req: Request, res: Response) => {
  const { email: inputEmail, password } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.signin(email, password);

    const token = createToken(user._id);

    res.status(200).json({
      name: user.name,
      email,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
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

const signup = async (req: Request, res: Response) => {
  const { name, email: inputEmail, password, pwConfirmation } = req.body;

  const email = inputEmail?.toLowerCase();

  try {
    if (!name || !email || !password || !pwConfirmation) {
      return res.status(400).json({ error: 'Name, email, password, and confirmation are required.' });
    }

    if (password !== pwConfirmation) {
      return res.status(400).json({ error: 'Password and confirmation do not match.' });
    }

    const user = await User.signup(name, email, password);

    const token = createToken(user._id);

    res.status(201).json({
      name,
      email,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
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

const updateName = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const user = await User.findByIdAndUpdate(req.user?._id, { name }, { new: true });

    const token = createToken(user._id);

    res.status(200).json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt,
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

    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      passwordUpdatedAt: updatedUser.passwordUpdatedAt,
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

    res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      passwordUpdatedAt: updatedUser.passwordUpdatedAt,
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

export default { signin, signup, updateName, updateEmail, updatePassword, deleteAccount };
