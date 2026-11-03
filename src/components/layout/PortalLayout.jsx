import {
  House,
  LogOut,
  Sparkles,
  Users,
  Settings,
  DoorOpen,
  UserRound,
  Bell,
  Menu,
  X,
  Sprout,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth, API_URL } from "../../context/AuthContext";
import { createPortal } from "react-dom";

const navigation = [
  { label: "Home", path: "/dashboard", icon: House },
  { label: "Profile", path: "/profile", icon: UserRound },
  { label: "My Houses", path: "/my-house", icon: DoorOpen },
  { label: "Friends", path: "/friends", icon: Users },
  { label: "Settings", path: "/settings", icon: Settings, comingSoon: true },
];

function getAvatarUrl(avatarPath) {
  if (!avatarPath || avatarPath.startsWith("preset:")) {
    return null;
  }

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  const cleanPath = avatarPath.replace(/^\/?uploads\//, "").replace(/^\/+/, "");

  return `${API_URL}/uploads/${cleanPath}`;
}

function PortalAvatar({ user, size = "h-10 w-10" }) {
  const username = user?.username || "friend";
  const avatarPath = user?.avatar_path || null;
  const avatarUrl = getAvatarUrl(avatarPath);

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarPath]);

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt={`${username}'s profile`}
        title={username}
        onError={() => setImageFailed(true)}
        className={`${size} rounded-full border-2 border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      title={username}
      className={`flex ${size} items-center justify-center rounded-full border-2 border-white bg-cozy-sage text-sm font-bold text-white shadow-sm`}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

function PortalSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-cozy-dark/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-cozy-brown/10 bg-cozy-paper px-6 py-7 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cozy-sage-dark text-white shadow-sm">
              <House size={23} />
            </div>

            <div>
              <h1 className="font-serif text-xl font-bold text-cozy-dark">
                Cozy Home
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-brown/50">
                Your little world
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-xl p-2 text-cozy-brown hover:bg-cozy-cream lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-12">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-brown/40">
            Menu
          </p>

          <nav className="space-y-2">
            {navigation.map(({ label, path, icon: Icon, comingSoon }) => (
              <NavLink
                key={label}
                to={path}
                end={path === "/dashboard"}
                onClick={(event) => {
                  if (comingSoon) {
                    event.preventDefault();
                    return;
                  }

                  onClose();
                }}
                aria-disabled={comingSoon}
                title={comingSoon ? "Coming soon" : label}
                className={({ isActive }) =>
                  `group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    comingSoon
                      ? "cursor-not-allowed text-cozy-brown/50"
                      : isActive
                      ? "bg-cozy-sage-dark text-white shadow-md shadow-cozy-sage-dark/15"
                      : "text-cozy-brown/70 hover:bg-cozy-cream"
                  }`
                }
              >
                <Icon size={19} />
                {label}

                {comingSoon && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider opacity-60">
                    Soon
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar reminder */}
        <div className="mt-auto">
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-cozy-cream p-5">
            <div className="absolute -right-3 -top-3 text-cozy-sage/30">
              <Sparkles size={65} />
            </div>

            <Sprout size={22} className="text-cozy-sage-dark" />

            <p className="mt-3 font-serif text-lg font-bold text-cozy-dark">
              A little reminder
            </p>

            <p className="mt-1 text-xs leading-5 text-cozy-brown/60">
              There's no rush. Your little world will grow at its own pace.
            </p>
          </div>

          <div className="rounded-xl border border-cozy-brown/10 px-4 py-3">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-cozy-brown/40">
              Made with care
            </p>
            <p className="mt-1 text-center font-serif text-sm font-semibold text-cozy-brown/70">
              Your little world awaits.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function PortalNavbar({ onMenuOpen, onSignOut }) {
  const { user } = useAuth();
  const location = useLocation();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const currentPage =
    navigation.find(
      (item) =>
        !item.comingSoon &&
        (location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`))
    )?.label || "Home";

  const pageTitles = {
    Home: "Home",
    Profile: "My Profile",
    "My Houses": "My Houses",
    Friends: "Friends",
    Settings: "Settings",
  };

  const pageTitle = pageTitles[currentPage] || "Home";

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-cozy-brown/10 bg-cozy-paper/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-xl p-2 text-cozy-brown hover:bg-cozy-cream lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs font-medium text-cozy-brown/50">
            Your personal space
          </p>
          <h2 className="font-serif text-lg font-bold text-cozy-dark">
            {pageTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          title="Notifications coming soon"
          aria-label="Notifications coming soon"
          className="relative rounded-xl border border-cozy-brown/10 p-2.5 text-cozy-brown/50"
        >
          <Bell size={18} />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-expanded={profileMenuOpen}
            aria-haspopup="true"
            aria-label="Open profile menu"
            className={`flex items-center gap-2 rounded-full border p-1 pr-2 transition ${
              profileMenuOpen
                ? "border-cozy-sage-dark/30 bg-cozy-cream"
                : "border-transparent hover:border-cozy-brown/10 hover:bg-cozy-cream"
            }`}
          >
            <PortalAvatar user={user} />

            <ChevronDown
              size={16}
              className={`text-cozy-brown/60 transition-transform ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-cozy-brown/10 bg-cozy-paper p-2 shadow-xl shadow-cozy-dark/10">
              {/* User information */}
              <div className="flex items-center gap-3 border-b border-cozy-brown/10 px-3 py-3">
                <PortalAvatar user={user} size="h-11 w-11" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-cozy-dark">
                    {user?.display_name || user?.username || "Friend"}
                  </p>
                  <p className="truncate text-xs text-cozy-brown/50">
                    @{user?.username || "friend"}
                  </p>
                </div>
              </div>

              {/* Profile option */}
              <NavLink
                to="/profile"
                onClick={() => setProfileMenuOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-cozy-brown/80 transition hover:bg-cozy-cream hover:text-cozy-dark"
              >
                <UserRound size={18} />
                My Profile
              </NavLink>

              {/* Sign out option */}
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-cozy-rose transition hover:bg-cozy-rose/10"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SignOutModal({ open, onCancel, onConfirm, loading }) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-cozy-dark/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        className="relative m-auto w-full max-w-md overflow-hidden rounded-3xl border border-cozy-brown/10 bg-cozy-paper p-6 shadow-2xl sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cozy-rose/10 text-cozy-rose">
          <LogOut size={28} />
        </div>

        <div className="mt-5 text-center">
          <h2
            id="signout-title"
            className="font-serif text-2xl font-bold text-cozy-dark"
          >
            Leaving so soon?
          </h2>

          <p className="mt-2 text-sm leading-6 text-cozy-brown/60">
            Are you sure you want to sign out of Cozy Home? Your little world
            will be waiting when you return.
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-cozy-brown/15 px-5 py-3 text-sm font-bold text-cozy-brown transition hover:bg-cozy-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stay here
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-cozy-rose px-5 py-3 text-sm font-bold text-white shadow-md shadow-cozy-rose/20 transition hover:bg-cozy-rose/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing out..." : "Yes, Sign Out"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function PortalLayout() {
  const { logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleConfirmSignOut() {
    if (signingOut) return;

    try {
      setSigningOut(true);
      await logout();
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-cozy-cream text-cozy-dark">
      <PortalSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <PortalNavbar
          onMenuOpen={() => setMobileOpen(true)}
          onSignOut={() => setSignOutOpen(true)}
        />

        <div className="page-transition">
          <Outlet />
        </div>
      </div>

      <SignOutModal
        open={signOutOpen}
        onCancel={() => setSignOutOpen(false)}
        onConfirm={handleConfirmSignOut}
        loading={signingOut}
      />
    </main>
  );
}
