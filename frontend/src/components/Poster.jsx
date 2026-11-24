import { useState } from 'react';

// Poster do filme. Sem URL (ou com erro de carga), mostra uma ilustracao SVG propria.
export default function Poster({ movie, className = '' }) {
  const [failed, setFailed] = useState(false);
  const wrap = `relative aspect-[2/3] w-full overflow-hidden bg-ink-800 ${className}`;

  if (movie.posterUrl && !failed) {
    return (
      <div className={wrap}>
        <img
          src={movie.posterUrl}
          alt={`Pôster de ${movie.title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={wrap}>
      <svg viewBox="0 0 200 300" className="h-full w-full" fill="none" role="img" aria-label={`Pôster de ${movie.title}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ka-pst-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#16204A" />
            <stop offset="1" stopColor="#090D1F" />
          </linearGradient>
          <linearGradient id="ka-pst-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00F5D4" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect width="200" height="300" fill="url(#ka-pst-bg)" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <g key={i}>
            <rect x="8" y={12 + i * 24} width="8" height="12" rx="2" fill="#1E2B63" />
            <rect x="184" y={12 + i * 24} width="8" height="12" rx="2" fill="#1E2B63" />
          </g>
        ))}
        <circle cx="100" cy="130" r="62" stroke="url(#ka-pst-a)" strokeWidth="3" opacity="0.9" />
        <circle cx="100" cy="130" r="44" stroke="#2DD4BF" strokeOpacity="0.3" strokeWidth="1.5" />
        <circle cx="100" cy="130" r="26" stroke="url(#ka-pst-a)" strokeWidth="1.5" opacity="0.6" />
        <polygon points="90,112 90,148 122,130" fill="url(#ka-pst-a)" />
        <path d="M30 236 L170 236" stroke="url(#ka-pst-a)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M54 252 L146 252" stroke="#2DD4BF" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
