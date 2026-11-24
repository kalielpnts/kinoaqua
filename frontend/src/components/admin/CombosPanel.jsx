import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import ComboIllustrations, { ILLUSTRATION_OPTIONS } from '../ComboIllustrations';
import { ConfirmDialog, ErrorBox, SelectField, Spinner, TextField } from './ui';
import { api } from '../../lib/api';
import { friendlyError } from '../../lib/errors';
import { brl } from '../../lib/format';

const EMPTY = { name: '', description: '', price: '25', category: 'Combos', illustration: 'popcorn', imageUrl: '', active: true };

export default function CombosPanel() {
  const [combos, setCombos] = useState(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setCombos(await api.get('/combos'));
      setError('');
    } catch (err) {
      setError(friendlyError(err));
      setCombos((prev) => prev || []);
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

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || '',
      price: String(c.price),
      category: c.category,
      illustration: c.illustration || '',
      imageUrl: c.imageUrl || '',
      active: c.active !== false,
    });
    setFormError('');
    setFormOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    try {
      const payload = { ...form, price: Number(form.price), imageUrl: form.imageUrl.trim() };
      if (editing) await api.put(`/combos/${editing.id}`, payload);
      else await api.post('/combos', payload);
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(c) {
    try {
      await api.put(`/combos/${c.id}`, { active: !c.active });
      await load();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.del(`/combos/${toDelete.id}`);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(friendlyError(err));
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  }

  if (combos === null) return <Spinner />;
  const categories = [...new Set(combos.map((c) => c.category))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Bomboniere ({combos.length})</h2>
        <button type="button" onClick={openNew} className="btn-primary !py-2.5">
          <Plus className="h-4 w-4" />
          Novo combo
        </button>
      </div>
      <ErrorBox message={error} />

      {combos.length === 0 ? (
        <p className="glass p-10 text-center text-mist">Nenhum combo cadastrado.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {combos.map((c) => (
            <li key={c.id} className="glass flex gap-4 p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 p-2">
                <ComboIllustrations kind={c.illustration} imageUrl={c.imageUrl} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {c.name}
                  {!c.active && <span className="badge border-amber-400/40 bg-amber-400/10 text-amber-300">Oculto</span>}
                </p>
                <p className="text-xs text-mist">{c.category}</p>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-mist">{c.description}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-semibold text-aqua-400">{brl(c.price)}</span>
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => openEdit(c)} className="btn-ghost !px-2.5 !py-1.5" aria-label={`Editar ${c.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => toggleActive(c)} className="btn-ghost !px-2.5 !py-1.5" aria-label={c.active ? 'Ocultar combo' : 'Mostrar combo'}>
                      {c.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => setToDelete(c)} className="btn-ghost !px-2.5 !py-1.5 !text-rose-300" aria-label={`Excluir ${c.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} maxWidth="max-w-2xl" label={editing ? 'Editar combo' : 'Novo combo'}>
        <form onSubmit={save} className="p-4 pt-12 sm:p-6 sm:pt-12">
          <h2 className="text-2xl font-semibold">{editing ? 'Editar combo' : 'Novo combo'}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField label="Nome" value={form.name} onChange={set('name')} required className="sm:col-span-2" />
            <label className="block sm:col-span-2">
              <span className="label">Descrição</span>
              <textarea value={form.description} onChange={set('description')} rows={2} className="input-field !pl-4" />
            </label>
            <TextField label="Preço (R$)" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
            <label className="block">
              <span className="label">Categoria</span>
              <input list="ka-categories" value={form.category} onChange={set('category')} className="input-field !pl-4" />
              <datalist id="ka-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <SelectField label="Ilustração vetorial" value={form.illustration} onChange={set('illustration')}>
              {ILLUSTRATION_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </SelectField>
            <TextField label="URL de imagem (opcional)" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." hint="Se informada, substitui a ilustração." />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-28 w-28 overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 p-2">
              <ComboIllustrations key={form.imageUrl} kind={form.illustration} imageUrl={form.imageUrl.trim()} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-teal-400" />
              Disponível na bomboniere
            </label>
          </div>

          <div className="mt-5">
            <ErrorBox message={formError} />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? 'Salvar alterações' : 'Cadastrar combo'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir combo"
        text={toDelete ? `Excluir "${toDelete.name}" da bomboniere? Tickets já emitidos mantêm o registro do combo.` : ''}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
