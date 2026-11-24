import { motion } from 'framer-motion';

const ROWS = [
  { y: 240, n: 7, lit: [3] },
  { y: 272, n: 9, lit: [2, 6] },
  { y: 304, n: 11, lit: [5] },
];
const W = 24;
const H = 20;
const GAP = 8;

// Ilustracao vetorial geometrica: tela curva de cinema e fileiras de poltronas.
export default function HeroIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 480 340" className={className} fill="none" role="img" aria-label="Sala de cinema estilizada">
      <defs>
        <linearGradient id="ka-hero-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00F5D4" stopOpacity="0.4" />
          <stop offset="1" stopColor="#4F5BD5" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="ka-hero-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#00F5D4" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
        <linearGradient id="ka-hero-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00F5D4" stopOpacity="0.16" />
          <stop offset="1" stopColor="#00F5D4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ka-hero-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00F5D4" />
          <stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>

      <polygon points="80,170 400,170 466,334 14,334" fill="url(#ka-hero-light)" />
      <path
        d="M60 60 Q240 20 420 60 L400 170 Q240 140 80 170 Z"
        fill="url(#ka-hero-screen)"
        stroke="url(#ka-hero-stroke)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <motion.polygon
        points="228,80 228,116 260,98"
        fill="#00F5D4"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {ROWS.map((row) => {
        const total = row.n * W + (row.n - 1) * GAP;
        const x0 = 240 - total / 2;
        return Array.from({ length: row.n }, (_, i) => {
          const x = x0 + i * (W + GAP);
          const lit = row.lit.includes(i);
          const seat = (
            <>
              <rect x={x} y={row.y - 9} width={W} height="6" rx="3" fill={lit ? '#2DD4BF' : '#1E2B63'} />
              <rect
                x={x}
                y={row.y}
                width={W}
                height={H}
                rx="6"
                fill={lit ? 'url(#ka-hero-seat)' : '#16204A'}
                stroke={lit ? 'none' : 'rgba(45,212,191,0.25)'}
              />
            </>
          );
          return lit ? (
            <motion.g
              key={`${row.y}-${i}`}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {seat}
            </motion.g>
          ) : (
            <g key={`${row.y}-${i}`}>{seat}</g>
          );
        });
      })}
    </svg>
  );
}
