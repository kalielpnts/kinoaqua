import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BrandLogo from './components/BrandLogo';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyTickets from './pages/MyTickets';
import Admin from './pages/Admin';

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <BrandLogo size={56} />
    </div>
  );
}

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/" element={<Protected><Home /></Protected>} />
            <Route path="/filme/:id" element={<Protected><Booking /></Protected>} />
            <Route path="/ingressos" element={<Protected><MyTickets /></Protected>} />
            <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
