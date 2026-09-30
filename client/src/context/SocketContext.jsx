import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const SocketContext = createContext({
  socket: null,
  unread: 0,
  refreshUnread: () => {},
});
export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
  /\/api$/,
  ""
);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    api
      .get("/chat/unread")
      .then((res) => setUnread(res.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.token) {
      setSocket(null);
      setUnread(0);
      return;
    }

    const s = io(SOCKET_URL, { auth: { token: user.token } });
    setSocket(s);
    refreshUnread();
    s.on("message:new", refreshUnread);

    return () => {
      s.off("message:new", refreshUnread);
      s.disconnect();
    };
  }, [user?.token, refreshUnread]);

  return (
    <SocketContext.Provider value={{ socket, unread, refreshUnread }}>
      {children}
    </SocketContext.Provider>
  );
}