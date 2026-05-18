import { Request, Response } from 'express';

import mongoose from 'mongoose';

import Application from '../models/application.model';
import User from '../models/user.model';

import otpCache from '../utils/otpCache';
import sendEmail from '../utils/sendEmail';
import verificationCodeEmailTemplate from '../utils/emailTemplate';

const getApplications = async (req: Request, res: Response) => {
  const { status, emailUsed, sort, order, pageSize, page, query } = req.query as {
    status: string;
    emailUsed: string;
    sort: string;
    order: string;
    pageSize: string;
    page: string;
    query: string;
  };

  try {
    if (!status || !emailUsed || !sort || !order || !pageSize || !page) {
      return res.status(400).json({ error: 'Status, emailUsed, sort, order, pageSize, and page are required.' });
    }

    if (!['added', 'updated', 'company', 'status'].includes(sort)) {
      return res.status(400).json({ error: 'Invalid sort.' });
    }

    if (!['asc', 'desc'].includes(order)) {
      return res.status(400).json({ error: 'Invalid order.' });
    }

    if (!Number(pageSize) || !Number.isInteger(Number(pageSize)) || Number(pageSize) < 1) {
      return res.status(400).json({ error: 'Invalid pageSize.' });
    }

    if (!Number(page) || !Number.isInteger(Number(page)) || Number(page) < 1) {
      return res.status(400).json({ error: 'Invalid page.' });
    }

    let sortObj: any = {};

    switch (sort) {
      case 'added':
        sortObj = {
          'history.0.date': order === 'asc' ? 1 : -1,
          'companyName': 1,
          'jobTitle': 1,
          'emailUsed': 1
        };
        break;

      case 'updated':
        sortObj = {
          date: order === 'asc' ? 1 : -1,
          companyName: 1,
          jobTitle: 1,
          emailUsed: 1
        };
        break;

      case 'company':
        sortObj = {
          companyName: order === 'asc' ? 1 : -1,
          jobTitle: 1,
          emailUsed: 1
        };
        break;

      case 'status':
        sortObj = {
          status: order === 'asc' ? 1 : -1,
          companyName: 1,
          jobTitle: 1,
          emailUsed: 1
        };
        break;
    }

    const statusArray = status.split(',');
    const emailUsedArray = emailUsed.split(',');

    const filter: any = { user: req.user?._id, status: { $in: statusArray }, emailUsed: { $in: emailUsedArray } };

    if (query) {
      const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

      const escapedQuery = escapeRegex(query);

      filter.$or = [
        { companyName: { $regex: escapedQuery, $options: 'i' } },
        { jobTitle: { $regex: escapedQuery, $options: 'i' } }
      ];
    }

    const applications = await Application.find(filter)
      .collation({ locale: 'en' })
      .sort(sortObj)
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    const count = await Application.countDocuments(filter);

    res.status(200).json({ applications, count });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const createApplication = async (req: Request, res: Response) => {
  const { companyName, jobTitle, emailUsed, trackingLink, status, date } = req.body;

  try {
    if (!companyName || !jobTitle || !emailUsed || !status || !date) {
      return res.status(400).json({ error: 'Company name, job title, email used, status, and date are required.' });
    }

    if (!req.user?.suggestedEmails.includes(emailUsed)) {
      await User.findByIdAndUpdate(req.user?._id, { $push: { suggestedEmails: emailUsed } });
    }

    const application = await Application.create({
      user: req.user?._id,
      companyName,
      jobTitle,
      emailUsed,
      trackingLink,
      status,
      date,
      history: [{ status, date }]
    });

    res.status(201).json(application);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const updateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { companyName, jobTitle, emailUsed, trackingLink } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!companyName || !jobTitle || !emailUsed) {
      return res.status(400).json({ error: 'Company name, job title, and email used are required.' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!req.user?.suggestedEmails.includes(emailUsed)) {
      await User.findByIdAndUpdate(req.user?._id, { $push: { suggestedEmails: emailUsed } });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { companyName, jobTitle, emailUsed, trackingLink },
      { new: true }
    );

    res.status(200).json(updatedApplication);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const deletedApplication = await Application.findByIdAndDelete(id);

    res.status(200).json(deletedApplication);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const deleteApplicationsSendOTP = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const email = user.email;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpCache.set(email, otp);

    const subject = 'Your verification code';

    const title = 'Delete all applications';

    const message = 'Use this verification code to confirm permanent deletion of all your job applications.';

    const text = `${title}\n\n${message}\n\n${otp}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`;

    const html = verificationCodeEmailTemplate(title, user.name, message, otp);

    await sendEmail(email, subject, text, html);

    res.status(200).json({ message: 'Verification code sent successfully.' });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const deleteApplications = async (req: Request, res: Response) => {
  const { verificationCode } = req.body;

  try {
    if (!verificationCode) {
      return res.status(400).json({ error: 'Verification code is required.' });
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const email = user.email;

    const otpEntry = otpCache.get(email);

    if (!otpEntry || otpEntry.otp !== verificationCode) {
      return res.status(400).json({ error: 'Verification code is invalid or has expired.' });
    }

    otpCache.delete(email);

    const applications = await Application.find({ user: req.user?._id });

    await Application.deleteMany({ _id: { $in: applications } });

    res.status(200).json(applications);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const createApplicationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, date } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!status || !date) {
      return res.status(400).json({ error: 'Status and date are required.' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    application.history.push({ status, date });

    application.history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    application.status = application.history[application.history.length - 1].status;
    application.date = application.history[application.history.length - 1].date;

    await application.save();

    res.status(201).json(application);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const updateApplicationStatus = async (req: Request, res: Response) => {
  const { id, statusId } = req.params;
  const { status, date } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!mongoose.Types.ObjectId.isValid(statusId as string)) {
      return res.status(400).json({ error: 'Invalid status ID.' });
    }

    if (!status || !date) {
      return res.status(400).json({ error: 'Status and date are required.' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (!application.history.some(status => status._id.toString() === statusId)) {
      return res.status(404).json({ error: 'Status not found.' });
    }

    if (application.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { $set: { 'history.$[statusId].status': status, 'history.$[statusId].date': date } },
      { new: true, arrayFilters: [{ 'statusId._id': statusId }] }
    );

    if (updatedApplication) {
      updatedApplication.history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      updatedApplication.status = updatedApplication.history[updatedApplication.history.length - 1].status;
      updatedApplication.date = updatedApplication.history[updatedApplication.history.length - 1].date;

      await updatedApplication.save();
    }

    res.status(200).json(updatedApplication);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const deleteApplicationStatus = async (req: Request, res: Response) => {
  const { id, statusId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!mongoose.Types.ObjectId.isValid(statusId as string)) {
      return res.status(400).json({ error: 'Invalid status ID.' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (!application.history.some(status => status._id.toString() === statusId)) {
      return res.status(404).json({ error: 'Status not found.' });
    }

    if (application.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { $pull: { history: { _id: statusId } } },
      { new: true }
    );

    if (updatedApplication) {
      updatedApplication.status = updatedApplication.history[updatedApplication.history.length - 1].status;
      updatedApplication.date = updatedApplication.history[updatedApplication.history.length - 1].date;

      await updatedApplication.save();
    }

    res.status(200).json(updatedApplication);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

export default {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  deleteApplicationsSendOTP,
  deleteApplications,
  createApplicationStatus,
  updateApplicationStatus,
  deleteApplicationStatus
};
