import { useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../../services/api.js';
import { carregarCadastro } from '../../services/cadastros.js';
import {
  cadastros,
  podeConsultar,
  rotuloRegistro,
  urlCadastro,
} from '../../config/cadastros.js';
import { useApiData } from '../../hooks/useApiData.js';
import { useAuth } from '../../hooks/useAuth.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Feedback from '../../components/shared/Feedback.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

function Detalhe({ recurso, id }) {
  const config = cadastros[recurso];
  const carregar = useCallback(
    async (signal) => {
      if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647)
        throw new Error('ID inválido.');
      const [registro, { referencias }] = await Promise.all([
        api(`${config.endpoint}/${id}`, { signal }),
        carregarCadastro(recurso, signal),
      ]);
      return { registro, referencias };
    },
    [recurso, id, config],
  );
  const { dados, erro, carregando, recarregar } = useApiData(carregar);

  return (
    <div className="stack">
      <Link to={urlCadastro(recurso)}>← Voltar para {config.titulo}</Link>
      <Feedback erro={erro} />
      {carregando && <p role="status">Carregando registro...</p>}
      {erro && (
        <Button variant="secondary" onClick={recarregar}>
          Tentar novamente
        </Button>
      )}
      {dados && (
        <Card title={rotuloRegistro(recurso, dados.registro)}>
          <dl className="detail-data">
            {config.campos
              .filter((campo) => !campo.soCriacao)
              .map((campo) => {
                let valor = dados.registro[campo.resposta ?? campo.nome];
                if (campo.recurso) {
                  const item = dados.referencias[campo.recurso]?.find(
                    (registro) =>
                      registro[cadastros[campo.recurso].id] === valor,
                  );
                  valor = item
                    ? rotuloRegistro(campo.recurso, item)
                    : `#${valor ?? '—'}`;
                } else if (campo.tipo === 'date' && valor) {
                  valor = valor.slice(0, 10).split('-').reverse().join('/');
                }
                return (
                  <div key={campo.nome}>
                    <dt>{campo.label}</dt>
                    <dd>{valor ?? '—'}</dd>
                  </div>
                );
              })}
          </dl>
        </Card>
      )}
    </div>
  );
}

export default function CadastroDetailPage({ recurso }) {
  const { entidade, id } = useParams();
  const { sessao } = useAuth();
  const nome = recurso ?? entidade;
  if (!Object.hasOwn(cadastros, nome)) return <NotFoundPage />;
  if (
    !podeConsultar(nome, sessao?.papel) ||
    (sessao?.papel === 'CONSULTA' && cadastros[nome].detalheConsulta === false)
  ) {
    return (
      <Feedback mensagem="Seu perfil não tem acesso aos detalhes deste cadastro." />
    );
  }
  return <Detalhe key={`${nome}:${id}`} recurso={nome} id={id} />;
}
