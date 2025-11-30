import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  author: string;
  authorId?: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface IPrice {
  oneTime: number;
  twoTime: number;
  monthly: number;
}

export interface IMess extends Document {
  name: string;
  address: string;
  contact: string;
  city?: string;
  state?: string;
  cuisineType?: string;
  price: IPrice;
  reviews: IReview[];
  googleMapsLink: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    author: { type: String, required: true },
    authorId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const PriceSchema = new Schema<IPrice>({
  oneTime: { type: Number, required: true },
  twoTime: { type: Number, required: true },
  monthly: { type: Number, required: true },
});

const MessSchema = new Schema<IMess>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    cuisineType: { type: String, enum: ["VEG", "NON_VEG", "BOTH"], default: "VEG" },
    price: { type: PriceSchema, required: true },
    reviews: { type: [ReviewSchema], default: [] },
    googleMapsLink: { type: String, required: true },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

const Mess = mongoose.model<IMess>('Mess', MessSchema);
export default Mess;
