import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-3xl',
  label = 'Janela',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-ink-950/85 p-2 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`glass relative my-auto w-full ${maxWidth} max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain !bg-ink-900/95 sm:max-h-[calc(100dvh-2rem)]`}
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="sticky top-2 z-20 float-right mr-2 mt-2 rounded-lg border border-aqua-400/20 bg-ink-950/90 p-2 text-mist transition hover:text-aqua-400"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
