import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Mess, CuisineType } from "../../types";

interface AddMessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMess: (mess: Omit<Mess, 'id' | 'reviews' | 'ownerId'>) => Promise<void>;
}

const AddMessModal: React.FC<AddMessModalProps> = ({ isOpen, onClose, onAddMess }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [oneTime, setOneTime] = useState("");
  const [twoTime, setTwoTime] = useState("");
  const [monthly, setMonthly] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cuisineType, setCuisineType] = useState<CuisineType | "">(""); // Start with empty string for required check
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setAddress("");
    setContact("");
    setOneTime("");
    setTwoTime("");
    setMonthly("");
    setGoogleMapsLink("");
    setCity("");
    setState("");
    setCuisineType("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 🆕 NEW: Input validation for cuisine type
    if (!cuisineType) {
      alert("Please select the Cuisine Type.");
      return;
    }
    setError("");
    setIsLoading(true);

    const contactNumber = contact.replace(/\s/g, "");
    if (contactNumber.length !== 10 || !/^\d{10}$/.test(contactNumber)) {
      setError("Contact number must be exactly 10 digits.");
      setIsLoading(false);
      return;
    }

    try {
      await onAddMess({
        name,
        address,
        contact: contactNumber,
        city,
        state,
        price: {
          oneTime: Number(oneTime),
          twoTime: Number(twoTime),
          monthly: Number(monthly),
        },
        googleMapsLink,
        cuisineType: cuisineType as CuisineType,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to add mess:", error);
      alert("There was an error adding the mess. Please try again.");
      setError(error.message || "Failed to add mess listing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a New Mess Service">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mess Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City (Mandatory)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State (Mandatory)
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
            />
          </div>
        </div>

        {/* 🆕 NEW: CUISINE TYPE RADIO BUTTONS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine Type
          </label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="cuisineType"
                value={CuisineType.VEG}
                checked={cuisineType === CuisineType.VEG}
                onChange={() => setCuisineType(CuisineType.VEG)}
                required
                className="form-radio h-4 w-4 text-primary"
              />
              <span className="ml-2 text-gray-700">Veg</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="cuisineType"
                value={CuisineType.NON_VEG}
                checked={cuisineType === CuisineType.NON_VEG}
                onChange={() => setCuisineType(CuisineType.NON_VEG)}
                className="form-radio h-4 w-4 text-primary"
              />
              <span className="ml-2 text-gray-700">Non-Veg</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="cuisineType"
                value={CuisineType.BOTH}
                checked={cuisineType === CuisineType.BOTH}
                onChange={() => setCuisineType(CuisineType.BOTH)}
                className="form-radio h-4 w-4 text-primary"
              />
              <span className="ml-2 text-gray-700">Both (Veg & Non-Veg)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Number (10 Digits)
          </label>
          <input
            type="tel" // Use 'tel' for better mobile keyboard experience
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            // Simple HTML pattern for a basic client-side check
            pattern="[0-9]{10}"
            title="10 digit phone number"
            maxLength={10} // Prevent entering more than 10 digits
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (1-Time)
            </label>
            <input
              type="number"
              value={oneTime}
              onChange={(e) => setOneTime(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (2-Time)
            </label>
            <input
              type="number"
              value={twoTime}
              onChange={(e) => setTwoTime(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price (Monthly)
            </label>
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Google Maps Link
          </label>
          <input
            type="url"
            value={googleMapsLink}
            onChange={(e) => setGoogleMapsLink(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Adding..." : "Add Mess"}
        </button>
      </form>
    </Modal>
  );
};

export default AddMessModal;
