import { Link, NavLink } from "react-router-dom";
import { Home, Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? "bg-cozy-sage/15 text-cozy-sage-dark"
        : "text-cozy-dark/70 hover:bg-cozy-sage/10 hover:text-cozy-sage-dark"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-cozy-brown/10 bg-cozy-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-3 text-xl font-bold tracking-tight text-cozy-dark"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cozy-sage/20 text-cozy-sage-dark transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
            <Home size={21} strokeWidth={2.2} />
          </span>

          <span>
            cozy<span className="text-cozy-rose">home</span>
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-cozy-dark transition-colors hover:bg-cozy-sage/15 md:hidden"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>

          <Link
            to="/get-started"
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-cozy-sage-dark px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cozy-dark hover:shadow-md"
          >
            Get Started
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>

      {/* Mobile navigation */}
      <div
        className={`grid transition-all duration-300 ease-in-out md:hidden ${
          menuOpen
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-2 border-t border-cozy-brown/10 px-5 py-4 sm:px-8">
            <NavLink to="/" end onClick={closeMenu} className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/about" onClick={closeMenu} className={navLinkClass}>
              About
            </NavLink>

            <Link
              to="/get-started"
              onClick={closeMenu}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-cozy-sage-dark px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-cozy-dark"
            >
              Get Started
              <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
