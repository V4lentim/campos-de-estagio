import { NavLink, Link } from 'react-router';
import logo from '../assets/images/logo-faminas-white.png';
import { navigation, routes } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';

export default function Sidebar({ onNavigate }) {
  const { sessao, logout } = useAuth();
  const grupos = navigation
    .map((grupo) => ({
      ...grupo,
      items: grupo.items.filter(
        (item) => !item.admin || sessao?.papel === 'ADMIN',
      ),
    }))
    .filter((grupo) => grupo.items.length > 0);
  return (
    <aside className="sidebar" id="main-menu">
      <Link to={routes.campos} className="sidebar__brand" onClick={onNavigate}>
        <img src={logo} alt="FAMINAS" />
        <span>Campos de Estágio</span>
      </Link>
      <nav aria-label="Navegação principal">
        {grupos.map((grupo) => (
          <div className="sidebar__group" key={grupo.title}>
            <p>{grupo.title}</p>
            {grupo.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' is-active' : ''}`
                }
                onClick={onNavigate}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar__footer">
        <div>
          <strong>{sessao?.papel}</strong>
          <span>Perfil de acesso</span>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
