import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../Modal';

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function TextField({ label, hint, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <input className="input-field !pl-4" {...props} />
      {hint && <span className="mt-1 block text-xs text-mist/80">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      <select className="input-field !pl-4" {...props}>
        {children}
      </select>
    </label>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Excluir', busy, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="max-w-md" label={title}>
      <div className="p-6 pt-12">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-mist">{text}</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className="btn border border-rose-400/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-20 text-aqua-400">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
