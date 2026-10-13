import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ScrollToTopButton.css";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const windowTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;

      // also check any inner scrolling container
      let innerTop = 0;
      document.querySelectorAll("*").forEach((el) => {
        if (el.scrollTop > innerTop) innerTop = el.scrollTop;
      });

      setVisible(Math.max(windowTop, innerTop) > 300);
    };

    document.addEventListener("scroll", onScroll, true);
    onScroll();
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);

  const scrollToTop = () => {
    const targets = new Set([window, document.documentElement, document.body]);

    // add every element that is currently scrolled down
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollTop > 0) targets.add(el);
    });

    targets.forEach((t) => {
      try {
        t.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        t.scrollTop = 0;
      }
    });
  };

  return createPortal(
    <button
      type="button"
      className={`scroll-top-btn ${visible ? "show" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>,
    document.body,
  );
};

export default ScrollToTopButton;
