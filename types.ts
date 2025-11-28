export enum CuisineType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  BOTH = 'BOTH',
}

export interface Review {
  id: string; // Firestore document ID
  author: string;
  authorId: string; // ID of the user who wrote it
  rating: number;
  comment: string;
  date: string;
}

export interface Price {
  oneTime: number;
  twoTime: number;
  monthly: number;
}

export interface Mess {
  id: string; // Firestore document ID
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  price: Price;
  reviews: Review[]; // This will now be a subcollection in Firestore
  googleMapsLink: string;
  ownerId: string; // ID of the mess owner
  cuisineType: CuisineType;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  OWNER = 'OWNER',
}

export interface User {
  // uid: string;
  _id: string; // Mongoose ID
  name: string | null;
  email: string | null;
  role: UserRole; // Add the role property
  // In a real app, you might store the role in Firestore's user collection
}

export enum ModalType {
  NONE,
  LOGIN,
  ADD_MESS,
  MESS_DETAIL,
}
