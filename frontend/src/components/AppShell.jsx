import { NavLink } from 'react-router-dom';
import { LogOut, ShieldCheck, ShoppingBag, User } from 'lucide-react';
import BrandLogo from './BrandLogo';
import BagLayer from './BagLayer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function NavItems({ links, className = '' }) {
  return (
    <nav className={`items-center gap-1 ${className}`} aria-label="Navegação principal">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 text-sm transition ${isActive ? 'bg-aqua-400/15 text-aqua-400' : 'text-mist hover:text-ice'}`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const cart = useCart();
  const isAdmin = user && user.role === 'admin';
  const links = [
    { to: '/', label: 'Catálogo', end: true },
    { to: '/ingressos', label: 'Meus ingressos', end: false },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', end: false }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-aqua-400/10 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <BrandLogo size={34} />
            <NavItems links={links} className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs leading-tight text-mist">{user.email}</p>
            </div>
            <span className={`hidden sm:inline-flex ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
              {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {isAdmin ? 'Administrador' : 'Usuário'}
            </span>
            <button type="button" onClick={() => cart.setDrawerOpen(true)} className="btn-ghost relative !px-3 !py-2" aria-label="Abrir sacola">
              <ShoppingBag className="h-4 w-4" />
              {cart.itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-aqua-neon px-1 text-[11px] font-bold text-ink-950">
                  {cart.itemCount}
                </span>
              )}
            </button>
            <button type="button" onClick={logout} className="btn-ghost !px-3 !py-2" aria-label="Sair">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <NavItems links={links} className="flex border-t border-aqua-400/10 px-4 py-2 md:hidden" />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <BagLayer />
    </div>
  );
}
