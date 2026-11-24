import { useState } from 'react';

export const ILLUSTRATION_OPTIONS = [
  { id: 'popcorn', label: 'Balde de Pipoca' },
  { id: 'drinks', label: 'Copo Duplo e Canudo' },
  { id: 'nachos', label: 'Nachos' },
  { id: 'vip-ticket', label: 'Ingresso VIP' },
];

function Defs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#00F5D4" />
        <stop offset="1" stopColor="#4F5BD5" />
      </linearGradient>
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1E2B63" />
        <stop offset="1" stopColor="#0F1633" />
      </linearGradient>
    </defs>
  );
}

function Popcorn() {
  const a = 'url(#ka-pop-a)';
  const b = 'url(#ka-pop-b)';
  return (
    <g>
      <Defs id="ka-pop" />
      {[[52, 62, 12], [70, 48, 14], [92, 46, 14], [110, 60, 12], [81, 62, 12]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#F8FAFC" fillOpacity="0.92" stroke={a} strokeWidth="2" />
      ))}
      <path d="M42 70 L118 70 L108 142 Q107 150 99 150 L61 150 Q53 150 52 142 Z" fill={b} stroke={a} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 74 L62 146 M80 74 L80 146 M94 74 L98 146" stroke={a} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <rect x="38" y="64" width="84" height="9" rx="4.5" fill={a} />
    </g>
  );
}

function Drinks() {
  const a = 'url(#ka-drk-a)';
  const b = 'url(#ka-drk-b)';
  return (
    <g>
      <Defs id="ka-drk" />
      <path d="M62 56 L64 30 L84 30" stroke={a} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polygon points="34,66 80,66 74,142 40,142" fill={b} stroke={a} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="30" y="58" width="54" height="9" rx="4.5" fill={a} />
      <path d="M38 96 L76 96" stroke={a} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M112 66 L116 38 L134 38" stroke="#2DD4BF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polygon points="88,78 134,78 128,146 94,146" fill={b} stroke="#2DD4BF" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="84" y="70" width="54" height="9" rx="4.5" fill="#2DD4BF" />
      <path d="M92 108 L130 108" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function Nachos() {
  const a = 'url(#ka-nch-a)';
  const b = 'url(#ka-nch-b)';
  return (
    <g>
      <Defs id="ka-nch" />
      <polygon points="30,104 52,64 72,104" fill={a} fillOpacity="0.85" stroke="#F8FAFC" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="56,104 84,50 108,104" fill={a} stroke="#F8FAFC" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="92,104 118,62 134,104" fill={a} fillOpacity="0.8" stroke="#F8FAFC" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 100 Q80 158 128 100 Z" fill={b} stroke={a} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="80" cy="100" rx="48" ry="8" fill={b} stroke={a} strokeWidth="2.5" />
      <ellipse cx="80" cy="99" rx="34" ry="5" fill="#2DD4BF" fillOpacity="0.9" />
      <path d="M50 124 Q80 140 110 124" stroke={a} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
    </g>
  );
}

function VipTicket() {
  const a = 'url(#ka-vip-a)';
  const b = 'url(#ka-vip-b)';
  return (
    <g>
      <Defs id="ka-vip" />
      <g transform="rotate(-8 80 80)">
        <rect x="22" y="40" width="116" height="80" rx="10" fill={b} stroke={a} strokeWidth="2.5" />
        <circle cx="22" cy="80" r="9" fill="#090D1F" stroke={a} strokeWidth="2.5" />
        <circle cx="138" cy="80" r="9" fill="#090D1F" stroke={a} strokeWidth="2.5" />
        <line x1="112" y1="48" x2="112" y2="112" stroke={a} strokeWidth="2" strokeDasharray="4 5" />
        <polygon points="62,60 66.4,72 79.1,72.5 69.1,80.5 72.6,93 62,85.7 51.4,93 54.9,80.5 44.9,72.5 57.6,72" fill={a} />
        <rect x="84" y="64" width="20" height="4" rx="2" fill={a} opacity="0.85" />
        <rect x="84" y="74" width="14" height="4" rx="2" fill={a} opacity="0.55" />
        <rect x="84" y="84" width="18" height="4" rx="2" fill={a} opacity="0.55" />
        <rect x="120" y="60" width="8" height="40" rx="2" fill={a} opacity="0.35" />
      </g>
    </g>
  );
}

const ART = { popcorn: Popcorn, drinks: Drinks, nachos: Nachos, 'vip-ticket': VipTicket };

// Ilustracao vetorial do combo. Se houver imageUrl valida, usa a imagem; senao, o SVG da categoria.
export default function ComboIllustrations({ kind, imageUrl, className = 'h-full w-full' }) {
  const [failed, setFailed] = useState(false);
  if (imageUrl && !failed) {
    return <img src={imageUrl} alt="" onError={() => setFailed(true)} className={`${className} object-cover`} />;
  }
  const Art = ART[kind] || Popcorn;
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" role="img" aria-label="Ilustração do combo">
      <Art />
    </svg>
  );
}
