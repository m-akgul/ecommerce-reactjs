import { useEffect, useState } from "react";
import axios from "../api/axios";
import { API_ENDPOINTS } from "../utils/constants";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { useDialog } from "./DialogContext";
import { FavoritesContext } from "./FavoritesContext";

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const { showDialog } = useDialog();
  const [favorites, setFavorites] = useState([]);

  // Fetch on login
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites([]); // Clear when logged out
        return;
      }
      try {
        const res = await axios.get(API_ENDPOINTS.FAVORITES, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(
          res.data.data.map((item) => ({
            id: item.productId,
            name: item.productName,
            price: item.productPrice,
            imageUrl: item.productImage,
          }))
        );
      } catch {
        console.error("Could not load favorites.");
      }
    };

    loadFavorites();
  }, [isAuthenticated, token]);

  // Add or Remove
  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      toast.warn("Please login to manage favorites.");
      showDialog({
        type: "alert",
        message: "You need to be logged in to manage favorites.",
      });
      return;
    }

    const isAlready = favorites.some((f) => f.id === productId);

    try {
      if (isAlready) {
        await axios.delete(`${API_ENDPOINTS.FAVORITES}/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter((f) => f.id !== productId));
      } else {
        const res = await axios.post(
          API_ENDPOINTS.FAVORITES,
          { productId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const item = res.data.data;
        const mapped = {
          id: item.productId,
          name: item.productName,
          price: item.productPrice,
          imageUrl: item.productImage,
        };
        setFavorites([...favorites, mapped]);
      }
    } catch {
      toast.error("Failed to update favorites.");
    }
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite: (productId) => favorites.some((f) => f.id === productId),
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
