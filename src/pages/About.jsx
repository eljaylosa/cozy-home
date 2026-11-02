import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  House,
  Users,
  Palette,
  Coffee,
  Sparkles,
  Flower2,
  Leaf,
  Sprout,
} from "lucide-react";

// Nature
import cherryBlossom from "../assets/images/nature/01_cherry_blossom_tree_32x32.png";
import bambooGrove from "../assets/images/nature/04_bamboo_grove_32x32.png";
import autumnMaple from "../assets/images/nature/05_autumn_maple_tree_32x32.png";
import stonePath from "../assets/images/nature/07_mossy_stone_path_32x32.png";

// Props
import toriiGate from "../assets/images/props/01_torii_gate_32x32.png";
import stoneLantern from "../assets/images/props/02_stone_lantern_32x32.png";
import paperLantern from "../assets/images/props/06_paper_lantern_32x32.png";

const values = [
  {
    icon: House,
    title: "A home of your own",
    description:
      "Build a space that reflects your personality, choose a theme, and make it yours.",
    number: "01",
    accent: "bg-[#e8eddf]",
  },
  {
    icon: Users,
    title: "Made for friendship",
    description:
      "Invite friends into your home and enjoy a shared little world together.",
    number: "02",
    accent: "bg-[#f3e6df]",
  },
  {
    icon: Palette,
    title: "Express yourself",
    description:
      "Arrange furniture, decorate rooms, and bring your imagination to life.",
    number: "03",
    accent: "bg-[#e8e9ef]",
  },
  {
    icon: Coffee,
    title: "Slow down and relax",
    description:
      "Enjoy simple activities, cozy interactions, and peaceful moments.",
    number: "04",
    accent: "bg-[#f3edda]",
  },
];

const sectionKicker =
  "text-xs font-bold uppercase tracking-[0.2em] text-cozy-sage-dark";

export default function About() {
  return (
    <main className="overflow-hidden">
      {/* HERO — EDITORIAL INTRO */}
      <section className="relative bg-cozy-paper px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
            <span className="h-px w-10 bg-cozy-sage-dark" />A little about Cozy
            Home
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            {/* Heading */}
            <div className="relative z-10">
              <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.13] text-cozy-dark sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                Every little
                <br />
                world needs
                <br />
                <span className="italic text-cozy-rose">
                  a place to belong.
                </span>
              </h1>

              <p className="mt-8 max-w-lg text-base leading-8 text-cozy-brown/80 sm:text-lg">
                Cozy Home is a little corner of the internet where you can
                create your own space, meet friends, and make memories one cozy
                moment at a time.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  to="/get-started"
                  className="inline-flex items-center gap-3 rounded-full bg-cozy-sage-dark px-7 py-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-cozy-dark hover:shadow-lg"
                >
                  Explore Cozy Home
                  <ArrowRight size={17} />
                </Link>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-cozy-rose">
                  <Heart size={15} fill="currentColor" />
                  Made for little moments
                </span>
              </div>
            </div>

            {/* Postcard illustration */}
            <div className="relative mx-auto w-full max-w-[470px]">
              <div className="absolute -right-3 -top-7 rotate-6 rounded-lg border border-cozy-brown/10 bg-white px-5 py-3 shadow-md sm:-right-8">
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-cozy-rose">
                  A postcard from
                </span>
                <span className="font-serif text-lg italic text-cozy-dark">
                  our little world
                </span>
              </div>

              <div className="rotate-[-2deg] rounded-sm bg-white p-3 pb-12 shadow-[0_25px_60px_rgba(57,68,55,0.16)] transition-transform duration-500 hover:rotate-0 sm:p-4 sm:pb-14">
                <div className="relative aspect-[4/4.1] overflow-hidden bg-[#c8deda]">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#b8d9df] via-[#dce8d5] to-[#c0d2a8]" />

                  <div className="absolute right-[16%] top-[10%] h-16 w-16 rounded-full bg-[#f7d99b] shadow-[0_0_35px_rgba(247,217,155,0.6)]" />

                  <div className="absolute inset-x-0 bottom-0 h-[52%] bg-[#9bb58c]" />
                  <div className="absolute inset-x-0 bottom-0 h-[35%] bg-[#adc696]" />

                  <img
                    src={cherryBlossom}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute left-[1%] top-[12%] z-10 w-[29%] max-w-none [image-rendering:pixelated]"
                  />

                  <img
                    src={autumnMaple}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute right-[1%] top-[12%] z-10 w-[28%] max-w-none [image-rendering:pixelated]"
                  />

                  <img
                    src={bambooGrove}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute left-[22%] top-[23%] z-10 w-[20%] max-w-none [image-rendering:pixelated]"
                  />

                  <img
                    src={toriiGate}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute left-1/2 top-[29%] z-20 w-[35%] max-w-none -translate-x-1/2 [image-rendering:pixelated]"
                  />

                  <img
                    src={stonePath}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute bottom-[7%] left-[29%] z-20 w-[43%] max-w-none [image-rendering:pixelated]"
                  />

                  <img
                    src={stoneLantern}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute bottom-[17%] right-[14%] z-20 w-[14%] max-w-none [image-rendering:pixelated]"
                  />

                  <img
                    src={paperLantern}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                    className="absolute right-[29%] top-[34%] z-20 w-[10%] max-w-none [image-rendering:pixelated]"
                  />

                  <div className="absolute bottom-4 left-4 z-30 rounded-full bg-cozy-paper/90 px-4 py-2 text-[10px] font-bold tracking-wider text-cozy-dark shadow-md">
                    EST. WITH LOVE ✿
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between px-1">
                  <span className="font-serif text-xl italic text-cozy-dark">
                    Dear friend,
                  </span>
                  <span className="text-xs tracking-[0.2em] text-cozy-rose">
                    ♡ ♡ ♡
                  </span>
                </div>
              </div>

              {/* Decorative stamps */}
              <div className="absolute -bottom-8 -left-5 flex h-20 w-20 rotate-[-12deg] items-center justify-center rounded-full border-2 border-dashed border-cozy-rose/50 bg-cozy-cream text-center text-[9px] font-bold uppercase tracking-widest text-cozy-rose shadow-sm">
                Made
                <br />
                with
                <br />
                love
              </div>

              <div className="absolute -bottom-5 -right-2 text-5xl text-cozy-sage-dark/40">
                ✿
              </div>
            </div>
          </div>

          <div className="mt-24 flex items-center justify-between border-t border-cozy-brown/15 pt-6">
            <span className="text-xs font-medium tracking-wider text-cozy-brown/60">
              A PLACE FOR EVERYONE
            </span>
            <span className="text-xs font-medium tracking-wider text-cozy-brown/60">
              YOUR SPACE. YOUR PEOPLE.
            </span>
          </div>
        </div>
      </section>

      {/* OUR STORY — TIMELINE */}
      <section className="bg-cozy-cream px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <span className={sectionKicker}>WHERE IT BEGAN</span>

              <h2 className="mt-6 max-w-sm font-serif text-4xl font-medium leading-tight text-cozy-dark sm:text-5xl">
                A small idea,
                <br />
                <span className="italic text-cozy-rose">
                  a world of possibilities.
                </span>
              </h2>

              <p className="mt-6 max-w-sm text-base leading-8 text-cozy-brown/75">
                Sometimes the simplest ideas become the most meaningful places.
              </p>

              <div className="mt-10 hidden lg:block">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cozy-sage/15 text-cozy-sage-dark">
                  <Sprout size={42} strokeWidth={1.2} />
                </div>
                <p className="mt-4 font-serif text-xl italic text-cozy-rose">
                  Let something lovely grow.
                </p>
              </div>
            </div>

            <div className="relative space-y-12 border-l border-cozy-sage/40 pl-8 sm:pl-12">
              <article className="relative">
                <span className="absolute -left-[2.55rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-cozy-cream bg-cozy-rose sm:-left-[3.05rem]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cozy-rose">
                  THE IDEA
                </span>

                <h3 className="mt-3 font-serif text-2xl font-semibold text-cozy-dark sm:text-3xl">
                  Everyone deserves a little space of their own.
                </h3>

                <p className="mt-4 max-w-xl text-base leading-8 text-cozy-brown/75">
                  We imagined a place where people could have their own virtual
                  home — somewhere to decorate, personalize, and escape into
                  whenever they wanted.
                </p>
              </article>

              <article className="relative">
                <span className="absolute -left-[2.55rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-cozy-cream bg-cozy-sage-dark sm:-left-[3.05rem]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cozy-sage-dark">
                  THE EXPERIENCE
                </span>

                <h3 className="mt-3 font-serif text-2xl font-semibold text-cozy-dark sm:text-3xl">
                  A home feels better when shared.
                </h3>

                <p className="mt-4 max-w-xl text-base leading-8 text-cozy-brown/75">
                  That little space became something more. Friends could visit
                  each other, chat, leave notes, and spend time together in one
                  shared world.
                </p>
              </article>

              <article className="relative">
                <span className="absolute -left-[2.55rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-cozy-cream bg-cozy-rose sm:-left-[3.05rem]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cozy-rose">
                  TODAY AND BEYOND
                </span>

                <h3 className="mt-3 font-serif text-2xl font-semibold text-cozy-dark sm:text-3xl">
                  A little world that keeps growing.
                </h3>

                <p className="mt-4 max-w-xl text-base leading-8 text-cozy-brown/75">
                  Cozy Home is a browser-based pixel-art social simulator built
                  around creativity, friendship, and the joy of creating
                  memories together.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES — EDITORIAL LIST */}
      <section className="bg-cozy-paper px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-6 border-b border-cozy-brown/15 pb-8 md:flex-row md:items-end">
            <div>
              <span className={sectionKicker}>WHAT WE BELIEVE IN</span>
              <h2 className="mt-5 font-serif text-4xl font-medium text-cozy-dark sm:text-5xl">
                The heart of Cozy Home.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-cozy-brown/75">
              More than decorations and pretty rooms. It's the little things
              that make a place meaningful.
            </p>
          </div>

          <div>
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.number}
                  className="group grid gap-5 border-b border-cozy-brown/15 py-9 transition-colors duration-300 hover:bg-cozy-cream/40 sm:grid-cols-[80px_1fr_1.1fr_50px] sm:items-center sm:gap-8"
                >
                  <span className="font-serif text-3xl italic text-cozy-rose/60">
                    {value.number}
                  </span>

                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${value.accent} text-cozy-sage-dark transition-transform duration-300 group-hover:rotate-[-8deg]`}
                    >
                      <Icon size={25} strokeWidth={1.6} />
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-cozy-dark sm:text-2xl">
                      {value.title}
                    </h3>
                  </div>

                  <p className="max-w-md text-sm leading-7 text-cozy-brown/75">
                    {value.description}
                  </p>

                  <span className="hidden text-2xl text-cozy-rose/50 transition-transform duration-300 group-hover:translate-x-2 sm:block">
                    →
                  </span>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm font-medium text-cozy-rose">
            <Heart size={16} fill="currentColor" />A little thought behind
            everything we create.
          </div>
        </div>
      </section>

      {/* VISION — CLOSING */}
      <section className="relative overflow-hidden bg-[#e5ebdc] px-5 py-28 sm:px-8 sm:py-36 lg:px-12">
        <div className="pointer-events-none absolute -left-10 top-0 text-[12rem] leading-none text-white/30">
          ✿
        </div>

        <div className="pointer-events-none absolute -bottom-16 -right-10 text-[16rem] leading-none text-cozy-sage-dark/10">
          ✧
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-cozy-sage-dark shadow-sm">
            <Sparkles size={29} strokeWidth={1.4} />
          </div>

          <span className={sectionKicker}>A WORLD STILL GROWING</span>

          <h2 className="mt-7 font-serif text-4xl font-medium leading-tight text-cozy-dark sm:text-5xl lg:text-6xl">
            Not just a place to play.
            <br />
            <span className="italic text-cozy-rose">
              A place to feel at home.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-cozy-brown/80 sm:text-lg">
            We hope Cozy Home becomes a little corner of the internet where
            friendships grow, creativity feels natural, and ordinary moments
            turn into lovely memories.
          </p>

          <Link
            to="/get-started"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-cozy-sage-dark px-8 py-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-cozy-dark hover:shadow-lg"
          >
            Find your little place
            <ArrowRight size={17} />
          </Link>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs font-medium tracking-wider text-cozy-rose">
            <Flower2 size={14} />
            YOUR SPACE. YOUR PEOPLE. YOUR COZY LITTLE WORLD.
            <Flower2 size={14} />
          </div>
        </div>
      </section>
    </main>
  );
}
