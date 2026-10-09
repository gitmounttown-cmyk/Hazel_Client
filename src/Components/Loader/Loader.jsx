import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import "./Loader.css";

/* ---------- Custom clothing icons (same style as lucide: 24x24, outline) ----------
   lucide-react has no kurta / maxi / nighty icons, so these are drawn to match. */

const IconBase = ({ size = 24, strokeWidth = 1.5, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Kurta: mandarin collar, 3/4 sleeves, long body, button placket
const Kurta = (props) => (
  <IconBase {...props}>
    <path d="M9 2.5 5 4.5 2.5 11 5 12 7 9.5V22H17V9.5L19 12 21.5 11 19 4.5 15 2.5" />
    <path d="M9 2.5Q12 6 15 2.5" />
    <path d="M12 5V14" />
    <path d="M12 7.5h.01M12 10h.01M12 12.5h.01" />
  </IconBase>
);

// Maxi dress: thin straps, fitted bodice, long flowing skirt
const Maxi = (props) => (
  <IconBase {...props}>
    <path d="M9 2 9.5 6M15 2 14.5 6" />
    <path d="M9.5 6Q12 8.8 14.5 6" />
    <path d="M9.5 6 9 11H15L14.5 6" />
    <path d="M9 11 4 22H20L15 11" />
    <path d="M10.5 11.5 9.5 22M13.5 11.5 14.5 22" />
  </IconBase>
);

// Nighty: spaghetti straps, V-neck, loose A-line with lace hem
const Nighty = (props) => (
  <IconBase {...props}>
    <path d="M8.5 2.5 9 7M15.5 2.5 15 7" />
    <path d="M9 7 12 10.5 15 7" />
    <path d="M9 7 8 11 5 21H19L16 11 15 7" />
    <path d="M8 11H16" />
    <path d="M5.8 18.5Q7 19.8 8.2 18.5T10.6 18.5 13 18.5 15.4 18.5 17.8 18.5 18.2 18.5" />
  </IconBase>
);

// Clothing icons that swap while the site loads
const ICONS = [Kurta, Shirt, Maxi, Nighty];
const STEP = 500; // ms each icon stays on screen

/**
 * Hazel page loader.
 * - Cycles through fashion icons (lucide-react) while the page loads.
 * - Stays until the page is fully loaded AND minDuration has passed.
 * - Fades out, then removes itself from the DOM.
 *
 * Usage: render <Loader /> once at the top of <App />.
 */
export default function Loader({ minDuration = 2400, exitDuration = 700 }) {
  const [phase, setPhase] = useState("loading"); // loading -> leaving -> done
  const [index, setIndex] = useState(0);

  // Swap icon every STEP ms
  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), STEP);
    return () => clearInterval(id);
  }, [phase]);

  // Lock page scroll while visible
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Wait for window load + minimum display time
  useEffect(() => {
    let minTimePassed = false;
    let pageLoaded = document.readyState === "complete";

    const tryFinish = () => {
      if (minTimePassed && pageLoaded) setPhase("leaving");
    };

    const timer = setTimeout(() => {
      minTimePassed = true;
      tryFinish();
    }, minDuration);

    const onLoad = () => {
      pageLoaded = true;
      tryFinish();
    };

    if (!pageLoaded) window.addEventListener("load", onLoad);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
    };
  }, [minDuration]);

  // Remove from DOM after exit animation
  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("done"), exitDuration);
    return () => clearTimeout(t);
  }, [phase, exitDuration]);

  if (phase === "done") return null;

  const Icon = ICONS[index];

  return (
    <div
      className={`hz-loader ${phase === "leaving" ? "is-leaving" : ""}`}
      style={{ "--hz-exit": `${exitDuration}ms`, "--hz-step": `${STEP}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="hz-loader__inner">
        <div className="hz-badge" aria-hidden="true">
          <span className="hz-badge__ring" />
          <span className="hz-badge__disc" />
          {/* key restarts the animation each time the icon changes */}
          <span className="hz-badge__icon" key={index}>
            <Icon size={52} strokeWidth={1.5} />
          </span>
        </div>

        <h1 className="hz-loader__brand">Hazel</h1>

        <div className="hz-stitch" aria-hidden="true">
          <span className="hz-stitch__fill" />
        </div>
      </div>
    </div>
  );
}
