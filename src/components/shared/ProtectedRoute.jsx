import { Navigate, Outlet } from 'react-router';
import { routes } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute() {
  const { sessao } = useAuth();

  return sessao ? <Outlet /> : <Navigate to={routes.login} replace />;
}