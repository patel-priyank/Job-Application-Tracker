import { Request, Response } from 'express';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import Application from '../models/application.model';
import User from '../models/user.model';

const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find({ user: req.user?._id });

    res.status(200).json(applications);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const createApplication = async (req: Request, res: Response) => {
  const { companyName, jobTitle, link, status, date } = req.body;

  try {
    if (!companyName || !jobTitle || !status || !date) {
      return res.status(400).json({ error: 'Company name, job title, status, and date are required.' });
    }

    const application = await Application.create({
      user: req.user?._id,
      companyName,
      jobTitle,
      link,
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
  const { companyName, jobTitle, link } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!companyName || !jobTitle) {
      return res.status(400).json({ error: 'Company name and job title are required.' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(id, { companyName, jobTitle, link }, { new: true });

    res.status(200).json(updatedApplication);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
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

const deleteApplications = async (req: Request, res: Response) => {
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

    res.status(200).json(applications);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

const createApplicationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, date } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid application ID.' });
    }

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
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

    const deletedApplication = await Application.findByIdAndDelete(id);

    res.status(200).json(deletedApplication);
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Unknown error.' });
  }
};

export default {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  deleteApplications,
  createApplicationStatus,
  updateApplicationStatus,
  deleteApplicationStatus
};
