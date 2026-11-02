import { Link } from "react-router-dom";
import { Heart, Home, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cozy-brown/10 bg-cozy-paper">
      <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-10 pb-10 md:flex-row md:items-start">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 text-xl font-bold tracking-tight text-cozy-dark"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cozy-sage/20 text-cozy-sage-dark transition-transform duration-300 group-hover:rotate-[-8deg]">
                <Home size={19} />
              </span>

              <span>
                cozy<span className="text-cozy-rose">home</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-7 text-cozy-brown/80">
              A little place to call home.
              <br />
              Make memories, one cozy moment at a time.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cozy-brown/50">
              Explore
            </h3>

            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-cozy-dark/75 transition-colors hover:text-cozy-sage-dark"
            >
              Home
              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>

            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-sm font-medium text-cozy-dark/75 transition-colors hover:text-cozy-sage-dark"
            >
              About
              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>

            <Link
              to="/get-started"
              className="group inline-flex items-center gap-2 text-sm font-medium text-cozy-dark/75 transition-colors hover:text-cozy-sage-dark"
            >
              Get Started
              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-cozy-brown/10 py-6 text-xs text-cozy-brown/65 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Cozy Home. All rights reserved.
          </span>

          <span className="inline-flex items-center gap-1.5">
            Made with
            <Heart size={13} className="text-cozy-rose" fill="currentColor" />
            and cozy vibes.
          </span>
        </div>
      </div>
    </footer>
  );
}
