import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  emailUsed: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  history: {
    type: [
      {
        status: {
          type: String,
          required: true,
          trim: true
        },
        date: {
          type: Date,
          required: true
        }
      }
    ]
  }
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
