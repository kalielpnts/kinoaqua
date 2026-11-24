import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Armchair,
  Clapperboard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Popcorn,
  ShieldCheck,
  User,
  UserPlus,
  Zap,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import ProjectorBeam from '../components/ProjectorBeam';
import HeroIllustration from '../components/HeroIllustration';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../lib/demoAccounts';
import { friendlyError } from '../lib/errors';

const TABS = [
  { id: 'login', label: 'Entrar', icon: LogIn },
  { id: 'register', label: 'Cadastrar', icon: UserPlus },
];

const FEATURES = [
  { icon: Clapperboard, text: 'Vitrine dinâmica com trailers integrados' },
  { icon: Armchair, text: 'Mapa interativo de poltronas em tempo real' },
  { icon: Popcorn, text: 'Ingressos e combos em uma única sacola' },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state && location.state.from && location.state.from.pathname) || '/';

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  function fillDemo(account) {
    setMode('login');
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isLogin && !name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setBusy(true);
    try {
      if (isLogin) await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ProjectorBeam />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block"
        >
          <BrandLogo size={52} />
          <h1 className="mt-10 text-4xl font-semibold leading-tight xl:text-5xl">
            A sala escura, <span className="text-gradient-aqua">redesenhada em profundidade.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-mist">
            Escolha o filme, reserve a poltrona e combine a bomboniere em uma única compra, com ticket digital na hora.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ice/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-aqua-400/20 bg-aqua-400/10 text-aqua-400">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-10 max-w-md"
          >
            <HeroIllustration className="w-full" />
          </motion.div>
        </motion.section>

        <div className="flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass w-full max-w-md p-6 sm:p-8"
          >
            <div className="mb-6 lg:hidden">
              <BrandLogo size={40} />
            </div>

            <div role="tablist" className="relative mb-6 grid grid-cols-2 rounded-xl border border-aqua-400/15 bg-ink-950/60 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.id}
                  onClick={() => switchMode(tab.id)}
                  className={`relative z-10 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    mode === tab.id ? 'text-ink-950' : 'text-mist hover:text-ice'
                  }`}
                >
                  {mode === tab.id && (
                    <motion.span
                      layoutId="ka-tab"
                      className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-aqua-neon to-aqua-500"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-semibold">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
            <p className="mb-6 mt-1 text-sm text-mist">
              {isLogin
                ? 'Entre para escolher sua sessão e reservar suas poltronas.'
                : 'Cadastre-se em segundos e comece a reservar.'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="-mx-1 overflow-hidden px-1"
                  >
                    <div className="pb-4">
                      <Field
                        id="name"
                        label="Nome"
                        icon={User}
                        type="text"
                        autoComplete="name"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <Field
                  id="email"
                  label="E-mail"
                  icon={Mail}
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Field
                  id="password"
                  label="Senha"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-mist transition hover:text-aqua-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.div
                      key="error"
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={busy} className="btn-primary w-full">
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLogin ? (
                    <LogIn className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {busy ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-aqua-400/10 pt-4">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-mist/80">
                <Zap className="h-3.5 w-3.5 text-aqua-400" />
                Acesso Rápido Demo
              </p>
              {['admin', 'user'].map((role) => (
                <div key={role} className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="w-24 text-xs text-mist/70">{role === 'admin' ? 'Administrador' : 'Usuário'}</span>
                  {DEMO_ACCOUNTS.filter((a) => a.role === role).map((a) => {
                    const active = email.toLowerCase() === a.email.toLowerCase() && password === a.password;
                    return (
                      <button
                        key={a.email}
                        type="button"
                        onClick={() => fillDemo(a)}
                        title={a.email}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                          active
                            ? 'border-aqua-400/60 bg-aqua-400/15 text-aqua-400'
                            : 'border-ink-700 text-mist hover:border-aqua-400/40 hover:text-ice'
                        }`}
                      >
                        {role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
