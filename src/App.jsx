import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AuthProvider from './contexts/AuthProvider.jsx';
import ProtectedRoute from './components/shared/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/login/LoginPage.jsx';
import CamposPage from './pages/campos/CamposPage.jsx';
import CampoPage from './pages/campos/CampoPage.jsx';
import ConsultoriosPage from './pages/consultorios/ConsultoriosPage.jsx';
import AlunosPage from './pages/alunos/AlunosPage.jsx';
import AlocacoesPage from './pages/alocacoes/AlocacoesPage.jsx';
import FaixasPage from './pages/faixas/FaixasPage.jsx';
import ImportacoesPage from './pages/importacoes/ImportacoesPage.jsx';
import PreceptoresPage from './pages/preceptores/PreceptoresPage.jsx';
import PreceptorPage from './pages/preceptores/PreceptorPage.jsx';
import VinculosPage from './pages/vinculos/VinculosPage.jsx';
import ContratosPage from './pages/contratos/ContratosPage.jsx';
import AvaliacoesPage from './pages/avaliacoes/AvaliacoesPage.jsx';
import { CadastroRoute } from './pages/cadastros/CadastroPage.jsx';
import CadastroDetailPage from './pages/cadastros/CadastroDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import './styles/global.css';
import './styles/integracao.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="/painel"
                element={<Navigate to="/campos" replace />}
              />
              <Route path="/campos" element={<CamposPage />} />
              <Route
                path="/campos/exemplo"
                element={<Navigate to="/campos" replace />}
              />
              <Route path="/campos/:id" element={<CampoPage />} />
              <Route path="/consultorios" element={<ConsultoriosPage />} />
              <Route
                path="/consultorios/:id"
                element={<CadastroDetailPage recurso="consultorios" />}
              />
              <Route path="/alunos" element={<AlunosPage />} />
              <Route
                path="/alunos/:id"
                element={<CadastroDetailPage recurso="alunos" />}
              />
              <Route path="/alocacoes" element={<AlocacoesPage />} />
              <Route path="/faixas" element={<FaixasPage />} />
              <Route path="/cadastros/:entidade" element={<CadastroRoute />} />
              <Route
                path="/cadastros/:entidade/:id"
                element={<CadastroDetailPage />}
              />
              <Route element={<ProtectedRoute papeis={['ADMIN']} />}>
                <Route path="/preceptores" element={<PreceptoresPage />} />
                <Route
                  path="/preceptores/exemplo"
                  element={<Navigate to="/preceptores" replace />}
                />
                <Route path="/preceptores/:id" element={<PreceptorPage />} />
                <Route path="/vinculos" element={<VinculosPage />} />
                <Route
                  path="/vinculos/:id"
                  element={<CadastroDetailPage recurso="vinculos" />}
                />
                <Route path="/contratos" element={<ContratosPage />} />
                <Route
                  path="/contratos/:id"
                  element={<CadastroDetailPage recurso="contratos" />}
                />
                <Route path="/avaliacoes" element={<AvaliacoesPage />} />
                <Route
                  path="/avaliacoes/:id"
                  element={<CadastroDetailPage recurso="avaliacoes" />}
                />
                <Route path="/importacoes" element={<ImportacoesPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
