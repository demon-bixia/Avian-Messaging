import mongoose, { Schema, Types } from 'mongoose';


// **** Types **** //

enum UserRoles {
  Standard = 'Standard',
  Admin = 'Admin'
}

export interface IUser {
  _id: Types.ObjectId
  email: string
  firstName: string
  lastName: string
  avatar?: string
  contacts: string[]
  lastSeen: string
  password: string
  role: UserRoles
};


// **** Variables **** //

// Schema
const userSchema = new Schema<IUser>({
  email: { type: String, maxLength: 255, unique: true, index: true },
  firstName: { type: String, minLength: 3, maxLength: 50 },
  lastName: { type: String, minLength: 3, maxLength: 50 },
  avatar: String,
  lastSeen: { type: String, default: String(Math.floor(Date.now() / 1000)) },
  contacts: [String],
  password: String,
  role: { type: String, default: UserRoles.Standard }
});


// **** Export default **** //

export default mongoose.model<IUser>('User', userSchema);
