import React, { useState, useMemo, useEffect } from "react";
import type { Mess, Review, User } from "./types";
import { CuisineType, ModalType, UserRole } from "./types";
import Header from "./components/Header";
import MessCard from "./components/MessCard";
import AddMessModal from "./components/modals/AddMessModal";
import MessDetailModal from "./components/modals/MessDetailModal";
import LoginRegisterModal from "./components/modals/LoginRegisterModal";
import { authAPI } from "./api/auth";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const getAverageRating = (mess: Mess): number => {
  if (!mess.reviews || mess.reviews.length === 0) return 0;
  const total = mess.reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / mess.reviews.length;
};

// 🆕 NEW: Options for the Cuisine filter UI
const cuisineOptions = [
  { label: "All Cuisine", value: "ALL" as const },
  { label: "Pure Veg", value: CuisineType.VEG },
  { label: "Non-Veg", value: CuisineType.NON_VEG },
  { label: "Veg & Non-Veg (Both)", value: CuisineType.BOTH },
];

export default function App() {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState(0); // filterPrice initialized to Infinity for "Any Price"
  const [filterPrice, setFilterPrice] = useState(Infinity);
  const [filterCuisine, setFilterCuisine] = useState<CuisineType | "ALL">(
    "ALL"
  );
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");

  // 🆕 NEW: State for City and State Filters
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // To check profile on load

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const user = await authAPI.getProfile();
        setCurrentUser(user as User);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    const fetchMesses = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/messes`);
        const data = await res.json();
        const mapped: Mess[] = data.map((m: any) => ({
          id: m._id,
          name: m.name,
          address: m.address,
          contact: m.contact,
          price: m.price,
          reviews: (m.reviews || []).map((r: any) => ({
            id: r._id,
            author: r.author,
            authorId: r.authorId,
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.date).toISOString(),
          })),
          googleMapsLink: m.googleMapsLink,
          ownerId: m.ownerId,
          city: m.city || "",
          state: m.state || "",
          // 🚀 UPDATED: Map cuisineType from API response
          cuisineType: m.cuisineType || CuisineType.VEG,
        }));
        setMesses(mapped);
      } catch (e) {
        console.error("Failed to load messes", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
    fetchMesses();
  }, []);

  // ------------------------------------------------------------------
  // DYNAMIC PRICE FILTER OPTIONS (Based on Min/Max Prices)
  // ------------------------------------------------------------------

  const priceFilterOptions = useMemo(() => {
    const monthlyPrices = messes
      .map((m) => m.price?.monthly)
      .filter(
        (price): price is number => typeof price === "number" && price > 0
      );

    if (monthlyPrices.length === 0) {
      return [];
    }

    const minPrice = Math.min(...monthlyPrices);
    const maxPrice = Math.max(...monthlyPrices);
    const options: number[] = [];
    const step = 1000;

    let currentOption = Math.max(
      step,
      Math.floor((minPrice - 1) / step) * step
    );
    const targetCeiling = Math.ceil(maxPrice / step) * step;

    while (currentOption <= targetCeiling) {
      options.push(currentOption);
      currentOption += step;
      if (options.length > 50) break;
    }

    return options.filter((price) => price > 0).sort((a, b) => a - b);
  }, [messes]);

  // ------------------------------------------------------------------
  // 🆕 NEW: DYNAMIC CITY & STATE FILTER OPTIONS
  // ------------------------------------------------------------------

  const uniqueLocations = useMemo(() => {
    const cities = new Set<string>();
    const states = new Set<string>();

    messes.forEach((mess) => {
      if (mess.city) {
        cities.add(mess.city);
      }
      if (mess.state) {
        states.add(mess.state);
      }
    });

    return {
      cities: Array.from(cities).sort(),
      states: Array.from(states).sort(),
    };
  }, [messes]);

  // ------------------------------------------------------------------
  // AUTH HANDLERS (Unchanged)
  // ------------------------------------------------------------------

  const openModal = (type: ModalType) => setActiveModal(type);

  const closeModal = () => {
    setActiveModal(ModalType.NONE);
    setSelectedMess(null);
  };

  const handleLoginClick = () => {
    openModal(ModalType.LOGIN);
  };

  const handleLoginRegisterSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setCurrentUser(null);
      closeModal();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ------------------------------------------------------------------
  // CRUD Handlers (Updated for cuisineType)
  // ------------------------------------------------------------------

  const handleAddMess = async (
    newMessData: Omit<Mess, "id" | "reviews" | "ownerId">
  ) => {
    if (!currentUser) {
      alert("Please log in to add a mess listing.");
      setActiveModal(ModalType.NONE);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/messes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newMessData,
          city: newMessData.city,
          state: newMessData.state,
          cuisineType: newMessData.cuisineType, // Ensure cuisineType is included in the payload
        }),
      });
      if (!res.ok) throw new Error("Failed to add mess");
      const created = await res.json();
      const mapped: Mess = {
        id: created._id,
        name: created.name,
        address: created.address,
        contact: created.contact,
        price: created.price,
        reviews: [],
        googleMapsLink: created.googleMapsLink,
        ownerId: created.ownerId,
        city: created.city,
        state: created.state,
        // 🚀 UPDATED: Use the cuisineType from the created response
        cuisineType: created.cuisineType || CuisineType.VEG,
      };
      setMesses((prev) => [mapped, ...prev]);
      setActiveModal(ModalType.NONE);
    } catch (e) {
      alert("Failed to add mess. Please try again.");
      console.error(e);
    }
  };

  const handleAddReview = async (
    messId: string,
    newReviewData: Omit<Review, "id" | "date" | "author" | "authorId">
  ) => {
    try {
      const res = await fetch(`${API_URL}/api/messes/${messId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newReviewData.rating,
          comment: newReviewData.comment,
          author: currentUser?.name || currentUser?.email || "Anonymous",
        }),
      });
      if (!res.ok) throw new Error("Failed to add review");
      const updated = await res.json();
      setMesses((prev) =>
        prev.map((m) =>
          m.id === updated._id
            ? {
                id: updated._id,
                name: updated.name,
                address: updated.address,
                contact: updated.contact,
                price: updated.price,
                reviews: (updated.reviews || []).map((r: any) => ({
                  id: r._id,
                  author: r.author,
                  authorId: r.authorId,
                  rating: r.rating,
                  comment: r.comment,
                  date: new Date(r.date).toISOString(),
                })),
                googleMapsLink: updated.googleMapsLink,
                ownerId: updated.ownerId,
                city: updated.city || "",
                state: updated.state || "",
                // 🚀 UPDATED: Include cuisineType in the mapped update
                cuisineType: updated.cuisineType || CuisineType.VEG,
              }
            : m
        )
      );
    } catch (e) {
      alert("Failed to submit review. Please try again.");
      console.error(e);
    }
  };

  // ------------------------------------------------------------------
  const handleViewDetails = (mess: Mess) => {
    setSelectedMess(mess);
    openModal(ModalType.MESS_DETAIL);
  };

  const handleAddMessClick = () => {
    if (currentUser) {
      openModal(ModalType.ADD_MESS);
    } else {
      handleLoginClick();
    }
  };

  // ------------------------------------------------------------------
  // 🚀 UPDATED FILTERING & SORTING LOGIC
  // ------------------------------------------------------------------

  const filteredAndSortedMesses = useMemo(() => {
    // Cache the lowercased search term for efficiency
    const lowerSearchTerm = searchTerm.toLowerCase();

    return messes
      .filter((mess) => {
        const avgRating = getAverageRating(mess);
        const monthlyPrice =
          mess.price && mess.price.monthly ? mess.price.monthly : Infinity;

        // 1. Text Search Filter (Fuzzy matching on all text fields)
        const textMatch =
          mess.name.toLowerCase().includes(lowerSearchTerm) ||
          mess.address.toLowerCase().includes(lowerSearchTerm) ||
          (mess.city || "").toLowerCase().includes(lowerSearchTerm) ||
          (mess.state || "").toLowerCase().includes(lowerSearchTerm);

        // 2. Dedicated Dropdown Filters (Exact matching)
        const cityFilterMatch = filterCity === "" || mess.city === filterCity;
        const stateFilterMatch =
          filterState === "" || mess.state === filterState;

        // 🚀 NEW: Cuisine Type Filter
        const cuisineMatch =
          filterCuisine === "ALL" || mess.cuisineType === filterCuisine;

        // 3. Rating and Price Filters
        const ratingMatch = avgRating >= filterRating;
        const priceMatch = monthlyPrice <= filterPrice;

        return (
          textMatch &&
          cityFilterMatch &&
          stateFilterMatch &&
          cuisineMatch && // 🚀 Apply cuisine filter
          ratingMatch &&
          priceMatch
        );
      })
      .sort((a, b) => {
        if (sortBy === "rating")
          return getAverageRating(b) - getAverageRating(a);
        if (sortBy === "price") {
          const aPrice =
            a.price && a.price.monthly ? a.price.monthly : Infinity;
          const bPrice =
            b.price && b.price.monthly ? b.price.monthly : Infinity;
          return aPrice - bPrice;
        }
        return 0;
      });
  }, [
    messes,
    searchTerm,
    filterRating,
    filterPrice,
    filterCuisine, // 🚀 NEW: Add to dependency array
    filterCity,
    filterState,
    sortBy,
  ]);
  // ------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddMessClick={handleAddMessClick}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogout}
        currentUser={currentUser}
      />

      <main className="container mx-auto p-4 md:p-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-brand-dark mb-4">
                Filter & Sort
              </h2>

              <div className="space-y-4">
                {/* 🆕 NEW: CUISINE FILTER */}
                <div>
                  <label
                    htmlFor="filter-cuisine"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cuisine Type
                  </label>
                  <select
                    id="filter-cuisine"
                    onChange={(e) =>
                      setFilterCuisine(e.target.value as CuisineType | "ALL")
                    }
                    value={filterCuisine}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary text-gray-900"
                  >
                    {cuisineOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* 🆕 NEW: CITY FILTER */}
                <div>
                  <label
                    htmlFor="filter-city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Filter by City
                  </label>
                  <select
                    id="filter-city"
                    onChange={(e) => setFilterCity(e.target.value)}
                    value={filterCity}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary text-gray-900"
                  >
                    <option value="">All Cities</option>

                    {uniqueLocations.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                {/* 🆕 NEW: STATE FILTER */}
                <div>
                  <label
                    htmlFor="filter-state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Filter by State
                  </label>

                  <select
                    id="filter-state"
                    onChange={(e) => setFilterState(e.target.value)}
                    value={filterState}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary text-gray-900"
                  >
                    <option value="">All States</option>

                    {uniqueLocations.states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                {/* END NEW LOCATION FILTERS */}
                <div>
                  <label
                    htmlFor="filter-rating"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Minimum Rating
                  </label>

                  <select
                    id="filter-rating"
                    onChange={(e) => setFilterRating(Number(e.target.value))}
                    value={filterRating}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary text-gray-900"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4}>4 Stars & Up</option>
                    <option value={3}>3 Stars & Up</option>
                    <option value={2}>2 Stars & Up</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="filter-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Max Monthly Price
                  </label>

                  <select
                    id="filter-price"
                    onChange={(e) => setFilterPrice(Number(e.target.value))}
                    value={filterPrice}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary text-gray-900"
                  >
                    <option value={Infinity}>Any Price</option>
                    {priceFilterOptions.map((price) => (
                      <option key={price} value={price}>
                        Under ₹{price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sort-by"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sort By
                  </label>

                  <select
                    id="sort-by"
                    onChange={(e) => setSortBy(e.target.value as any)}
                    value={sortBy}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary text-gray-900"
                  >
                    <option value="rating">Rating</option>{" "}
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center col-span-full py-16">
                <div role="status" className="flex justify-center items-center">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-primary"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />

                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>

                <p className="text-xl text-gray-500 mt-4">Loading messes...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredAndSortedMesses.map((mess) => (
                    <MessCard
                      key={mess.id}
                      mess={mess}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {filteredAndSortedMesses.length === 0 && (
                  <div className="text-center col-span-full py-16">
                    <p className="text-xl text-gray-500">
                      No messes found matching your criteria.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} MessMate. All rights reserved.
          </p>
        </div>
      </footer>
      {/* Login/Register Modal */}
      <LoginRegisterModal
        isOpen={activeModal === ModalType.LOGIN}
        onClose={closeModal}
        onSuccess={handleLoginRegisterSuccess}
        apiCalls={{
          login: authAPI.login,
          register: authAPI.register,
        }}
      />

      <AddMessModal
        isOpen={activeModal === ModalType.ADD_MESS}
        onClose={closeModal}
        onAddMess={handleAddMess}
      />

      <MessDetailModal
        isOpen={activeModal === ModalType.MESS_DETAIL}
        onClose={closeModal}
        mess={selectedMess}
        currentUser={currentUser}
        onAddReview={handleAddReview}
      />
    </div>
  );
}
