import React from 'react';
import { Mess , CuisineType} from '../types';
import StarRating from './common/StarRating';
import { MapPinIcon, PhoneIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid';

interface MessCardProps {
  mess: Mess;
  onViewDetails: (mess: Mess) => void;
}

const getAverageRating = (mess: Mess): number => {
    if (mess.reviews.length === 0) return 0;
    const total = mess.reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / mess.reviews.length;
}

const getCuisineBadge = (cuisine: CuisineType) => {
  switch (cuisine) {
    case CuisineType.VEG:
      return {
        label: "Pure Veg",
        color: "bg-green-100 text-green-800 border-green-300",
      };
    case CuisineType.NON_VEG:
      return {
        label: "Non-Veg",
        color: "bg-red-100 text-red-800 border-red-300",
      };
    case CuisineType.BOTH:
      return {
        label: "Veg & Non-Veg",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    default:
      return {
        label: "Cuisine",
        color: "bg-gray-100 text-gray-800 border-gray-300",
      };
  }
};

const MessCard: React.FC<MessCardProps> = ({ mess, onViewDetails }) => {
    const avgRating = getAverageRating(mess);

    const badge = getCuisineBadge(mess.cuisineType);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-brand-dark mb-2">
              {mess.name}
            </h3>
            <div className="flex items-center">
              <StarRating rating={avgRating} />
              <span className="text-gray-600 text-sm ml-2">
                ({mess.reviews.length})
              </span>
            </div>
          </div>

          {/* 🆕 NEW: Display Cuisine Badge */}
          <div
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${badge.color} mt-2`}
          >
            {badge.label}
          </div>

          <div className="space-y-3 text-gray-600 mt-4">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-1" />
              <span>{mess.address}</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              <span>{mess.contact}</span>
            </div>
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
              <span>Monthly: ₹{mess.price.monthly}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t">
          <button
            onClick={() => onViewDetails(mess)}
            className="w-full text-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            View Details & Reviews
          </button>
        </div>
      </div>
    );
};

export default MessCard;