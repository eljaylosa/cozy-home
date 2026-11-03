import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";
import PortalLayout from "./components/layout/PortalLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import GetStarted from "./pages/GetStarted";
import EmailTest from "./pages/EmailTest";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyHouses from "./pages/MyHouses";
import Friends from "./pages/Friends";
import HouseGame from "./pages/HouseGame";

import { useAuth } from "./context/AuthContext";

import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cozy-cream">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cozy-sage/30 border-t-cozy-sage-dark" />
          <p className="mt-4 text-sm font-medium text-cozy-brown/70">
            Preparing your cozy home...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/get-started" replace />;
  }

  return children;
}

function App() {
  const location = useLocation();

  const isAuthPage = location.pathname === "/get-started";
  const isEmailTestPage = location.pathname === "/dev/email-test";
  const isHouseGamePage = location.pathname.startsWith("/house/");

  const isPortalPage = [
    "/dashboard",
    "/profile",
    "/my-house",
    "/friends",
    "/settings",
  ].some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  const isStandalonePage =
    isAuthPage || isEmailTestPage || isPortalPage || isHouseGamePage;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [location.pathname]);

  return (
    <>
      {!isStandalonePage && <ScrollReveal />}
      {!isStandalonePage && <Navbar />}

      <div key={location.pathname} className="page-transition">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/get-started" element={<GetStarted />} />

          {/* Protected portal pages */}
          <Route
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-house" element={<MyHouses />} />
            <Route path="/friends" element={<Friends />} />
          </Route>

          {/* Protected standalone house game */}
          <Route
            path="/house/:houseId"
            element={
              <ProtectedRoute>
                <HouseGame />
              </ProtectedRoute>
            }
          />

          {/* Development only */}
          <Route
            path="/dev/email-test"
            element={
              import.meta.env.DEV ? (
                <EmailTest />
              ) : (
                <main className="flex min-h-screen items-center justify-center bg-cozy-cream">
                  <h1 className="font-serif text-3xl text-cozy-dark">
                    Page not found.
                  </h1>
                </main>
              )
            }
          />

          {/* Not found */}
          <Route
            path="*"
            element={
              <main className="flex min-h-[70vh] flex-col items-center justify-center bg-cozy-cream px-5 text-center">
                <h1 className="font-serif text-4xl font-semibold text-cozy-dark">
                  Oops! This page doesn't exist.
                </h1>
              </main>
            }
          />
        </Routes>
      </div>

      {!isStandalonePage && <Footer />}
    </>
  );
}

export default App;
