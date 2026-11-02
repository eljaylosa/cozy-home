import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";

import Home from "./pages/Home";
import About from "./pages/About";

import "./App.css";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [location.pathname]);

  return (
    <>
      <ScrollReveal />
      <Navbar />
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/get-started"
            element={
              <main className="placeholder-page">
                <span className="section-kicker">COMING SOON</span>
                <h1>Your cozy adventure starts here.</h1>
                <p>We're preparing something special for you.</p>
              </main>
            }
          />

          <Route
            path="*"
            element={
              <main className="placeholder-page">
                <h1>Oops! This page doesn't exist.</h1>
              </main>
            }
          />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
