'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, Users, Compass } from 'lucide-react';

// Smooth wavy bezier path — runs RIGHT (04 Drive) → LEFT (01 Explore)
// Flows smoothly BELOW all card image boxes through the circular step nodes
const PATH_D =
  'M 1160,190 C 1080,190 970,172 906,172 C 840,172 800,200 753,200 C 700,200 650,175 600,175 C 540,175 490,205 447,205 C 400,205 340,178 294,178 C 240,180 190,195 141,195 C 100,195 60,190 30,190';

const STEPS = [
  {
    num: '04',
    title: 'Drive',
    desc: 'Get on the road and enjoy the drive.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=80',
    icon: Compass,
    elevationClass: 'step-pos-4',
  },
  {
    num: '03',
    title: 'Meet',
    desc: 'Schedule a viewing or complete your booking online.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=700&q=80',
    icon: Users,
    elevationClass: 'step-pos-3',
  },
  {
    num: '02',
    title: 'Choose',
    desc: 'Compare, check details and select the perfect car.',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=700&q=80',
    icon: ShieldCheck,
    elevationClass: 'step-pos-2',
  },
  {
    num: '01',
    title: 'Explore',
    desc: 'Browse a curated selection of premium vehicles.',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=80',
    icon: Search,
    elevationClass: 'step-pos-1',
  },
];

// Progress thresholds at which each card fades in (cards are rendered 04→01 left-to-right)
// Step 04 appears first (low threshold), 01 last (high threshold)
const CARD_THRESHOLDS = [0.05, 0.28, 0.56, 0.82]; // [04, 03, 02, 01]

export function ClearerRoute() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const prevAngleRef = useRef(180);
  const prevProgressRef = useRef(0);
  const scrollDirRef = useRef<'down' | 'up'>('down');

  const [pathLength, setPathLength] = useState(1200);
  const [dashOffset, setDashOffset] = useState(1200);
  const [carPos, setCarPos] = useState({ x: 1160, y: 190 });
  const [carAngle, setCarAngle] = useState(180);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Initialise path length once the ref is available
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let rafId: number;

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!wrapperRef.current || !pathRef.current) return;

        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        // scrollable distance = wrapper height − 1 viewport height (the sticky panel)
        const scrollable = wrapperRef.current.offsetHeight - window.innerHeight;
        // How far the wrapper top has scrolled above the viewport top
        const scrolled = Math.max(0, -wrapperRect.top);
        const raw = scrolled / scrollable;
        const prog = Math.min(Math.max(raw, 0), 1);

        // Direction
        if (prog > prevProgressRef.current + 0.001) scrollDirRef.current = 'down';
        else if (prog < prevProgressRef.current - 0.001) scrollDirRef.current = 'up';
        prevProgressRef.current = prog;

        setProgress(prog);

        // Path reveal
        const totalLen = pathRef.current.getTotalLength();
        setPathLength(totalLen);
        setDashOffset(totalLen * (1 - prog));

        // Car position & angle
        const currentLen = prog * totalLen;
        const pt = pathRef.current.getPointAtLength(currentLen);
        const eps = 3;
        const prevPt = pathRef.current.getPointAtLength(Math.max(0, currentLen - eps));
        const nextPt = pathRef.current.getPointAtLength(Math.min(totalLen, currentLen + eps));
        let angle = Math.atan2(nextPt.y - prevPt.y, nextPt.x - prevPt.x) * (180 / Math.PI);

        if (scrollDirRef.current === 'up') angle += 180;

        // Unwrap angle to prevent 360° spins
        let delta = angle - prevAngleRef.current;
        while (delta > 180) { angle -= 360; delta = angle - prevAngleRef.current; }
        while (delta < -180) { angle += 360; delta = angle - prevAngleRef.current; }
        prevAngleRef.current = angle;

        setCarPos({ x: pt.x, y: pt.y });
        setCarAngle(angle);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Render cards in display order (04 on left → 01 on right)
  const displaySteps = [...STEPS].reverse();

  return (
    // Tall wrapper that gives the sticky panel room to scroll
    <div
      ref={wrapperRef}
      className="route-scroll-wrapper"
      id="how-it-works"
      style={{ height: isMobile ? 'auto' : '450vh' }}
    >
      {/* Sticky panel */}
      <div className={`route-sticky-panel${isMobile ? ' route-sticky-panel--static' : ''}`}>
        <div className="container route-container">
          {/* Header */}
          <div className="route-header">
            <div className="section-eyebrow-accent">
              <span className="eyebrow-dash" />
              <span className="eyebrow-text">A CLEARER ROUTE</span>
              <span className="eyebrow-dash" />
            </div>
            <h2 className="route-title">
              From search<br />
              to the <span className="gold-text">driver's seat.</span>
            </h2>
            <p className="route-subtitle">
              A seamless journey, designed around you. Here's how it works.
            </p>
          </div>

          {/* Flow area */}
          <div className="route-flow-wrap">

            {/* ── SVG Path + Car ── */}
            <svg
              className="route-svg-path"
              viewBox="0 0 1200 450"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="rgg" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="80%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
                <linearGradient id="hlg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ghost guideline */}
              <path
                d={PATH_D}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="2"
                strokeDasharray="5 5"
              />

              {/* Revealed golden line */}
              <path
                ref={pathRef}
                d={PATH_D}
                stroke="url(#rgg)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                strokeDashoffset={dashOffset}
                className="route-path-line"
                filter="url(#glow)"
              />

              {/* Driving car */}
              <g
                transform={`translate(${carPos.x},${carPos.y}) rotate(${carAngle})`}
                className="route-animated-car"
              >
                <polygon points="12,0 38,-12 38,12" fill="url(#hlg)" opacity="0.85" />
                <rect x="-14" y="-8" width="28" height="16" rx="4" fill="#090909" stroke="#fbbf24" strokeWidth="1.5" />
                <rect x="-3" y="-5" width="9" height="10" rx="2" fill="#fbbf24" opacity="0.9" />
                <circle cx="12" cy="-5" r="1.5" fill="#ffffff" />
                <circle cx="12" cy="5" r="1.5" fill="#ffffff" />
                <rect x="-14" y="-6" width="2" height="3" fill="#ef4444" />
                <rect x="-14" y="3" width="2" height="3" fill="#ef4444" />
              </g>
            </svg>

            {/* ── Step Cards (04 → 01 left to right) ── */}
            <div className="route-grid">
              {displaySteps.map(({ num, title, desc, image, icon: Icon, elevationClass }, idx) => {
                const cardIndex = STEPS.findIndex((s) => s.num === num);
                const threshold = CARD_THRESHOLDS[cardIndex];
                const visible = isMobile || progress >= threshold;
                return (
                  <div
                    key={num}
                    className={`route-step-card ${elevationClass}`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.93)',
                      transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                      pointerEvents: visible ? 'auto' : 'none',
                    }}
                  >
                    <div className="route-img-box">
                      <img src={image} alt={title} loading="lazy" />
                      <div className="route-img-overlay" />
                    </div>
                    <div className="route-node-point">
                      <div className="node-icon-badge">
                        <Icon size={16} className="node-badge-icon" />
                      </div>
                    </div>
                    <div className="route-step-info">
                      <div className="route-step-header">
                        <span className="route-step-num">{num}</span>
                        <h3 className="route-step-title">{title}</h3>
                      </div>
                      <p className="route-step-desc">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
