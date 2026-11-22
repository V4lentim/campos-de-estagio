import { useCallback, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  cadastros,
  podeConsultar,
  rotuloRegistro,
  urlCadastro,
} from '../../config/cadastros.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useApiData } from '../../hooks/useApiData.js';
import {
  carregarCadastro,
  excluirCadastro,
  salvarCadastro,
  valoresFormulario,
} from '../../services/cadastros.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import CadastroForm from '../../components/shared/CadastroForm.jsx';
import Feedback from '../../components/shared/Feedback.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

function exibir(campo, registro, referencias) {
  const valor = registro[campo.resposta ?? campo.nome];
  if (campo.recurso) {
    const config = cadastros[campo.recurso];
    const item = referencias[campo.recurso]?.find(
      (opcao) => opcao[config.id] === valor,
    );
    return item ? rotuloRegistro(campo.recurso, item) : `#${valor ?? '—'}`;
  }
  if (campo.tipo === 'date' && valor)
    return valor.slice(0, 10).split('-').reverse().join('/');
  return valor ?? '—';
}

export default function CadastroPage({ recurso }) {
  const config = cadastros[recurso];
  const { sessao } = useAuth();
  const admin = sessao?.papel === 'ADMIN';
  const carregar = useCallback(
    (signal) => carregarCadastro(recurso, signal),
    [recurso],
  );
  const { dados, erro, carregando, recarregar } = useApiData(carregar);
  const [busca, setBusca] = useState('');
  const [filtros, setFiltros] = useState({});
  const [formulario, setFormulario] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [feedback, setFeedback] = useState({});
  const enviando = useRef(false);

  const referencias = dados?.referencias ?? {};
  const camposTabela = config.campos.filter((campo) => !campo.soCriacao);
  const colunas = camposTabela.map((campo) => ({
    key: campo.nome,
    label: campo.label,
    render: (registro) => exibir(campo, registro, referencias),
  }));

  function abrirFormulario(registro = null) {
    setFeedback({});
    setConfirmacao(null);
    setFormulario({
      original: registro,
      valores: valoresFormulario(config, registro ?? {}),
    });
  }

  async function salvar(event) {
    event.preventDefault();
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setFeedback({});
    try {
      await salvarCadastro(recurso, formulario.valores, formulario.original);
      setFormulario(null);
      setFeedback({ mensagem: 'Registro salvo com sucesso.' });
      recarregar();
    } catch (error) {
      setFeedback({ erro: error });
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }

  async function confirmarExclusao() {
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setFeedback({});
    try {
      await excluirCadastro(recurso, confirmacao[config.id]);
      setConfirmacao(null);
      setFeedback({
        mensagem: config.exclusaoLogica
          ? 'Registro inativado com sucesso.'
          : 'Registro excluído com sucesso.',
      });
      recarregar();
    } catch (error) {
      setFeedback({ erro: error });
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }

  colunas.push({
    key: 'acoes',
    label: 'Ações',
    render: (registro) => (
      <div className="inline-actions">
        {(admin || config.detalheConsulta !== false) && (
          <Link
            className="button button--secondary"
            to={`${urlCadastro(recurso)}/${registro[config.id]}`}
          >
            Detalhes
          </Link>
        )}
        {admin && (
          <>
            <Button
              variant="secondary"
              disabled={ocupado || carregando}
              onClick={() => abrirFormulario(registro)}
            >
              Editar
            </Button>
            <Button
              variant="secondary"
              disabled={ocupado || carregando}
              onClick={() => {
                setFormulario(null);
                setFeedback({});
                setConfirmacao(registro);
              }}
            >
              {config.exclusaoLogica ? 'Inativar' : 'Excluir'}
            </Button>
          </>
        )}
      </div>
    ),
  });

  const registros = (dados?.registros ?? [])
    .filter((registro) => {
      const texto = camposTabela
        .map((campo) => exibir(campo, registro, referencias))
        .join(' ')
        .toLocaleLowerCase('pt-BR');
      return (
        texto.includes(busca.trim().toLocaleLowerCase('pt-BR')) &&
        Object.entries(filtros).every(
          ([nome, valor]) => !valor || String(registro[nome]) === valor,
        )
      );
    })
    .map((registro) => ({ ...registro, id: registro[config.id] }));

  return (
    <div className="stack">
      {config.descricao && <div className="notice">{config.descricao}</div>}
      <Feedback erro={erro} />
      <Feedback {...feedback} />
      <div className="card filter-bar">
        <label className="field">
          <span>Buscar nos registros</span>
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>
        {config.campos
          .filter((campo) => campo.recurso)
          .map((campo) => (
            <label className="field" key={campo.nome}>
              <span>{campo.label}</span>
              <select
                value={filtros[campo.nome] ?? ''}
                onChange={(event) =>
                  setFiltros({ ...filtros, [campo.nome]: event.target.value })
                }
              >
                <option value="">Todos</option>
                {(referencias[campo.recurso] ?? []).map((item) => (
                  <option
                    key={item[cadastros[campo.recurso].id]}
                    value={item[cadastros[campo.recurso].id]}
                  >
                    {rotuloRegistro(campo.recurso, item)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        <Button
          variant="secondary"
          disabled={ocupado}
          onClick={() => {
            setBusca('');
            setFiltros({});
          }}
        >
          Limpar filtros
        </Button>
        <Button
          variant="secondary"
          disabled={ocupado || carregando}
          onClick={recarregar}
        >
          Atualizar lista
        </Button>
      </div>
      {carregando && <p role="status">Carregando registros...</p>}
      {formulario && admin && (
        <Card title={formulario.original ? 'Editar registro' : 'Novo registro'}>
          <form className="stack" onSubmit={salvar}>
            <CadastroForm
              config={config}
              valores={formulario.valores}
              referencias={referencias}
              editando={Boolean(formulario.original)}
              ocupado={ocupado}
              onChange={(valores) => setFormulario({ ...formulario, valores })}
            />
            <div className="inline-actions">
              <Button type="submit" disabled={ocupado || carregando}>
                {ocupado ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="secondary"
                disabled={ocupado}
                onClick={() => setFormulario(null)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}
      {confirmacao && admin && (
        <Card
          title={
            config.exclusaoLogica
              ? 'Confirmar inativação'
              : 'Confirmar exclusão'
          }
        >
          <p>{rotuloRegistro(recurso, confirmacao)}</p>
          <div className="inline-actions">
            <Button disabled={ocupado} onClick={confirmarExclusao}>
              Confirmar
            </Button>
            <Button
              variant="secondary"
              disabled={ocupado}
              onClick={() => setConfirmacao(null)}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}
      {!carregando && !erro && (
        <Card
          title={config.titulo}
          description={`${registros.length} registro(s)`}
          action={
            admin && (
              <Button disabled={ocupado} onClick={() => abrirFormulario()}>
                Novo registro
              </Button>
            )
          }
        >
          <DataTable
            caption={config.titulo}
            columns={colunas}
            rows={registros}
            emptyTitle="Nenhum registro encontrado"
            emptyDescription="Cadastre um registro ou ajuste os filtros."
          />
        </Card>
      )}
    </div>
  );
}

export function CadastroRoute() {
  const { entidade } = useParams();
  const { sessao } = useAuth();
  if (!Object.hasOwn(cadastros, entidade)) return <NotFoundPage />;
  if (!podeConsultar(entidade, sessao?.papel))
    return <Feedback mensagem="Seu perfil não tem acesso a este cadastro." />;
  return <CadastroPage key={entidade} recurso={entidade} />;
}
