import { useRef, useState } from 'react';
import { carregarFaixas, atualizarFaixa } from '../../services/operacoes.js';
import { useApiData } from '../../hooks/useApiData.js';
import { useAuth } from '../../hooks/useAuth.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Feedback from '../../components/shared/Feedback.jsx';

export default function FaixasPage() {
  const { sessao } = useAuth();
  const admin = sessao?.papel === 'ADMIN';
  const { dados, erro, carregando, recarregar } = useApiData(carregarFaixas);
  const [edicao, setEdicao] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [filtro, setFiltro] = useState('');
  const [tipo, setTipo] = useState('');
  const enviando = useRef(false);

  async function salvar(event) {
    event.preventDefault();
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setFeedback({});
    try {
      await atualizarFaixa(edicao.id, edicao.ideal, edicao.maximoAceitavel);
      setEdicao(null);
      setFeedback({ mensagem: 'Faixa atualizada.' });
      recarregar();
    } catch (error) {
      setFeedback({ erro: error });
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }

  const columns = [
    {
      key: 'especialidadeId',
      label: 'Especialidade',
      render: (item) =>
        dados?.especialidades.find(
          (especialidade) =>
            especialidade.EspecialidadeID === item.especialidadeId,
        )?.nome ?? `#${item.especialidadeId}`,
    },
    { key: 'tipoAtendimento', label: 'Tipo de atendimento' },
    { key: 'ideal', label: 'Ideal' },
    { key: 'maximoAceitavel', label: 'Máximo aceitável' },
    ...(admin
      ? [
          {
            key: 'acoes',
            label: 'Ações',
            render: (item) => (
              <Button
                variant="secondary"
                disabled={ocupado}
                onClick={() => {
                  setFeedback({});
                  setEdicao({
                    id: item.id,
                    ideal: String(item.ideal),
                    maximoAceitavel: String(item.maximoAceitavel),
                  });
                }}
              >
                Editar
              </Button>
            ),
          },
        ]
      : []),
  ];
  const rows = (dados?.faixas ?? []).filter(
    (item) =>
      (!filtro || item.especialidadeId === Number(filtro)) &&
      (!tipo || item.tipoAtendimento === tipo),
  );

  return (
    <div className="stack">
      <div className="notice">
        As faixas existentes podem ser consultadas e editadas. A API não oferece
        criação nem exclusão de faixas.
      </div>
      <Feedback erro={erro} />
      <Feedback {...feedback} />
      {carregando && <p role="status">Carregando faixas...</p>}
      <Button
        variant="secondary"
        disabled={ocupado || carregando}
        onClick={recarregar}
      >
        Atualizar lista
      </Button>
      {dados && (
        <>
          <div className="card filter-bar">
            <label className="field">
              <span>Especialidade</span>
              <select
                value={filtro}
                onChange={(event) => setFiltro(event.target.value)}
              >
                <option value="">Todas</option>
                {dados.especialidades.map((item) => (
                  <option
                    key={item.EspecialidadeID}
                    value={item.EspecialidadeID}
                  >
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tipo de atendimento</span>
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
              >
                <option value="">Todos</option>
                <option>AMBULATORIAL</option>
                <option>PRONTO_ATENDIMENTO</option>
              </select>
            </label>
          </div>
          {admin && edicao && (
            <Card title="Editar faixa">
              <form className="stack" onSubmit={salvar}>
                <div className="two-columns">
                  <label className="field">
                    <span>Ideal</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      max="2147483647"
                      disabled={ocupado}
                      value={edicao.ideal}
                      onChange={(event) =>
                        setEdicao({ ...edicao, ideal: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Máximo aceitável</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      max="2147483647"
                      disabled={ocupado}
                      value={edicao.maximoAceitavel}
                      onChange={(event) =>
                        setEdicao({
                          ...edicao,
                          maximoAceitavel: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div className="inline-actions">
                  <Button type="submit" disabled={ocupado}>
                    Salvar faixa
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={ocupado}
                    onClick={() => setEdicao(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}
          <Card title="Faixas de ocupação">
            <DataTable
              caption="Faixas de ocupação"
              columns={columns}
              rows={rows}
              emptyTitle="Nenhuma faixa encontrada"
              emptyDescription="Ajuste os filtros. Se a lista estiver vazia, confira as faixas cadastradas na API."
            />
          </Card>
        </>
      )}
    </div>
  );
}
