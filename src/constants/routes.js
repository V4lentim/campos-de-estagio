import { cadastros, urlCadastro } from '../config/cadastros.js';

export const routes = {
  login: '/',
  painel: '/painel',
  campos: '/campos',
  campoExemplo: '/campos/exemplo',
  campoDetalhe: '/campos/:id',
  consultorios: '/consultorios',
  alunos: '/alunos',
  preceptores: '/preceptores',
  preceptorExemplo: '/preceptores/exemplo',
  preceptorDetalhe: '/preceptores/:id',
  vinculos: '/vinculos',
  contratos: '/contratos',
  alocacoes: '/alocacoes',
  faixas: '/faixas',
  importacoes: '/importacoes',
  avaliacoes: '/avaliacoes',
  mapa: '/mapa',
  distribuicao: '/distribuicao',
  simulador: '/simulador',
};

export const navigation = [
  {
    title: 'Operação',
    items: [
      { to: routes.campos, label: 'Campos de estágio' },
      { to: routes.consultorios, label: 'Consultórios' },
      { to: routes.alunos, label: 'Alunos' },
      { to: routes.alocacoes, label: 'Alocações' },
      { to: routes.faixas, label: 'Faixas de ocupação' },
    ],
  },
  {
    title: 'Extras',
    items: [
      { to: routes.preceptores, label: 'Preceptores', admin: true },
      {
        to: urlCadastro('preceptorCampos'),
        label: 'Preceptores por campo',
        admin: true,
      },
      { to: routes.avaliacoes, label: 'Avaliações', admin: true },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: routes.vinculos, label: 'Vínculos de estágio', admin: true },
      { to: routes.contratos, label: 'Contratos', admin: true },
      { to: routes.importacoes, label: 'Importação', admin: true },
    ],
  },
  {
    title: 'Cadastros de apoio',
    items: [
      'municipios',
      'especialidades',
      'instituicoes',
      'periodos',
      'equipamentos',
      'regrasMunicipios',
      'camposEspecialidades',
      'camposEquipamentos',
      'scores',
      'usuarios',
      'historicoVinculos',
    ].map((recurso) => ({
      to: urlCadastro(recurso),
      label: cadastros[recurso].titulo,
      admin: !cadastros[recurso].consulta,
    })),
  },
];
