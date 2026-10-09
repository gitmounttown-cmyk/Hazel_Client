import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import "./Loader.css";

/* ------------------------------------------------------------------
   Four garments hanging on a clothesline, swaying in the breeze.
   Each garment is drawn in a 24x24 box; the FIRST path is the body
   (gets the fill), the rest are details. `dot` = a small button.
------------------------------------------------------------------- */
const GARMENTS = [
  {
    name: "Kurta",
    x: 62,
    y: 50,
    fill: "#F1CB62",
    amp: "7deg",
    dur: "3.0s",
    delay: "-0.4s",
    paths: [
      {
        d: "M9 2.5 5 4.5 2.5 11 5 12 7 9.5V22H17V9.5L19 12 21.5 11 19 4.5 15 2.5Q12 6 9 2.5Z",
      },
      { d: "M12 5V14" },
      { d: "M12 7.5h.01", dot: true },
      { d: "M12 10h.01", dot: true },
      { d: "M12 12.5h.01", dot: true },
    ],
  },
  {
    name: "Shirt",
    x: 141,
    y: 59,
    fill: "#FBF6E9",
    amp: "9deg",
    dur: "2.5s",
    delay: "-1.3s",
    paths: [
      {
        d: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z",
      },
    ],
  },
  {
    name: "Maxi dress",
    x: 220,
    y: 59,
    fill: "#F6DE96",
    amp: "6deg",
    dur: "3.4s",
    delay: "-2.1s",
    paths: [
      { d: "M9.5 6Q12 8.8 14.5 6L15 11 20 22H4L9 11Z" },
      { d: "M9 2 9.5 6M15 2 14.5 6" },
      { d: "M9 11H15" },
      { d: "M10.5 11.5 9.5 22M13.5 11.5 14.5 22" },
    ],
  },
  {
    name: "Nighty",
    x: 299,
    y: 50,
    fill: "#FAF4E2",
    amp: "10deg",
    dur: "2.8s",
    delay: "-0.9s",
    paths: [
      { d: "M9 7 12 10.5 15 7 16 11 19 21H5L8 11Z" },
      { d: "M8.5 2.5 9 7M15.5 2.5 15 7" },
      { d: "M8 11H16" },
      { d: "M5.8 18.2Q7 19.5 8.2 18.2T10.6 18.2 13 18.2 15.4 18.2 17.8 18.2" },
    ],
  },
];

const SCALE = 2.7; // garment size on the line

function Hanging({ g, i }) {
  return (
    <g transform={`translate(${g.x} ${g.y})`}>
      {/* drop-in on load, blown away on exit */}
      <g className="hz-drop" style={{ "--n": i }}>
        {/* swaying from the peg */}
        <g
          className="hz-sway"
          style={{ "--amp": g.amp, "--dur": g.dur, "--delay": g.delay }}
        >
          <g
            transform={`translate(${-12 * SCALE} ${-2.2 * SCALE + 3}) scale(${SCALE})`}
            fill="none"
            stroke="#292626"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {g.paths.map((p, k) => (
              <path
                key={k}
                d={p.d}
                fill={k === 0 ? g.fill : "none"}
                strokeWidth={p.dot ? 1.8 : 1.1}
              />
            ))}
          </g>
          {/* peg */}
          <rect
            x="-3.5"
            y="-7"
            width="7"
            height="14"
            rx="2.2"
            className="hz-peg"
          />
          <line x1="0" y1="-5" x2="0" y2="5" className="hz-peg-line" />
        </g>
      </g>
    </g>
  );
}

/**
 * Hazel page loader.
 * - Garments hang on a clothesline and sway in the breeze.
 * - Stays until the page is loaded AND minDuration has passed.
 * - On exit a gust blows the clothes away, then the loader fades out.
 *
 * Usage: render <Loader /> once at the top of <App />.
 */
export default function Loader({ minDuration = 3200, exitDuration = 1200 }) {
  const [phase, setPhase] = useState("loading"); // loading -> leaving -> done

  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

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

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = setTimeout(() => setPhase("done"), exitDuration + 150);
    return () => clearTimeout(t);
  }, [phase, exitDuration]);

  if (phase === "done") return null;

  return (
    <div
      className={`hz-loader ${phase === "leaving" ? "is-leaving" : ""}`}
      style={{ "--hz-exit": `${exitDuration}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="hz-blob hz-blob--a" />
      <span className="hz-blob hz-blob--b" />

      <div className="hz-stage">
        <div className="hz-scene" aria-hidden="true">
          <Sparkles
            className="hz-spark hz-spark--1"
            size={20}
            strokeWidth={1.5}
          />
          <Sparkles
            className="hz-spark hz-spark--2"
            size={14}
            strokeWidth={1.5}
          />

          <svg viewBox="0 0 360 150" className="hz-svg">
            {/* breeze streaks */}
            <path
              className="hz-wind hz-wind--1"
              d="M10 112 Q70 100 130 112 T250 108"
              pathLength="1"
            />
            <path
              className="hz-wind hz-wind--2"
              d="M90 132 Q160 120 230 132 T350 126"
              pathLength="1"
            />
            <path
              className="hz-wind hz-wind--3"
              d="M0 92 Q40 84 80 92"
              pathLength="1"
            />

            {/* clothesline */}
            <path className="hz-rope" d="M6 40 Q180 82 354 40" pathLength="1" />
            <circle className="hz-post" cx="6" cy="40" r="3.5" />
            <circle className="hz-post" cx="354" cy="40" r="3.5" />

            {GARMENTS.map((g, i) => (
              <Hanging key={g.name} g={g} i={i} />
            ))}
          </svg>
        </div>

        <h1 className="hz-brand" aria-label="Hazel">
          {"Hazel".split("").map((c, i) => (
            <span key={i} aria-hidden="true" style={{ "--i": i }}>
              {c}
            </span>
          ))}
        </h1>

        <div className="hz-stitch" aria-hidden="true">
          <span className="hz-stitch__fill" />
        </div>
      </div>
    </div>
  );
}
