import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, LayoutDashboard, Popcorn } from 'lucide-react';
import AppShell from '../components/AppShell';
import StatsPanel from '../components/admin/StatsPanel';
import MoviesPanel from '../components/admin/MoviesPanel';
import CombosPanel from '../components/admin/CombosPanel';

const TABS = [
  { id: 'indicadores', label: 'Indicadores', icon: LayoutDashboard },
  { id: 'filmes', label: 'Filmes e salas', icon: Film },
  { id: 'combos', label: 'Combos', icon: Popcorn },
];

export default function Admin() {
  const [tab, setTab] = useState('indicadores');

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">
        Painel <span className="text-gradient-aqua">administrativo</span>
      </h1>
      <p className="mt-2 text-mist">Gerencie filmes, salas, poltronas e a bomboniere.</p>

      <div role="tablist" className="relative mt-6 inline-flex max-w-full overflow-x-auto rounded-xl border border-aqua-400/15 bg-ink-950/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative z-10 flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-ink-950' : 'text-mist hover:text-ice'
            }`}
          >
            {tab === t.id && (
              <motion.span layoutId="ka-admin-tab" className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-aqua-neon to-aqua-500" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'indicadores' && <StatsPanel />}
        {tab === 'filmes' && <MoviesPanel />}
        {tab === 'combos' && <CombosPanel />}
      </div>
    </AppShell>
  );
}
