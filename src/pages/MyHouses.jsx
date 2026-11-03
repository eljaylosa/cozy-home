import {
  House,
  Copy,
  Check,
  LockKeyhole,
  Globe,
  Users,
  Crown,
  DoorOpen,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Pencil,
  Archive,
  RotateCcw,
  X,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API_URL } from "../context/AuthContext";

const themes = [
  {
    id: "cozy-cottage",
    name: "Cozy Cottage",
    description: "A warm little countryside home.",
    color: "bg-[#e9d6b8]",
    preview: "🏡",
  },
  {
    id: "japanese-home",
    name: "Japanese Home",
    description: "A peaceful home inspired by Japan.",
    color: "bg-[#ead5d0]",
    preview: "🏯",
  },
  {
    id: "forest-retreat",
    name: "Forest Retreat",
    description: "A quiet hideaway surrounded by nature.",
    color: "bg-[#dce7cf]",
    preview: "🌲",
  },
  {
    id: "seaside-home",
    name: "Seaside Home",
    description: "A breezy little home by the sea.",
    color: "bg-[#d5e7e8]",
    preview: "🏖️",
  },
];

async function apiRequest(url, accessToken, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function HouseEditor({ house, onClose, onSave, saving }) {
  const [name, setName] = useState(house.name || "");
  const [theme, setTheme] = useState(house.theme || "cozy-cottage");
  const [visibility, setVisibility] = useState(house.visibility || "private");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length > 40) {
      setError("House name must contain 1–40 characters.");
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        theme,
        visibility,
      });
    } catch (err) {
      setError(err.message || "Unable to update your house.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-cozy-dark/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="my-auto w-full max-w-lg overflow-hidden rounded-[1.75rem] bg-cozy-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-cozy-brown/10 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cozy-sage-dark">
              House settings
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-cozy-dark">
              Edit Your House
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cozy-cream text-cozy-brown transition hover:bg-cozy-sage/20 disabled:opacity-50"
            aria-label="Close editor"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="house-name"
              className="mb-2 block text-xs font-bold text-cozy-brown"
            >
              House name
            </label>
            <input
              id="house-name"
              type="text"
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Give your house a name..."
              className="w-full rounded-xl border border-cozy-brown/15 bg-white px-4 py-3 text-sm text-cozy-dark outline-none transition placeholder:text-cozy-brown/35 focus:border-cozy-sage-dark focus:ring-2 focus:ring-cozy-sage/20"
              required
            />
            <p className="mt-1.5 text-right text-[10px] text-cozy-brown/45">
              {name.length}/40 characters
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-cozy-brown">
              House theme
            </label>

            <div className="grid grid-cols-2 gap-3">
              {themes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    theme === item.id
                      ? "border-cozy-sage-dark bg-cozy-sage/10"
                      : "border-cozy-brown/10 bg-white hover:border-cozy-sage/50"
                  }`}
                >
                  <span
                    className={`flex h-12 items-center justify-center rounded-lg text-3xl ${item.color}`}
                  >
                    {item.preview}
                  </span>
                  <span className="mt-2 block text-xs font-bold text-cozy-dark">
                    {item.name}
                  </span>
                  {theme === item.id && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-cozy-sage-dark">
                      <Check size={12} />
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-cozy-brown">
              House visibility
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                  visibility === "private"
                    ? "border-cozy-sage-dark bg-cozy-sage/10"
                    : "border-cozy-brown/10 bg-white"
                }`}
              >
                <LockKeyhole
                  size={19}
                  className="shrink-0 text-cozy-sage-dark"
                />
                <span>
                  <span className="block text-xs font-bold text-cozy-dark">
                    Private
                  </span>
                  <span className="mt-1 block text-[10px] text-cozy-brown/50">
                    Invite code access
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                  visibility === "public"
                    ? "border-cozy-sage-dark bg-cozy-sage/10"
                    : "border-cozy-brown/10 bg-white"
                }`}
              >
                <Globe size={19} className="shrink-0 text-cozy-sage-dark" />
                <span>
                  <span className="block text-xs font-bold text-cozy-dark">
                    Public
                  </span>
                  <span className="mt-1 block text-[10px] text-cozy-brown/50">
                    Discoverable by others
                  </span>
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-cozy-rose/10 p-3 text-xs text-cozy-rose"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3 border-t border-cozy-brown/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-cozy-brown/15 px-4 py-3 text-sm font-bold text-cozy-brown transition hover:bg-cozy-cream disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-4 py-3 text-sm font-bold text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HouseCard({
  house,
  onCopy,
  copiedCode,
  onEdit,
  onArchive,
  onRestore,
  onEnter,
  busy,
  archived = false,
}) {
  const theme = themes.find((item) => item.id === house.theme);
  const isOwner = house.role?.toLowerCase() === "owner";

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div
        className={`relative flex h-36 items-center justify-center overflow-hidden ${
          theme?.color || "bg-cozy-cream"
        }`}
      >
        <div className="absolute -left-8 -top-10 h-36 w-36 rounded-full border-[18px] border-white/20" />
        <div className="absolute -bottom-12 -right-5 h-36 w-36 rounded-full border-[18px] border-white/20" />

        <span className="relative text-7xl drop-shadow-sm">
          {theme?.preview || "🏡"}
        </span>

        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm ${
            isOwner
              ? "bg-cozy-sage-dark text-white"
              : "bg-white/85 text-cozy-brown"
          }`}
        >
          {isOwner ? <Crown size={12} /> : <Users size={12} />}
          {isOwner ? "Owner" : "Member"}
        </span>

        <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-bold capitalize text-cozy-brown">
          {archived ? "Archived" : house.visibility || "private"}
        </span>
      </div>

      <div className="p-5">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl font-bold text-cozy-dark">
            {house.name || "Untitled House"}
          </h3>

          <p className="mt-1 text-xs text-cozy-brown/55">
            {theme?.name || "Cozy Home"}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-cozy-cream/80 p-3">
            <div className="flex items-center gap-2 text-cozy-brown/50">
              <Users size={14} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Members
              </span>
            </div>

            <p className="mt-2 text-sm font-bold text-cozy-dark">
              {house.member_count ?? 1} / 12
            </p>
          </div>

          <div className="rounded-xl bg-cozy-cream/80 p-3">
            <div className="flex items-center gap-2 text-cozy-brown/50">
              {house.visibility === "public" ? (
                <Globe size={14} />
              ) : (
                <LockKeyhole size={14} />
              )}

              <span className="text-[9px] font-bold uppercase tracking-wider">
                Visibility
              </span>
            </div>

            <p className="mt-2 text-sm font-bold capitalize text-cozy-dark">
              {house.visibility || "Private"}
            </p>
          </div>
        </div>

        {!archived && (
          <div className="mt-4 rounded-xl border border-cozy-brown/10 bg-white/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-cozy-brown/45">
                  House code
                </p>

                <p className="mt-1 truncate font-mono text-sm font-bold tracking-[0.15em] text-cozy-dark">
                  {house.house_code || "Unavailable"}
                </p>
              </div>

              <button
                type="button"
                disabled={!house.house_code}
                onClick={() => onCopy(house.house_code)}
                title="Copy house code"
                aria-label="Copy house code"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cozy-sage/15 text-cozy-sage-dark transition hover:bg-cozy-sage/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copiedCode === house.house_code ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-cozy-brown/10 pt-4">
          <p className="truncate text-[11px] text-cozy-brown/50">
            Owner: {house.owner_username || "Unknown"}
          </p>

          <span className="text-[10px] font-bold uppercase tracking-wider text-cozy-sage-dark">
            {isOwner ? "Your house" : "Shared with you"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {!archived ? (
            <>
              <button
                type="button"
                onClick={() => onEnter(house)}
                disabled={busy}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-4 py-3 text-xs font-bold text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DoorOpen size={16} />
                Enter House
                <ArrowUpRight size={14} />
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(house)}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-cozy-brown/15 bg-white px-3 py-2.5 text-xs font-bold text-cozy-brown transition hover:border-cozy-sage-dark hover:text-cozy-sage-dark disabled:opacity-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onArchive(house)}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-cozy-rose/20 bg-cozy-rose/5 px-3 py-2.5 text-xs font-bold text-cozy-rose transition hover:bg-cozy-rose/10 disabled:opacity-50"
                  >
                    <Archive size={14} />
                    Archive
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => onRestore(house)}
              disabled={busy || !isOwner}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-4 py-3 text-xs font-bold text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={15} />
              {busy ? "Restoring..." : "Restore House"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyHouses({ onRefresh, archived = false }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-cozy-brown/20 bg-cozy-paper px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cozy-sage/15 text-cozy-sage-dark">
        {archived ? <Archive size={30} /> : <House size={30} />}
      </div>

      <h3 className="mt-5 font-serif text-2xl font-bold text-cozy-dark">
        {archived ? "No archived houses" : "Your little world starts here"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-cozy-brown/60">
        {archived
          ? "Houses you archive will appear here. You can restore them whenever you like."
          : "You don't have any houses yet. Head to your Home dashboard to create your first cozy little space."}
      </p>

      {!archived && (
        <a
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cozy-sage-dark px-5 py-3 text-sm font-bold text-white transition hover:bg-cozy-dark"
        >
          Go to Home
          <ArrowUpRight size={16} />
        </a>
      )}

      <button
        type="button"
        onClick={onRefresh}
        className="mx-auto mt-4 flex items-center gap-2 text-xs font-semibold text-cozy-brown/50 transition hover:text-cozy-sage-dark"
      >
        <RefreshCw size={13} />
        Refresh houses
      </button>
    </div>
  );
}

export default function MyHouses() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [busyHouseId, setBusyHouseId] = useState(null);

  const fetchMyHouses = useCallback(
    async (signal) => {
      if (!accessToken) {
        setHouses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const query = showArchived ? "?archived=true" : "";
        const response = await fetch(`${API_URL}/api/houses/my${query}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your houses.");
        }

        setHouses(Array.isArray(data.houses) ? data.houses : []);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Fetch my houses failed:", err);
        setError(
          err.message || "Something went wrong while loading your houses."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [accessToken, showArchived]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchMyHouses(controller.signal);

    return () => controller.abort();
  }, [fetchMyHouses]);

  async function refreshHouses() {
    await fetchMyHouses();
  }

  function handleEnterHouse(house) {
    if (!house?.id) {
      setError("Unable to enter this house. House information is missing.");
      return;
    }

    navigate(`/house/${house.id}`, {
      state: { house },
    });
  }

  async function handleCopy(code) {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      window.setTimeout(() => {
        setCopiedCode((current) => (current === code ? "" : current));
      }, 1800);
    } catch (err) {
      console.error("Unable to copy house code:", err);
      setError("Unable to copy the house code. Please copy it manually.");
    }
  }

  async function handleEditHouse(updatedDetails) {
    if (!editingHouse) return;

    setBusyHouseId(editingHouse.id);

    try {
      const data = await apiRequest(
        `/api/houses/${editingHouse.id}`,
        accessToken,
        {
          method: "PUT",
          body: JSON.stringify(updatedDetails),
        }
      );

      setHouses((current) =>
        current.map((house) =>
          String(house.id) === String(editingHouse.id)
            ? { ...house, ...data.house, ...updatedDetails }
            : house
        )
      );

      setEditingHouse(null);
      setNotice("Your house details have been updated!");
      setError("");
    } catch (err) {
      console.error("Update house failed:", err);
      throw err;
    } finally {
      setBusyHouseId(null);
    }
  }

  async function handleArchiveHouse(house) {
    const confirmed = window.confirm(
      `Archive "${house.name}"?\n\nIt will disappear from your active houses, but you can restore it later.`
    );

    if (!confirmed) return;

    setBusyHouseId(house.id);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(
        `/api/houses/${house.id}/archive`,
        accessToken,
        { method: "PATCH" }
      );

      setNotice(data.message || "House archived successfully.");
      await refreshHouses();
    } catch (err) {
      console.error("Archive house failed:", err);
      setError(err.message || "Unable to archive this house.");
    } finally {
      setBusyHouseId(null);
    }
  }

  async function handleRestoreHouse(house) {
    const confirmed = window.confirm(
      `Restore "${house.name}" to your active houses?`
    );

    if (!confirmed) return;

    setBusyHouseId(house.id);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(
        `/api/houses/${house.id}/restore`,
        accessToken,
        { method: "PATCH" }
      );

      setNotice(data.message || "House restored successfully.");
      await refreshHouses();
    } catch (err) {
      console.error("Restore house failed:", err);
      setError(err.message || "Unable to restore this house.");
    } finally {
      setBusyHouseId(null);
    }
  }

  const ownedHouses = houses.filter(
    (house) => house.role?.toLowerCase() === "owner"
  );

  const joinedHouses = houses.filter(
    (house) => house.role?.toLowerCase() !== "owner"
  );

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      {editingHouse && (
        <HouseEditor
          house={editingHouse}
          onClose={() => setEditingHouse(null)}
          onSave={handleEditHouse}
          saving={busyHouseId === editingHouse.id}
        />
      )}

      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-cozy-sage-dark px-7 py-9 text-white shadow-lg shadow-cozy-sage-dark/10 sm:px-10 sm:py-11">
        <div className="absolute -right-8 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="absolute -bottom-20 right-40 h-52 w-52 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
            <Sparkles size={13} />
            Your little collection
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold leading-tight sm:text-5xl">
            My Houses
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
            Every house has its own little story. Keep track of the cozy places
            you've created and the homes you've joined.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                {showArchived ? "Archived houses" : "Active houses"}
              </p>
              <p className="mt-1 text-xl font-bold">
                {loading ? "—" : houses.length}
              </p>
            </div>

            <div className="rounded-xl bg-white/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Owned
              </p>
              <p className="mt-1 text-xl font-bold">
                {loading ? "—" : ownedHouses.length}
              </p>
            </div>

            <div className="rounded-xl bg-white/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Joined
              </p>
              <p className="mt-1 text-xl font-bold">
                {loading ? "—" : joinedHouses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-8 hidden text-white/10 md:block">
          <House size={190} strokeWidth={0.8} />
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
            Manage your collection
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-cozy-dark">
            {showArchived ? "Archived Houses" : "Your Houses"}
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cozy-brown/10 bg-cozy-paper p-1">
          <button
            type="button"
            onClick={() => {
              setShowArchived(false);
              setNotice("");
              setError("");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              !showArchived
                ? "bg-cozy-sage-dark text-white shadow-sm"
                : "text-cozy-brown/60 hover:bg-cozy-cream"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <House size={13} />
              Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowArchived(true);
              setNotice("");
              setError("");
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              showArchived
                ? "bg-cozy-sage-dark text-white shadow-sm"
                : "text-cozy-brown/60 hover:bg-cozy-cream"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Archive size={13} />
              Archived
            </span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-xl border border-cozy-sage/30 bg-cozy-sage/10 p-4 text-sm font-medium text-cozy-sage-dark"
        >
          <Check size={17} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-auto rounded-lg p-1 hover:bg-cozy-sage/15"
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-7 flex flex-col gap-3 rounded-2xl border border-cozy-rose/20 bg-cozy-rose/10 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-bold text-cozy-rose">
              Something went wrong.
            </p>
            <p className="mt-1 text-xs leading-5 text-cozy-brown/70">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => fetchMyHouses()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-cozy-sage-dark shadow-sm transition hover:bg-cozy-cream"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-cozy-sage/30 border-t-cozy-sage-dark" />
          <p className="mt-4 text-sm font-medium text-cozy-brown/60">
            Gathering your little worlds...
          </p>
        </div>
      ) : !error && houses.length === 0 ? (
        <EmptyHouses
          archived={showArchived}
          onRefresh={() => fetchMyHouses()}
        />
      ) : (
        <>
          {ownedHouses.length > 0 && (
            <section className="mb-10">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                    {showArchived ? "Kept for later" : "Built by you"}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-cozy-dark">
                    {showArchived ? "Your Archived Houses" : "Houses You Own"}
                  </h2>
                  <p className="mt-1 text-xs text-cozy-brown/55">
                    {showArchived
                      ? "Restore a house whenever you're ready."
                      : "Your own little worlds, made your way."}
                  </p>
                </div>

                <span className="rounded-full bg-cozy-sage/20 px-3 py-1.5 text-[10px] font-bold text-cozy-sage-dark">
                  {ownedHouses.length}{" "}
                  {ownedHouses.length === 1 ? "House" : "Houses"}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {ownedHouses.map((house) => (
                  <HouseCard
                    key={house.id}
                    house={house}
                    onCopy={handleCopy}
                    copiedCode={copiedCode}
                    onEdit={setEditingHouse}
                    onArchive={handleArchiveHouse}
                    onRestore={handleRestoreHouse}
                    onEnter={handleEnterHouse}
                    busy={busyHouseId === house.id}
                    archived={showArchived}
                  />
                ))}
              </div>
            </section>
          )}

          {!showArchived && joinedHouses.length > 0 && (
            <section>
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                    Shared with you
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-cozy-dark">
                    Houses You've Joined
                  </h2>
                  <p className="mt-1 text-xs text-cozy-brown/55">
                    Little worlds where you're part of the community.
                  </p>
                </div>

                <span className="rounded-full bg-cozy-cream px-3 py-1.5 text-[10px] font-bold text-cozy-brown/70">
                  {joinedHouses.length}{" "}
                  {joinedHouses.length === 1 ? "House" : "Houses"}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {joinedHouses.map((house) => (
                  <HouseCard
                    key={house.id}
                    house={house}
                    onCopy={handleCopy}
                    copiedCode={copiedCode}
                    onEdit={setEditingHouse}
                    onArchive={handleArchiveHouse}
                    onRestore={handleRestoreHouse}
                    onEnter={handleEnterHouse}
                    busy={busyHouseId === house.id}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-10 flex items-start gap-4 rounded-2xl border border-cozy-brown/10 bg-cozy-paper p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cozy-cream text-cozy-sage-dark">
          <DoorOpen size={21} />
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-cozy-dark">
            Your next little adventure
          </h3>
          <p className="mt-1 text-xs leading-5 text-cozy-brown/60">
            Your houses are ready to explore. Enter a house to visit its
            interior and start building your cozy little world.
          </p>
        </div>
      </div>
    </div>
  );
}
