import { Link, Navigate, Outlet } from 'react-router';
import { routes } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ papeis }) {
  const { sessao } = useAuth();
  if (!sessao) return <Navigate to={routes.login} replace />;
  if (papeis && !papeis.includes(sessao.papel)) {
    return (
      <div className="stack">
        <p role="alert">
          Seu perfil não tem permissão para acessar esta página.
        </p>
        <Link to={routes.campos}>Voltar para campos</Link>
      </div>
    );
  }
  return <Outlet />;
}
