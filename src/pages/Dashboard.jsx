import { House, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cozy-cream px-5 py-12">
      <section className="w-full max-w-xl rounded-[2rem] border border-cozy-brown/10 bg-cozy-paper p-8 text-center shadow-[0_25px_80px_rgba(57,68,55,0.12)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cozy-sage-dark text-white shadow-md">
          <House size={30} />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-cozy-sage/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cozy-sage-dark">
          <Sparkles size={14} />
          You're home
        </div>

        <h1 className="mt-5 font-serif text-4xl font-semibold text-cozy-dark">
          Welcome, {user?.username || "friend"}!
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-cozy-brown/70">
          Your Cozy Home account is ready. Soon, you'll be able to create your
          own little space and invite your favorite people.
        </p>

        <div className="mt-8 rounded-2xl bg-cozy-cream p-5 text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-cozy-brown/60">
            Account details
          </p>

          <p className="mt-3 text-sm font-semibold text-cozy-dark">
            {user?.username}
          </p>

          <p className="mt-1 text-sm text-cozy-brown/70">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-cozy-brown/15 px-6 py-3 text-sm font-bold text-cozy-brown transition-all hover:border-cozy-rose/40 hover:bg-cozy-rose/5 hover:text-cozy-rose"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </section>
    </main>
  );
}
