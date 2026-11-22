import { useRef, useState } from 'react';
import {
  enviarLote,
  consultarImportacao,
  confirmarImportacao,
} from '../../services/operacoes.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Feedback from '../../components/shared/Feedback.jsx';

const exemplo = JSON.stringify(
  {
    linhas: [
      {
        campo: 'Campo de exemplo',
        endereco: 'Rua de exemplo, 100',
        classificacao: 'Escola',
        municipio: 'Nome de município cadastrado',
        consultorio: 1,
        especialidade: 'Nome de especialidade cadastrada',
        capacidadeMin: 1,
        capacidadeMax: 3,
        tipoAtendimento: 'AMBULATORIAL',
      },
    ],
  },
  null,
  2,
);

export default function ImportacoesPage() {
  const [texto, setTexto] = useState(exemplo);
  const [id, setId] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [ocupado, setOcupado] = useState(false);
  const enviando = useRef(false);

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

  function enviar(event) {
    event.preventDefault();
    executar(async () => {
      const resposta = await enviarLote(texto);
      setId(String(resposta.id));
      setResumo(resposta);
      setResultado(null);
      setDetalhe(null);
      setFeedback({
        mensagem: `Lote #${resposta.id} recebido. Revise as linhas antes de confirmar.`,
      });
      setDetalhe(await consultarImportacao(resposta.id));
    });
  }

  function consultar(event) {
    event.preventDefault();
    executar(async () => {
      const resposta = await consultarImportacao(id);
      setResumo(null);
      setResultado(null);
      setDetalhe(resposta);
    });
  }

  function confirmar() {
    executar(async () => {
      const resposta = await confirmarImportacao(detalhe.id);
      setResultado(resposta);
      setDetalhe({ ...detalhe, status: resposta.status });
      setFeedback({ mensagem: 'Importação confirmada.' });
      setDetalhe(await consultarImportacao(detalhe.id));
    });
  }

  return (
    <div className="stack">
      <div className="notice">
        O envio grava o lote e suas linhas em staging. Campos e consultórios são
        criados somente na confirmação, a partir das linhas válidas. Use os
        nomes de municípios e especialidades já cadastrados.
      </div>
      <Feedback {...feedback} />
      <Card title="1. Enviar lote">
        <form className="stack" onSubmit={enviar}>
          <label className="field">
            <span>Abrir arquivo JSON (opcional)</span>
            <input
              type="file"
              accept=".json,application/json"
              disabled={ocupado}
              onChange={(event) => {
                const arquivo = event.target.files?.[0];
                if (arquivo)
                  executar(async () => {
                    setTexto(await arquivo.text());
                    setFeedback({
                      mensagem:
                        'Arquivo carregado. Confira o conteúdo antes de enviar.',
                    });
                  });
              }}
            />
          </label>
          <label className="field">
            <span>Conteúdo do lote (JSON)</span>
            <textarea
              className="json-editor"
              rows={16}
              required
              value={texto}
              disabled={ocupado}
              onChange={(event) => setTexto(event.target.value)}
              spellCheck={false}
            />
          </label>
          <Button type="submit" disabled={ocupado}>
            {ocupado ? 'Processando...' : 'Enviar para validação'}
          </Button>
        </form>
      </Card>
      <Card title="Consultar lote pelo ID">
        <form className="inline-actions" onSubmit={consultar}>
          <label className="field">
            <span>ID da importação</span>
            <input
              type="number"
              min="1"
              max="2147483647"
              step="1"
              required
              value={id}
              disabled={ocupado}
              onChange={(event) => setId(event.target.value)}
            />
          </label>
          <Button type="submit" disabled={ocupado}>
            Consultar lote
          </Button>
        </form>
      </Card>
      {detalhe && (
        <>
          <Card
            title={`2. Revisar lote #${detalhe.id}`}
            description={`Status: ${detalhe.status}`}
          >
            <p>
              Total: {detalhe.linhas.length} · Válidas:{' '}
              {
                detalhe.linhas.filter((linha) => linha.situacao === 'VALIDA')
                  .length
              }{' '}
              · Inválidas:{' '}
              {
                detalhe.linhas.filter((linha) => linha.situacao === 'INVALIDA')
                  .length
              }
            </p>
            <DataTable
              caption="Linhas da importação"
              columns={[
                { key: 'posicao', label: 'Linha' },
                { key: 'situacao', label: 'Situação' },
                {
                  key: 'erros',
                  label: 'Erros',
                  render: (linha) => linha.erros.join(', ') || 'Sem erros',
                },
              ]}
              rows={detalhe.linhas.map((linha) => ({
                ...linha,
                id: linha.posicao,
              }))}
              emptyTitle="Lote sem linhas"
            />
          </Card>
          <Card title="3. Confirmar importação">
            <Button
              disabled={ocupado || detalhe.status !== 'PENDENTE_CONFIRMACAO'}
              onClick={confirmar}
            >
              Confirmar linhas válidas do lote #{detalhe.id}
            </Button>
          </Card>
        </>
      )}
      {resumo && !detalhe && (
        <div className="notice">
          Lote recebido: #{resumo.id}. Consulte esse ID para recuperar a
          revisão.
        </div>
      )}
      {resultado && (
        <Card title="Resultado da confirmação">
          <p>Campos criados: {resultado.camposCriados}</p>
          <p>Consultórios criados: {resultado.consultoriosCriados}</p>
          <p>Linhas ignoradas: {resultado.linhasIgnoradas}</p>
        </Card>
      )}
    </div>
  );
}
