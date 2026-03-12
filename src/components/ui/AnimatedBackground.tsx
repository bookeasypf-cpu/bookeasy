"use client";

/**
 * AnimatedBackground — Full-coverage hero background
 *
 * - Full-screen gradient orbs, dot-grid, floating particles (original style)
 * - Detailed SVG silhouettes of Tahiti-Nui, Tahiti-Iti, Moorea (precise coastlines)
 * - Animated stroke drawing + glow halos
 * - Luminous merchant hotspots (Papeete, Punaauia, Faa'a, Arue, Moorea villages)
 * - Travel routes between islands with animated dots
 * - Scintillating dots along coastlines
 */

/* ── Merchant hotspot data ── */
const HOTSPOTS = [
  // Tahiti
  { cx: 815, cy: 158, r: 4, color: "#0066FF", label: "Papeete", size: "lg", delay: 5 },
  { cx: 745, cy: 200, r: 3, color: "#00B4D8", label: "Faa'a", size: "md", delay: 5.6 },
  { cx: 715, cy: 278, r: 3, color: "#0066FF", label: "Punaauia", size: "md", delay: 6.2 },
  { cx: 870, cy: 160, r: 2.5, color: "#00B4D8", label: "Arue", size: "sm", delay: 6.8 },
  { cx: 762, cy: 370, r: 2, color: "#0066FF", label: "Paea", size: "sm", delay: 7.2 },
  // Moorea
  { cx: 484, cy: 186, r: 3, color: "#00B4D8", label: "Maharepa", size: "md", delay: 6 },
  { cx: 370, cy: 252, r: 2.5, color: "#0066FF", label: "Haapiti", size: "sm", delay: 6.6 },
  { cx: 445, cy: 218, r: 2, color: "#00B4D8", label: "Paopao", size: "sm", delay: 7 },
];

/* ── Detailed island paths (precise coastlines with many bezier curves) ── */
const TAHITI_NUI =
  "M 815,150" +
  " C 828,147 842,146 855,148" + // Papeete E → Pirae
  " C 868,151 880,157 890,164" + // Pirae → Arue
  " C 898,170 906,178 914,188" + // Arue coast
  " C 920,196 925,192 928,198" + // Point Venus promontory
  " C 932,206 938,218 944,232" + // Mahina → Papenoo
  " C 950,248 954,264 956,282" + // East coast
  " C 958,300 954,316 946,330" + // Tiarei area
  " C 938,342 928,352 916,358" + // Towards isthmus
  " C 906,362 898,360 892,358" + // Taravao isthmus
  " C 886,356 880,358 876,362" + // Isthmus narrows
  " C 868,368 858,375 846,380" + // South coast W
  " C 832,385 818,386 804,384" + // Papeari
  " C 790,382 776,376 764,368" + // Papara
  " C 752,358 742,346 734,332" + // Paea
  " C 726,318 720,302 716,286" + // Punaauia south
  " C 713,270 714,254 718,240" + // Punaauia center
  " C 722,226 730,214 740,204" + // Punaauia N / Faa'a S
  " C 750,194 762,186 774,180" + // Faa'a airport
  " C 786,174 798,168 808,160" + // Faa'a → Papeete
  " C 812,156 814,152 815,150 Z";

const TAHITI_ITI =
  "M 892,358" +
  " C 900,362 910,370 920,382" + // East coast descending
  " C 930,396 936,412 938,428" + // East coast south
  " C 940,442 937,456 930,464" + // Southern tip area
  " C 922,472 912,474 902,470" + // Te Pari
  " C 892,464 882,454 874,442" + // West coast ascending
  " C 866,428 860,412 858,396" + // West coast
  " C 856,382 858,370 866,362" + // Approaching isthmus
  " C 872,356 882,356 892,358 Z";

const MOOREA =
  "M 350,222" +
  " C 354,208 362,196 372,188" + // NW coast
  " C 380,182 390,178 398,176" + // N coast → Opunohu
  " C 402,176 406,180 408,186" + // W wall Opunohu Bay
  " C 410,194 412,206 413,218" + // Descending into Opunohu
  " C 414,226 416,232 418,228" + // V-bottom Opunohu
  " C 420,220 422,210 424,200" + // Ascending out of Opunohu
  " C 426,190 428,182 432,178" + // E rim Opunohu
  " C 436,176 440,175 444,176" + // Mt Rotui ridge
  " C 447,177 450,180 452,186" + // W wall Cook's Bay
  " C 454,196 456,208 457,220" + // Descending into Cook's
  " C 458,228 460,232 462,226" + // V-bottom Cook's
  " C 464,218 466,208 468,198" + // Ascending out of Cook's
  " C 470,190 474,183 480,180" + // E rim Cook's Bay
  " C 488,178 496,182 504,190" + // NE coast
  " C 512,200 518,214 520,230" + // East coast
  " C 522,248 520,266 514,282" + // SE coast
  " C 506,296 494,306 480,312" + // South coast
  " C 464,318 448,318 434,314" + // S-SW
  " C 420,308 408,298 398,286" + // SW coast
  " C 388,272 380,256 374,240" + // West coast
  " C 368,230 362,226 350,222 Z";

/* ── Travel route from Moorea to Tahiti ── */
const ROUTE_PATH = "M 520,230 C 560,215 620,205 680,212 C 710,218 730,228 750,238";

/* ── Coast paths for traveling dots ── */
const TAHITI_COAST = TAHITI_NUI.replace(" Z", "").replace("M ", "");
const MOOREA_COAST = MOOREA.replace(" Z", "").replace("M ", "");

export function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ═══════════════════════════════════════════════════
          LAYER 1 — FULL-SCREEN GRADIENT ORBS
      ═══════════════════════════════════════════════════ */}
      {[
        { w: 700, h: 700, top: "-20%", right: "-12%", c: "0,102,255", o: 0.10, anim: "ab-orb1", dur: "22s" },
        { w: 600, h: 600, bottom: "0%", left: "-15%", c: "0,180,216", o: 0.08, anim: "ab-orb2", dur: "28s" },
        { w: 450, h: 450, top: "25%", left: "20%", c: "0,102,255", o: 0.06, anim: "ab-orb3", dur: "18s" },
        { w: 500, h: 500, top: "10%", left: "55%", c: "0,180,216", o: 0.05, anim: "ab-orb4", dur: "24s" },
        { w: 400, h: 400, bottom: "-10%", right: "20%", c: "0,102,255", o: 0.07, anim: "ab-orb5", dur: "20s" },
      ].map((orb, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: orb.w,
            height: orb.h,
            top: orb.top,
            bottom: orb.bottom,
            left: orb.left,
            right: orb.right,
            background: `radial-gradient(circle, rgba(${orb.c},${orb.o}) 0%, transparent 70%)`,
            animationName: orb.anim,
            animationDuration: orb.dur,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
          }}
        />
      ))}

      {/* ═══════════════════════════════════════════════════
          LAYER 2 — DOT GRID (full coverage)
      ═══════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,180,216,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />

      {/* ═══════════════════════════════════════════════════
          LAYER 3 — SVG ISLANDS + ROUTES + HOTSPOTS
      ═══════════════════════════════════════════════════ */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1400 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Stroke gradients ── */}
          <linearGradient id="ab-s1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#00B4D8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.50" />
          </linearGradient>
          <linearGradient id="ab-s2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.70" />
          </linearGradient>

          {/* ── Fill gradients ── */}
          <linearGradient id="ab-f1" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#00B4D8" stopOpacity="0.09" />
          </linearGradient>
          <linearGradient id="ab-f2" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.08" />
          </linearGradient>

          {/* ── Glow filters ── */}
          <filter id="ab-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ab-iglow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feFlood floodColor="#00B4D8" floodOpacity="0.12" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ab-pglow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Halos ── */}
          <radialGradient id="ab-h1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.10" />
            <stop offset="55%" stopColor="#00B4D8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ab-h2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.08" />
            <stop offset="55%" stopColor="#0066FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ═══════ TAHITI ═══════ */}
        <g>
          {/* Halo */}
          <ellipse cx="835" cy="280" rx="180" ry="160" fill="url(#ab-h1)" opacity="0">
            <animate attributeName="opacity" values="0;1;1" dur="3.5s" begin="0.5s" fill="freeze" />
          </ellipse>

          {/* Tahiti-Nui (main island — detailed coastline) */}
          <path
            d={TAHITI_NUI}
            fill="url(#ab-f1)"
            stroke="url(#ab-s1)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1200"
            strokeDashoffset="1200"
            filter="url(#ab-iglow)"
            style={{ animation: "ab-draw 4.5s ease-out 0.5s forwards" }}
          />

          {/* Tahiti-Iti (peninsula — detailed coastline) */}
          <path
            d={TAHITI_ITI}
            fill="url(#ab-f1)"
            stroke="url(#ab-s1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset="600"
            filter="url(#ab-iglow)"
            style={{ animation: "ab-draw 3s ease-out 2.5s forwards" }}
          />

          {/* Interior mountain ridgeline */}
          <path
            d="M 760,260 C 780,225 810,215 840,230 C 860,240 880,260 900,280"
            fill="none" stroke="#00B4D8" strokeWidth="0.6" strokeDasharray="4 8" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.22;0.22" dur="2s" begin="5s" fill="freeze" />
          </path>
          <path
            d="M 890,380 C 900,400 910,420 915,440"
            fill="none" stroke="#00B4D8" strokeWidth="0.5" strokeDasharray="3 7" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.18;0.18" dur="2s" begin="5.5s" fill="freeze" />
          </path>

          {/* Reef ring */}
          <ellipse cx="835" cy="290" rx="170" ry="150" fill="none"
            stroke="#00B4D8" strokeWidth="0.6" strokeDasharray="5 16" strokeOpacity="0"
            style={{ animation: "ab-reef 9s ease-in-out infinite" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.10;0.10" dur="2s" begin="4.5s" fill="freeze" />
          </ellipse>

          {/* Traveling glow dot — Tahiti coast */}
          <circle r="3" fill="#00B4D8" filter="url(#ab-glow)">
            <animateMotion dur="16s" repeatCount="indefinite" begin="3s" path={TAHITI_NUI.replace(" Z", "")} />
            <animate attributeName="opacity" values="0;0.6;0.9;0.6;0" dur="16s" repeatCount="indefinite" begin="3s" />
          </circle>
          {/* Second dot, opposite direction offset */}
          <circle r="2" fill="#0066FF" filter="url(#ab-glow)">
            <animateMotion dur="16s" repeatCount="indefinite" begin="11s" path={TAHITI_NUI.replace(" Z", "")} />
            <animate attributeName="opacity" values="0;0.4;0.7;0.4;0" dur="16s" repeatCount="indefinite" begin="11s" />
          </circle>

          {/* Label */}
          <text x="835" y="415" textAnchor="middle" fill="#00B4D8"
            fontSize="12" fontWeight="500" letterSpacing="4" opacity="0"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <animate attributeName="opacity" values="0;0.22;0.22" dur="2s" begin="5.5s" fill="freeze" />
            TAHITI
          </text>
        </g>

        {/* ═══════ MOOREA ═══════ */}
        <g>
          {/* Halo */}
          <ellipse cx="435" cy="250" rx="115" ry="100" fill="url(#ab-h2)" opacity="0">
            <animate attributeName="opacity" values="0;1;1" dur="3.5s" begin="1s" fill="freeze" />
          </ellipse>

          {/* Moorea outline (detailed — Cook's Bay + Opunohu Bay) */}
          <path
            d={MOOREA}
            fill="url(#ab-f2)"
            stroke="url(#ab-s2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="900"
            strokeDashoffset="900"
            filter="url(#ab-iglow)"
            style={{ animation: "ab-draw 4s ease-out 1.2s forwards" }}
          />

          {/* Bay detail accents (Opunohu + Cook's) */}
          <path d="M 408,186 C 410,194 412,206 413,218 C 414,226 416,232 418,228 C 420,220 422,210 424,200"
            fill="none" stroke="#00B4D8" strokeWidth="0.7" strokeOpacity="0" strokeLinecap="round"
          >
            <animate attributeName="stroke-opacity" values="0;0.35;0.35" dur="1.5s" begin="5.2s" fill="freeze" />
          </path>
          <path d="M 452,186 C 454,196 456,208 457,220 C 458,228 460,232 462,226 C 464,218 466,208 468,198"
            fill="none" stroke="#00B4D8" strokeWidth="0.7" strokeOpacity="0" strokeLinecap="round"
          >
            <animate attributeName="stroke-opacity" values="0;0.35;0.35" dur="1.5s" begin="5.4s" fill="freeze" />
          </path>

          {/* Mountain ridge between bays (Mt Rotui) */}
          <path d="M 420,200 C 430,188 440,186 450,196"
            fill="none" stroke="#00B4D8" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.2;0.2" dur="2s" begin="5.8s" fill="freeze" />
          </path>

          {/* Reef ring */}
          <ellipse cx="435" cy="250" rx="110" ry="90" fill="none"
            stroke="#0066FF" strokeWidth="0.5" strokeDasharray="4 14" strokeOpacity="0"
            style={{ animation: "ab-reef 8s ease-in-out infinite 1.5s" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.08;0.08" dur="2s" begin="5s" fill="freeze" />
          </ellipse>

          {/* Traveling glow dot — Moorea coast */}
          <circle r="2.5" fill="#0066FF" filter="url(#ab-glow)">
            <animateMotion dur="12s" repeatCount="indefinite" begin="4s" path={MOOREA.replace(" Z", "")} />
            <animate attributeName="opacity" values="0;0.5;0.8;0.5;0" dur="12s" repeatCount="indefinite" begin="4s" />
          </circle>

          {/* Label */}
          <text x="435" y="342" textAnchor="middle" fill="#0066FF"
            fontSize="10" fontWeight="500" letterSpacing="3" opacity="0"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <animate attributeName="opacity" values="0;0.20;0.20" dur="2s" begin="6s" fill="freeze" />
            MOOREA
          </text>
        </g>

        {/* ═══════ TRAVEL ROUTES ═══════ */}
        <g>
          {/* Base dashed route */}
          <path d={ROUTE_PATH} fill="none" stroke="#00B4D8"
            strokeWidth="1" strokeDasharray="6 12" strokeOpacity="0" strokeLinecap="round"
          >
            <animate attributeName="stroke-opacity" values="0;0.18;0.18" dur="2s" begin="5.5s" fill="freeze" />
          </path>
          {/* Animated flow overlay */}
          <path d={ROUTE_PATH} fill="none" stroke="#00B4D8"
            strokeWidth="1.5" strokeDasharray="10 42" strokeOpacity="0" strokeLinecap="round"
            style={{ animation: "ab-route 4s linear infinite" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.30;0.30" dur="2s" begin="5.5s" fill="freeze" />
          </path>
          {/* Traveling dot — Moorea → Tahiti */}
          <circle r="3" fill="#00B4D8" filter="url(#ab-glow)">
            <animateMotion dur="5s" repeatCount="indefinite" begin="5.5s" path={ROUTE_PATH} />
            <animate attributeName="opacity" values="0;0.5;0.9;0.5;0" dur="5s" repeatCount="indefinite" begin="5.5s" />
          </circle>
          {/* Return dot — Tahiti → Moorea */}
          <circle r="2" fill="#0066FF" filter="url(#ab-glow)">
            <animateMotion dur="5s" repeatCount="indefinite" begin="8s"
              path="M 750,238 C 730,228 710,218 680,212 C 620,205 560,215 520,230" />
            <animate attributeName="opacity" values="0;0.4;0.7;0.4;0" dur="5s" repeatCount="indefinite" begin="8s" />
          </circle>
        </g>

        {/* ═══════ MERCHANT HOTSPOTS ═══════ */}
        {HOTSPOTS.map((h, i) => {
          const pulseR = h.size === "lg" ? 10 : h.size === "md" ? 7 : 5;
          const dur = h.size === "lg" ? "3s" : h.size === "md" ? "3.5s" : "4s";
          const maxOp = h.size === "lg" ? "0.7" : h.size === "md" ? "0.5" : "0.4";
          const ringOp = h.size === "lg" ? "0.6" : h.size === "md" ? "0.45" : "0.3";
          return (
            <g key={`hs-${i}`} filter="url(#ab-pglow)">
              {/* Expanding ring */}
              <circle cx={h.cx} cy={h.cy} r={h.r} fill={h.color} opacity="0">
                <animate attributeName="opacity" values={`0;${ringOp};0`} dur={dur} begin={`${h.delay}s`} repeatCount="indefinite" />
                <animate attributeName="r" values={`${h.r};${pulseR};${h.r}`} dur={dur} begin={`${h.delay}s`} repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle cx={h.cx} cy={h.cy} r={h.r * 0.6} fill={h.color} opacity="0">
                <animate attributeName="opacity" values={`0;${maxOp};${Number(maxOp) * 0.5}`} dur={dur} begin={`${h.delay}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* ═══════ MOUNTAIN PEAK SCINTILLATION ═══════ */}
        {[
          { cx: 830, cy: 230, r: 2.5, d: "5s", b: "4.5s" },
          { cx: 910, cy: 420, r: 2, d: "5.5s", b: "5.8s" },
          { cx: 435, cy: 210, r: 2, d: "4.5s", b: "5s" },
          { cx: 780, cy: 310, r: 1.5, d: "6s", b: "6.5s" },
        ].map((pk, i) => (
          <circle key={`pk-${i}`} cx={pk.cx} cy={pk.cy} r={pk.r} fill="#00B4D8" opacity="0">
            <animate attributeName="opacity" values="0;0.45;0.15;0.45;0" dur={pk.d} begin={pk.b} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* ═══════════════════════════════════════════════════
          LAYER 4 — FLOATING PARTICLES (full coverage)
      ═══════════════════════════════════════════════════ */}
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={`p-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${1.5 + (i % 3)}px`,
            height: `${1.5 + (i % 3)}px`,
            left: `${3 + ((i * 4.1) % 94)}%`,
            top: `${5 + ((i * 7.3) % 88)}%`,
            background: i % 2 === 0 ? "#0066FF" : "#00B4D8",
            opacity: 0.07 + (i % 5) * 0.025,
            animationName: "ab-particle",
            animationDuration: `${12 + (i % 7) * 3}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${(i % 6) * -2}s`,
          }}
        />
      ))}

      {/* ═══════════════════════════════════════════════════
          KEYFRAMES
      ═══════════════════════════════════════════════════ */}
      <style>{`
        @keyframes ab-orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 18px) scale(1.08); }
          66% { transform: translate(18px, -22px) scale(0.92); }
        }
        @keyframes ab-orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(35px, -20px) scale(1.1); }
          66% { transform: translate(-22px, 28px) scale(0.88); }
        }
        @keyframes ab-orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -18px) scale(1.15); }
        }
        @keyframes ab-orb4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(20px, 25px) scale(1.06); }
          80% { transform: translate(-15px, -12px) scale(0.95); }
        }
        @keyframes ab-orb5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(1.12); }
        }
        @keyframes ab-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ab-route {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -52; }
        }
        @keyframes ab-reef {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes ab-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.06; }
          25% { transform: translateY(-18px) translateX(10px); opacity: 0.15; }
          50% { transform: translateY(-28px) translateX(-6px); opacity: 0.04; }
          75% { transform: translateY(-12px) translateX(-10px); opacity: 0.13; }
        }
      `}</style>
    </div>
  );
}
