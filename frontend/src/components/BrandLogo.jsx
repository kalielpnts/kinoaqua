import { useId } from 'react';
import { motion } from 'framer-motion';

const CX = 26;
const CY = 32;
const HOLES = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  return { x: CX + Math.cos(a) * 11, y: CY + Math.sin(a) * 11 };
});

// Logo vetorial: rolo de cinema com feixe de projetor. Gradiente indigo -> verde-agua.
export default function BrandLogo({ size = 40, showText = true, animated = true, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ring = `ka-ring-${uid}`;
  const beam = `ka-beam-${uid}`;

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label="KinoAqua"
        className="shrink-0 overflow-visible"
      >
        <defs>
          <linearGradient id={ring} x1="6" y1="10" x2="46" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00F5D4" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
          <linearGradient id={beam} x1="50" y1="32" x2="64" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#00F5D4" stopOpacity="0.85" />
            <stop offset="1" stopColor="#00F5D4" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r="20" stroke={`url(#${ring})`} strokeWidth="3" />
        <circle cx={CX} cy={CY} r="16" stroke="#2DD4BF" strokeOpacity="0.25" strokeWidth="1" />

        <motion.g
          animate={animated ? { rotate: 360 } : undefined}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {HOLES.map((h, i) => (
            <circle key={i} cx={h.x} cy={h.y} r="3.6" fill="#0F1633" stroke={`url(#${ring})`} strokeWidth="1.4" />
          ))}
        </motion.g>

        <circle cx={CX} cy={CY} r="3" fill="#00F5D4" />
        <rect x="45" y="27" width="5" height="10" rx="1.6" fill={`url(#${ring})`} />
        <motion.polygon
          points="50,28 64,17 64,47 50,36"
          fill={`url(#${beam})`}
          animate={animated ? { opacity: [0.55, 1, 0.55] } : undefined}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {showText && (
        <span
          className="font-display font-semibold leading-none tracking-wide text-ice"
          style={{ fontSize: Math.round(size * 0.58) }}
        >
          Kino<span className="text-gradient-aqua">Aqua</span>
        </span>
      )}
    </span>
  );
}
