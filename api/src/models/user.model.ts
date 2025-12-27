import bcrypt from 'bcryptjs';
import mongoose, { Model } from 'mongoose';
import validator from 'validator';

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
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

interface UserModel extends Model<any> {
  signin(email: string, password: string): Promise<any>;
  signup(name: string, email: string, password: string): Promise<any>;
}

userSchema.statics.signin = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw Error('Unable to sign in with the provided credentials.');
  }

  const pwMatch = await bcrypt.compare(password, user.password);

  if (!pwMatch) {
    throw Error('Unable to sign in with the provided credentials.');
  }

  return user;
};

userSchema.statics.signup = async function (name, email, password) {
  if (!validator.isEmail(email)) {
    throw Error('Invalid email address.');
  }

  if (!validator.isStrongPassword(password)) {
    throw Error('Password does not meet security requirements.');
  }

  const user = await this.findOne({ email });

  if (user) {
    throw Error('Unable to create an account with the provided details.');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const newUser = await this.create({ name, email, password: hash });

  return newUser;
};

const User = mongoose.model<any, UserModel>('User', userSchema);

export default User;
