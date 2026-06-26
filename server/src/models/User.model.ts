import { Schema, model, Document, Model, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types/user.types';
import { UserRole } from '../types/enums';
import { config } from '../config/env';

/**
 * Mongoose document for a User, including the instance method used to verify
 * a plaintext password against the stored bcrypt hash.
 */
export interface IUserDocument extends IUser, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      // Optional: OAuth-only accounts (Google/Apple) have no local password.
      required: false,
      select: false,
    },
    googleId: {
      type: String,
      select: false,
      // sparse so multiple password-only users (no googleId) don't collide on null.
      unique: true,
      sparse: true,
    },
    appleId: {
      type: String,
      select: false,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (
  this: IUserDocument,
  next: CallbackWithoutResultAndOptionalError
): Promise<void> {
  // No-op for OAuth accounts (no password) or when the password is unchanged.
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(config.bcryptRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidate: string
): Promise<boolean> {
  // OAuth-only accounts have no local password; never authenticate them via password.
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);
