import { Request, Response } from "express";
import Mess from "../models/Mess";
import type { IMess } from "../models/Mess";

export const listMesses = async (_req: Request, res: Response) => {
  try {
    const messes = await Mess.find().sort({ name: 1 }).lean();
    res.json(messes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messes" });
  }
};

export const createMess = async (req: Request, res: Response) => {
  try {
    const { name, address, contact, price, googleMapsLink, city, state, cuisineType } = req.body;
    const ownerId = req.user?._id?.toString() || "anonymous";

    if (!name || !address || !contact || !price || !googleMapsLink || !city || !state || !cuisineType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const mess = await Mess.create({
      name,
      address,
      contact,
      city,
      state,
      cuisineType,
      price,
      googleMapsLink,
      ownerId,
    } as any);

    res.status(201).json(mess);
  } catch (error) {
    res.status(500).json({ message: "Failed to create mess" });
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const { messId } = req.params;
    const { rating, comment, author } = req.body;
    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    const mess = await Mess.findById(messId);
    if (!mess) return res.status(404).json({ message: "Mess not found" });

    mess.reviews.unshift({
      rating,
      comment,
      author: author || "Anonymous",
      authorId: req.user?._id?.toString(),
      date: new Date(),
    } as any);

    await mess.save();
    res.status(201).json(mess);
  } catch (error) {
    res.status(500).json({ message: "Failed to add review" });
  }
};
