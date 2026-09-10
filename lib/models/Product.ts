import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  images: string[];
  description: string;
  badge?: string;
  isArchived?: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true, default: 4.5 },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, required: true },
    badge: { type: String, default: '' },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
