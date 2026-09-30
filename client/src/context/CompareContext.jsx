import { createContext, useContext, useEffect, useState } from "react";

const CompareContext = createContext({
  ids: [],
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  full: false,
});
export const useCompare = () => useContext(CompareContext);

const KEY = "compareIds";
const MAX = 3;

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (e) {
    return [];
  }
};

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch (e) {
      // storage blocked, ignore
    }
  }, [ids]);

  const toggle = (id) =>
    setIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX
        ? prev
        : [...prev, id]
    );

  const remove = (id) => setIds((prev) => prev.filter((x) => x !== id));
  const clear = () => setIds([]);

  return (
    <CompareContext.Provider value={{ ids, toggle, remove, clear, full: ids.length >= MAX }}>
      {children}
    </CompareContext.Provider>
  );
}