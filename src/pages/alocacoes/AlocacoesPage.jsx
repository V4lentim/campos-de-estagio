import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useApiData } from '../../hooks/useApiData.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  carregarAlocacoes,
  consultarOcupacao,
  criarAlocacao,
  removerAlocacao,
} from '../../services/operacoes.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Feedback, { Evidencia } from '../../components/shared/Feedback.jsx';

function Resultado({ resultado }) {
  if (!resultado) return null;
  return (
    <div className="notice" role="status">
      <p>
        Classificação: <strong>{resultado.classificacao}</strong>
        {resultado.alunosNoConsultorio !== undefined &&
          ` · Alunos no consultório: ${resultado.alunosNoConsultorio}`}
      </p>
      {(resultado.alertas ?? []).map((alerta, index) => (
        <div key={`${alerta.codigo}:${index}`}>
          <p>{alerta.mensagem}</p>
          <Evidencia evidencia={alerta.evidencia} />
        </div>
      ))}
    </div>
  );
}

export default function AlocacoesPage() {
  const { sessao } = useAuth();
  const admin = sessao?.papel === 'ADMIN';
  const { dados, erro, carregando, recarregar } = useApiData(carregarAlocacoes);
  const [alunoId, setAlunoId] = useState('');
  const [consultorioId, setConsultorioId] = useState('');
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [resultado, setResultado] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const enviando = useRef(false);

  function nomeAluno(id) {
    const aluno = dados?.alunos.find((item) => item.AlunoID === id);
    return aluno ? `${aluno.nome} · ${aluno.matricula}` : `Aluno #${id}`;
  }

  function nomeConsultorio(id) {
    const consultorio = dados?.consultorios.find(
      (item) => item.ConsultorioID === id,
    );
    const campo = dados?.campos.find(
      (item) => item.CampoID === consultorio?.CampoID,
    );
    return consultorio
      ? `${consultorio.nome} · ${campo?.nome ?? `Campo #${consultorio.CampoID}`}`
      : `Consultório #${id} (indisponível)`;
  }

  async function executar(acao) {
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setFeedback({});
    try {
      await acao();
    } catch (error) {
      setFeedback({ erro: error });
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }

  function alocar(event) {
    event.preventDefault();
    executar(async () => {
      setResultado(null);
      const resposta = await criarAlocacao(alunoId, consultorioId);
      setResultado(resposta);
      setFeedback({ mensagem: `Alocação #${resposta.id} criada.` });
      recarregar();
    });
  }

  const rows = (dados?.alocacoes ?? []).filter(
    (item) =>
      (!filtro || item.consultorioId === Number(filtro)) &&
      nomeAluno(item.alunoId).toLowerCase().includes(busca.toLowerCase()),
  );
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'alunoId',
      label: 'Aluno',
      render: (item) => nomeAluno(item.alunoId),
    },
    {
      key: 'consultorioId',
      label: 'Consultório',
      render: (item) => nomeConsultorio(item.consultorioId),
    },
    ...(admin
      ? [
          {
            key: 'acoes',
            label: 'Ações',
            render: (item) => (
              <Button
                variant="secondary"
                disabled={ocupado}
                onClick={() => setConfirmacao(item)}
              >
                Remover
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="stack">
      <Link to="/alunos">Abrir cadastro de alunos</Link>
      <div className="notice">
        A classificação e os limites de ocupação são calculados pela API. Uma
        alocação acima do máximo é bloqueada.
      </div>
      <Feedback erro={erro} />
      <Feedback {...feedback} />
      <Resultado resultado={resultado} />
      {carregando && <p role="status">Carregando alocações...</p>}
      <Button
        variant="secondary"
        disabled={carregando || ocupado}
        onClick={recarregar}
      >
        Atualizar lista
      </Button>
      {dados && (
        <>
          {admin && (
            <Card title="Nova alocação">
              <form className="stack" onSubmit={alocar}>
                <div className="two-columns">
                  <label className="field">
                    <span>Aluno</span>
                    <select
                      required
                      disabled={ocupado}
                      value={alunoId}
                      onChange={(event) => setAlunoId(event.target.value)}
                    >
                      <option value="">Selecione</option>
                      {dados.alunos.map((aluno) => (
                        <option key={aluno.AlunoID} value={aluno.AlunoID}>
                          {nomeAluno(aluno.AlunoID)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Consultório</span>
                    <select
                      required
                      disabled={ocupado}
                      value={consultorioId}
                      onChange={(event) => setConsultorioId(event.target.value)}
                    >
                      <option value="">Selecione</option>
                      {dados.consultorios.map((item) => (
                        <option
                          key={item.ConsultorioID}
                          value={item.ConsultorioID}
                        >
                          {nomeConsultorio(item.ConsultorioID)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <Button type="submit" disabled={ocupado}>
                  Alocar aluno
                </Button>
              </form>
            </Card>
          )}
          <div className="card filter-bar">
            <label className="field">
              <span>Aluno ou matrícula</span>
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Consultório / ocupação</span>
              <select
                disabled={ocupado}
                value={filtro}
                onChange={(event) => {
                  setFiltro(event.target.value);
                  setResultado(null);
                }}
              >
                <option value="">Todos</option>
                {dados.consultorios.map((item) => (
                  <option key={item.ConsultorioID} value={item.ConsultorioID}>
                    {nomeConsultorio(item.ConsultorioID)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              disabled={!filtro || ocupado}
              onClick={() =>
                executar(async () => {
                  setResultado(null);
                  setResultado(await consultarOcupacao(filtro));
                })
              }
            >
              Consultar ocupação
            </Button>
          </div>
          {confirmacao && (
            <Card title="Confirmar remoção da alocação">
              <p>
                {nomeAluno(confirmacao.alunoId)} ·{' '}
                {nomeConsultorio(confirmacao.consultorioId)}
              </p>
              <div className="inline-actions">
                <Button
                  disabled={ocupado}
                  onClick={() =>
                    executar(async () => {
                      await removerAlocacao(confirmacao.id);
                      setConfirmacao(null);
                      setResultado(null);
                      setFeedback({ mensagem: 'Alocação removida.' });
                      recarregar();
                    })
                  }
                >
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
          <Card title="Alocações" description={`${rows.length} registro(s)`}>
            <DataTable
              caption="Alocações"
              columns={columns}
              rows={rows}
              emptyTitle="Nenhuma alocação encontrada"
              emptyDescription="Ajuste os filtros ou registre uma alocação."
            />
          </Card>
        </>
      )}
    </div>
  );
}
