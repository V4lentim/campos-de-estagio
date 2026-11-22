import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { navigation } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/ui/Button.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { sessao } = useAuth();
  const grupo = navigation.find(({ items }) =>
    items.some(({ to }) => pathname === to || pathname.startsWith(`${to}/`)),
  );
  const item = grupo?.items.find(
    ({ to }) => pathname === to || pathname.startsWith(`${to}/`),
  );
  return (
    <div className={`app-layout${menuOpen ? ' menu-open' : ''}`}>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <Sidebar onNavigate={() => setMenuOpen(false)} />
      <div className="app-layout__main">
        <header className="app-header">
          <Button
            variant="secondary"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? 'Fechar menu' : 'Abrir menu'}
          </Button>
          <div>
            <span className="eyebrow">{grupo?.title}</span>
            <h1>{item?.label ?? 'Campos de estágio'}</h1>
          </div>
          <span className="badge profile-badge">{sessao?.papel}</span>
        </header>
        <main id="main-content" className="page-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
