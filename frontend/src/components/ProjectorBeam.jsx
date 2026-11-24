import { motion } from 'framer-motion';

// Particulas de poeira dentro do feixe (posicoes deterministicas)
const DUST = Array.from({ length: 18 }, (_, i) => {
  const t = (i + 1) / 19;
  const seed = Math.sin((i + 1) * 12.9898) * 43758.5453;
  const r = seed - Math.floor(seed);
  return {
    x: 140 + t * 800,
    y: 80 + t * 330 + (r - 0.5) * 220 * t,
    radius: 1 + r * 2.2,
    duration: 4 + r * 5,
    delay: r * 4,
  };
});

// Feixe de luz de projetor animado, usado como fundo da tela de login.
export default function ProjectorBeam({ className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg className="h-full w-full" viewBox="0 0 1000 800" preserveAspectRatio="xMinYMin slice">
        <defs>
          <linearGradient id="ka-beam-main" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0" stopColor="#00F5D4" stopOpacity="0.38" />
            <stop offset="0.55" stopColor="#14B8A6" stopOpacity="0.1" />
            <stop offset="1" stopColor="#14B8A6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ka-beam-source">
            <stop offset="0" stopColor="#00F5D4" stopOpacity="0.65" />
            <stop offset="1" stopColor="#00F5D4" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.8, ease: 'easeOut' }}>
          <motion.polygon
            points="70,50 1000,230 1000,760"
            fill="url(#ka-beam-main)"
            animate={{ opacity: [0.55, 0.95, 0.55] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.polygon
            points="70,50 1000,380 1000,620"
            fill="url(#ka-beam-main)"
            animate={{ opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx="70" cy="50" r="90" fill="url(#ka-beam-source)" />
          {DUST.map((d, i) => (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.radius}
              fill="#5EEAD4"
              initial={{ opacity: 0.1 }}
              animate={{ cy: [d.y, d.y - 16, d.y], opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
