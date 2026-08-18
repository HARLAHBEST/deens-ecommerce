import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegisteredItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface IUser extends Document {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: Date;
  registeredItems: IRegisteredItem[];
}

const RegisteredItemSchema = new Schema<IRegisteredItem>(
  {
    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, default: 'default123' },
    registeredItems: { type: [RegisteredItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
