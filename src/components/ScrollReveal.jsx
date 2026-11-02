import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollReveal() {
  const location = useLocation();
  useEffect(() => {
    const selectors = [
      ".intro-section",
      ".features-section",
      ".together-section",
      ".cta-section",
      ".about-hero",
      ".about-story",
      ".about-values",
      ".about-vision",
      ".feature-card",
      ".value-card",
      ".vision-card",
    ];

    const elements = document.querySelectorAll(selectors.join(", "));

    elements.forEach((element, index) => {
      element.setAttribute("data-reveal", "");

      if (
        element.classList.contains("feature-card") ||
        element.classList.contains("value-card")
      ) {
        const cardIndex = Array.from(element.parentElement.children).indexOf(
          element
        );

        element.style.setProperty("--reveal-delay", `${cardIndex * 100}ms`);
      }
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
}
