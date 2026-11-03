import {
  House,
  Sparkles,
  Users,
  Plus,
  DoorOpen,
  ArrowUpRight,
  Leaf,
  Sun,
  Cloud,
  LockKeyhole,
  Globe,
  X,
  Check,
  Trees,
  Waves,
  Flower2,
  Copy,
  RefreshCw,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API_URL } from "../context/AuthContext";

const themes = [
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    description: "A warm little countryside home.",
    icon: House,
    color: "bg-[#e9d6b8]",
    accent: "text-[#9b6548]",
    preview: "🏡",
  },
  {
    id: "japanese-home",
    name: "Japanese Home",
    description: "A peaceful home inspired by Japan.",
    icon: Flower2,
    color: "bg-[#ead5d0]",
    accent: "text-[#b77c68]",
    preview: "🏯",
  },
  {
    id: "forest-retreat",
    name: "Forest Retreat",
    description: "A quiet hideaway surrounded by nature.",
    icon: Trees,
    color: "bg-[#dce7cf]",
    accent: "text-[#718568]",
    preview: "🌲",
  },
  {
    id: "seaside-home",
    name: "Seaside Home",
    description: "A breezy little home by the sea.",
    icon: Waves,
    color: "bg-[#d5e7e8]",
    accent: "text-[#628f9a]",
    preview: "🏖️",
  },
];

function getAvatarUrl(avatarPath) {
  if (!avatarPath || avatarPath.startsWith("preset:")) return null;

  if (/^https?:\/\//i.test(avatarPath)) {
    return avatarPath;
  }

  const cleanPath = avatarPath.replace(/^\/?uploads\//, "").replace(/^\/+/, "");

  return `${API_URL}/uploads/${cleanPath}`;
}

function CreateHouseModal({ onClose, accessToken, onCreated }) {
  const [houseName, setHouseName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("cozy-cottage");
  const [visibility, setVisibility] = useState("private");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedThemeData = themes.find((theme) => theme.id === selectedTheme);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = houseName.trim();

    if (!trimmedName) {
      setMessage("Please give your house a name first.");
      return;
    }

    if (trimmedName.length > 40) {
      setMessage("House name cannot exceed 40 characters.");
      return;
    }

    if (!accessToken) {
      setMessage("Your session has expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/houses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName,
          theme: selectedTheme,
          visibility,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create your house.");
      }

      onCreated(data.house);
      onClose();
    } catch (error) {
      console.error("Create house request failed:", error);
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-cozy-dark/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-house-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cozy-brown/10 bg-cozy-paper shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-cozy-sage-dark px-6 py-7 text-white sm:px-8">
          <div className="absolute -right-5 -top-10 opacity-10">
            <House size={150} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="absolute right-5 top-5 rounded-xl p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-40"
          >
            <X size={20} />
          </button>

          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <House size={25} />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
              A new beginning
            </p>
            <h2
              id="create-house-title"
              className="mt-2 font-serif text-3xl font-bold"
            >
              Create your house
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
              Every little world starts somewhere. Give yours a name and make it
              feel like home.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-8">
          <div>
            <label
              htmlFor="houseName"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-cozy-brown/70"
            >
              House name
            </label>

            <input
              id="houseName"
              type="text"
              maxLength={40}
              value={houseName}
              disabled={submitting}
              onChange={(event) => {
                setHouseName(event.target.value);
                setMessage("");
              }}
              placeholder="e.g. Little Fern Cottage"
              className="w-full rounded-xl border border-cozy-brown/15 bg-cozy-cream/60 px-4 py-3.5 text-sm text-cozy-dark outline-none transition placeholder:text-cozy-brown/35 focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/15 disabled:opacity-60"
            />

            <p className="mt-2 text-right text-[10px] text-cozy-brown/45">
              {houseName.length}/40 characters
            </p>
          </div>

          <div>
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-cozy-brown/70">
                Choose your house theme
              </p>
              <p className="mt-1 text-xs text-cozy-brown/50">
                You can choose the atmosphere of your little world.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {themes.map((theme) => {
                const isSelected = selectedTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={submitting}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                      isSelected
                        ? "border-cozy-sage-dark bg-cozy-sage/10 ring-2 ring-cozy-sage/20"
                        : "border-cozy-brown/10 bg-white hover:border-cozy-sage/50 hover:bg-cozy-cream/50"
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${theme.color} ${theme.accent}`}
                    >
                      <span className="text-2xl">{theme.preview}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-cozy-dark">
                        {theme.name}
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-cozy-brown/55">
                        {theme.description}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cozy-sage-dark text-white">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cozy-brown/70">
              House visibility
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setVisibility("public")}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                  visibility === "public"
                    ? "border-cozy-sage-dark bg-cozy-sage/10 ring-2 ring-cozy-sage/20"
                    : "border-cozy-brown/10 hover:bg-cozy-cream/50"
                }`}
              >
                <Globe
                  size={20}
                  className="mt-0.5 shrink-0 text-cozy-sage-dark"
                />
                <div>
                  <p className="text-sm font-bold text-cozy-dark">Public</p>
                  <p className="mt-1 text-[11px] leading-5 text-cozy-brown/55">
                    Other players can discover your house.
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setVisibility("private")}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-60 ${
                  visibility === "private"
                    ? "border-cozy-sage-dark bg-cozy-sage/10 ring-2 ring-cozy-sage/20"
                    : "border-cozy-brown/10 hover:bg-cozy-cream/50"
                }`}
              >
                <LockKeyhole
                  size={20}
                  className="mt-0.5 shrink-0 text-cozy-sage-dark"
                />
                <div>
                  <p className="text-sm font-bold text-cozy-dark">Private</p>
                  <p className="mt-1 text-[11px] leading-5 text-cozy-brown/55">
                    Only invited players can enter.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-cozy-cream p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/50">
              Your house preview
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl ${selectedThemeData.color}`}
              >
                {selectedThemeData.preview}
              </div>

              <div className="min-w-0">
                <p className="truncate font-serif text-lg font-bold text-cozy-dark">
                  {houseName.trim() || "Your Little Home"}
                </p>
                <p className="mt-1 text-xs text-cozy-brown/60">
                  {selectedThemeData.name} ·{" "}
                  {visibility === "public" ? "Public" : "Private"}
                </p>
              </div>
            </div>
          </div>

          {message && (
            <p
              role="alert"
              className="rounded-xl bg-cozy-rose/10 px-4 py-3 text-xs leading-5 text-cozy-rose"
            >
              {message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-cozy-brown/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-cozy-brown/15 px-5 py-3 text-sm font-bold text-cozy-brown transition hover:bg-cozy-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-6 py-3 text-sm font-bold text-white shadow-md shadow-cozy-sage-dark/15 transition hover:-translate-y-0.5 hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Create House
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PixelHouse() {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#dce7cf] sm:h-80">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[12%] top-12 text-[#8da77b]">
          <Cloud size={48} />
        </div>
        <div className="absolute right-[14%] top-20 text-[#8da77b]">
          <Cloud size={34} />
        </div>
        <div className="absolute bottom-0 h-20 w-full bg-[#a6bb8c]" />
        <div className="absolute bottom-12 left-0 h-8 w-full bg-[#b8c99e]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-[-5px] flex items-end">
          <div className="h-0 w-0 border-b-[65px] border-l-[85px] border-r-[85px] border-b-[#9b6548] border-l-transparent border-r-transparent sm:border-b-[85px] sm:border-l-[110px] sm:border-r-[110px]" />
        </div>

        <div className="relative flex h-28 w-44 items-end justify-center border-[6px] border-[#76513d] bg-[#f5dfb5] shadow-lg sm:h-36 sm:w-56">
          <div className="absolute left-4 top-5 h-9 w-9 border-4 border-[#76513d] bg-[#9fc4bd] sm:h-12 sm:w-12" />
          <div className="absolute right-4 top-5 h-9 w-9 border-4 border-[#76513d] bg-[#9fc4bd] sm:h-12 sm:w-12" />
          <div className="h-16 w-12 border-[5px] border-[#76513d] bg-[#a96e4e] sm:h-20 sm:w-14">
            <div className="ml-auto mt-8 h-2 w-2 bg-[#f3d38d]" />
          </div>
        </div>

        <div className="mt-[-2px] h-3 w-64 rounded-full bg-[#718c61]/50 blur-sm" />
      </div>

      <div className="absolute bottom-5 left-5 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cozy-dark backdrop-blur">
        <Sparkles size={12} className="mr-1 inline" />
        Your little home
      </div>
    </div>
  );
}

function HouseDetails({ house, onCopy }) {
  const theme = themes.find((item) => item.id === house.theme);

  return (
    <div className="rounded-2xl border border-cozy-brown/10 bg-white/70 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
              theme?.color || "bg-cozy-cream"
            }`}
          >
            {theme?.preview || "🏡"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg font-bold text-cozy-dark">
              {house.name}
            </h3>
            <p className="mt-1 text-xs text-cozy-brown/60">
              {theme?.name || "Cozy Home"} ·{" "}
              {house.visibility === "public" ? "Public" : "Private"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full bg-cozy-sage/20 px-3 py-1 text-[10px] font-bold capitalize text-cozy-sage-dark">
            {house.role}
          </span>
          <span className="rounded-full bg-cozy-cream px-3 py-1 text-[10px] font-bold text-cozy-brown/70">
            {house.member_count || 1}/12 members
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-cozy-cream px-4 py-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-cozy-brown/50">
            House code
          </p>
          <p className="mt-1 font-mono text-sm font-bold tracking-[0.15em] text-cozy-dark">
            {house.house_code}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(house.house_code)}
          title="Copy house code"
          className="rounded-lg p-2 text-cozy-sage-dark transition hover:bg-cozy-sage/20"
        >
          <Copy size={16} />
        </button>
      </div>

      <p className="mt-3 text-[11px] text-cozy-brown/50">
        Owner: {house.owner_username || "Unknown"}
      </p>
    </div>
  );
}

function FriendPreview({ friend }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = getAvatarUrl(friend.avatar_path);
  const displayName = friend.display_name || friend.username || "Friend";

  useEffect(() => {
    setAvatarFailed(false);
  }, [friend.avatar_path]);

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-cozy-brown/10 bg-white/60 p-3">
      {avatarUrl && !avatarFailed ? (
        <img
          src={avatarUrl}
          alt={`${displayName}'s avatar`}
          onError={() => setAvatarFailed(true)}
          className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-cozy-sage text-sm font-bold text-white shadow-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-cozy-dark">
          {displayName}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-cozy-brown/50">
          @{friend.username || "friend"}
        </p>
      </div>

      <span className="h-2 w-2 shrink-0 rounded-full bg-cozy-sage-dark" />
    </div>
  );
}

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [createHouseOpen, setCreateHouseOpen] = useState(false);

  const [houses, setHouses] = useState([]);
  const [housesLoading, setHousesLoading] = useState(true);
  const [housesError, setHousesError] = useState("");

  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState("");

  // Load the user's houses.
  useEffect(() => {
    if (!accessToken) {
      setHouses([]);
      setHousesLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchMyHouses() {
      setHousesLoading(true);
      setHousesError("");

      try {
        const response = await fetch(`${API_URL}/api/houses/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your houses.");
        }

        setHouses(Array.isArray(data.houses) ? data.houses : []);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Fetch houses failed:", error);
        setHousesError(error.message || "Unable to load your houses.");
      } finally {
        if (!controller.signal.aborted) {
          setHousesLoading(false);
        }
      }
    }

    fetchMyHouses();

    return () => controller.abort();
  }, [accessToken]);

  // Load the user's accepted friends.
  useEffect(() => {
    if (!accessToken) {
      setFriends([]);
      setFriendsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchMyFriends() {
      setFriendsLoading(true);
      setFriendsError("");

      try {
        const response = await fetch(`${API_URL}/api/friends/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your friends.");
        }

        setFriends(Array.isArray(data.friends) ? data.friends : []);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Fetch friends failed:", error);
        setFriendsError(error.message || "Unable to load your friends.");
      } finally {
        if (!controller.signal.aborted) {
          setFriendsLoading(false);
        }
      }
    }

    fetchMyFriends();

    return () => controller.abort();
  }, [accessToken]);

  function handleHouseCreated(createdHouse) {
    setHouses((currentHouses) => [
      createdHouse,
      ...currentHouses.filter((house) => house.id !== createdHouse.id),
    ]);
  }

  async function copyHouseCode(code) {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Unable to copy house code:", error);
    }
  }

  const username = user?.username || "friend";
  const primaryHouse = houses[0] || null;

  const primaryHouseTheme = themes.find(
    (theme) => theme.id === primaryHouse?.theme
  );

  const friendPreview = friends.slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-cozy-sage-dark px-7 py-9 text-white shadow-lg shadow-cozy-sage-dark/10 sm:px-10 sm:py-12">
          <div className="absolute -right-8 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="absolute -bottom-20 right-40 h-52 w-52 rounded-full bg-white/5" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
              <Sun size={13} />A fresh little day
            </div>

            <h1 className="mt-5 font-serif text-3xl font-bold leading-tight sm:text-5xl">
              Welcome home,
              <br />
              {username}!
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
              Your cozy corner of the world is waiting. Take a breath, settle
              in, and start creating little memories.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCreateHouseOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-cozy-paper px-5 py-3 text-sm font-bold text-cozy-dark transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Plus size={17} />
                {houses.length > 0 ? "Create Another House" : "Create a House"}
              </button>

              <button
                type="button"
                disabled
                title="Joining houses coming soon"
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white/70"
              >
                <DoorOpen size={17} />
                Join a House
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-8 hidden text-white/10 md:block">
            <House size={190} strokeWidth={0.8} />
          </div>
        </section>

        <div className="grid gap-7 xl:grid-cols-[1.6fr_1fr]">
          <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                  Your space
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold">
                  My Little House
                </h2>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                  houses.length > 0
                    ? "bg-cozy-sage/20 text-cozy-sage-dark"
                    : "bg-cozy-brown/10 text-cozy-brown/60"
                }`}
              >
                {housesLoading
                  ? "Loading..."
                  : `${houses.length} ${
                      houses.length === 1 ? "House" : "Houses"
                    }`}
              </span>
            </div>

            <div className="rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-4 shadow-sm sm:p-5">
              <PixelHouse />

              {housesLoading ? (
                <div className="flex items-center justify-center gap-3 px-4 py-10 text-sm text-cozy-brown/60">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-cozy-sage/30 border-t-cozy-sage-dark" />
                  Loading your little worlds...
                </div>
              ) : housesError ? (
                <div className="mt-5 rounded-xl bg-cozy-rose/10 p-4">
                  <p className="text-sm font-semibold text-cozy-rose">
                    Couldn't load your houses.
                  </p>
                  <p className="mt-1 text-xs text-cozy-brown/70">
                    {housesError}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cozy-sage-dark hover:underline"
                  >
                    <RefreshCw size={13} />
                    Refresh page
                  </button>
                </div>
              ) : primaryHouse ? (
                <>
                  <div className="flex flex-col justify-between gap-4 px-1 pb-1 pt-5 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <h3 className="break-words font-serif text-xl font-bold">
                        {primaryHouse.name}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-cozy-brown/60">
                        {primaryHouseTheme?.name || "Cozy Home"} ·{" "}
                        {primaryHouse.visibility === "public"
                          ? "Public"
                          : "Private"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-cozy-cream px-4 py-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-cozy-brown/50">
                          House code
                        </p>
                        <p className="font-mono text-sm font-bold tracking-[0.15em] text-cozy-dark">
                          {primaryHouse.house_code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyHouseCode(primaryHouse.house_code)}
                        title="Copy house code"
                        className="rounded-lg p-2 text-cozy-sage-dark transition hover:bg-cozy-sage/20"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-cozy-brown/10 pt-4">
                    <div className="rounded-xl bg-cozy-cream/70 p-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-cozy-brown/50">
                        Members
                      </p>
                      <p className="mt-1 text-sm font-bold text-cozy-dark">
                        {primaryHouse.member_count || 1} / 12
                      </p>
                    </div>
                    <div className="rounded-xl bg-cozy-cream/70 p-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-cozy-brown/50">
                        Your role
                      </p>
                      <p className="mt-1 text-sm font-bold capitalize text-cozy-dark">
                        {primaryHouse.role || "Owner"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cozy-sage/15 text-cozy-sage-dark">
                    <House size={26} />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold">
                    A place to call yours
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-cozy-brown/60">
                    Your home, your style, your own little world. Create your
                    first house and make it yours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateHouseOpen(true)}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-cozy-sage/20 px-5 py-3 text-xs font-bold text-cozy-sage-dark transition hover:bg-cozy-sage/30"
                  >
                    Set up my house
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {houses.length > 1 && (
              <section className="mt-7">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                    Your collection
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold">
                    Your Other Houses
                  </h2>
                </div>

                <div className="space-y-3">
                  {houses.slice(1).map((house) => (
                    <HouseDetails
                      key={house.id}
                      house={house}
                      onCopy={copyHouseCode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Friends and shared worlds */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <section className="rounded-2xl border border-cozy-brown/10 bg-cozy-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-rose/10 text-cozy-rose">
                    <Users size={19} />
                  </div>

                  <span className="rounded-full bg-cozy-sage/15 px-3 py-1 text-[10px] font-bold text-cozy-sage-dark">
                    {friendsLoading
                      ? "Loading..."
                      : `${friends.length} ${
                          friends.length === 1 ? "Friend" : "Friends"
                        }`}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-lg font-bold text-cozy-dark">
                  Your friends
                </h3>
                <p className="mt-1 text-xs leading-5 text-cozy-brown/60">
                  Your favorite people are just a visit away.
                </p>

                {friendsLoading ? (
                  <div className="flex items-center gap-2 py-6 text-xs text-cozy-brown/50">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cozy-sage/30 border-t-cozy-sage-dark" />
                    Gathering your friends...
                  </div>
                ) : friendsError ? (
                  <div className="mt-4 rounded-xl bg-cozy-rose/10 p-3">
                    <p className="text-xs leading-5 text-cozy-rose">
                      Couldn't load your friends.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/friends")}
                      className="mt-2 text-[10px] font-bold text-cozy-sage-dark hover:underline"
                    >
                      Open Friends page
                    </button>
                  </div>
                ) : friends.length > 0 ? (
                  <>
                    <div className="mt-4 space-y-2">
                      {friendPreview.map((friend) => (
                        <FriendPreview key={friend.id} friend={friend} />
                      ))}
                    </div>

                    {friends.length > 4 && (
                      <p className="mt-3 text-center text-[10px] text-cozy-brown/50">
                        And {friends.length - 4} more{" "}
                        {friends.length - 4 === 1 ? "friend" : "friends"}...
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-4 rounded-xl bg-cozy-cream/70 px-4 py-6 text-center">
                    <UserRound
                      size={25}
                      className="mx-auto text-cozy-sage-dark/60"
                    />
                    <p className="mt-2 text-xs font-bold text-cozy-dark">
                      Your community starts here
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-cozy-brown/55">
                      Find players and make your first friends.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/friends")}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-4 py-3 text-xs font-bold text-white transition hover:bg-cozy-dark"
                >
                  <MessageCircle size={14} />
                  {friends.length > 0 ? "View All Friends" : "Find Friends"}
                  <ArrowUpRight size={14} />
                </button>
              </section>

              <section className="rounded-2xl border border-cozy-brown/10 bg-cozy-paper p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-sage/20 text-cozy-sage-dark">
                  <Globe size={19} />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-cozy-dark">
                  Shared worlds
                </h3>
                <p className="mt-1 text-xs leading-5 text-cozy-brown/60">
                  Visit other cozy homes and spend time together.
                </p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-cozy-sage-dark">
                  Coming soon
                </p>
              </section>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                    Little details
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold">
                    Your account
                  </h2>
                </div>
                <Sparkles size={22} className="text-cozy-rose" />
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                    Username
                  </p>
                  <p className="mt-1 text-sm font-semibold">{username}</p>
                </div>

                <div className="h-px bg-cozy-brown/10" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                    Email address
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-cozy-brown/75">
                    {user?.email || "Not available"}
                  </p>
                </div>

                <div className="h-px bg-cozy-brown/10" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                      Account status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-cozy-sage-dark">
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-cozy-sage-dark" />
                      Active
                    </p>
                  </div>
                  <LockKeyhole size={18} className="text-cozy-sage-dark" />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[1.75rem] bg-[#eee6d6] p-6">
              <div className="flex items-center gap-2 text-cozy-sage-dark">
                <Leaf size={18} />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  A cozy thought
                </p>
              </div>
              <p className="mt-4 font-serif text-xl font-bold leading-relaxed text-cozy-dark">
                "Home isn't a place. It's the little moments we make."
              </p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-cozy-brown/60">
                  Take your time.
                </span>
                <Sparkles size={20} className="text-cozy-rose" />
              </div>
            </section>
          </aside>
        </div>

        <footer className="mt-12 border-t border-cozy-brown/10 py-6 text-center">
          <p className="text-xs text-cozy-brown/45">
            Made with <span className="text-cozy-rose">♥</span> for little
            moments · Cozy Home
          </p>
        </footer>
      </div>

      {createHouseOpen && (
        <CreateHouseModal
          accessToken={accessToken}
          onCreated={handleHouseCreated}
          onClose={() => setCreateHouseOpen(false)}
        />
      )}
    </>
  );
}
