const texto = (nome, label, extra = {}) => ({
  nome,
  label,
  tipo: 'text',
  ...extra,
});
const numero = (nome, label, extra = {}) => ({
  nome,
  label,
  tipo: 'number',
  min: 0,
  step: 1,
  ...extra,
});
const data = (nome, label) => ({ nome, label, tipo: 'date' });
const relacao = (nome, label, recurso) => ({
  nome,
  label,
  tipo: 'relacao',
  recurso,
});
const escolha = (nome, label, opcoes, extra = {}) => ({
  nome,
  label,
  tipo: 'select',
  opcoes,
  ...extra,
});
const atendimento = ['AMBULATORIAL', 'PRONTO_ATENDIMENTO'];

export const cadastros = {
  campos: {
    titulo: 'Campos de estágio',
    endpoint: '/campos',
    id: 'CampoID',
    consulta: true,
    url: '/campos',
    exclusaoLogica: true,
    campos: [
      texto('nome', 'Nome'),
      texto('local', 'Local / endereço'),
      texto('categoria', 'Categoria'),
      relacao('MunicipioID', 'Município', 'municipios'),
    ],
  },
  consultorios: {
    titulo: 'Consultórios',
    endpoint: '/consultorios',
    id: 'ConsultorioID',
    consulta: true,
    url: '/consultorios',
    exclusaoLogica: true,
    campos: [
      texto('nome', 'Nome'),
      relacao('CampoID', 'Campo', 'campos'),
      relacao('EspecialidadeID', 'Especialidade', 'especialidades'),
      numero('capacidade_minima', 'Capacidade mínima', {
        resposta: 'capacidadeMin',
      }),
      numero('capacidade_maxima', 'Capacidade máxima', {
        resposta: 'capacidadeMax',
      }),
      escolha('tipoAtendimento', 'Tipo de atendimento', atendimento),
    ],
  },
  alunos: {
    titulo: 'Alunos',
    endpoint: '/alunos',
    id: 'AlunoID',
    consulta: true,
    url: '/alunos',
    campos: [
      texto('nome', 'Nome', { maxLength: 150 }),
      texto('matricula', 'Matrícula', {
        pattern: '[0-9]{2}-[0-9]{5}',
        placeholder: '12-34567',
      }),
      numero('periodo', 'Período acadêmico', {
        min: 1,
        opcional: true,
        anulavel: true,
      }),
      numero('nota_academica', 'Nota acadêmica', {
        max: 999.99,
        step: 'any',
        opcional: true,
        anulavel: true,
      }),
    ],
  },
  municipios: {
    titulo: 'Municípios',
    endpoint: '/municipios',
    id: 'MunicipioID',
    consulta: true,
    detalheConsulta: false,
    campos: [
      texto('nome', 'Nome'),
      texto('uf', 'UF', { minLength: 2, maxLength: 2 }),
    ],
  },
  especialidades: {
    titulo: 'Especialidades',
    endpoint: '/especialidades',
    id: 'EspecialidadeID',
    consulta: true,
    detalheConsulta: false,
    campos: [texto('nome', 'Nome')],
  },
  instituicoes: {
    titulo: 'Instituições',
    endpoint: '/instituicoes',
    id: 'InstituicaoID',
    campos: [texto('nome', 'Nome'), texto('campus', 'Campus')],
  },
  periodos: {
    titulo: 'Períodos',
    endpoint: '/periodos',
    id: 'PeriodoID',
    campos: [
      texto('nome', 'Nome'),
      data('data_inicio', 'Início'),
      data('data_fim', 'Fim'),
      data('fechamento_matricula', 'Fechamento da matrícula'),
    ],
  },
  equipamentos: {
    titulo: 'Equipamentos',
    endpoint: '/equipamentos',
    id: 'EquipamentoID',
    campos: [texto('nome', 'Nome')],
  },
  preceptores: {
    titulo: 'Preceptores',
    endpoint: '/preceptores',
    id: 'PreceptorID',
    url: '/preceptores',
    campos: [
      texto('nome', 'Nome'),
      texto('formacao', 'Formação'),
      texto('disponibilidade', 'Disponibilidade'),
    ],
  },
  preceptorCampos: {
    titulo: 'Preceptores por campo',
    endpoint: '/preceptor-campos',
    id: 'PreceptorCampoID',
    descricao:
      'Extra 1: associação do preceptor ao campo, com início e fim da atuação.',
    campos: [
      relacao('PreceptorID', 'Preceptor', 'preceptores'),
      relacao('CampoID', 'Campo', 'campos'),
      data('data_inicio', 'Início'),
      data('data_fim', 'Fim'),
    ],
  },
  contratos: {
    titulo: 'Contratos',
    endpoint: '/contratos',
    id: 'ContratoID',
    url: '/contratos',
    campos: [
      relacao('InstituicaoID', 'Instituição', 'instituicoes'),
      relacao('CampoID', 'Campo', 'campos'),
      relacao('PreceptorID', 'Preceptor', 'preceptores'),
      data('data_inicio', 'Início'),
      data('data_fim', 'Fim'),
      texto('status', 'Status'),
      numero('valor', 'Valor', { step: 'any' }),
      texto('forma_calculo', 'Forma de cálculo'),
    ],
  },
  vinculos: {
    titulo: 'Vínculos de estágio',
    endpoint: '/vinculos',
    id: 'VinculoID',
    url: '/vinculos',
    descricao:
      'O vínculo de estágio reúne aluno, campo, preceptor, consultório e período. É diferente da alocação de ocupação.',
    campos: [
      relacao('AlunoID', 'Aluno', 'alunos'),
      relacao('CampoID', 'Campo', 'campos'),
      relacao('PreceptorID', 'Preceptor', 'preceptores'),
      relacao('ConsultorioID', 'Consultório', 'consultorios'),
      relacao('PeriodoID', 'Período', 'periodos'),
      data('data_inicio', 'Início'),
      data('data_fim', 'Fim'),
      texto('status', 'Status'),
      texto('motivo_recusa', 'Motivo da recusa', { opcional: true }),
    ],
  },
  avaliacoes: {
    titulo: 'Avaliações',
    endpoint: '/avaliacoes',
    id: 'AvaliacaoID',
    url: '/avaliacoes',
    descricao:
      'Extra 2: o ADMIN registra a avaliação do aluno. Aluno, campo e preceptor devem corresponder ao vínculo escolhido.',
    campos: [
      relacao('VinculoID', 'Vínculo', 'vinculos'),
      relacao('AlunoID', 'Aluno', 'alunos'),
      relacao('InstituicaoID', 'Instituição', 'instituicoes'),
      relacao('CampoID', 'Campo', 'campos'),
      relacao('PreceptorID', 'Preceptor', 'preceptores'),
      escolha('tipo', 'Tipo', ['CAMPO', 'PRECEPTOR']),
      numero('nota', 'Nota', { max: 10, step: 'any' }),
      texto('comentario', 'Comentário', { tipo: 'textarea', maxLength: 1000 }),
      data('data', 'Data'),
    ],
  },
  regrasMunicipios: {
    titulo: 'Regras dos municípios',
    endpoint: '/regras-municipios',
    id: 'RegraID',
    campos: [
      relacao('MunicipioID', 'Município', 'municipios'),
      texto('nome', 'Nome'),
      texto('descricao', 'Descrição'),
      texto('valor', 'Valor'),
    ],
  },
  camposEspecialidades: {
    titulo: 'Especialidades por campo',
    endpoint: '/campos-especialidades',
    id: 'CampoEspecialidadeID',
    campos: [
      relacao('CampoID', 'Campo', 'campos'),
      relacao('EspecialidadeID', 'Especialidade', 'especialidades'),
    ],
  },
  camposEquipamentos: {
    titulo: 'Equipamentos por campo',
    endpoint: '/campos-equipamentos',
    id: 'CampoEquipamentoID',
    campos: [
      relacao('CampoID', 'Campo', 'campos'),
      relacao('EspecialidadeID', 'Especialidade', 'especialidades'),
      relacao('EquipamentoID', 'Equipamento', 'equipamentos'),
      texto('classificacao', 'Classificação'),
    ],
  },
  scores: {
    titulo: 'Scores',
    endpoint: '/scores',
    id: 'ScoreID',
    descricao:
      'Cadastro dos scores existentes. O cálculo automático da metodologia não está disponível na API.',
    campos: [
      relacao('CampoID', 'Campo', 'campos'),
      relacao('EspecialidadeID', 'Especialidade', 'especialidades'),
      texto('tipo_atendimento', 'Tipo de atendimento'),
      numero('dia_semana', 'Dia da semana (1 a 7)', { min: 1, max: 7 }),
      numero('pontuacao', 'Pontuação', { max: 99999999.99, step: 'any' }),
      texto('classificacao', 'Classificação'),
    ],
  },
  usuarios: {
    titulo: 'Usuários',
    endpoint: '/usuarios',
    id: 'id',
    campos: [
      texto('nome', 'Nome', { maxLength: 150 }),
      texto('email', 'E-mail', { tipo: 'email', maxLength: 255 }),
      escolha('perfil', 'Perfil', ['ADMIN', 'CONSULTA'], { resposta: 'papel' }),
      texto('senha', 'Senha inicial', {
        tipo: 'password',
        minLength: 8,
        soCriacao: true,
      }),
    ],
  },
  historicoVinculos: {
    titulo: 'Histórico de vínculos',
    endpoint: '/historico-vinculos',
    id: 'HistoricoID',
    campos: [
      relacao('VinculoID', 'Vínculo', 'vinculos'),
      relacao('UsuarioID', 'Usuário', 'usuarios'),
      texto('acao', 'Ação'),
      texto('motivo', 'Motivo'),
      data('data_alteracao', 'Data da alteração'),
    ],
  },
};

export function urlCadastro(recurso) {
  return cadastros[recurso].url ?? `/cadastros/${recurso}`;
}

export function podeConsultar(recurso, papel) {
  return (
    papel === 'ADMIN' ||
    (papel === 'CONSULTA' && cadastros[recurso]?.consulta === true)
  );
}

export function rotuloRegistro(recurso, registro) {
  const config = cadastros[recurso];
  if (recurso === 'vinculos') {
    return `Vínculo #${registro.VinculoID} · aluno #${registro.AlunoID} · campo #${registro.CampoID} · preceptor #${registro.PreceptorID}`;
  }
  return `${registro.nome ?? config.titulo} (#${registro[config.id]})`;
}
