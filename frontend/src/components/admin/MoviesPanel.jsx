import { useCallback, useEffect, useState } from 'react';
import { Armchair, Eye, EyeOff, Film, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import Poster from '../Poster';
import SeatEditor from './SeatEditor';
import { ConfirmDialog, ErrorBox, SelectField, Spinner, TextField } from './ui';
import { api } from '../../lib/api';
import { friendlyError } from '../../lib/errors';
import { brl, formatDuration } from '../../lib/format';
import { parseRows, rowsToText, seatCodesOf } from '../../lib/rooms';
import { extractYoutubeId, toEmbedUrl } from '../../lib/youtube';

const RATINGS = ['L', '10', '12', '14', '16', '18'];
const TECHS = ['2D', '3D', 'IMAX', 'Dolby Atmos'];

const EMPTY = {
  title: '',
  synopsis: '',
  genre: '',
  rating: 'L',
  duration: '120',
  price: '30',
  showtimes: '14:00, 17:00, 20:00',
  posterUrl: '',
  trailerSourceUrl: '',
  roomName: '',
  technology: '2D',
  rows: 'A-F',
  cols: '8',
  active: true,
};

function fromMovie(m) {
  return {
    title: m.title,
    synopsis: m.synopsis,
    genre: m.genre,
    rating: m.rating,
    duration: String(m.duration),
    price: String(m.price),
    showtimes: m.showtimes.join(', '),
    posterUrl: m.posterUrl || '',
    trailerSourceUrl: m.trailerSourceUrl || m.trailerUrl || '',
    roomName: m.room.name,
    technology: m.room.technology,
    rows: rowsToText(m.room.rows),
    cols: String(m.room.cols),
    active: m.active !== false,
  };
}

export default function MoviesPanel() {
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seatsFor, setSeatsFor] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setMovies(await api.get('/movies'));
      setError('');
    } catch (err) {
      setError(friendlyError(err));
      setMovies((prev) => prev || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(m) {
    setEditing(m);
    setForm(fromMovie(m));
    setFormError('');
    setFormOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    try {
      const rows = parseRows(form.rows);
      const cols = Number(form.cols);
      const valid = new Set(seatCodesOf(rows, cols));
      const keepBroken = editing ? editing.room.brokenSeats.filter((b) => valid.has(b.code)) : [];
      const keepVip = editing ? editing.room.vipSeats.filter((c) => valid.has(c) && !keepBroken.some((b) => b.code === c)) : [];
      const payload = {
        title: form.title,
        synopsis: form.synopsis,
        genre: form.genre,
        rating: form.rating,
        duration: Number(form.duration),
        price: Number(form.price),
        showtimes: form.showtimes,
        posterUrl: form.posterUrl.trim(),
        trailerSourceUrl: form.trailerSourceUrl.trim(),
        active: form.active,
        room: {
          name: form.roomName,
          technology: form.technology,
          rows,
          cols,
          brokenSeats: keepBroken,
          vipSeats: keepVip,
        },
      };
      const saved = editing ? await api.put(`/movies/${editing.id}`, payload) : await api.post('/movies', payload);
      setFormOpen(false);
      await load();
      if (!editing) setSeatsFor(saved);
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(m) {
    try {
      await api.put(`/movies/${m.id}`, { active: !m.active });
      await load();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.del(`/movies/${toDelete.id}`);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(friendlyError(err));
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  }

  const trailerId = extractYoutubeId(form.trailerSourceUrl);
  const embed = toEmbedUrl(form.trailerSourceUrl);

  if (movies === null) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Filmes e sessões ({movies.length})</h2>
        <button type="button" onClick={openNew} className="btn-primary !py-2.5">
          <Plus className="h-4 w-4" />
          Novo filme
        </button>
      </div>
      <ErrorBox message={error} />

      {movies.length === 0 ? (
        <p className="glass p-10 text-center text-mist">Nenhum filme cadastrado.</p>
      ) : (
        <ul className="space-y-3">
          {movies.map((m) => (
            <li key={m.id} className="glass flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="w-16 shrink-0 overflow-hidden rounded-lg">
                <Poster movie={m} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {m.title}
                  <span className="badge border-aqua-400/40 bg-aqua-400/10 text-aqua-400">{m.rating}</span>
                  {!m.active && <span className="badge border-amber-400/40 bg-amber-400/10 text-amber-300">Oculto</span>}
                </p>
                <p className="mt-1 text-xs text-mist">
                  {m.genre} - {formatDuration(m.duration)} - {brl(m.price)} - {m.room.name} ({m.room.technology}, {m.room.rows.length}x{m.room.cols})
                </p>
                <p className="mt-1 text-xs text-mist">
                  Sessões: {m.showtimes.join(', ')} - Manutenção: {m.room.brokenSeats.length} - VIP: {m.room.vipSeats.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setSeatsFor(m)} className="btn-ghost !px-3 !py-2" aria-label={`Editar poltronas de ${m.title}`}>
                  <Armchair className="h-4 w-4" />
                  Poltronas
                </button>
                <button type="button" onClick={() => openEdit(m)} className="btn-ghost !px-3 !py-2" aria-label={`Editar ${m.title}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => toggleActive(m)} className="btn-ghost !px-3 !py-2" aria-label={m.active ? 'Ocultar do catálogo' : 'Mostrar no catálogo'} title={m.active ? 'Ocultar do catálogo' : 'Mostrar no catálogo'}>
                  {m.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setToDelete(m)} className="btn-ghost !px-3 !py-2 !text-rose-300" aria-label={`Excluir ${m.title}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} maxWidth="max-w-4xl" label={editing ? 'Editar filme' : 'Novo filme'}>
        <form onSubmit={save} className="p-4 pt-12 sm:p-6 sm:pt-12">
          <h2 className="text-2xl font-semibold">{editing ? 'Editar filme' : 'Novo filme'}</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField label="Título" value={form.title} onChange={set('title')} required className="sm:col-span-2" />
            <label className="block sm:col-span-2">
              <span className="label">Sinopse</span>
              <textarea value={form.synopsis} onChange={set('synopsis')} required rows={3} className="input-field !pl-4" />
            </label>
            <TextField label="Gênero" value={form.genre} onChange={set('genre')} required />
            <SelectField label="Classificação indicativa" value={form.rating} onChange={set('rating')}>
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </SelectField>
            <TextField label="Duração (minutos)" type="number" min="1" value={form.duration} onChange={set('duration')} required />
            <TextField label="Preço do ingresso (R$)" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
            <TextField label="Horários das sessões" value={form.showtimes} onChange={set('showtimes')} required hint="Formato HH:MM separados por vírgula. Ex: 14:00, 17:30, 21:00" className="sm:col-span-2" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <TextField label="URL do pôster" value={form.posterUrl} onChange={set('posterUrl')} placeholder="https://..." />
              <div className="mt-3 w-36">
                <Poster key={form.posterUrl} movie={{ title: form.title || 'Pôster', posterUrl: form.posterUrl.trim() }} className="rounded-xl border border-aqua-400/20" />
              </div>
              <p className="mt-1 text-xs text-mist/80">Sem URL (ou se a imagem não carregar), o catálogo mostra a ilustração padrão.</p>
            </div>
            <div>
              <TextField label="Link do trailer (YouTube)" value={form.trailerSourceUrl} onChange={set('trailerSourceUrl')} placeholder="youtube.com/watch?v=... ou youtu.be/... ou shorts/..." />
              <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-aqua-400/20 bg-ink-950">
                {embed ? (
                  <iframe
                    src={embed}
                    title="Prévia do trailer"
                    className="absolute inset-0 h-full w-full"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-mist">
                    <Film className="h-7 w-7 text-aqua-400/70" />
                    {form.trailerSourceUrl.trim() ? 'Link do YouTube inválido.' : 'Cole um link para ver a prévia.'}
                  </div>
                )}
              </div>
              {trailerId && (
                <p className="mt-2 text-xs">
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-aqua-400 underline underline-offset-4"
                  >
                    Abrir este vídeo diretamente no YouTube
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="label">Sala de cinema</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TextField label="Nome da sala" value={form.roomName} onChange={set('roomName')} required placeholder="Sala 01 - Aqua IMAX" className="lg:col-span-2" />
              <SelectField label="Tecnologia" value={form.technology} onChange={set('technology')}>
                {TECHS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
              <TextField label="Fileiras" value={form.rows} onChange={set('rows')} required hint="Ex: A-F" />
              <TextField label="Colunas" type="number" min="1" max="30" value={form.cols} onChange={set('cols')} required />
            </div>
            <p className="mt-2 text-xs text-mist/80">
              {editing
                ? 'Se a grade for reduzida, poltronas em manutenção e VIP fora dela são removidas. Use o botão Poltronas para editar o mapa.'
                : 'Depois de salvar, o editor visual de poltronas abre para você marcar manutenção e VIP.'}
            </p>
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-teal-400" />
            Exibir no catálogo dos usuários
          </label>

          <div className="mt-5">
            <ErrorBox message={formError} />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Salvar alterações' : 'Cadastrar filme'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!seatsFor}
        onClose={() => {
          setSeatsFor(null);
          load();
        }}
        maxWidth="max-w-4xl"
        label="Editor de poltronas"
      >
        {seatsFor && (
          <SeatEditor
            movie={seatsFor}
            onUpdate={(m) => {
              setSeatsFor(m);
              setMovies((prev) => (prev || []).map((x) => (x.id === m.id ? m : x)));
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir filme"
        text={toDelete ? `Excluir "${toDelete.title}" remove o filme e as reservas de poltronas dele. Os tickets já emitidos continuam no histórico dos usuários.` : ''}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
