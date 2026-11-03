import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Mail,
  CalendarDays,
  ShieldCheck,
  UserRound,
  Save,
  Sparkles,
  Camera,
  Upload,
  X,
  CheckCircle2,
  ImagePlus,
} from "lucide-react";
import { useAuth, API_URL } from "../context/AuthContext";

const AVATAR_PRESETS = [
  {
    id: "farmer-01",
    name: "Sunny",
    skin: "#E9B98F",
    hair: "#51352D",
    shirt: "#D88B65",
    pants: "#557C68",
    style: "short",
    accessory: "none",
  },
  {
    id: "farmer-02",
    name: "Mochi",
    skin: "#F3D0AE",
    hair: "#342A29",
    shirt: "#D78FA4",
    pants: "#665A85",
    style: "long",
    accessory: "bow",
  },
  {
    id: "farmer-03",
    name: "Maple",
    skin: "#B97850",
    hair: "#30241F",
    shirt: "#D6A84F",
    pants: "#557C68",
    style: "curly",
    accessory: "none",
  },
  {
    id: "farmer-04",
    name: "Clover",
    skin: "#F1C9A5",
    hair: "#B96E42",
    shirt: "#8BAA82",
    pants: "#77618C",
    style: "ponytail",
    accessory: "flower",
  },
  {
    id: "farmer-05",
    name: "Basil",
    skin: "#8E573D",
    hair: "#211E20",
    shirt: "#6D91B2",
    pants: "#C18B62",
    style: "short",
    accessory: "cap",
  },
  {
    id: "farmer-06",
    name: "Peaches",
    skin: "#D99B76",
    hair: "#E0B36C",
    shirt: "#B77D9C",
    pants: "#526D83",
    style: "long",
    accessory: "none",
  },
  {
    id: "farmer-07",
    name: "Fern",
    skin: "#F0C7A0",
    hair: "#76503A",
    shirt: "#A7A66C",
    pants: "#806A55",
    style: "curly",
    accessory: "flower",
  },
  {
    id: "farmer-08",
    name: "Ash",
    skin: "#A96F50",
    hair: "#29252D",
    shirt: "#8C9BB8",
    pants: "#554C68",
    style: "ponytail",
    accessory: "cap",
  },
];

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PixelAvatar({ preset, className = "" }) {
  const character =
    AVATAR_PRESETS.find((item) => item.id === preset) || AVATAR_PRESETS[0];

  return (
    <svg
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`${character.name} pixel avatar`}
    >
      <rect width="32" height="32" fill="#E9E3D2" />
      <rect x="4" y="25" width="24" height="5" fill="#D4CDBB" />

      {character.style === "long" && (
        <rect x="9" y="7" width="14" height="15" fill={character.hair} />
      )}

      {character.style === "ponytail" && (
        <>
          <rect x="20" y="9" width="6" height="10" fill={character.hair} />
          <rect x="23" y="15" width="4" height="5" fill={character.hair} />
        </>
      )}

      <rect x="10" y="19" width="12" height="7" fill={character.shirt} />
      <rect x="8" y="21" width="4" height="5" fill={character.shirt} />
      <rect x="20" y="21" width="4" height="5" fill={character.shirt} />
      <rect x="11" y="25" width="4" height="5" fill={character.pants} />
      <rect x="17" y="25" width="4" height="5" fill={character.pants} />
      <rect x="10" y="29" width="6" height="2" fill="#604A3D" />
      <rect x="16" y="29" width="6" height="2" fill="#604A3D" />

      <rect x="14" y="17" width="4" height="4" fill={character.skin} />
      <rect x="10" y="8" width="12" height="11" fill={character.skin} />
      <rect x="8" y="11" width="2" height="5" fill={character.skin} />
      <rect x="22" y="11" width="2" height="5" fill={character.skin} />

      <rect x="9" y="6" width="14" height="5" fill={character.hair} />
      <rect x="8" y="8" width="3" height="7" fill={character.hair} />

      {character.style === "short" && (
        <>
          <rect x="20" y="8" width="3" height="5" fill={character.hair} />
          <rect x="12" y="10" width="4" height="2" fill={character.hair} />
        </>
      )}

      {character.style === "long" && (
        <>
          <rect x="8" y="13" width="3" height="8" fill={character.hair} />
          <rect x="21" y="13" width="3" height="8" fill={character.hair} />
          <rect x="13" y="10" width="5" height="2" fill={character.hair} />
        </>
      )}

      {character.style === "curly" && (
        <>
          <rect x="7" y="7" width="4" height="4" fill={character.hair} />
          <rect x="12" y="4" width="4" height="4" fill={character.hair} />
          <rect x="17" y="5" width="5" height="4" fill={character.hair} />
          <rect x="21" y="8" width="4" height="4" fill={character.hair} />
        </>
      )}

      {character.style === "ponytail" && (
        <>
          <rect x="20" y="12" width="4" height="5" fill={character.hair} />
          <rect x="23" y="16" width="4" height="5" fill={character.hair} />
          <rect x="12" y="10" width="5" height="2" fill={character.hair} />
        </>
      )}

      <rect x="12" y="13" width="2" height="2" fill="#382D2B" />
      <rect x="19" y="13" width="2" height="2" fill="#382D2B" />
      <rect x="15" y="17" width="3" height="1" fill="#A85F58" />
      <rect x="10" y="16" width="2" height="1" fill="#D78D83" />
      <rect x="20" y="16" width="2" height="1" fill="#D78D83" />

      {character.accessory === "bow" && (
        <>
          <rect x="21" y="5" width="3" height="3" fill="#D87591" />
          <rect x="24" y="5" width="3" height="3" fill="#D87591" />
          <rect x="23" y="6" width="2" height="2" fill="#F1C5C9" />
        </>
      )}

      {character.accessory === "flower" && (
        <>
          <rect x="7" y="5" width="2" height="2" fill="#F4D47D" />
          <rect x="6" y="6" width="2" height="2" fill="#E88E91" />
          <rect x="8" y="6" width="2" height="2" fill="#E88E91" />
          <rect x="7" y="7" width="2" height="2" fill="#E88E91" />
        </>
      )}

      {character.accessory === "cap" && (
        <>
          <rect x="8" y="5" width="16" height="3" fill="#B87555" />
          <rect x="7" y="7" width="18" height="2" fill="#B87555" />
          <rect x="17" y="5" width="3" height="2" fill="#E4C17B" />
        </>
      )}

      <rect x="15" y="21" width="2" height="4" fill="#F5E7C9" opacity="0.8" />
    </svg>
  );
}

function getAvatarUrl(avatarPath) {
  if (!avatarPath) return null;

  if (avatarPath.startsWith("preset:")) {
    return null;
  }

  if (/^https?:\/\//i.test(avatarPath)) {
    return avatarPath;
  }

  return `${API_URL}/uploads/${avatarPath
    .replace(/^\/?uploads\//, "")
    .replace(/^\/+/, "")}`;
}

function AvatarDisplay({ avatarPath, username, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);

  const presetId = avatarPath?.startsWith("preset:")
    ? avatarPath.replace("preset:", "")
    : null;

  useEffect(() => {
    setImageFailed(false);
  }, [avatarPath]);

  if (presetId && AVATAR_PRESETS.some((item) => item.id === presetId)) {
    return <PixelAvatar preset={presetId} className={className} />;
  }

  const imageUrl = getAvatarUrl(avatarPath);

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={`${username || "User"}'s profile`}
        onError={() => setImageFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-cozy-sage font-bold text-white ${className}`}
    >
      {(username || "F").charAt(0).toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const { user, accessToken, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [friendCodeCopied, setFriendCodeCopied] = useState(false);

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!accessToken) return;

    const controller = new AbortController();

    async function fetchProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your profile.");
        }

        const currentProfile = data.profile;

        setProfile(currentProfile);
        setUsername(currentProfile.username || "");
        setBio(currentProfile.bio || "");

        updateUser({
          username: currentProfile.username,
          friendCode: currentProfile.friend_code,
          avatar_path: currentProfile.avatar_path || null,
        });
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Fetch profile failed:", err);
        setError(err.message || "Unable to load your profile.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  function closeAvatarModal() {
    setAvatarModalOpen(false);
    setSelectedPreset(null);
    setPendingFile(null);

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);

    setSelectedPreset(null);
    setPendingFile(file);
    setFilePreview(URL.createObjectURL(file));
    setError("");
    setSuccess("");
  }

  async function handleCopyFriendCode() {
    const friendCode = profile?.friend_code || user?.friendCode;

    if (!friendCode) {
      setError("Your friend code is not available yet.");
      return;
    }

    try {
      await navigator.clipboard.writeText(friendCode);
      setFriendCodeCopied(true);

      window.setTimeout(() => {
        setFriendCodeCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy friend code failed:", err);
      setError("Unable to copy your friend code. Please copy it manually.");
    }
  }

  async function savePresetAvatar() {
    if (!selectedPreset) return;

    setAvatarSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/profile/avatar/preset`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          avatar_path: `preset:${selectedPreset}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your avatar.");
      }

      const avatarPath = data.avatar_path;

      setProfile((current) => ({
        ...current,
        avatar_path: avatarPath,
      }));

      updateUser({ avatar_path: avatarPath });

      closeAvatarModal();
      setSuccess("Your new character is ready!");
    } catch (err) {
      console.error("Save preset avatar failed:", err);
      setError(err.message || "Unable to save your avatar.");
    } finally {
      setAvatarSaving(false);
    }
  }

  async function uploadCustomAvatar() {
    if (!pendingFile) return;

    setAvatarSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", pendingFile);

      const response = await fetch(`${API_URL}/api/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload your avatar.");
      }

      setProfile((current) => ({
        ...current,
        avatar_path: data.avatar_path,
      }));

      updateUser({ avatar_path: data.avatar_path });

      closeAvatarModal();
      setSuccess(data.message || "Your profile picture has been updated!");
    } catch (err) {
      console.error("Upload avatar failed:", err);
      setError(err.message || "Unable to upload your avatar.");
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedBio = bio.trim();

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(trimmedUsername)) {
      setError(
        "Username must be 3–24 characters and may only contain letters, numbers, and underscores."
      );
      return;
    }

    if (trimmedBio.length > 160) {
      setError("Bio cannot exceed 160 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          username: trimmedUsername,
          bio: trimmedBio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update your profile.");
      }

      const updatedProfile = data.profile;

      setProfile(updatedProfile);
      setUsername(updatedProfile.username || "");
      setBio(updatedProfile.bio || "");

      updateUser({
        username: updatedProfile.username,
        friendCode: updatedProfile.friend_code,
        avatar_path: updatedProfile.avatar_path || profile?.avatar_path || null,
      });

      setSuccess(data.message || "Your profile has been updated!");
    } catch (err) {
      console.error("Update profile failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const currentUsername =
    username.trim() || profile?.username || user?.username || "friend";

  const email = profile?.email || user?.email || "Not available";
  const currentAvatar = profile?.avatar_path || user?.avatar_path || null;
  const friendCode = profile?.friend_code || user?.friendCode || null;

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-cozy-sage/30 border-t-cozy-sage-dark" />
          <p className="mt-4 text-sm text-cozy-brown/60">
            Preparing your profile...
          </p>
        </div>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl bg-cozy-rose/10 p-6">
          <p className="font-semibold text-cozy-rose">
            Couldn't load your profile.
          </p>
          <p className="mt-2 text-sm text-cozy-brown/70">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 text-sm font-bold text-cozy-sage-dark hover:underline"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
          Your little identity
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-cozy-dark sm:text-4xl">
          My Profile
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-cozy-brown/60">
          A little space to tell everyone about yourself. Make it feel like you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
        <section className="h-fit rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-6 text-center shadow-sm">
          <div className="relative mx-auto h-28 w-28">
            <AvatarDisplay
              avatarPath={currentAvatar}
              username={currentUsername}
              className="h-28 w-28 rounded-full border-4 border-white shadow-md"
            />

            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-cozy-sage-dark text-white shadow-md transition hover:scale-105 hover:bg-cozy-dark"
              aria-label="Change profile picture"
              title="Change avatar"
            >
              <Camera size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAvatarModalOpen(true)}
            className="mt-3 text-xs font-bold text-cozy-sage-dark hover:underline"
          >
            Change avatar
          </button>

          <h2 className="mt-3 font-serif text-xl font-bold text-cozy-dark">
            {currentUsername}
          </h2>

          <p className="mt-1 text-xs text-cozy-brown/50">@{currentUsername}</p>

          <div className="my-6 h-px bg-cozy-brown/10" />

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cozy-sage-dark">
            <ShieldCheck size={16} />
            Verified account
          </div>

          <p className="mt-3 text-xs leading-5 text-cozy-brown/50">
            Your account is active and ready for your little world.
          </p>
        </section>

        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-6 shadow-sm sm:p-8"
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-sage/15 text-cozy-sage-dark">
                <UserRound size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-cozy-dark">
                  Personal details
                </h2>
                <p className="mt-1 text-xs text-cozy-brown/50">
                  Customize how you appear to other players.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-xs font-bold text-cozy-brown/70"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  maxLength={24}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Choose your username"
                  disabled={saving}
                  className="w-full rounded-xl border border-cozy-brown/15 bg-cozy-cream/50 px-4 py-3 text-sm text-cozy-dark outline-none transition placeholder:text-cozy-brown/35 focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/15 disabled:opacity-60"
                />
                <p className="mt-2 text-right text-[10px] text-cozy-brown/40">
                  {username.length}/24 · Letters, numbers, and underscores
                </p>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-xs font-bold text-cozy-brown/70"
                >
                  About me
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  maxLength={160}
                  value={bio}
                  onChange={(event) => {
                    setBio(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Tell us a little about yourself..."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-cozy-brown/15 bg-cozy-cream/50 px-4 py-3 text-sm leading-6 text-cozy-dark outline-none transition placeholder:text-cozy-brown/35 focus:border-cozy-sage-dark focus:ring-4 focus:ring-cozy-sage/15 disabled:opacity-60"
                />
                <p className="mt-2 text-right text-[10px] text-cozy-brown/40">
                  {bio.length}/160
                </p>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-cozy-rose/10 px-4 py-3 text-xs text-cozy-rose"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="mt-5 flex items-center gap-2 rounded-xl bg-cozy-sage/15 px-4 py-3 text-xs font-semibold text-cozy-sage-dark"
              >
                <Check size={15} />
                {success}
              </p>
            )}

            <div className="mt-7 flex justify-end border-t border-cozy-brown/10 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-60"
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

          <section className="rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-rose/10 text-cozy-rose">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-cozy-dark">
                  Account information
                </h2>
                <p className="mt-1 text-xs text-cozy-brown/50">
                  Your account details and membership.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Friend Code */}
              <div className="rounded-2xl border border-cozy-sage/20 bg-cozy-sage/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/50">
                      Your friend code
                    </p>
                    <p className="mt-2 break-all font-mono text-lg font-bold tracking-wider text-cozy-dark">
                      {friendCode || "Not available"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyFriendCode}
                    disabled={!friendCode}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cozy-sage-dark px-3 py-2.5 text-xs font-bold text-white transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Copy friend code"
                  >
                    {friendCodeCopied ? (
                      <>
                        <Check size={15} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-3 text-[11px] leading-5 text-cozy-brown/60">
                  Share this code with other players so they can find and add
                  you as a friend.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <UserRound size={17} className="mt-1 text-cozy-sage-dark" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                    Username
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-cozy-dark">
                    {profile?.username || user?.username || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={17} className="mt-1 text-cozy-sage-dark" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                    Email address
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-cozy-dark">
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays size={17} className="mt-1 text-cozy-sage-dark" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                    Member since
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cozy-dark">
                    {formatDate(profile?.account_created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={17} className="mt-1 text-cozy-sage-dark" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cozy-brown/45">
                    Account status
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-cozy-sage-dark">
                    {profile?.status || "Active"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Avatar selection modal */}
      {avatarModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-cozy-dark/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !avatarSaving) {
              closeAvatarModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-5 shadow-2xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                  Make it yours
                </p>
                <h2
                  id="avatar-modal-title"
                  className="mt-2 font-serif text-2xl font-bold text-cozy-dark"
                >
                  Choose your character
                </h2>
                <p className="mt-2 text-xs text-cozy-brown/55">
                  Pick a little character or use your own picture.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAvatarModal}
                disabled={avatarSaving}
                className="rounded-full p-2 text-cozy-brown/50 transition hover:bg-cozy-brown/10 hover:text-cozy-dark disabled:opacity-50"
                aria-label="Close avatar selector"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-3 sm:grid-cols-4">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setPendingFile(null);

                      if (filePreview) {
                        URL.revokeObjectURL(filePreview);
                        setFilePreview("");
                      }

                      setError("");
                    }}
                    disabled={avatarSaving}
                    className={`group rounded-2xl border-2 p-2 transition ${
                      isSelected
                        ? "border-cozy-sage-dark bg-cozy-sage/15 shadow-sm"
                        : "border-cozy-brown/10 bg-cozy-cream/40 hover:border-cozy-sage/60"
                    }`}
                  >
                    <div className="relative mx-auto aspect-square w-full max-w-[100px] overflow-hidden rounded-xl bg-[#E9E3D2]">
                      <PixelAvatar
                        preset={preset.id}
                        className="h-full w-full transition group-hover:scale-105"
                      />
                      {isSelected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cozy-sage-dark text-white">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <span className="mt-2 block truncate text-[11px] font-bold text-cozy-brown">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5 rounded-2xl border border-dashed border-cozy-brown/20 bg-cozy-cream/40 p-4">
              <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cozy-sage/15 text-cozy-sage-dark">
                  <ImagePlus size={22} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-cozy-dark">
                    Use your own picture
                  </p>
                  <p className="mt-1 text-[11px] text-cozy-brown/55">
                    JPG, PNG, or WebP · Maximum 5 MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-cozy-sage-dark/20 bg-white px-4 py-2.5 text-xs font-bold text-cozy-sage-dark transition hover:bg-cozy-sage/10 disabled:opacity-50"
                >
                  <Upload size={15} />
                  Choose image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {pendingFile && filePreview && (
                <div className="mt-4 flex items-center gap-4 border-t border-cozy-brown/10 pt-4">
                  <img
                    src={filePreview}
                    alt="Avatar preview"
                    className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-cozy-dark">
                      {pendingFile.name}
                    </p>
                    <p className="mt-1 text-[10px] text-cozy-brown/50">
                      {(pendingFile.size / (1024 * 1024)).toFixed(2)} MB · Ready
                      to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingFile(null);
                      URL.revokeObjectURL(filePreview);
                      setFilePreview("");

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-full p-2 text-cozy-brown/50 hover:bg-cozy-rose/10 hover:text-cozy-rose"
                    aria-label="Remove selected image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {selectedPreset && (
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-cozy-sage/10 p-3">
                <PixelAvatar
                  preset={selectedPreset}
                  className="h-12 w-12 rounded-lg"
                />
                <div>
                  <p className="text-xs font-bold text-cozy-dark">
                    {
                      AVATAR_PRESETS.find((item) => item.id === selectedPreset)
                        ?.name
                    }
                  </p>
                  <p className="mt-1 text-[10px] text-cozy-brown/55">
                    Character selected
                  </p>
                </div>
                <CheckCircle2
                  size={18}
                  className="ml-auto text-cozy-sage-dark"
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-cozy-brown/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAvatarModal}
                disabled={avatarSaving}
                className="rounded-xl border border-cozy-brown/15 px-5 py-3 text-xs font-bold text-cozy-brown/70 transition hover:bg-cozy-cream disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={pendingFile ? uploadCustomAvatar : savePresetAvatar}
                disabled={avatarSaving || (!pendingFile && !selectedPreset)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cozy-sage-dark px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-cozy-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {avatarSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Save avatar
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
