import mongoose, { Model } from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  suggestedEmails: {
    type: [
      {
        type: String,
        required: true,
        trim: true
      }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

interface UserModel extends Model<any> {}

const User = mongoose.model<any, UserModel>('User', userSchema);

export default User;
