import { useEffect, useState } from 'react';
import { Armchair, Clock, Crown, Film, Monitor, Wrench } from 'lucide-react';
import Modal from './Modal';
import { api } from '../lib/api';
import { brl, formatDuration } from '../lib/format';
import { extractYoutubeId, toEmbedUrl } from '../lib/youtube';

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="glass-soft p-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-mist">
        <Icon className="h-3.5 w-3.5 text-aqua-400" />
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

export default function MovieModal({ movie, onClose, onChoose }) {
  const [showtime, setShowtime] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (movie) setShowtime(movie.showtimes[0] || '');
  }, [movie]);

  useEffect(() => {
    if (!movie || !showtime) return undefined;
    let alive = true;
    setSummary(null);
    api
      .get(`/movies/${movie.id}/seats?showtime=${encodeURIComponent(showtime)}`)
      .then((d) => alive && setSummary(d.summary))
      .catch(() => alive && setSummary(null));
    return () => {
      alive = false;
    };
  }, [movie, showtime]);

  const val = (v) => (summary ? v : '--');
  const trailerInput = movie ? (movie.trailerSourceUrl || movie.trailerUrl || '') : '';
  const trailerId = extractYoutubeId(trailerInput);
  const trailerEmbed = toEmbedUrl(trailerInput);

  return (
    <Modal open={!!movie} onClose={onClose} maxWidth="max-w-4xl" label={movie ? `Detalhes de ${movie.title}` : 'Detalhes'}>
      {movie && (
        <div className="p-4 sm:p-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-aqua-400/20 bg-ink-950">
            {trailerEmbed ? (
              <iframe
                src={trailerEmbed}
                title={`Trailer de ${movie.title}`}
                className="absolute inset-0 h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-mist">
                <Film className="h-8 w-8 text-aqua-400/70" />
                <p className="text-sm">Trailer não cadastrado para este filme.</p>
              </div>
            )}
          </div>

          {trailerId && (
            <p className="mt-2 text-right text-sm">
              <a
                href={`https://www.youtube.com/watch?v=${trailerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-aqua-400 underline underline-offset-4 hover:text-aqua-300"
              >
                Se o vídeo não carregar, assistir diretamente no YouTube
              </a>
            </p>
          )}

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold">{movie.title}</h2>
                <span className="badge border-aqua-400/40 bg-aqua-400/10 text-aqua-400" title="Classificação indicativa">
                  {movie.rating}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-mist">
                <span>{movie.genre}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(movie.duration)}
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ice/85">{movie.synopsis}</p>
            </div>

            <div>
              <p className="label">Ficha da sala</p>
              <div className="glass-soft p-4">
                <p className="flex items-center gap-2 font-medium">
                  <Monitor className="h-4 w-4 text-aqua-400" />
                  {movie.room.name}
                </p>
                <p className="mt-1 text-sm text-mist">
                  Tecnologia {movie.room.technology} - Fileiras {movie.room.rows[0]} a {movie.room.rows[movie.room.rows.length - 1]} - {movie.room.cols} colunas
                </p>
              </div>

              <p className="label mt-4">Sessão</p>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setShowtime(t)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      t === showtime
                        ? 'border-aqua-neon bg-aqua-neon/15 text-aqua-neon'
                        : 'border-ink-700 text-mist hover:border-aqua-400/50 hover:text-ice'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Tile icon={Armchair} label="Disponíveis" value={val(summary && summary.available)} />
                <Tile icon={Armchair} label="Ocupadas" value={val(summary && summary.occupied)} />
                <Tile icon={Wrench} label="Manutenção" value={val(summary && summary.broken)} />
                <Tile icon={Crown} label="VIP" value={val(summary && summary.vip)} />
              </div>

              <button type="button" onClick={() => onChoose(movie, showtime)} className="btn-primary mt-5 w-full">
                <Armchair className="h-4 w-4" />
                Escolher poltronas - {brl(movie.price)}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
