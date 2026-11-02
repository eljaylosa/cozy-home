import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Users,
  Armchair,
  MessageCircle,
  Tv,
  Sparkles,
  Leaf,
  Flower2,
} from "lucide-react";

// Nature
import cherryBlossom from "../assets/images/nature/01_cherry_blossom_tree_32x32.png";
import koiPond from "../assets/images/nature/02_koi_pond_tile_32x32.png";
import rockCluster from "../assets/images/nature/03_rock_cluster_32x32.png";
import bambooGrove from "../assets/images/nature/04_bamboo_grove_32x32.png";
import autumnMaple from "../assets/images/nature/05_autumn_maple_tree_32x32.png";
import lotusLily from "../assets/images/nature/06_lotus_lily_pad_32x32.png";
import stonePath from "../assets/images/nature/07_mossy_stone_path_32x32.png";
import fallenLog from "../assets/images/nature/08_fallen_log_32x32.png";

// Props
import toriiGate from "../assets/images/props/01_torii_gate_32x32.png";
import stoneLantern from "../assets/images/props/02_stone_lantern_32x32.png";
import bambooCluster from "../assets/images/props/03_bamboo_cluster_32x32.png";
import paperLantern from "../assets/images/props/06_paper_lantern_32x32.png";
import woodenFence from "../assets/images/props/07_wooden_fence_32x32.png";

// Structures
import shrineWall from "../assets/images/structures/01_shrine_wall_segment_32x32.png";
import stoneWell from "../assets/images/structures/03_stone_well_32x32.png";
import woodenBridge from "../assets/images/structures/04_wooden_bridge_32x32.png";
import stoneSteps from "../assets/images/structures/05_stone_steps_32x32.png";

const features = [
  {
    icon: Armchair,
    title: "Make it yours",
    description:
      "Choose your favorite house theme, arrange furniture, and decorate every little corner.",
  },
  {
    icon: Users,
    title: "Invite your people",
    description:
      "Share your house with friends and enjoy your own little world together.",
  },
  {
    icon: MessageCircle,
    title: "Stay connected",
    description:
      "Talk, leave little notes, and make everyday moments more memorable.",
  },
  {
    icon: Tv,
    title: "Enjoy things together",
    description:
      "Gather around the TV and share your screen while hanging out.",
  },
];

const sceneSprites = [
  {
    src: cherryBlossom,
    alt: "Cherry blossom tree",
    position: "left-[4%] top-[13%] w-[18%]",
  },
  {
    src: autumnMaple,
    alt: "Autumn maple tree",
    position: "right-[5%] top-[12%] w-[19%]",
  },
  {
    src: bambooGrove,
    alt: "Bamboo grove",
    position: "left-[23%] top-[16%] w-[13%]",
  },
  {
    src: bambooCluster,
    alt: "Bamboo cluster",
    position: "right-[22%] top-[23%] w-[10%]",
  },
  {
    src: shrineWall,
    alt: "Shrine wall",
    position: "left-[35%] top-[35%] w-[30%]",
  },
  {
    src: toriiGate,
    alt: "Japanese torii gate",
    position: "left-[39%] top-[27%] w-[23%]",
  },
  {
    src: koiPond,
    alt: "Koi pond",
    position: "left-[7%] bottom-[18%] w-[22%]",
  },
  {
    src: lotusLily,
    alt: "Lotus lily pads",
    position: "left-[12%] bottom-[21%] w-[12%]",
  },
  {
    src: woodenBridge,
    alt: "Wooden bridge",
    position: "left-[25%] bottom-[19%] w-[23%]",
  },
  {
    src: stonePath,
    alt: "Mossy stone path",
    position: "left-[43%] bottom-[7%] w-[28%]",
  },
  {
    src: stoneSteps,
    alt: "Stone steps",
    position: "left-[44%] bottom-[17%] w-[17%]",
  },
  {
    src: stoneLantern,
    alt: "Stone lantern",
    position: "right-[17%] bottom-[24%] w-[9%]",
  },
  {
    src: paperLantern,
    alt: "Paper lantern",
    position: "right-[8%] top-[39%] w-[7%]",
  },
  {
    src: stoneWell,
    alt: "Stone well",
    position: "right-[8%] bottom-[15%] w-[13%]",
  },
  {
    src: rockCluster,
    alt: "Rock cluster",
    position: "left-[31%] bottom-[10%] w-[10%]",
  },
  {
    src: fallenLog,
    alt: "Fallen log",
    position: "right-[31%] bottom-[9%] w-[12%]",
  },
  {
    src: woodenFence,
    alt: "Wooden fence",
    position: "left-[3%] bottom-[7%] w-[18%]",
  },
];

const sectionKicker =
  "text-xs font-bold uppercase tracking-[0.2em] text-cozy-sage-dark";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cozy-sage-dark px-7 py-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-cozy-dark hover:shadow-lg";

const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-cozy-brown/20 bg-cozy-paper/70 px-7 py-4 text-sm font-bold text-cozy-dark transition-all duration-300 hover:-translate-y-1 hover:border-cozy-sage-dark hover:bg-white";

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* HERO */}
      <section className="relative bg-cozy-cream px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-12 lg:pt-28">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute left-[5%] top-20 animate-pulse text-4xl text-cozy-rose/50">
          ✿
        </div>
        <div className="pointer-events-none absolute right-[8%] top-32 text-3xl text-cozy-sage/60">
          ✧
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
          {/* Hero content */}
          <div className="relative z-10 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cozy-sage/30 bg-cozy-paper px-4 py-2 text-[10px] font-bold tracking-[0.16em] text-cozy-sage-dark shadow-sm sm:text-xs">
              <Sparkles size={14} />
              YOUR LITTLE CORNER OF THE INTERNET
            </div>

            <h1 className="font-serif text-5xl font-semibold leading-[1.12] tracking-tight text-cozy-dark sm:text-6xl lg:text-7xl">
              Your space.
              <br />
              Your people.
              <br />
              <span className="italic text-cozy-rose">
                Your cozy little world.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-cozy-brown/80 sm:text-lg lg:mx-0">
              Create a home that feels like you. Decorate your space, invite
              your favorite people, and enjoy the little moments together.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/get-started" className={primaryButton}>
                Get Started <ArrowRight size={17} />
              </Link>

              <Link to="/about" className={secondaryButton}>
                Discover Cozy Home
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-cozy-brown/70 lg:justify-start">
              <Heart size={14} className="text-cozy-rose" fill="currentColor" />
              A little world made for you and your friends.
            </div>
          </div>

          {/* Pixel art scene */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -top-7 left-5 z-20 inline-flex items-center gap-2 rounded-full border border-cozy-sage/20 bg-cozy-paper px-4 py-2 text-[10px] font-bold tracking-widest text-cozy-sage-dark shadow-md sm:left-10">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              YOUR HAPPY PLACE
            </div>

            <div className="relative aspect-[1.15] w-full overflow-hidden rounded-[2rem] border-[8px] border-white bg-[#c7dfd0] shadow-[0_25px_70px_rgba(57,68,55,0.16)] sm:rounded-[2.5rem] sm:border-[12px]">
              {/* Sky */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#b9d9df] via-[#d9e8d4] to-[#c0d3a7]" />

              {/* Sun */}
              <div className="absolute right-[15%] top-[9%] h-12 w-12 rounded-full bg-[#f7d99b] shadow-[0_0_35px_rgba(247,217,155,0.7)] sm:h-16 sm:w-16" />

              {/* Clouds */}
              <div className="absolute left-[28%] top-[12%] h-4 w-16 rounded-full bg-white/70 blur-[1px] sm:h-5 sm:w-20" />
              <div className="absolute left-[30%] top-[9%] h-5 w-8 rounded-full bg-white/70 blur-[1px] sm:h-7 sm:w-10" />

              <div className="absolute right-[32%] top-[24%] h-3 w-12 rounded-full bg-white/60 blur-[1px] sm:h-4 sm:w-16" />

              {/* Ground */}
              <div className="absolute inset-x-0 bottom-0 h-[53%] bg-[#9bb58c]" />
              <div className="absolute inset-x-0 bottom-0 h-[43%] bg-[#a9c494]" />

              {/* Ground details */}
              <div className="absolute bottom-[15%] left-[20%] h-3 w-3 rounded-full bg-[#7f9d77]/50" />
              <div className="absolute bottom-[35%] right-[25%] h-2 w-2 rounded-full bg-[#7f9d77]/60" />
              <div className="absolute bottom-[8%] right-[40%] h-2 w-2 rounded-full bg-[#7f9d77]/50" />

              {/* Pixel-art sprites */}
              {sceneSprites.map((sprite, index) => (
                <img
                  key={sprite.alt}
                  src={sprite.src}
                  alt={sprite.alt}
                  draggable="false"
                  className={`absolute z-10 h-auto max-w-none object-contain [image-rendering:pixelated] drop-shadow-sm transition-transform duration-500 hover:scale-110 ${sprite.position}`}
                  style={{ zIndex: 10 + index }}
                />
              ))}

              {/* Scene caption */}
              <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/40 bg-cozy-paper/90 px-4 py-2 text-[10px] font-semibold text-cozy-dark shadow-lg backdrop-blur-sm sm:bottom-6 sm:text-xs">
                <span className="text-base">⌂</span>
                Home is where the cozy is.
              </div>
            </div>

            {/* Floating notes */}
            <div className="absolute -right-2 top-[17%] z-30 flex -rotate-6 items-center gap-2 rounded-2xl border border-cozy-rose/10 bg-cozy-paper px-3 py-3 text-xs font-semibold text-cozy-rose shadow-lg sm:-right-7 sm:px-4">
              <Flower2 size={17} />
              Made with love
            </div>

            <div className="absolute -bottom-5 left-1 z-30 flex rotate-3 items-center gap-2 rounded-2xl border border-cozy-rose/10 bg-cozy-paper px-3 py-3 text-xs font-semibold text-cozy-rose shadow-lg sm:-left-6 sm:px-4">
              <Heart size={17} fill="currentColor" />
              Stay awhile
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 flex max-w-7xl items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] text-cozy-sage-dark/70">
          <Leaf size={14} />
          TAKE A BREATH. YOU'RE HOME.
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="relative bg-cozy-paper px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <span className={sectionKicker}>A LITTLE ESCAPE</span>

          <h2 className="mt-6 font-serif text-4xl font-medium leading-tight text-cozy-dark sm:text-5xl lg:text-6xl">
            More than just a house.
            <br />
            <span className="italic text-cozy-rose">
              It's a place to belong.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-cozy-brown/80 sm:text-lg">
            Cozy Home is your own little virtual space where you can express
            yourself, spend time with friends, and create memories without ever
            leaving your room.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-[10%] hidden gap-8 text-3xl text-cozy-sage/30 sm:flex">
          <span>✿</span>
          <span>✧</span>
          <span>♡</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-cozy-cream px-5 py-24 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className={sectionKicker}>THE COZY EXPERIENCE</span>
              <h2 className="mt-4 font-serif text-4xl font-medium text-cozy-dark sm:text-5xl">
                Little things to love.
              </h2>
            </div>

            <span className="hidden text-5xl text-cozy-rose/50 sm:block">
              ✿
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-cozy-brown/10 bg-cozy-paper p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-cozy-sage/40 hover:shadow-xl"
                >
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-cozy-sage/15 text-cozy-sage-dark transition-all duration-300 group-hover:rotate-[-6deg] group-hover:bg-cozy-sage-dark group-hover:text-white">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>

                  <span className="absolute right-7 top-8 text-xs font-bold tracking-widest text-cozy-brown/30">
                    0{index + 1}
                  </span>

                  <h3 className="font-serif text-xl font-semibold text-cozy-dark">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-cozy-brown/75">
                    {feature.description}
                  </p>

                  <span className="absolute bottom-5 right-6 text-2xl text-cozy-rose/30 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-125">
                    ✧
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOCIAL SECTION */}
      <section className="bg-cozy-paper px-5 py-24 sm:px-8 sm:py-28 lg:px-12">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-[2rem] bg-[#e9eee1] px-7 py-14 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute -right-10 -top-16 text-[13rem] leading-none text-cozy-sage/10">
            ♡
          </div>

          <div className="relative z-10">
            <span className={sectionKicker}>BETTER TOGETHER</span>

            <h2 className="mt-6 font-serif text-4xl font-medium leading-tight text-cozy-dark sm:text-5xl">
              Your friends are
              <br />
              always welcome here.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-cozy-brown/80">
              Invite your friends using a house code. Let them visit your home,
              rearrange furniture, leave notes, and simply enjoy spending time
              together.
            </p>

            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cozy-sage-dark transition-all hover:gap-4 hover:text-cozy-dark"
            >
              Learn more about the experience
              <ArrowUpRight size={17} />
            </Link>
          </div>

          {/* Illustration */}
          <div className="relative flex min-h-[240px] flex-col items-center justify-center">
            <div className="absolute left-[15%] top-[10%] animate-bounce text-3xl text-cozy-rose/60">
              ♡
            </div>

            <div className="absolute right-[15%] top-[20%] text-3xl text-cozy-sage-dark/40">
              ✧
            </div>

            <div className="flex h-40 w-40 items-center justify-center rounded-[2.5rem] border-4 border-white bg-cozy-sage/30 text-8xl text-cozy-sage-dark shadow-xl transition-transform duration-500 hover:rotate-[-5deg] hover:scale-105">
              ⌂
            </div>

            <div className="mt-5 text-lg font-serif italic text-cozy-brown">
              ♡ ✧ ♡
            </div>

            <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
              good times live here
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-cozy-cream px-5 py-28 text-center sm:px-8 sm:py-36">
        <div className="pointer-events-none absolute right-[12%] top-12 text-6xl text-cozy-rose/30">
          ✿
        </div>

        <div className="pointer-events-none absolute bottom-16 left-[10%] text-5xl text-cozy-sage/30">
          ✧
        </div>

        <div className="relative mx-auto max-w-3xl">
          <span className={sectionKicker}>
            YOUR LITTLE ADVENTURE STARTS HERE
          </span>

          <h2 className="mt-7 font-serif text-5xl font-medium leading-tight text-cozy-dark sm:text-6xl lg:text-7xl">
            Come on in.
            <br />
            <span className="italic text-cozy-rose">
              We've saved you a spot.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-cozy-brown/80 sm:text-lg">
            Your cozy little world is waiting. Make yourself at home.
          </p>

          <Link to="/get-started" className={`${primaryButton} mt-9`}>
            Find your cozy place <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
