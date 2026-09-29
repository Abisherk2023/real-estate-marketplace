import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();
export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    api
      .get("/favorites/ids")
      .then((res) => setIds(res.data))
      .catch(() => setIds([]));
  }, [user]);

  const toggle = async (propertyId) => {
    const { data } = await api.post(`/favorites/${propertyId}`);
    setIds(data.ids);
  };

  return (
    <FavoritesContext.Provider value={{ ids, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}