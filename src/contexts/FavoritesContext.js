import { createContext, useContext } from "react";

export const FavoritesContext = createContext();
export const useFavorites = () => useContext(FavoritesContext);

