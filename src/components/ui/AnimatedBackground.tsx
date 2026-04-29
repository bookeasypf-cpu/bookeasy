"use client";

/**
 * AnimatedBackground — Full-coverage hero background
 *
 * - Full-screen gradient orbs, dot-grid, floating particles
 * - 3D realistic SVG islands: Tahiti-Nui, Tahiti-Iti, Moorea
 *   → Multi-layer elevation fills (5 concentric layers per island)
 *   → Lagoon/reef turquoise glow hugging coastlines
 *   → Mountain ridges radiating from peaks
 *   → Summit glow with scintillation
 *   → Deep 3D shadows with perspective transform
 * - Animated stroke drawing + glow halos
 * - Luminous merchant hotspots
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
  " C 828,147 842,146 855,148" +
  " C 868,151 880,157 890,164" +
  " C 898,170 906,178 914,188" +
  " C 920,196 925,192 928,198" +
  " C 932,206 938,218 944,232" +
  " C 950,248 954,264 956,282" +
  " C 958,300 954,316 946,330" +
  " C 938,342 928,352 916,358" +
  " C 906,362 898,360 892,358" +
  " C 886,356 880,358 876,362" +
  " C 868,368 858,375 846,380" +
  " C 832,385 818,386 804,384" +
  " C 790,382 776,376 764,368" +
  " C 752,358 742,346 734,332" +
  " C 726,318 720,302 716,286" +
  " C 713,270 714,254 718,240" +
  " C 722,226 730,214 740,204" +
  " C 750,194 762,186 774,180" +
  " C 786,174 798,168 808,160" +
  " C 812,156 814,152 815,150 Z";

const TAHITI_ITI =
  "M 892,358" +
  " C 900,362 910,370 920,382" +
  " C 930,396 936,412 938,428" +
  " C 940,442 937,456 930,464" +
  " C 922,472 912,474 902,470" +
  " C 892,464 882,454 874,442" +
  " C 866,428 860,412 858,396" +
  " C 856,382 858,370 866,362" +
  " C 872,356 882,356 892,358 Z";

const MOOREA =
  "M 350,222" +
  " C 354,208 362,196 372,188" +
  " C 380,182 390,178 398,176" +
  " C 402,176 406,180 408,186" +
  " C 410,194 412,206 413,218" +
  " C 414,226 416,232 418,228" +
  " C 420,220 422,210 424,200" +
  " C 426,190 428,182 432,178" +
  " C 436,176 440,175 444,176" +
  " C 447,177 450,180 452,186" +
  " C 454,196 456,208 457,220" +
  " C 458,228 460,232 462,226" +
  " C 464,218 466,208 468,198" +
  " C 470,190 474,183 480,180" +
  " C 488,178 496,182 504,190" +
  " C 512,200 518,214 520,230" +
  " C 522,248 520,266 514,282" +
  " C 506,296 494,306 480,312" +
  " C 464,318 448,318 434,314" +
  " C 420,308 408,298 398,286" +
  " C 388,272 380,256 374,240" +
  " C 368,230 362,226 350,222 Z";

/* ── Travel route from Moorea to Tahiti ── */
const ROUTE_PATH = "M 520,230 C 560,215 620,205 680,212 C 710,218 730,228 750,238";

/* ── Island center coordinates for elevation layer scaling ── */
const TAHITI_NUI_CENTER = { x: 835, y: 265 };
const TAHITI_ITI_CENTER = { x: 898, y: 416 };
const MOOREA_CENTER = { x: 435, y: 248 };

/* ── Ridge lines for Tahiti-Nui (from Orohena peak outward) ── */
const TAHITI_RIDGES = [
  "M 838,255 C 825,235 810,215 790,195",       // NW to Faa'a
  "M 838,255 C 850,235 868,218 890,200",        // NE to Arue
  "M 838,255 C 855,270 880,290 910,310",        // E coast
  "M 838,255 C 850,280 860,310 870,340",        // SE to isthmus
  "M 838,255 C 830,280 820,310 810,340",        // S to Papara
  "M 838,255 C 815,270 790,290 765,310",        // SW to Paea
  "M 838,255 C 820,260 800,265 780,275",        // W to Punaauia
  "M 838,255 C 845,245 860,235 880,225",        // NE mid
  "M 838,255 C 830,275 825,295 825,320",        // S center
  "M 838,255 C 852,260 870,270 895,285",        // ESE
];

/* ── Ridge lines for Tahiti-Iti ── */
const ITI_RIDGES = [
  "M 898,416 C 910,400 918,385 925,370",
  "M 898,416 C 885,400 878,385 872,370",
  "M 898,416 C 910,430 920,445 925,458",
  "M 898,416 C 885,430 878,445 875,455",
];

/* ── Ridge lines for Moorea ── */
const MOOREA_RIDGES = [
  "M 442,238 C 430,220 418,205 410,192",  // NW to Opunohu bay
  "M 442,238 C 455,218 462,200 468,190",  // NE to Cook's bay
  "M 442,238 C 460,250 480,265 500,280",  // E coast
  "M 442,238 C 450,260 455,280 460,300",  // SE
  "M 442,238 C 430,260 420,280 410,295",  // SW
  "M 442,238 C 420,245 400,255 380,265",  // W coast
  "M 442,238 C 435,225 428,210 420,200",  // NW inner
  "M 442,238 C 450,230 458,218 464,205",  // NE inner
];

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
        style={{
          transform: "perspective(1000px) rotateX(10deg) rotateY(-3deg)",
          transformOrigin: "center 55%",
        }}
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

          {/* ── Base fill gradients (ocean floor under islands) ── */}
          <linearGradient id="ab-f1" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#00B4D8" stopOpacity="0.09" />
          </linearGradient>
          <linearGradient id="ab-f2" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.08" />
          </linearGradient>

          {/* ── 3D Terrain elevation gradients — 5 layers per island ── */}
          {/* Layer 0: Lagoon / reef shelf (outermost, turquoise) */}
          <radialGradient id="ab-lagoon-t" cx="48%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#00B4D8" stopOpacity="0.12" />
            <stop offset="85%" stopColor="#0099CC" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#006688" stopOpacity="0.03" />
          </radialGradient>
          <radialGradient id="ab-lagoon-m" cx="50%" cy="40%" r="56%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.05" />
            <stop offset="60%" stopColor="#00B4D8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#006688" stopOpacity="0.03" />
          </radialGradient>

          {/* Layer 1: Coastal lowlands (dark green-teal) */}
          <radialGradient id="ab-elev1-t" cx="46%" cy="40%" r="52%">
            <stop offset="0%" stopColor="#0D7377" stopOpacity="0.22" />
            <stop offset="40%" stopColor="#0A5F5F" stopOpacity="0.16" />
            <stop offset="80%" stopColor="#0B4D4D" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#083838" stopOpacity="0.06" />
          </radialGradient>
          <radialGradient id="ab-elev1-m" cx="50%" cy="38%" r="50%">
            <stop offset="0%" stopColor="#0D7377" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#0A5F5F" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#083838" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="ab-elev1-iti" cx="48%" cy="38%" r="50%">
            <stop offset="0%" stopColor="#0D7377" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#0A5F5F" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#083838" stopOpacity="0.04" />
          </radialGradient>

          {/* Layer 2: Mid-elevation (green with more vibrancy) */}
          <radialGradient id="ab-elev2-t" cx="45%" cy="38%" r="45%">
            <stop offset="0%" stopColor="#10A37F" stopOpacity="0.20" />
            <stop offset="35%" stopColor="#0D8B6C" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#0A7058" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#085545" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="ab-elev2-m" cx="48%" cy="36%" r="42%">
            <stop offset="0%" stopColor="#10A37F" stopOpacity="0.18" />
            <stop offset="40%" stopColor="#0D8B6C" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#085545" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="ab-elev2-iti" cx="48%" cy="36%" r="42%">
            <stop offset="0%" stopColor="#10A37F" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#0D8B6C" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#085545" stopOpacity="0.03" />
          </radialGradient>

          {/* Layer 3: High elevation (bright teal-emerald) */}
          <radialGradient id="ab-elev3-t" cx="44%" cy="35%" r="35%">
            <stop offset="0%" stopColor="#14D9A5" stopOpacity="0.18" />
            <stop offset="40%" stopColor="#10B88E" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#0A8B6C" stopOpacity="0.06" />
          </radialGradient>
          <radialGradient id="ab-elev3-m" cx="46%" cy="34%" r="32%">
            <stop offset="0%" stopColor="#14D9A5" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#10B88E" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0A8B6C" stopOpacity="0.04" />
          </radialGradient>

          {/* Layer 4: Summit (bright cyan-white glow) */}
          <radialGradient id="ab-summit-t" cx="45%" cy="35%" r="25%">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.25" />
            <stop offset="30%" stopColor="#22D3EE" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0.02" />
          </radialGradient>
          <radialGradient id="ab-summit-m" cx="48%" cy="34%" r="22%">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.22" />
            <stop offset="35%" stopColor="#22D3EE" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0.02" />
          </radialGradient>

          {/* ── Reef edge glow (tight around coastline) ── */}
          <filter id="ab-reef-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feFlood floodColor="#00E5FF" floodOpacity="0.25" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

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

          {/* ── Deep 3D shadow ── */}
          <filter id="ab-shadow-deep" x="-15%" y="-10%" width="140%" height="150%">
            <feDropShadow dx="6" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.40" />
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.20" />
          </filter>
          <filter id="ab-shadow-md" x="-10%" y="-5%" width="130%" height="140%">
            <feDropShadow dx="4" dy="7" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
            <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
          </filter>

          {/* ── Island ambient glow (terrain light) ── */}
          <filter id="ab-terrain-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feFlood floodColor="#14D9A5" floodOpacity="0.08" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
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

        {/* ═══════ TAHITI-NUI ═══════ */}
        <g>
          {/* Halo */}
          <ellipse cx="835" cy="280" rx="180" ry="160" fill="url(#ab-h1)" opacity="0">
            <animate attributeName="opacity" values="0;1;1" dur="3.5s" begin="0.5s" fill="freeze" />
          </ellipse>

          {/* Deep 3D shadow — offset + blurred */}
          <path
            d={TAHITI_NUI}
            fill="rgba(0,0,0,0.35)"
            stroke="none"
            transform={`translate(8, 12)`}
            style={{ filter: "blur(14px)", opacity: 0, animation: "ab-fade-in 2s ease-out 0.8s forwards" }}
          />
          {/* Secondary shadow — closer, sharper */}
          <path
            d={TAHITI_NUI}
            fill="rgba(0,0,0,0.18)"
            stroke="none"
            transform={`translate(3, 5)`}
            style={{ filter: "blur(6px)", opacity: 0, animation: "ab-fade-in 2s ease-out 0.8s forwards" }}
          />

          {/* Lagoon / reef shelf (widest, turquoise glow) */}
          <path
            d={TAHITI_NUI}
            fill="url(#ab-lagoon-t)"
            stroke="#00E5FF"
            strokeWidth="2.5"
            strokeOpacity="0.15"
            filter="url(#ab-reef-glow)"
            transform={`translate(${TAHITI_NUI_CENTER.x},${TAHITI_NUI_CENTER.y}) scale(1.06) translate(${-TAHITI_NUI_CENTER.x},${-TAHITI_NUI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2.5s ease-out 1.2s forwards" }}
          />

          {/* Elevation Layer 1 — Coastal lowlands */}
          <path
            d={TAHITI_NUI}
            fill="url(#ab-elev1-t)"
            stroke="none"
            filter="url(#ab-terrain-glow)"
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 1.5s forwards" }}
          />

          {/* Elevation Layer 2 — Mid slopes (scaled inward ~88%) */}
          <path
            d={TAHITI_NUI}
            fill="url(#ab-elev2-t)"
            stroke="none"
            transform={`translate(${TAHITI_NUI_CENTER.x},${TAHITI_NUI_CENTER.y}) scale(0.88) translate(${-TAHITI_NUI_CENTER.x},${-TAHITI_NUI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 2s forwards" }}
          />

          {/* Elevation Layer 3 — High terrain (scaled ~72%) */}
          <path
            d={TAHITI_NUI}
            fill="url(#ab-elev3-t)"
            stroke="none"
            transform={`translate(${TAHITI_NUI_CENTER.x},${TAHITI_NUI_CENTER.y}) scale(0.72) translate(${-TAHITI_NUI_CENTER.x},${-TAHITI_NUI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 2.5s forwards" }}
          />

          {/* Elevation Layer 4 — Summit zone (scaled ~48%) */}
          <path
            d={TAHITI_NUI}
            fill="url(#ab-summit-t)"
            stroke="none"
            transform={`translate(${TAHITI_NUI_CENTER.x},${TAHITI_NUI_CENTER.y}) scale(0.48) translate(${-TAHITI_NUI_CENTER.x},${-TAHITI_NUI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 3s forwards" }}
          />

          {/* Coastline stroke (drawn on) */}
          <path
            d={TAHITI_NUI}
            fill="none"
            stroke="url(#ab-s1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1200"
            strokeDashoffset="1200"
            style={{ animation: "ab-draw 4.5s ease-out 0.5s forwards" }}
          />

          {/* Inner coastline accent (subtle lighter line) */}
          <path
            d={TAHITI_NUI}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="0.8"
            strokeOpacity="0"
            transform={`translate(${TAHITI_NUI_CENTER.x},${TAHITI_NUI_CENTER.y}) scale(0.97) translate(${-TAHITI_NUI_CENTER.x},${-TAHITI_NUI_CENTER.y})`}
          >
            <animate attributeName="stroke-opacity" values="0;0.20;0.20" dur="2s" begin="5s" fill="freeze" />
          </path>

          {/* ── Mountain ridges radiating from Orohena ── */}
          {TAHITI_RIDGES.map((d, i) => (
            <path
              key={`tr-${i}`}
              d={d}
              fill="none"
              stroke="#00B4D8"
              strokeWidth={i < 3 ? "0.8" : "0.5"}
              strokeDasharray={i < 3 ? "4 10" : "3 8"}
              strokeOpacity="0"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-opacity"
                values={`0;${i < 3 ? "0.22" : "0.14"};${i < 3 ? "0.22" : "0.14"}`}
                dur="2s"
                begin={`${4.5 + i * 0.2}s`}
                fill="freeze"
              />
            </path>
          ))}

          {/* ── Topographic contour lines ── */}
          <path
            d="M 830,165 C 860,160 890,175 910,200 C 935,240 945,280 940,320 C 930,345 910,355 895,358"
            fill="none" stroke="#00B4D8" strokeWidth="0.4" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.10;0.10" dur="2s" begin="4s" fill="freeze" />
          </path>
          <path
            d="M 810,185 C 835,178 860,190 878,215 C 900,250 905,285 895,320 C 885,340 870,350 858,355"
            fill="none" stroke="#00B4D8" strokeWidth="0.5" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.14;0.14" dur="2s" begin="4.5s" fill="freeze" />
          </path>
          <path
            d="M 795,215 C 815,205 840,210 858,235 C 872,260 875,290 865,315"
            fill="none" stroke="#00B4D8" strokeWidth="0.6" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.18;0.18" dur="2s" begin="5s" fill="freeze" />
          </path>
          <path
            d="M 820,240 C 835,232 850,240 855,260 C 858,275 852,290 840,298"
            fill="none" stroke="#67E8F9" strokeWidth="0.7" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.24;0.24" dur="2s" begin="5.5s" fill="freeze" />
          </path>

          {/* Summit glow point — Orohena (2241m) */}
          <circle cx="838" cy="255" r="6" fill="#67E8F9" opacity="0" filter="url(#ab-glow)">
            <animate attributeName="opacity" values="0;0.35;0.15;0.35;0" dur="4s" begin="6s" repeatCount="indefinite" />
            <animate attributeName="r" values="5;7;5" dur="4s" begin="6s" repeatCount="indefinite" />
          </circle>
          {/* Summit inner core */}
          <circle cx="838" cy="255" r="2" fill="#F0FDFA" opacity="0">
            <animate attributeName="opacity" values="0;0.5;0.2;0.5;0" dur="4s" begin="6s" repeatCount="indefinite" />
          </circle>

          {/* Reef ring */}
          <ellipse cx="835" cy="290" rx="170" ry="150" fill="none"
            stroke="#00B4D8" strokeWidth="0.8" strokeDasharray="5 16" strokeOpacity="0"
            style={{ animation: "ab-reef 9s ease-in-out infinite" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.12;0.12" dur="2s" begin="4.5s" fill="freeze" />
          </ellipse>
          {/* Inner reef */}
          <ellipse cx="835" cy="285" rx="148" ry="130" fill="none"
            stroke="#00E5FF" strokeWidth="0.4" strokeDasharray="3 20" strokeOpacity="0"
            style={{ animation: "ab-reef 11s ease-in-out infinite 2s" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.08;0.08" dur="2s" begin="5s" fill="freeze" />
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
          <text x="835" y="420" textAnchor="middle" fill="#00B4D8"
            fontSize="12" fontWeight="500" letterSpacing="4" opacity="0"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <animate attributeName="opacity" values="0;0.22;0.22" dur="2s" begin="5.5s" fill="freeze" />
            TAHITI
          </text>
        </g>

        {/* ═══════ TAHITI-ITI ═══════ */}
        <g>
          {/* Deep shadow */}
          <path
            d={TAHITI_ITI}
            fill="rgba(0,0,0,0.30)"
            stroke="none"
            transform="translate(6, 9)"
            style={{ filter: "blur(10px)", opacity: 0, animation: "ab-fade-in 2s ease-out 2.2s forwards" }}
          />
          <path
            d={TAHITI_ITI}
            fill="rgba(0,0,0,0.15)"
            stroke="none"
            transform="translate(2, 4)"
            style={{ filter: "blur(5px)", opacity: 0, animation: "ab-fade-in 2s ease-out 2.2s forwards" }}
          />

          {/* Lagoon shelf */}
          <path
            d={TAHITI_ITI}
            fill="url(#ab-lagoon-t)"
            stroke="#00E5FF"
            strokeWidth="2"
            strokeOpacity="0.12"
            filter="url(#ab-reef-glow)"
            transform={`translate(${TAHITI_ITI_CENTER.x},${TAHITI_ITI_CENTER.y}) scale(1.06) translate(${-TAHITI_ITI_CENTER.x},${-TAHITI_ITI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2.5s ease-out 2.5s forwards" }}
          />

          {/* Elevation Layer 1 — Coastal */}
          <path
            d={TAHITI_ITI}
            fill="url(#ab-elev1-iti)"
            stroke="none"
            filter="url(#ab-terrain-glow)"
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 2.8s forwards" }}
          />

          {/* Elevation Layer 2 — Mid */}
          <path
            d={TAHITI_ITI}
            fill="url(#ab-elev2-iti)"
            stroke="none"
            transform={`translate(${TAHITI_ITI_CENTER.x},${TAHITI_ITI_CENTER.y}) scale(0.85) translate(${-TAHITI_ITI_CENTER.x},${-TAHITI_ITI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 3.2s forwards" }}
          />

          {/* Elevation Layer 3 — High */}
          <path
            d={TAHITI_ITI}
            fill="url(#ab-elev3-t)"
            stroke="none"
            transform={`translate(${TAHITI_ITI_CENTER.x},${TAHITI_ITI_CENTER.y}) scale(0.65) translate(${-TAHITI_ITI_CENTER.x},${-TAHITI_ITI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 3.5s forwards" }}
          />

          {/* Summit glow */}
          <path
            d={TAHITI_ITI}
            fill="url(#ab-summit-t)"
            stroke="none"
            transform={`translate(${TAHITI_ITI_CENTER.x},${TAHITI_ITI_CENTER.y}) scale(0.4) translate(${-TAHITI_ITI_CENTER.x},${-TAHITI_ITI_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 3.8s forwards" }}
          />

          {/* Coastline stroke */}
          <path
            d={TAHITI_ITI}
            fill="none"
            stroke="url(#ab-s1)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset="600"
            style={{ animation: "ab-draw 3s ease-out 2.5s forwards" }}
          />

          {/* Ridges */}
          {ITI_RIDGES.map((d, i) => (
            <path
              key={`ir-${i}`}
              d={d}
              fill="none"
              stroke="#00B4D8"
              strokeWidth="0.5"
              strokeDasharray="3 7"
              strokeOpacity="0"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-opacity"
                values="0;0.16;0.16"
                dur="2s"
                begin={`${5.5 + i * 0.2}s`}
                fill="freeze"
              />
            </path>
          ))}

          {/* Summit — Mt Ronui */}
          <circle cx="898" cy="416" r="4" fill="#67E8F9" opacity="0" filter="url(#ab-glow)">
            <animate attributeName="opacity" values="0;0.25;0.10;0.25;0" dur="4.5s" begin="6.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="898" cy="416" r="1.5" fill="#F0FDFA" opacity="0">
            <animate attributeName="opacity" values="0;0.4;0.15;0.4;0" dur="4.5s" begin="6.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ═══════ MOOREA ═══════ */}
        <g>
          {/* Halo */}
          <ellipse cx="435" cy="250" rx="115" ry="100" fill="url(#ab-h2)" opacity="0">
            <animate attributeName="opacity" values="0;1;1" dur="3.5s" begin="1s" fill="freeze" />
          </ellipse>

          {/* Deep 3D shadow */}
          <path
            d={MOOREA}
            fill="rgba(0,0,0,0.30)"
            stroke="none"
            transform="translate(6, 9)"
            style={{ filter: "blur(12px)", opacity: 0, animation: "ab-fade-in 2s ease-out 1.2s forwards" }}
          />
          <path
            d={MOOREA}
            fill="rgba(0,0,0,0.15)"
            stroke="none"
            transform="translate(2, 4)"
            style={{ filter: "blur(5px)", opacity: 0, animation: "ab-fade-in 2s ease-out 1.2s forwards" }}
          />

          {/* Lagoon / reef shelf */}
          <path
            d={MOOREA}
            fill="url(#ab-lagoon-m)"
            stroke="#00E5FF"
            strokeWidth="2.2"
            strokeOpacity="0.13"
            filter="url(#ab-reef-glow)"
            transform={`translate(${MOOREA_CENTER.x},${MOOREA_CENTER.y}) scale(1.06) translate(${-MOOREA_CENTER.x},${-MOOREA_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2.5s ease-out 1.5s forwards" }}
          />

          {/* Elevation Layer 1 — Coastal */}
          <path
            d={MOOREA}
            fill="url(#ab-elev1-m)"
            stroke="none"
            filter="url(#ab-terrain-glow)"
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 1.8s forwards" }}
          />

          {/* Elevation Layer 2 — Mid */}
          <path
            d={MOOREA}
            fill="url(#ab-elev2-m)"
            stroke="none"
            transform={`translate(${MOOREA_CENTER.x},${MOOREA_CENTER.y}) scale(0.86) translate(${-MOOREA_CENTER.x},${-MOOREA_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 2.2s forwards" }}
          />

          {/* Elevation Layer 3 — High */}
          <path
            d={MOOREA}
            fill="url(#ab-elev3-m)"
            stroke="none"
            transform={`translate(${MOOREA_CENTER.x},${MOOREA_CENTER.y}) scale(0.68) translate(${-MOOREA_CENTER.x},${-MOOREA_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 2.6s forwards" }}
          />

          {/* Elevation Layer 4 — Summit */}
          <path
            d={MOOREA}
            fill="url(#ab-summit-m)"
            stroke="none"
            transform={`translate(${MOOREA_CENTER.x},${MOOREA_CENTER.y}) scale(0.45) translate(${-MOOREA_CENTER.x},${-MOOREA_CENTER.y})`}
            style={{ opacity: 0, animation: "ab-fade-in 2s ease-out 3s forwards" }}
          />

          {/* Coastline stroke */}
          <path
            d={MOOREA}
            fill="none"
            stroke="url(#ab-s2)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="900"
            strokeDashoffset="900"
            style={{ animation: "ab-draw 4s ease-out 1.2s forwards" }}
          />

          {/* Inner coastline accent */}
          <path
            d={MOOREA}
            fill="none"
            stroke="#00E5FF"
            strokeWidth="0.7"
            strokeOpacity="0"
            transform={`translate(${MOOREA_CENTER.x},${MOOREA_CENTER.y}) scale(0.97) translate(${-MOOREA_CENTER.x},${-MOOREA_CENTER.y})`}
          >
            <animate attributeName="stroke-opacity" values="0;0.18;0.18" dur="2s" begin="5.2s" fill="freeze" />
          </path>

          {/* Bay detail accents (Opunohu + Cook's) */}
          <path d="M 408,186 C 410,194 412,206 413,218 C 414,226 416,232 418,228 C 420,220 422,210 424,200"
            fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0" strokeLinecap="round"
          >
            <animate attributeName="stroke-opacity" values="0;0.30;0.30" dur="1.5s" begin="5.2s" fill="freeze" />
          </path>
          <path d="M 452,186 C 454,196 456,208 457,220 C 458,228 460,232 462,226 C 464,218 466,208 468,198"
            fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeOpacity="0" strokeLinecap="round"
          >
            <animate attributeName="stroke-opacity" values="0;0.30;0.30" dur="1.5s" begin="5.4s" fill="freeze" />
          </path>

          {/* Mountain ridge between bays (Mt Rotui) */}
          <path d="M 420,200 C 430,188 440,186 450,196"
            fill="none" stroke="#14D9A5" strokeWidth="0.7" strokeDasharray="3 6" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.28;0.28" dur="2s" begin="5.8s" fill="freeze" />
          </path>

          {/* ── Moorea ridges ── */}
          {MOOREA_RIDGES.map((d, i) => (
            <path
              key={`mr-${i}`}
              d={d}
              fill="none"
              stroke="#00B4D8"
              strokeWidth={i < 2 ? "0.7" : "0.4"}
              strokeDasharray={i < 2 ? "4 9" : "3 8"}
              strokeOpacity="0"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-opacity"
                values={`0;${i < 2 ? "0.20" : "0.12"};${i < 2 ? "0.20" : "0.12"}`}
                dur="2s"
                begin={`${4.5 + i * 0.2}s`}
                fill="freeze"
              />
            </path>
          ))}

          {/* ── Moorea topographic contour lines ── */}
          <path d="M 380,200 C 400,192 430,188 460,195 C 490,205 510,225 515,255"
            fill="none" stroke="#00B4D8" strokeWidth="0.4" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.10;0.10" dur="2s" begin="4.5s" fill="freeze" />
          </path>
          <path d="M 395,215 C 415,205 440,202 460,212 C 485,225 498,248 495,270"
            fill="none" stroke="#00B4D8" strokeWidth="0.5" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.14;0.14" dur="2s" begin="5s" fill="freeze" />
          </path>
          <path d="M 420,230 C 435,222 455,225 465,240 C 472,252 468,265 458,272"
            fill="none" stroke="#67E8F9" strokeWidth="0.5" strokeOpacity="0"
          >
            <animate attributeName="stroke-opacity" values="0;0.20;0.20" dur="2s" begin="5.5s" fill="freeze" />
          </path>

          {/* Summit glow — Mt Tohivea (1207m) */}
          <circle cx="442" cy="238" r="5" fill="#67E8F9" opacity="0" filter="url(#ab-glow)">
            <animate attributeName="opacity" values="0;0.28;0.12;0.28;0" dur="4.5s" begin="6.5s" repeatCount="indefinite" />
            <animate attributeName="r" values="4;6;4" dur="4.5s" begin="6.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="442" cy="238" r="1.5" fill="#F0FDFA" opacity="0">
            <animate attributeName="opacity" values="0;0.45;0.2;0.45;0" dur="4.5s" begin="6.5s" repeatCount="indefinite" />
          </circle>

          {/* Reef rings */}
          <ellipse cx="435" cy="250" rx="110" ry="90" fill="none"
            stroke="#0066FF" strokeWidth="0.7" strokeDasharray="4 14" strokeOpacity="0"
            style={{ animation: "ab-reef 8s ease-in-out infinite 1.5s" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.10;0.10" dur="2s" begin="5s" fill="freeze" />
          </ellipse>
          <ellipse cx="435" cy="248" rx="95" ry="78" fill="none"
            stroke="#00E5FF" strokeWidth="0.3" strokeDasharray="3 18" strokeOpacity="0"
            style={{ animation: "ab-reef 10s ease-in-out infinite 3s" }}
          >
            <animate attributeName="stroke-opacity" values="0;0.07;0.07" dur="2s" begin="5.5s" fill="freeze" />
          </ellipse>

          {/* Traveling glow dot — Moorea coast */}
          <circle r="2.5" fill="#0066FF" filter="url(#ab-glow)">
            <animateMotion dur="12s" repeatCount="indefinite" begin="4s" path={MOOREA.replace(" Z", "")} />
            <animate attributeName="opacity" values="0;0.5;0.8;0.5;0" dur="12s" repeatCount="indefinite" begin="4s" />
          </circle>

          {/* Label */}
          <text x="435" y="345" textAnchor="middle" fill="#0066FF"
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
        @keyframes ab-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
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
