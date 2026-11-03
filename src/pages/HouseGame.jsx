import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, House, Sparkles, Construction } from "lucide-react";

export default function HouseGame() {
  const { houseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const house = location.state?.house;

  return (
    <main className="min-h-screen bg-[#eee8dc] p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/my-house")}
            className="flex items-center gap-2 rounded-xl border border-[#514538]/15 bg-[#faf7ef] px-4 py-3 text-sm font-bold text-[#514538] transition hover:bg-white"
          >
            <ArrowLeft size={17} />
            Back to My Houses
          </button>

          <span className="flex items-center gap-2 rounded-full bg-[#dce7cf] px-4 py-2 text-xs font-bold text-[#526b48]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6d985d]" />
            House World
          </span>
        </header>

        {/* House information */}
        <section className="mt-8 rounded-3xl bg-[#647b58] p-6 text-white shadow-lg sm:p-9">
          <div className="flex items-center gap-3">
            <House size={25} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Welcome home
            </p>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold sm:text-5xl">
            {house?.name || "Your Cozy Home"}
          </h1>

          <p className="mt-3 text-sm text-white/75">House ID: {houseId}</p>
        </section>

        {/* Game viewport */}
        <section className="mt-6 overflow-hidden rounded-3xl border-4 border-[#b5a58c] bg-[#d7dfc4] shadow-xl">
          <div className="flex min-h-[420px] flex-col items-center justify-center px-5 py-12 text-center sm:min-h-[560px]">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#f8f3e8] text-[#647b58] shadow-md">
              <Construction size={44} />
            </div>

            <h2 className="mt-7 font-serif text-2xl font-bold text-[#384b32] sm:text-3xl">
              Your world is getting ready!
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#59634e]">
              The game world is not connected yet. This is where your top-down
              pixel-art house, character movement, decorations, and multiplayer
              features will appear.
            </p>

            <div className="mt-6 flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-bold text-[#647b58]">
              <Sparkles size={15} />
              Game engine coming next
            </div>
          </div>
        </section>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-[#827967]">
          Cozy Home · Your little world, your little story.
        </p>
      </div>
    </main>
  );
}
