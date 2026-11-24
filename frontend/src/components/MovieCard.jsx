import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Armchair, Clock, Play } from 'lucide-react';
import Poster from './Poster';
import { brl, formatDuration } from '../lib/format';

export default function MovieCard({ movie, onDetails, onChoose, index = 0 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 220, damping: 20 });

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.45 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="glass group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-glow"
    >
      <button type="button" onClick={() => onDetails(movie)} className="relative block text-left" aria-label={`Ver trailer e detalhes de ${movie.title}`}>
        <Poster movie={movie} className="transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-lg border border-aqua-400/40 bg-ink-950/80 px-2 text-xs font-semibold text-aqua-400" title="Classificação indicativa">
          {movie.rating}
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition duration-300 group-hover:bg-ink-950/45 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-aqua-neon/60 bg-ink-950/70 text-aqua-neon shadow-glow">
            <Play className="h-6 w-6" />
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold leading-snug">{movie.title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist">
          <span>{movie.genre}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(movie.duration)}
          </span>
          <span>{movie.room.technology}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {movie.showtimes.map((t) => (
            <span key={t} className="rounded-md border border-ink-700 bg-ink-950/60 px-2 py-0.5 text-xs text-ice/90">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <p className="mb-3 text-sm text-mist">
            Ingresso a partir de <span className="font-semibold text-aqua-400">{brl(movie.price)}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onDetails(movie)} className="btn-ghost !px-3 !py-2.5">
              <Play className="h-4 w-4" />
              Trailer
            </button>
            <button type="button" onClick={() => onChoose(movie)} className="btn-primary !px-3 !py-2.5">
              <Armchair className="h-4 w-4" />
              Poltronas
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
