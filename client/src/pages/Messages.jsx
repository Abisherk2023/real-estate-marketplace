import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Messages() {
  const { id: activeId } = useParams();
  const { user } = useAuth();
  const { socket, refreshUnread } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const lastTypingSent = useRef(0);

  const loadConversations = () =>
    api
      .get("/chat/conversations")
      .then((res) => setConversations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when a conversation is opened
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    api
      .get(`/chat/conversations/${activeId}/messages`)
      .then((res) => {
        setMessages(res.data);
        loadConversations();
        refreshUnread();
      })
      .catch(() => navigate("/messages"));
  }, [activeId]);

  // Live events
  useEffect(() => {
    if (!socket) return;

    const onMessage = ({ conversationId, message }) => {
      loadConversations();
      if (conversationId === activeId) {
        setMessages((prev) =>
          prev.some((m) => m._id === message._id) ? prev : [...prev, message]
        );
        if (String(message.sender?._id || message.sender) !== String(user._id)) {
          api.put(`/chat/conversations/${conversationId}/read`).then(refreshUnread);
        }
      }
    };

    const onTyping = ({ conversationId }) => {
      if (conversationId !== activeId) return;
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 2000);
    };

    socket.on("message:new", onMessage);
    socket.on("typing", onTyping);
    return () => {
      socket.off("message:new", onMessage);
      socket.off("typing", onTyping);
    };
  }, [socket, activeId, user._id]);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleChange = (e) => {
    setText(e.target.value);
    const now = Date.now();
    if (socket && now - lastTypingSent.current > 1000) {
      lastTypingSent.current = now;
      socket.emit("typing", { conversationId: activeId });
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    try {
      const { data } = await api.post(`/chat/conversations/${activeId}/messages`, {
        text: value,
      });
      setMessages((prev) => (prev.some((m) => m._id === data._id) ? prev : [...prev, data]));
      loadConversations();
    } catch (err) {
      setText(value);
      alert(err.response?.data?.message || "Could not send message");
    }
  };

  const otherPerson = (c) => (c.buyer?._id === user._id ? c.agent : c.buyer);
  const active = conversations.find((c) => c._id === activeId);

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>

      <div className="bg-white rounded-xl shadow grid md:grid-cols-3 h-[70vh] overflow-hidden">
        {/* Conversation list */}
        <div
          className={`border-r overflow-y-auto ${activeId ? "hidden md:block" : "block"}`}
        >
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No conversations yet. Open a property and click "Chat with agent".
            </p>
          ) : (
            conversations.map((c) => (
              <Link
                key={c._id}
                to={`/messages/${c._id}`}
                className={`flex items-center gap-3 p-3 border-b hover:bg-gray-50 ${
                  c._id === activeId ? "bg-emerald-50" : ""
                }`}
              >
                <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                  {c.property?.images?.[0] && (
                    <img
                      src={c.property.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {otherPerson(c)?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {c.property?.title || "Deleted property"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMessage}</p>
                </div>
                {c.unread > 0 && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-0.5">
                    {c.unread}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Thread */}
        <div
          className={`md:col-span-2 flex flex-col min-h-0 ${
            activeId ? "flex" : "hidden md:flex"
          }`}
        >
          {!activeId || !active ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="p-3 border-b flex items-center gap-3">
                <Link to="/messages" className="md:hidden text-emerald-600 text-sm">
                  ← Back
                </Link>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {otherPerson(active)?.name}
                  </p>
                  {active.property && (
                    <Link
                      to={`/properties/${active.property._id}`}
                      className="text-xs text-emerald-600 truncate block"
                    >
                      {active.property.title}
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {messages.map((m) => {
                  const senderId = String(m.sender?._id || m.sender);
const mine = senderId === String(user._id);
                  console.log("sender:", m.sender, "| me:", user._id, "| mine:", m.sender === user._id);
                  return (
                    <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          mine
                            ? "bg-emerald-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 shadow rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            mine ? "text-emerald-100" : "text-gray-400"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {typing && <p className="text-xs text-gray-400 italic">typing...</p>}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="p-3 border-t flex gap-2">
                <input
                  value={text}
                  onChange={handleChange}
                  maxLength={2000}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-full text-sm"
                />
                <button className="bg-emerald-600 text-white px-5 rounded-full font-semibold hover:bg-emerald-700">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}