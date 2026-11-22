import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import logo from '../../assets/images/logo-faminas-white.png';
import Button from '../../components/ui/Button.jsx';
import { Field } from '../../components/ui/Field.jsx';
import { routes } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ApiError } from '../../services/api.js';

export default function LoginPage() {
  const { sessao, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (sessao) {
    return <Navigate to={routes.campos} replace />;
  }

  async function entrar(event) {
    event.preventDefault();

    if (carregando) return;

    setErro('');
    setCarregando(true);

    try {
      await login(email, senha);

      setSenha('');
      navigate(routes.campos, { replace: true });
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível entrar. Confira a conexão com a API e tente novamente.',
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <img src={logo} alt="FAMINAS" />

        <div className="stack">
          <span className="eyebrow">Coordenação de Medicina</span>

          <h1>Gestão de Campos de Estágio</h1>

          <p>
            Gestão de campos, consultórios, alunos, alocações, preceptores e
            avaliações.
          </p>
        </div>

        <small>Projeto acadêmico · Gestão de Campos de Estágio</small>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <form
          className="login-form stack"
          onSubmit={entrar}
          aria-busy={carregando}
        >
          <div>
            <h2 id="login-title">Entrar na Plataforma</h2>

            <p className="muted">Informe suas credenciais para continuar.</p>
          </div>

          <Field
            label="E-mail"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={carregando}
            required
          />

          <Field
            label="Senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            disabled={carregando}
            required
          />

          {erro && (
            <p className="notice notice--warning" role="alert">
              {erro}
            </p>
          )}

          <Button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </section>
    </main>
  );
}
