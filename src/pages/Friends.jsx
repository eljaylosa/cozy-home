import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Users,
  UserPlus,
  Search,
  Copy,
  Check,
  CheckCircle2,
  X,
  Clock,
  RefreshCw,
  Send,
  UserMinus,
  Sprout,
  Home,
  Lock,
  Globe,
  UserRound,
  Eye,
  CalendarDays,
  MessageCircle,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useAuth, API_URL } from "../context/AuthContext";

function getAvatarUrl(avatarPath) {
  if (!avatarPath || avatarPath.startsWith("preset:")) return null;
  if (/^https?:\/\//i.test(avatarPath)) return avatarPath;
  const cleanPath = avatarPath.replace(/^\/?uploads\//, "").replace(/^\/+/, "");
  return `${API_URL}/uploads/${cleanPath}`;
}

function Avatar({ avatarPath, username, size = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);
  const url = getAvatarUrl(avatarPath);

  useEffect(() => {
    setFailed(false);
  }, [avatarPath]);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={`${username || "Player"}'s avatar`}
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-full border-2 border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-cozy-sage text-lg font-bold text-white shadow-sm`}
    >
      {(username || "F").charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center px-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cozy-sage/10 text-cozy-sage-dark">
        <Icon size={25} />
      </div>
      <h3 className="mt-4 font-serif text-lg font-bold text-cozy-dark">
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-xs leading-5 text-cozy-brown/55">
        {description}
      </p>
    </div>
  );
}

function PlayerCard({ player, children }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-cozy-brown/10 bg-white/60 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar avatarPath={player.avatar_path} username={player.username} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-cozy-dark">
            {player.username}
          </p>
          <p className="mt-1 truncate font-mono text-[10px] text-cozy-brown/50">
            {player.friend_code}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function HouseCard({ house }) {
  const isPrivate = house.visibility === "private";

  return (
    <div className="rounded-2xl border border-cozy-brown/10 bg-white/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cozy-sage/15 text-cozy-sage-dark">
          <Home size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-cozy-dark">
            {house.name}
          </h4>
          <p className="mt-1 text-xs capitalize text-cozy-brown/55">
            {(house.theme || "cozy-cottage").replaceAll("-", " ")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                isPrivate
                  ? "bg-cozy-rose/10 text-cozy-rose"
                  : "bg-cozy-sage/15 text-cozy-sage-dark"
              }`}
            >
              {isPrivate ? <Lock size={11} /> : <Globe size={11} />}
              {isPrivate ? "Private" : "Public"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cozy-cream px-2.5 py-1 text-[10px] font-bold text-cozy-brown/60">
              <Users size={11} />
              {house.member_count}{" "}
              {Number(house.member_count) === 1 ? "member" : "members"}
            </span>
            {Boolean(Number(house.is_member)) && (
              <span className="rounded-lg bg-cozy-sage/15 px-2.5 py-1 text-[10px] font-bold text-cozy-sage-dark">
                You're a member
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function mergeMessages(existing, incoming) {
  const messageMap = new Map();

  [...existing, ...incoming].forEach((message) => {
    messageMap.set(String(message.id), message);
  });

  return [...messageMap.values()].sort((a, b) => {
    const dateDifference =
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (dateDifference !== 0) return dateDifference;
    return Number(a.id) - Number(b.id);
  });
}

function getMessagePreview(message) {
  if (!message) return "Start a conversation";
  if (message.is_deleted || message.last_message_is_deleted)
    return "Message deleted";
  return message.content || "Start a conversation";
}

export default function Friends() {
  const { accessToken, user } = useAuth();
  const currentUserId = user?.id;

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedConversationRef = useRef(null);

  const [socketConnected, setSocketConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [friendHouses, setFriendHouses] = useState([]);
  const [detailsTab, setDetailsTab] = useState("profile");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [unfriending, setUnfriending] = useState(false);

  // Messaging
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const apiRequest = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}/api/friends${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Something went wrong.");
      return data;
    },
    [accessToken]
  );

  const messageRequest = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}/api/messages${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Messaging request failed.");
      return data;
    },
    [accessToken]
  );

  const loadFriendsData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");

    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([
        apiRequest("/"),
        apiRequest("/requests/incoming"),
        apiRequest("/requests/outgoing"),
      ]);
      setFriends(friendsData.friends || []);
      setIncoming(incomingData.requests || []);
      setOutgoing(outgoingData.requests || []);
    } catch (err) {
      console.error("[Friends] Load data failed:", err);
      setError(err.message || "Unable to load your friends.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, apiRequest]);

  const loadConversations = useCallback(async () => {
    if (!accessToken) return;
    setConversationsLoading(true);

    try {
      const data = await messageRequest("/");
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("[Messages] Load conversations failed:", err);
      setMessageError(err.message || "Unable to load conversations.");
    } finally {
      setConversationsLoading(false);
    }
  }, [accessToken, messageRequest]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;
      setMessagesLoading(true);
      setMessageError("");

      try {
        const data = await messageRequest(
          `/conversations/${conversationId}/messages`
        );
        setMessages((current) => mergeMessages(current, data.messages || []));
      } catch (err) {
        console.error("[Messages] Load messages failed:", err);
        setMessageError(err.message || "Unable to load messages.");
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [messageRequest]
  );

  // Socket connection
  useEffect(() => {
    if (!accessToken) {
      setSocketConnected(false);
      return;
    }

    const socket = io(API_URL.replace(/\/+$/, ""), {
      auth: { token: accessToken },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Messages] Socket connected:", socket.id);
      setSocketConnected(true);

      const selected = selectedConversationRef.current;
      if (selected?.conversation_id) {
        socket.emit("conversation:join", selected.conversation_id, (result) => {
          if (!result?.success) {
            console.error(
              "[Messages] Failed to rejoin conversation:",
              result?.message
            );
          }
        });
      }
      loadConversations();
    });

    socket.on("connect_error", (err) => {
      console.error("[Messages] Socket connection error:", err.message);
      setSocketConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Messages] Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.on("message:new", (newMessage) => {
      if (!newMessage?.id || !newMessage?.conversation_id) return;

      const conversationId = String(newMessage.conversation_id);
      const selected = selectedConversationRef.current;
      const isCurrentConversation =
        selected && String(selected.conversation_id) === conversationId;

      if (isCurrentConversation) {
        setMessages((current) => mergeMessages(current, [newMessage]));
        if (String(newMessage.sender_id) !== String(currentUserId)) {
          setUnreadCounts((current) => ({ ...current, [conversationId]: 0 }));
        }
      } else if (String(newMessage.sender_id) !== String(currentUserId)) {
        setUnreadCounts((current) => ({
          ...current,
          [conversationId]: (current[conversationId] || 0) + 1,
        }));
      }
    });

    socket.on("conversation:updated", (payload) => {
      if (!payload?.conversation_id) return;

      const conversationId = String(payload.conversation_id);
      const latestMessage = payload.message;

      setConversations((current) => {
        const existing = current.find(
          (conversation) =>
            String(conversation.conversation_id) === conversationId
        );

        if (!existing) {
          loadConversations();
          return current;
        }

        const updatedConversation = {
          ...existing,
          last_message_id: latestMessage?.id,
          last_message_sender_id: latestMessage?.sender_id,
          last_message_content: latestMessage?.content,
          last_message_is_deleted: latestMessage?.is_deleted,
          last_message_created_at: latestMessage?.created_at,
          updated_at: latestMessage?.created_at || existing.updated_at,
        };

        return [
          updatedConversation,
          ...current.filter(
            (conversation) =>
              String(conversation.conversation_id) !== conversationId
          ),
        ];
      });
    });

    socket.on("conversation:created", loadConversations);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      setSocketConnected(false);
    };
  }, [accessToken, currentUserId, loadConversations]);

  // Join selected conversation
  useEffect(() => {
    const socket = socketRef.current;
    const conversationId = selectedConversation?.conversation_id;

    if (!socket || !socket.connected || !conversationId) return;

    socket.emit("conversation:join", conversationId, (result) => {
      if (!result?.success) {
        console.error(
          "[Messages] Unable to join conversation room:",
          result?.message
        );
        setMessageError(
          result?.message || "Unable to connect to this conversation."
        );
      } else {
        console.log(
          "[Messages] Joined conversation room:",
          result.conversation_id
        );
      }
    });

    return () => {
      if (socket.connected) socket.emit("conversation:leave", conversationId);
    };
  }, [selectedConversation?.conversation_id, socketConnected]);

  // Scroll only the messages panel, never the whole page.
  useEffect(() => {
    if (activeTab !== "messages" || !selectedConversation) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: messagesLoading ? "auto" : "smooth",
    });
  }, [
    messages,
    activeTab,
    selectedConversation?.conversation_id,
    messagesLoading,
  ]);

  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  useEffect(() => {
    if (activeTab === "messages") loadConversations();
  }, [activeTab, loadConversations]);

  async function handleSearch(event) {
    event.preventDefault();
    const code = searchCode.trim().toUpperCase();

    if (!/^LA-[A-F0-9]{10}$/.test(code)) {
      setError("Enter a valid Friend Code (example: LA-4FEBAEA3D7).");
      setSuccess("");
      setSearchResult(null);
      return;
    }

    setSearching(true);
    setError("");
    setSuccess("");
    setSearchResult(null);

    try {
      const data = await apiRequest(`/search?code=${encodeURIComponent(code)}`);
      setSearchResult(data);
    } catch (err) {
      setError(err.message || "Player not found.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest() {
    if (!searchResult?.player) return;
    setSending(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest("/requests", {
        method: "POST",
        body: JSON.stringify({ friend_code: searchResult.player.friend_code }),
      });

      setSuccess(`Friend request sent to ${searchResult.player.username}!`);
      setSearchResult((current) =>
        current
          ? {
              ...current,
              relationship: { status: "pending", direction: "outgoing" },
            }
          : current
      );
      await loadFriendsData();
    } catch (err) {
      setError(err.message || "Unable to send friend request.");
    } finally {
      setSending(false);
    }
  }

  async function handleRequestAction(requestId, action) {
    setBusyId(requestId);
    setError("");
    setSuccess("");

    try {
      if (action === "cancel") {
        await apiRequest(`/requests/${requestId}`, { method: "DELETE" });
      } else {
        await apiRequest(`/requests/${requestId}/${action}`, {
          method: "PATCH",
        });
      }

      const messages = {
        accept: "Friend request accepted!",
        decline: "Friend request declined.",
        cancel: "Friend request cancelled.",
      };

      setSuccess(messages[action]);
      await loadFriendsData();
    } catch (err) {
      setError(err.message || "Unable to process friend request.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess("Friend Code copied!");
      setError("");
    } catch {
      setError("Unable to copy Friend Code.");
      setSuccess("");
    }
  }

  async function openFriendDetails(friend, initialTab = "profile") {
    setSelectedFriend(friend);
    setFriendProfile(null);
    setFriendHouses([]);
    setDetailsTab(initialTab);
    setDetailsLoading(true);
    setDetailsError("");
    setError("");
    setSuccess("");

    try {
      const [profileData, housesData] = await Promise.all([
        apiRequest(`/${friend.id}/profile`),
        apiRequest(`/${friend.id}/houses`),
      ]);
      setFriendProfile(profileData.profile || null);
      setFriendHouses(housesData.houses || []);
    } catch (err) {
      console.error("[Friends] Load friend details failed:", err);
      setDetailsError(err.message || "Unable to load friend details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeFriendDetails() {
    setSelectedFriend(null);
    setFriendProfile(null);
    setFriendHouses([]);
    setDetailsError("");
    setDetailsLoading(false);
  }

  async function handleUnfriend(friend) {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${friend.username} from your friends?`
    );
    if (!confirmed) return;

    setUnfriending(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/${friend.id}`, { method: "DELETE" });
      setSuccess(`${friend.username} has been removed from your friends.`);
      closeFriendDetails();
      await loadFriendsData();
    } catch (err) {
      setError(err.message || "Unable to remove friend.");
    } finally {
      setUnfriending(false);
    }
  }

  async function openConversation(conversation) {
    setSelectedConversation(conversation);
    setMessages([]);
    setMessageContent("");
    setMessageError("");

    const conversationId = String(conversation.conversation_id);
    setUnreadCounts((current) => ({ ...current, [conversationId]: 0 }));

    await loadMessages(conversation.conversation_id);
  }

  async function startConversation(friend) {
    setCreatingConversation(true);
    setMessageError("");
    setActiveTab("messages");

    try {
      const data = await messageRequest("/conversations", {
        method: "POST",
        body: JSON.stringify({ friend_id: friend.id }),
      });

      const conversation = {
        conversation_id: data.conversation_id,
        friend_id: friend.id,
        friend_username: friend.username,
        friend_display_name: friend.display_name || null,
        friend_avatar_path: friend.avatar_path || null,
      };

      setSelectedConversation(conversation);
      setMessages([]);
      setMessageContent("");

      await loadConversations();
      await loadMessages(data.conversation_id);
    } catch (err) {
      console.error("[Messages] Create conversation failed:", err);
      setMessageError(err.message || "Unable to start conversation.");
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    const content = messageContent.trim();

    if (!content || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    setMessageError("");

    try {
      const data = await messageRequest(
        `/conversations/${selectedConversation.conversation_id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );

      if (data.sent_message) {
        setMessages((current) => mergeMessages(current, [data.sent_message]));
      }

      setMessageContent("");
      await loadConversations();
    } catch (err) {
      console.error("[Messages] Send message failed:", err);
      setMessageError(err.message || "Unable to send message.");
    } finally {
      setSendingMessage(false);
    }
  }

  async function refreshCurrentChat() {
    if (!selectedConversation) {
      await loadConversations();
      return;
    }

    await Promise.all([
      loadMessages(selectedConversation.conversation_id),
      loadConversations(),
    ]);
  }

  const totalUnread = Object.values(unreadCounts).reduce(
    (total, count) => total + Number(count || 0),
    0
  );

  const tabs = [
    { id: "friends", label: "My Friends", count: friends.length },
    {
      id: "messages",
      label: "Messages",
      count: conversations.length,
      unread: totalUnread,
    },
    { id: "incoming", label: "Incoming", count: incoming.length },
    { id: "outgoing", label: "Outgoing", count: outgoing.length },
  ];

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
            Grow your little community
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-cozy-dark sm:text-4xl">
            Friends
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-cozy-brown/60">
            Find other players, send friend requests, and keep in touch with
            your little community.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            activeTab === "messages" ? refreshCurrentChat() : loadFriendsData()
          }
          disabled={loading || conversationsLoading || messagesLoading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-cozy-brown/10 bg-cozy-paper px-4 py-2.5 text-xs font-bold text-cozy-brown/70 transition hover:bg-white disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              loading || conversationsLoading || messagesLoading
                ? "animate-spin"
                : ""
            }
          />
          Refresh
        </button>
      </div>

      {/* Find friends */}
      <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-cozy-sage/20 bg-cozy-paper shadow-sm">
        <div className="flex items-center gap-3 border-b border-cozy-brown/10 p-5 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cozy-sage/15 text-cozy-sage-dark">
            <UserPlus size={21} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-cozy-dark">
              Find a friend
            </h2>
            <p className="mt-1 text-xs text-cozy-brown/50">
              Enter someone's Friend Code to find them.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-cozy-brown/35"
              />
              <input
                type="text"
                value={searchCode}
                onChange={(event) => {
                  setSearchCode(event.target.value.toUpperCase());
                  setError("");
                  setSuccess("");
                  setSearchResult(null);
                }}
                placeholder="Enter Friend Code (LA-XXXXXXXXXX)"
                maxLength={13}
                className="w-full rounded-xl border border-cozy-brown/15 bg-cozy-cream/50 py-3 pl-11 pr-4 font-mono text-sm text-cozy-dark outline-none transition placeholder:font-sans placeholder:text-xs placeholder:text-cozy-brown/35 focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/15"
              />
            </div>

            <button
              type="submit"
              disabled={searching || !searchCode.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-6 py-3 text-sm font-bold text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search
                </>
              )}
            </button>
          </form>

          {searchResult?.player && (
            <div className="mt-5 rounded-2xl border border-cozy-sage/20 bg-cozy-sage/5 p-4">
              <PlayerCard player={searchResult.player}>
                {searchResult.relationship?.status === "accepted" ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-cozy-sage/15 px-4 py-2.5 text-xs font-bold text-cozy-sage-dark">
                    <CheckCircle2 size={15} />
                    Already friends
                  </span>
                ) : searchResult.relationship?.status === "pending" ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-cozy-cream px-4 py-2.5 text-xs font-bold text-cozy-brown/60">
                    <Clock size={15} />
                    {searchResult.relationship.direction === "outgoing"
                      ? "Request sent"
                      : "Request received"}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cozy-dark disabled:opacity-50"
                  >
                    <Send size={14} />
                    {sending ? "Sending..." : "Add Friend"}
                  </button>
                )}
              </PlayerCard>
            </div>
          )}
        </div>
      </section>

      {(error || success) && (
        <div
          role={error ? "alert" : "status"}
          className={`mb-6 flex items-start gap-2 rounded-xl px-4 py-3 text-xs ${
            error
              ? "bg-cozy-rose/10 text-cozy-rose"
              : "bg-cozy-sage/15 font-semibold text-cozy-sage-dark"
          }`}
        >
          {error ? (
            <X size={15} className="mt-0.5 shrink-0" />
          ) : (
            <Check size={15} className="mt-0.5 shrink-0" />
          )}
          <span>{error || success}</span>
        </div>
      )}

      {/* Community */}
      <section className="overflow-hidden rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper shadow-sm">
        <div className="border-b border-cozy-brown/10 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-rose/10 text-cozy-rose">
              <Users size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-cozy-dark">
                Your community
              </h2>
              <p className="mt-1 text-xs text-cozy-brown/50">
                Friends, conversations, and pending connections.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-cozy-sage-dark text-white shadow-sm"
                    : "bg-cozy-cream text-cozy-brown/60 hover:bg-cozy-sage/10"
                }`}
              >
                {tab.id === "messages" && <MessageCircle size={14} />}
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-white text-cozy-brown/60"
                  }`}
                >
                  {tab.count}
                </span>
                {tab.id === "messages" && tab.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cozy-rose px-1.5 text-[9px] font-bold text-white">
                    {tab.unread > 99 ? "99+" : tab.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          {activeTab !== "messages" && loading ? (
            <div className="flex justify-center py-12">
              <span className="h-9 w-9 animate-spin rounded-full border-4 border-cozy-sage/30 border-t-cozy-sage-dark" />
            </div>
          ) : activeTab === "messages" ? (
            <div className="overflow-hidden rounded-2xl border border-cozy-brown/10 bg-white/60">
              {messageError && (
                <div
                  role="alert"
                  className="m-3 rounded-xl bg-cozy-rose/10 p-3 text-xs text-cozy-rose"
                >
                  {messageError}
                </div>
              )}

              {/* Fixed-height messaging workspace.
                  min-h-0 is important so inner panels can scroll instead of expanding the page. */}
              <div className="grid h-[min(680px,75vh)] min-h-[480px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
                {/* Conversation list */}
                <div
                  className={`flex min-h-0 flex-col border-cozy-brown/10 md:border-r ${
                    selectedConversation ? "hidden md:flex" : "flex"
                  }`}
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-cozy-brown/10 p-4">
                    <div>
                      <h3 className="font-serif font-bold text-cozy-dark">
                        Your Messages
                      </h3>
                      <p className="mt-1 text-[10px] text-cozy-brown/50">
                        Conversations with your friends
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadConversations}
                      disabled={conversationsLoading}
                      className="rounded-lg p-2 text-cozy-brown/50 transition hover:bg-cozy-sage/10 hover:text-cozy-sage-dark"
                      title="Refresh conversations"
                    >
                      <RefreshCw
                        size={15}
                        className={conversationsLoading ? "animate-spin" : ""}
                      />
                    </button>
                  </div>

                  {/* Only this list scrolls */}
                  <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">
                    {conversationsLoading && conversations.length === 0 ? (
                      <div className="flex justify-center py-10">
                        <span className="h-7 w-7 animate-spin rounded-full border-4 border-cozy-sage/30 border-t-cozy-sage-dark" />
                      </div>
                    ) : conversations.length ? (
                      conversations.map((conversation) => {
                        const conversationId = String(
                          conversation.conversation_id
                        );
                        const unreadCount = unreadCounts[conversationId] || 0;

                        return (
                          <button
                            key={conversation.conversation_id}
                            type="button"
                            onClick={() => openConversation(conversation)}
                            className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                              String(selectedConversation?.conversation_id) ===
                              conversationId
                                ? "bg-cozy-sage/15"
                                : "hover:bg-cozy-cream"
                            }`}
                          >
                            <Avatar
                              avatarPath={conversation.friend_avatar_path}
                              username={conversation.friend_username}
                              size="h-11 w-11"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-cozy-dark">
                                {conversation.friend_display_name ||
                                  conversation.friend_username}
                              </p>
                              <p className="mt-1 truncate text-[10px] text-cozy-brown/50">
                                {getMessagePreview(conversation)}
                              </p>
                            </div>
                            {unreadCount > 0 && (
                              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cozy-rose px-1.5 text-[9px] font-bold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <EmptyState
                        icon={MessageCircle}
                        title="No conversations yet"
                        description="Visit My Friends and press Message to start chatting with a friend."
                      />
                    )}
                  </div>
                </div>

                {/* Chat window */}
                <div
                  className={`min-h-0 min-w-0 flex-col ${
                    selectedConversation ? "flex" : "hidden md:flex"
                  }`}
                >
                  {selectedConversation ? (
                    <>
                      {/* Fixed chat header */}
                      <div className="flex shrink-0 items-center gap-3 border-b border-cozy-brown/10 p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedConversation(null);
                            setMessages([]);
                            setMessageError("");
                          }}
                          className="rounded-lg p-2 text-cozy-brown/50 hover:bg-cozy-cream md:hidden"
                          aria-label="Back to conversations"
                        >
                          <ArrowLeft size={18} />
                        </button>
                        <Avatar
                          avatarPath={selectedConversation.friend_avatar_path}
                          username={selectedConversation.friend_username}
                          size="h-10 w-10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-cozy-dark">
                            {selectedConversation.friend_display_name ||
                              selectedConversation.friend_username}
                          </p>
                          <p className="flex items-center gap-1.5 text-[10px] text-cozy-brown/50">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                socketConnected
                                  ? "bg-cozy-sage-dark"
                                  : "bg-cozy-brown/30"
                              }`}
                            />
                            {socketConnected ? "Connected" : "Connecting..."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={refreshCurrentChat}
                          disabled={messagesLoading}
                          className="rounded-lg p-2 text-cozy-brown/50 transition hover:bg-cozy-sage/10 hover:text-cozy-sage-dark"
                          title="Refresh chat"
                        >
                          <RefreshCw
                            size={15}
                            className={messagesLoading ? "animate-spin" : ""}
                          />
                        </button>
                      </div>

                      {/* Independently scrollable message history */}
                      <div
                        ref={messagesContainerRef}
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-cozy-cream/30 p-4"
                      >
                        <div className="flex min-h-full flex-col gap-3">
                          {messagesLoading && messages.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center">
                              <span className="h-7 w-7 animate-spin rounded-full border-4 border-cozy-sage/30 border-t-cozy-sage-dark" />
                            </div>
                          ) : messages.length ? (
                            messages.map((message) => {
                              const isMine =
                                currentUserId != null &&
                                String(message.sender_id) ===
                                  String(currentUserId);

                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    isMine ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                                      isMine
                                        ? "rounded-br-md bg-cozy-sage-dark text-white"
                                        : "rounded-bl-md border border-cozy-brown/10 bg-white text-cozy-dark"
                                    }`}
                                  >
                                    {message.is_deleted ? (
                                      <p className="text-xs italic opacity-70">
                                        This message was deleted.
                                      </p>
                                    ) : (
                                      <p className="whitespace-pre-wrap break-words text-sm leading-5">
                                        {message.content}
                                      </p>
                                    )}
                                    <div className="mt-2 flex items-center justify-end gap-1">
                                      {message.is_edited && (
                                        <span className="text-[9px] opacity-60">
                                          Edited
                                        </span>
                                      )}
                                      <span className="text-[9px] opacity-60">
                                        {new Date(
                                          message.created_at
                                        ).toLocaleTimeString([], {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                              <MessageCircle
                                size={35}
                                className="text-cozy-sage/50"
                              />
                              <p className="mt-3 font-serif font-bold text-cozy-dark">
                                Say hello!
                              </p>
                              <p className="mt-1 text-xs text-cozy-brown/50">
                                Start your conversation with a little message.
                              </p>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      {/* Fixed composer */}
                      <form
                        onSubmit={handleSendMessage}
                        className="flex shrink-0 items-end gap-2 border-t border-cozy-brown/10 bg-white p-3"
                      >
                        <textarea
                          value={messageContent}
                          onChange={(event) =>
                            setMessageContent(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" &&
                              !event.shiftKey &&
                              !event.nativeEvent.isComposing
                            ) {
                              event.preventDefault();
                              event.currentTarget.form?.requestSubmit();
                            }
                          }}
                          placeholder="Write a message..."
                          maxLength={5000}
                          rows={1}
                          className="max-h-28 min-h-11 flex-1 resize-y rounded-xl border border-cozy-brown/15 bg-cozy-cream/50 px-4 py-3 text-sm text-cozy-dark outline-none transition placeholder:text-cozy-brown/40 focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/10"
                        />
                        <button
                          type="submit"
                          disabled={!messageContent.trim() || sendingMessage}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cozy-sage-dark text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Send message"
                        >
                          {sendingMessage ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Send size={17} />
                          )}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="hidden flex-1 flex-col items-center justify-center p-8 text-center md:flex">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cozy-sage/10 text-cozy-sage-dark">
                        <MessageSquare size={28} />
                      </div>
                      <h3 className="mt-4 font-serif text-xl font-bold text-cozy-dark">
                        Your little conversations
                      </h3>
                      <p className="mt-2 max-w-xs text-xs leading-5 text-cozy-brown/55">
                        Select a conversation or start chatting with one of your
                        friends.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "friends" ? (
            friends.length ? (
              friends.map((friend) => (
                <PlayerCard key={friend.id} player={friend}>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openFriendDetails(friend, "profile")}
                      className="inline-flex items-center gap-2 rounded-xl bg-cozy-sage-dark px-3 py-2.5 text-xs font-bold text-white transition hover:bg-cozy-dark"
                    >
                      <UserRound size={14} />
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => openFriendDetails(friend, "houses")}
                      className="inline-flex items-center gap-2 rounded-xl border border-cozy-sage/30 bg-cozy-sage/10 px-3 py-2.5 text-xs font-bold text-cozy-sage-dark transition hover:bg-cozy-sage/20"
                    >
                      <Home size={14} />
                      Houses
                    </button>
                    <button
                      type="button"
                      onClick={() => startConversation(friend)}
                      disabled={creatingConversation}
                      className="inline-flex items-center gap-2 rounded-xl bg-cozy-rose px-3 py-2.5 text-xs font-bold text-white transition hover:bg-cozy-rose/80 disabled:opacity-50"
                    >
                      <MessageCircle size={14} />
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnfriend(friend)}
                      disabled={unfriending}
                      title="Remove friend"
                      className="inline-flex items-center justify-center rounded-xl border border-cozy-rose/20 px-3 py-2.5 text-cozy-rose transition hover:bg-cozy-rose/10 disabled:opacity-50"
                    >
                      <UserMinus size={15} />
                    </button>
                  </div>
                </PlayerCard>
              ))
            ) : (
              <EmptyState
                icon={Users}
                title="Your world is waiting"
                description="You haven't added any friends yet. Search for a player using their Friend Code to get started."
              />
            )
          ) : activeTab === "incoming" ? (
            incoming.length ? (
              incoming.map((request) => (
                <PlayerCard key={request.id} player={request}>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRequestAction(request.id, "accept")}
                      disabled={busyId === request.id}
                      title="Accept request"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-cozy-sage-dark px-3 py-2.5 text-xs font-bold text-white transition hover:bg-cozy-dark disabled:opacity-50"
                    >
                      <Check size={15} />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestAction(request.id, "decline")}
                      disabled={busyId === request.id}
                      title="Decline request"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cozy-rose/20 px-3 py-2.5 text-xs font-bold text-cozy-rose transition hover:bg-cozy-rose/10 disabled:opacity-50"
                    >
                      <X size={15} />
                      Decline
                    </button>
                  </div>
                </PlayerCard>
              ))
            ) : (
              <EmptyState
                icon={UserPlus}
                title="No incoming requests"
                description="When someone sends you a friend request, it'll appear here."
              />
            )
          ) : outgoing.length ? (
            outgoing.map((request) => (
              <PlayerCard key={request.id} player={request}>
                <button
                  type="button"
                  onClick={() => handleRequestAction(request.id, "cancel")}
                  disabled={busyId === request.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cozy-brown/15 px-4 py-2.5 text-xs font-bold text-cozy-brown/60 transition hover:border-cozy-rose/30 hover:bg-cozy-rose/10 hover:text-cozy-rose disabled:opacity-50"
                >
                  <UserMinus size={15} />
                  Cancel
                </button>
              </PlayerCard>
            ))
          ) : (
            <EmptyState
              icon={Clock}
              title="No outgoing requests"
              description="Friend requests you send will show up here while waiting for a response."
            />
          )}
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cozy-sage/15 bg-cozy-sage/5 p-4">
        <Sprout size={19} className="mt-0.5 shrink-0 text-cozy-sage-dark" />
        <p className="text-xs leading-5 text-cozy-brown/60">
          Friendships grow one little step at a time. You can find players by
          sharing your Friend Code from your profile.
        </p>
      </div>

      {/* Friend details modal */}
      {selectedFriend && (
        <Modal onClose={closeFriendDetails}>
          <div className="flex items-center justify-between border-b border-cozy-brown/10 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cozy-sage-dark">
                Your community
              </p>
              <h2 className="mt-1 font-serif text-xl font-bold text-cozy-dark">
                {selectedFriend.username}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeFriendDetails}
              className="rounded-xl p-2 text-cozy-brown/50 transition hover:bg-cozy-rose/10 hover:text-cozy-rose"
              aria-label="Close friend details"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-2 border-b border-cozy-brown/10 px-5 pt-4 sm:px-6">
            <button
              type="button"
              onClick={() => setDetailsTab("profile")}
              className={`rounded-t-xl px-4 py-2.5 text-xs font-bold transition ${
                detailsTab === "profile"
                  ? "bg-cozy-sage-dark text-white"
                  : "bg-cozy-cream text-cozy-brown/60 hover:bg-cozy-sage/10"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <UserRound size={14} />
                Profile
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDetailsTab("houses")}
              className={`rounded-t-xl px-4 py-2.5 text-xs font-bold transition ${
                detailsTab === "houses"
                  ? "bg-cozy-sage-dark text-white"
                  : "bg-cozy-cream text-cozy-brown/60 hover:bg-cozy-sage/10"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Home size={14} />
                Houses
              </span>
            </button>
          </div>

          <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5 sm:p-6">
            {detailsLoading ? (
              <div className="flex flex-col items-center py-12">
                <span className="h-9 w-9 animate-spin rounded-full border-4 border-cozy-sage/30 border-t-cozy-sage-dark" />
                <p className="mt-3 text-xs text-cozy-brown/50">
                  Loading friend details...
                </p>
              </div>
            ) : detailsError ? (
              <div className="rounded-xl bg-cozy-rose/10 p-4 text-xs text-cozy-rose">
                {detailsError}
              </div>
            ) : detailsTab === "profile" ? (
              friendProfile ? (
                <>
                  <div className="flex flex-col items-center rounded-2xl bg-cozy-sage/5 p-6 text-center">
                    <Avatar
                      avatarPath={friendProfile.avatar_path}
                      username={friendProfile.username}
                      size="h-24 w-24"
                    />
                    <h3 className="mt-4 font-serif text-xl font-bold text-cozy-dark">
                      {friendProfile.display_name || friendProfile.username}
                    </h3>
                    <p className="mt-1 text-xs text-cozy-brown/55">
                      @{friendProfile.username}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-cozy-sage/15 px-3 py-1.5 text-[10px] font-bold text-cozy-sage-dark">
                      <CheckCircle2 size={12} />
                      Friend
                    </span>
                  </div>

                  <div className="rounded-2xl border border-cozy-brown/10 bg-white/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                      About
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-cozy-brown/75">
                      {friendProfile.bio ||
                        "This player hasn't written a bio yet."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cozy-brown/10 bg-white/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                      Friend Code
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="break-all font-mono text-sm font-bold text-cozy-dark">
                        {friendProfile.friend_code}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyCode(friendProfile.friend_code)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cozy-sage/10 px-3 py-2 text-xs font-bold text-cozy-sage-dark transition hover:bg-cozy-sage/20"
                      >
                        <Copy size={13} />
                        Copy
                      </button>
                    </div>
                  </div>

                  {friendProfile.created_at && (
                    <div className="flex items-center gap-2 text-xs text-cozy-brown/50">
                      <CalendarDays size={14} />
                      Player since{" "}
                      {new Date(friendProfile.created_at).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long" }
                      )}
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={UserRound}
                  title="Profile unavailable"
                  description="We couldn't find this friend's profile."
                />
              )
            ) : friendHouses.length ? (
              <>
                <div className="mb-2">
                  <h3 className="font-serif text-lg font-bold text-cozy-dark">
                    {friendProfile?.username || selectedFriend.username}'s
                    Houses
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-cozy-brown/55">
                    These are the active houses you're allowed to see.
                  </p>
                </div>

                {friendHouses.map((house) => (
                  <HouseCard key={house.id} house={house} />
                ))}

                <p className="rounded-xl bg-cozy-sage/5 p-3 text-[10px] leading-5 text-cozy-brown/55">
                  <Eye size={12} className="mr-1 inline" />
                  You can browse these house details. Entering a house will be
                  available when the game world is implemented.
                </p>
              </>
            ) : (
              <EmptyState
                icon={Home}
                title="No houses to show"
                description="This friend has no active houses available for you to view. Private houses only appear when you already have access."
              />
            )}
          </div>

          <div className="flex justify-end border-t border-cozy-brown/10 p-5 sm:px-6">
            <button
              type="button"
              onClick={closeFriendDetails}
              className="rounded-xl bg-cozy-sage-dark px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cozy-dark"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
