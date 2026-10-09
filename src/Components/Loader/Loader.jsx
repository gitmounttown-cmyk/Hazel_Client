import { useEffect, useState } from "react";
import "./Loader.css";

/* ------------------------------------------------------------------
   Two garments: Maxi dress and Nighty.

   Want REAL photos instead? Put transparent-background PNG/WebP files in
   your /public folder and set `image` below, e.g.
     { name: "Maxi dress", image: "/loader/maxi.png" }
   When `image` is set it is used; otherwise the drawn version is shown.
------------------------------------------------------------------- */

const MaxiDress = () => (
  <svg viewBox="0 0 100 150" className="hz-garment" fill="none">
    <defs>
      <linearGradient id="hzMaxiFabric" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F9E6A6" />
        <stop offset="0.5" stopColor="#F1CB62" />
        <stop offset="1" stopColor="#D9A93A" />
      </linearGradient>
      <linearGradient id="hzMaxiShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.14" />
        <stop offset="0.35" stopColor="#000" stopOpacity="0" />
        <stop offset="0.7" stopColor="#fff" stopOpacity="0.18" />
        <stop offset="1" stopColor="#000" stopOpacity="0.16" />
      </linearGradient>
    </defs>

    <ellipse cx="50" cy="148" rx="36" ry="2.6" fill="#292626" opacity="0.12" />

    {/* thin straps */}
    <path
      d="M38 3C37 13 36 20 35 29M62 3C63 13 64 20 65 29"
      stroke="#C9972E"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* fitted bodice with sweetheart neckline */}
    <path
      d="M35 29C40 35 46 32 50 37C54 32 60 35 65 29L66.5 58C60 61 40 61 33.5 58Z"
      fill="url(#hzMaxiFabric)"
    />
    <path
      d="M35 29C40 35 46 32 50 37C54 32 60 35 65 29"
      stroke="#B88820"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* waist band */}
    <path
      d="M33.5 56.5C40 59.5 60 59.5 66.5 56.5L67 62C60 65 40 65 33 62Z"
      fill="#C9972E"
    />

    {/* long flowing skirt */}
    <path
      d="M33 62C42 65 58 65 67 62C72 94 84 124 93 146Q81 151 70 146T48 146T26 146T7 146C16 124 28 94 33 62Z"
      fill="url(#hzMaxiFabric)"
    />
    <path
      d="M33 62C42 65 58 65 67 62C72 94 84 124 93 146Q81 151 70 146T48 146T26 146T7 146C16 124 28 94 33 62Z"
      fill="url(#hzMaxiShade)"
    />

    {/* fabric folds */}
    <g strokeLinecap="round" fill="none">
      <path
        d="M41 65C37 98 29 126 20 147"
        stroke="#8A6414"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      <path
        d="M50 66C50.5 100 49 126 48 150"
        stroke="#8A6414"
        strokeOpacity="0.25"
        strokeWidth="1.4"
      />
      <path
        d="M59 65C63 98 71 126 80 147"
        stroke="#8A6414"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      <path
        d="M45.5 66C43 98 38 126 33 149"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
      <path
        d="M55 66C57 98 62 126 67 149"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
    </g>

    {/* tiny blossoms on the fabric */}
    <g fill="#fff" opacity="0.7">
      <circle cx="40" cy="84" r="1.6" />
      <circle cx="58" cy="90" r="1.6" />
      <circle cx="48" cy="104" r="1.6" />
      <circle cx="68" cy="116" r="1.6" />
      <circle cx="30" cy="118" r="1.6" />
      <circle cx="52" cy="128" r="1.6" />
      <circle cx="74" cy="136" r="1.4" />
      <circle cx="24" cy="136" r="1.4" />
    </g>
  </svg>
);

// scalloped lace along the nighty hem
const laceDots = Array.from({ length: 13 }, (_, i) => {
  const t = i / 12;
  const x = 14 + t * 72;
  const y = 140 + 2 * t * (1 - t) * 6 + 1.6;
  return { x, y };
});

const Nighty = () => (
  <svg viewBox="0 0 100 150" className="hz-garment" fill="none">
    <defs>
      <linearGradient id="hzNightySatin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFDF6" />
        <stop offset="0.5" stopColor="#F6E9C4" />
        <stop offset="1" stopColor="#E7CF92" />
      </linearGradient>
      <linearGradient id="hzNightySheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.1" />
        <stop offset="0.3" stopColor="#fff" stopOpacity="0.5" />
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.14" />
      </linearGradient>
    </defs>

    <ellipse cx="50" cy="148" rx="34" ry="2.4" fill="#292626" opacity="0.12" />

    {/* spaghetti straps */}
    <path
      d="M40 4 43 32M60 4 57 32"
      stroke="#C9A24A"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* satin body: V-neck, empire seam, loose A-line */}
    <path
      d="M38 31 35 62C29 92 21 118 14 140Q50 146 86 140C79 118 71 92 65 62L62 31C59 38 54 44 50 50C46 44 41 38 38 31Z"
      fill="url(#hzNightySatin)"
    />
    <path
      d="M38 31 35 62C29 92 21 118 14 140Q50 146 86 140C79 118 71 92 65 62L62 31C59 38 54 44 50 50C46 44 41 38 38 31Z"
      fill="url(#hzNightySheen)"
    />

    {/* lace bust */}
    <path
      d="M38 31C40 42 45 47 50 50C55 47 60 42 62 31C59 38 54 44 50 50C46 44 41 38 38 31Z"
      fill="#fff"
      opacity="0.9"
    />
    <path
      d="M38 31C41 38 46 44 50 50C54 44 59 38 62 31"
      stroke="#D6B76A"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <g fill="#E2C77C">
      <circle cx="42" cy="38" r="0.9" />
      <circle cx="45" cy="43" r="0.9" />
      <circle cx="58" cy="38" r="0.9" />
      <circle cx="55" cy="43" r="0.9" />
      <circle cx="50" cy="46" r="0.9" />
    </g>

    {/* empire seam + ribbon bow */}
    <path
      d="M35 62C43 66 57 66 65 62"
      stroke="#D6B76A"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M50 64.5 44.5 60.5 44 68.5ZM50 64.5 55.5 60.5 56 68.5Z"
      fill="#F1CB62"
      stroke="#C9972E"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="64.5" r="1.8" fill="#C9972E" />

    {/* soft satin folds */}
    <g strokeLinecap="round">
      <path
        d="M43 68C40 96 34 120 28 142"
        stroke="#9A7A2A"
        strokeOpacity="0.2"
        strokeWidth="1.3"
      />
      <path
        d="M57 68C60 96 66 120 72 142"
        stroke="#9A7A2A"
        strokeOpacity="0.2"
        strokeWidth="1.3"
      />
      <path
        d="M50 68C50 96 50 120 50 144"
        stroke="#9A7A2A"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />
      <path
        d="M46 68C45 96 42 120 40 143"
        stroke="#fff"
        strokeOpacity="0.7"
        strokeWidth="1.2"
      />
    </g>

    {/* scalloped lace hem */}
    <g fill="#fff" stroke="#D6B76A" strokeWidth="0.8">
      {laceDots.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.2" />
      ))}
    </g>
  </svg>
);

const GARMENTS = [
  { name: "Maxi dress", image: null, Drawing: MaxiDress },
  { name: "Nighty", image: null, Drawing: Nighty },
];

const STEP = 1600; // ms per garment

/**
 * Hazel page loader — simple round spinner with a garment inside.
 * Waits for the page to load AND minDuration, then fades out.
 * Usage: render <Loader /> once at the top of <App />.
 */
export default function Loader({ minDuration = 2200, exitDuration = 500 }) {
  const [phase, setPhase] = useState("loading"); // loading -> leaving -> done
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % GARMENTS.length),
      STEP,
    );
    return () => clearInterval(id);
  }, [phase]);

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
    const t = setTimeout(() => setPhase("done"), exitDuration);
    return () => clearTimeout(t);
  }, [phase, exitDuration]);

  if (phase === "done") return null;

  const garment = GARMENTS[index];

  return (
    <div
      className={`hz-loader ${phase === "leaving" ? "is-leaving" : ""}`}
      style={{ "--hz-exit": `${exitDuration}ms`, "--hz-step": `${STEP}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="hz-spinner" aria-hidden="true">
        {/* round track + spinning gold arc */}
        <svg className="hz-spinner__ring" viewBox="0 0 100 100">
          <circle className="hz-spinner__track" cx="50" cy="50" r="46" />
          <circle className="hz-spinner__arc" cx="50" cy="50" r="46" />
        </svg>

        {/* garment swaps inside the circle */}
        <span className="hz-spinner__icon" key={index}>
          {garment.image ? (
            <img
              src={garment.image}
              alt=""
              className="hz-garment"
              draggable="false"
            />
          ) : (
            <garment.Drawing />
          )}
        </span>
      </div>

      <p className="hz-brand">Hazel</p>
    </div>
  );
}
