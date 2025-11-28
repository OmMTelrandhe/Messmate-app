import React, { useState } from 'react';
import { Mess, Review, User, CuisineType } from "../../types";
import Modal from '../common/Modal';
import StarRating from '../common/StarRating';
import StarIcon from '../icons/StarIcon';
import {
  MapPinIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";


interface MessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mess: Mess | null;
  currentUser: User | null;
  onAddReview: (messId: string, review: Omit<Review, 'id' | 'date' | 'author' | 'authorId'>) => Promise<void>;
}

const getAverageRating = (mess: Mess): number => {
    if (mess.reviews.length === 0) return 0;
    const total = mess.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / mess.reviews.length;
}

const getCuisineLabel = (cuisine: CuisineType) => {
  switch (cuisine) {
    case CuisineType.VEG:
      return "Pure Vegetarian";
    case CuisineType.NON_VEG:
      return "Non-Vegetarian";
    case CuisineType.BOTH:
      return "Vegetarian & Non-Vegetarian";
    default:
      return "Cuisine Type Not Specified";
  }
};

const MessDetailModal: React.FC<MessDetailModalProps> = ({ isOpen, onClose, mess, currentUser, onAddReview }) => {
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mess) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0) {
        alert("Please select a rating to submit a review.");
        return;
    }
    setIsSubmitting(true);
    try {
        await onAddReview(mess.id, {
          rating: newReviewRating,
          comment: newReviewComment,
        });
        setNewReviewRating(0);
        setNewReviewComment('');
    } catch(error) {
        console.error("Failed to submit review:", error);
        alert("There was an error submitting your review. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const avgRating = getAverageRating(mess);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mess.name} size="2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <div className="flex items-center">
              <StarRating rating={avgRating} size="lg" />
              <span className="ml-3 text-lg text-gray-600">
                {avgRating.toFixed(1)} ({mess.reviews.length} reviews)
              </span>
            </div>
          </div>
          <a
            href={mess.googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            View on Map
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-start text-gray-700">
              <MapPinIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
              <span>{mess.address}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <PhoneIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              <span>{mess.contact}</span>
            </div>
          </div>

          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">Cuisine Type</p>
              <p>{getCuisineLabel(mess.cuisineType)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <CurrencyRupeeIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              <span>
                One-time: ₹{mess.price.oneTime} / Two-time: ₹
                {mess.price.twoTime}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <CurrencyRupeeIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              <span className="font-semibold">
                Monthly: ₹{mess.price.monthly}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-4">
            Reviews
          </h4>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {mess.reviews.length > 0 ? (
              mess.reviews
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-4 rounded-lg border"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-700">
                        {review.author}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                    <p className="text-xs text-gray-400 text-right mt-2">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">
                No reviews yet. Be the first to add one!
              </p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t">
          <h4 className="text-lg font-semibold text-brand-dark mb-2">
            Leave a Review
          </h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setNewReviewRating(index + 1)}
                  >
                    <StarIcon
                      className={`h-8 w-8 cursor-pointer ${
                        index + 1 <= newReviewRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                rows={3}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default MessDetailModal;
