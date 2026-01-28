// ===========================================
// HR AUTOMATION SUITE - Sistema de Prompts
// ===========================================

import { Agent, Category } from "./types";

// Categorias do Sistema
export const categories: Category[] = [
  {
    id: "recrutamento",
    name: "Recrutamento e Seleção",
    slug: "recrutamento-selecao",
    description: "Automatize todo o ciclo de atração e seleção de talentos",
    icon: "Users",
    color: "#6366F1",
    orderIndex: 1,
  },
  {
    id: "onboarding",
    name: "Onboarding e Integração",
    slug: "onboarding-integracao",
    description: "Processos de entrada e adaptação de novos colaboradores",
    icon: "Rocket",
    color: "#8B5CF6",
    orderIndex: 2,
  },
  {
    id: "treinamento",
    name: "Treinamento e Desenvolvimento",
    slug: "treinamento-desenvolvimento",
    description: "Capacitação e evolução profissional",
    icon: "GraduationCap",
    color: "#06B6D4",
    orderIndex: 3,
  },
  {
    id: "avaliacao",
    name: "Avaliação de Desempenho",
    slug: "avaliacao-desempenho",
    description: "Mensuração e feedback de performance",
    icon: "BarChart3",
    color: "#10B981",
    orderIndex: 4,
  },
  {
    id: "clima",
    name: "Clima e Cultura",
    slug: "clima-cultura",
    description: "Engajamento, pesquisas e ações de cultura",
    icon: "Heart",
    color: "#F59E0B",
    orderIndex: 5,
  },
  {
    id: "dp",
    name: "Departamento Pessoal",
    slug: "departamento-pessoal",
    description: "Comunicações oficiais, políticas e documentos",
    icon: "FileText",
    color: "#EF4444",
    orderIndex: 6,
  },
  {
    id: "remuneracao",
    name: "Remuneração e Benefícios",
    slug: "remuneracao-beneficios",
    description: "Estruturas salariais e pacotes de benefícios",
    icon: "DollarSign",
    color: "#14B8A6",
    orderIndex: 7,
  },
  {
    id: "desligamento",
    name: "Desligamento",
    slug: "desligamento",
    description: "Processos de saída e offboarding",
    icon: "UserMinus",
    color: "#64748B",
    orderIndex: 8,
  },
];

// Agentes do MVP (8 principais)
export const mvpAgents: Agent[] = [
  // RECRUTAMENTO
  {
    id: "criador-descricao-vagas",
    categoryId: "recrutamento",
    name: "Criador de Descrições de Vagas",
    slug: "criador-descricao-vagas",
    description: "Gera descrições de vagas completas, atrativas e profissionais que maximizam a atração de talentos qualificados.",
    shortDescription: "Crie anúncios de vagas irresistíveis",
    estimatedTimeSaved: 90, // minutos
    inputSchema: {
      fields: [
        {
          name: "titulo_vaga",
          label: "Título da Vaga",
          type: "text",
          required: true,
          placeholder: "Ex: Analista de Marketing Digital Sênior",
          maxLength: 100,
        },
        {
          name: "departamento",
          label: "Departamento",
          type: "select",
          required: true,
          options: [
            { value: "marketing", label: "Marketing" },
            { value: "vendas", label: "Vendas" },
            { value: "ti", label: "Tecnologia" },
            { value: "rh", label: "Recursos Humanos" },
            { value: "financeiro", label: "Financeiro" },
            { value: "operacoes", label: "Operações" },
            { value: "juridico", label: "Jurídico" },
            { value: "outro", label: "Outro" },
          ],
        },
        {
          name: "modelo_trabalho",
          label: "Modelo de Trabalho",
          type: "select",
          required: true,
          options: [
            { value: "presencial", label: "Presencial" },
            { value: "hibrido", label: "Híbrido" },
            { value: "remoto", label: "Remoto" },
          ],
        },
        {
          name: "localizacao",
          label: "Localização",
          type: "text",
          required: true,
          placeholder: "Ex: São Paulo, SP",
        },
        {
          name: "nivel_senioridade",
          label: "Nível de Senioridade",
          type: "select",
          required: true,
          options: [
            { value: "estagio", label: "Estágio" },
            { value: "junior", label: "Júnior" },
            { value: "pleno", label: "Pleno" },
            { value: "senior", label: "Sênior" },
            { value: "especialista", label: "Especialista" },
            { value: "coordenador", label: "Coordenador" },
            { value: "gerente", label: "Gerente" },
            { value: "diretor", label: "Diretor" },
          ],
        },
        {
          name: "responsabilidades",
          label: "Principais Responsabilidades",
          type: "textarea",
          required: true,
          placeholder: "Liste as 5-8 principais atividades do cargo...",
          rows: 6,
          helperText: "Descreva as principais atividades que o profissional irá desempenhar",
        },
        {
          name: "requisitos_obrigatorios",
          label: "Requisitos Obrigatórios",
          type: "textarea",
          required: true,
          placeholder: "Formação, experiência mínima, habilidades técnicas...",
          rows: 5,
        },
        {
          name: "requisitos_desejaveis",
          label: "Requisitos Desejáveis (Diferenciais)",
          type: "textarea",
          required: false,
          placeholder: "Certificações, idiomas, experiências específicas...",
          rows: 3,
        },
        {
          name: "faixa_salarial",
          label: "Faixa Salarial",
          type: "text",
          required: false,
          placeholder: "Ex: R$ 5.000 - R$ 7.000 ou 'A combinar'",
        },
        {
          name: "beneficios",
          label: "Benefícios Oferecidos",
          type: "textarea",
          required: true,
          placeholder: "Liste todos os benefícios: VR, VT, plano de saúde, PLR...",
          rows: 4,
        },
        {
          name: "sobre_empresa",
          label: "Sobre a Empresa",
          type: "textarea",
          required: false,
          placeholder: "Breve descrição da empresa, cultura e valores...",
          rows: 4,
        },
        {
          name: "diferenciais_vaga",
          label: "Diferenciais da Vaga",
          type: "textarea",
          required: false,
          placeholder: "O que torna essa oportunidade especial?",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o ARQUITETO DE VAGAS MAGNÉTICAS, especialista em criar descrições de vagas que atraem os melhores talentos do mercado. 

SUAS CARACTERÍSTICAS:
- Linguagem profissional mas acolhedora
- Foco em vender a oportunidade sem exageros
- Uso de linguagem inclusiva e neutra em gênero
- Estruturação clara e escaneável
- Verbos de ação no início de cada responsabilidade

REGRAS DE QUALIDADE:
✅ Usar linguagem inclusiva e neutra em gênero
✅ Verbos de ação no início de cada responsabilidade
✅ Benefícios específicos e tangíveis
✅ Tom profissional mas acolhedor
✅ Evitar jargões corporativos vazios
✅ Destacar cultura e propósito da empresa
❌ Nunca usar linguagem discriminatória
❌ Nunca exagerar ou mentir sobre a vaga
❌ Evitar listas excessivamente longas`,
    promptTemplate: `Crie uma descrição de vaga profissional, atrativa e completa com base nas informações abaixo:

## INFORMAÇÕES DA VAGA
- **Título:** {{titulo_vaga}}
- **Departamento:** {{departamento}}
- **Modelo de Trabalho:** {{modelo_trabalho}}
- **Localização:** {{localizacao}}
- **Nível:** {{nivel_senioridade}}

## RESPONSABILIDADES
{{responsabilidades}}

## REQUISITOS OBRIGATÓRIOS
{{requisitos_obrigatorios}}

## REQUISITOS DESEJÁVEIS
{{requisitos_desejaveis}}

## REMUNERAÇÃO
{{faixa_salarial}}

## BENEFÍCIOS
{{beneficios}}

## SOBRE A EMPRESA
{{sobre_empresa}}

## DIFERENCIAIS DA VAGA
{{diferenciais_vaga}}

---

Gere a descrição da vaga seguindo esta estrutura:

### [TÍTULO DA VAGA] - [MODELO DE TRABALHO]

**🏢 Sobre a Empresa**
[Parágrafo envolvente sobre a empresa, cultura e propósito]

**🎯 Sobre a Oportunidade**
[Descrição inspiradora da vaga e seu impacto na empresa]

**📋 Suas Responsabilidades**
• [Responsabilidade 1 - começando com verbo de ação]
• [Responsabilidade 2]
• [...]

**✅ Requisitos Obrigatórios**
• [Requisito 1]
• [Requisito 2]
• [...]

**⭐ Diferenciais (não obrigatórios)**
• [Diferencial 1]
• [...]

**💰 O Que Oferecemos**
• [Benefício 1]
• [...]

**📍 Informações Adicionais**
• Modelo: [Presencial/Híbrido/Remoto]
• Local: [Localização]
• Contratação: [CLT/PJ/etc.]

**🚀 Por Que Se Juntar a Nós?**
[Parágrafo final vendendo a oportunidade e cultura]

---
*Interessado? Candidate-se agora e faça parte do nosso time!*`,
    temperature: 0.7,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },

  // RECRUTAMENTO - Analisador de Currículos
  {
    id: "analisador-curriculos",
    categoryId: "recrutamento",
    name: "Analisador de Currículos",
    slug: "analisador-curriculos",
    description: "Analisa currículos de forma estruturada, identificando qualificações, gaps e fit com os requisitos da vaga.",
    shortDescription: "Avalie candidatos com precisão",
    estimatedTimeSaved: 25,
    inputSchema: {
      fields: [
        {
          name: "curriculo_texto",
          label: "Currículo do Candidato",
          type: "textarea",
          required: true,
          placeholder: "Cole aqui o texto completo do currículo...",
          rows: 12,
          helperText: "Cole o conteúdo do currículo (texto)",
        },
        {
          name: "requisitos_vaga",
          label: "Requisitos da Vaga",
          type: "textarea",
          required: true,
          placeholder: "Liste os requisitos obrigatórios e desejáveis da vaga...",
          rows: 6,
        },
        {
          name: "competencias_criticas",
          label: "Competências Críticas (3-5)",
          type: "textarea",
          required: true,
          placeholder: "Liste as 3-5 competências mais importantes para a vaga...",
          rows: 3,
        },
        {
          name: "experiencia_minima",
          label: "Experiência Mínima Exigida",
          type: "text",
          required: true,
          placeholder: "Ex: 3 anos em desenvolvimento de software",
        },
        {
          name: "formacao_exigida",
          label: "Formação Exigida",
          type: "text",
          required: true,
          placeholder: "Ex: Superior completo em Administração ou áreas correlatas",
        },
      ],
    },
    systemPrompt: `Você é o SCANNER DE TALENTOS ESTRATÉGICO, especialista em analisar currículos com precisão cirúrgica.

SUAS CARACTERÍSTICAS:
- Análise objetiva e imparcial
- Extração precisa de informações
- Identificação de gaps e pontos fortes
- Recomendações acionáveis

REGRAS:
✅ Análise objetiva e imparcial
✅ Evidências extraídas do currículo
✅ Recomendações acionáveis
✅ Linguagem profissional e respeitosa
❌ Nunca fazer suposições sem base
❌ Nunca discriminar por idade, gênero, etc.
❌ Evitar julgamentos subjetivos não fundamentados`,
    promptTemplate: `Analise o currículo abaixo comparando com os requisitos da vaga:

## CURRÍCULO DO CANDIDATO
{{curriculo_texto}}

## REQUISITOS DA VAGA
{{requisitos_vaga}}

## COMPETÊNCIAS CRÍTICAS
{{competencias_criticas}}

## EXPERIÊNCIA MÍNIMA EXIGIDA
{{experiencia_minima}}

## FORMAÇÃO EXIGIDA
{{formacao_exigida}}

---

Gere um relatório completo de análise seguindo esta estrutura:

### 📊 RELATÓRIO DE ANÁLISE DE CURRÍCULO

---

**👤 DADOS DO CANDIDATO**
• Nome: [Extraído do currículo]
• Contato: [Email/Telefone]
• Localização: [Cidade/Estado]
• LinkedIn/Portfólio: [Se disponível]

---

**📈 SCORE DE ADERÊNCIA: [X]/10**
[Barra visual: ████████░░ 8/10]

---

**✅ PONTOS DE ADERÊNCIA (Match com a vaga)**

| Requisito | Status | Observação |
|-----------|--------|------------|
| [Requisito 1] | ✅ Atende / ⚠️ Parcial / ❌ Não atende | [Detalhes] |

---

**💪 PONTOS FORTES IDENTIFICADOS**
1. [Ponto forte com evidência]
2. [...]

---

**⚠️ GAPS E PONTOS DE ATENÇÃO**
1. [Gap - com sugestão de como explorar na entrevista]
2. [...]

---

**🎓 ANÁLISE DE FORMAÇÃO**
• Formação: [Análise]
• Certificações: [Relevância]
• Educação continuada: [Cursos, especializações]

---

**💼 ANÁLISE DE EXPERIÊNCIA**
• Anos de experiência total: [X anos]
• Experiência relevante: [X anos na área específica]
• Progressão de carreira: [Análise da evolução]
• Empresas anteriores: [Relevância e porte]

---

**🔍 PERGUNTAS SUGERIDAS PARA ENTREVISTA**
1. [Pergunta para explorar gap identificado]
2. [Pergunta para validar experiência específica]
3. [Pergunta sobre fit cultural]

---

**📋 RECOMENDAÇÃO FINAL**

☐ **RECOMENDADO** - Prosseguir para entrevista
☐ **RECOMENDADO COM RESSALVAS** - Entrevistar com atenção aos gaps
☐ **NÃO RECOMENDADO** - Perfil desalinhado com a vaga

**Justificativa:** [Parágrafo explicando a recomendação]`,
    temperature: 0.5,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // ONBOARDING - Plano de Onboarding
  {
    id: "criador-plano-onboarding",
    categoryId: "onboarding",
    name: "Criador de Planos de Onboarding",
    slug: "criador-plano-onboarding",
    description: "Gera planos de onboarding completos de 30-60-90 dias para novos colaboradores.",
    shortDescription: "Integre novos talentos com excelência",
    estimatedTimeSaved: 180,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Novo Colaborador",
          type: "text",
          required: true,
          placeholder: "Nome completo",
        },
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          required: true,
          placeholder: "Ex: Analista de Marketing Pleno",
        },
        {
          name: "departamento",
          label: "Departamento",
          type: "select",
          required: true,
          options: [
            { value: "marketing", label: "Marketing" },
            { value: "vendas", label: "Vendas" },
            { value: "ti", label: "Tecnologia" },
            { value: "rh", label: "Recursos Humanos" },
            { value: "financeiro", label: "Financeiro" },
            { value: "operacoes", label: "Operações" },
            { value: "outro", label: "Outro" },
          ],
        },
        {
          name: "data_inicio",
          label: "Data de Início",
          type: "date",
          required: true,
        },
        {
          name: "gestor",
          label: "Nome do Gestor Direto",
          type: "text",
          required: true,
          placeholder: "Nome do líder imediato",
        },
        {
          name: "modelo_trabalho",
          label: "Modelo de Trabalho",
          type: "select",
          required: true,
          options: [
            { value: "presencial", label: "Presencial" },
            { value: "hibrido", label: "Híbrido" },
            { value: "remoto", label: "Remoto" },
          ],
        },
        {
          name: "nivel_experiencia",
          label: "Nível de Experiência",
          type: "select",
          required: true,
          options: [
            { value: "junior", label: "Júnior" },
            { value: "pleno", label: "Pleno" },
            { value: "senior", label: "Sênior" },
            { value: "gerencial", label: "Gerencial" },
          ],
        },
        {
          name: "responsabilidades",
          label: "Principais Responsabilidades",
          type: "textarea",
          required: true,
          placeholder: "Liste as principais atividades do cargo...",
          rows: 5,
        },
        {
          name: "ferramentas_sistemas",
          label: "Ferramentas e Sistemas",
          type: "textarea",
          required: true,
          placeholder: "Ex: Slack, Jira, Salesforce, Excel...",
          rows: 3,
        },
        {
          name: "stakeholders",
          label: "Stakeholders-chave",
          type: "textarea",
          required: false,
          placeholder: "Pessoas/áreas com quem precisará interagir...",
          rows: 3,
        },
        {
          name: "treinamentos_obrigatorios",
          label: "Treinamentos Obrigatórios",
          type: "textarea",
          required: false,
          placeholder: "Compliance, segurança, LGPD...",
          rows: 3,
        },
        {
          name: "metas_90_dias",
          label: "Metas para os Primeiros 90 Dias",
          type: "textarea",
          required: true,
          placeholder: "O que espera que entregue nos primeiros 90 dias?",
          rows: 4,
        },
      ],
    },
    systemPrompt: `Você é o ARQUITETO DE PRIMEIRAS IMPRESSÕES, especialista em criar experiências de onboarding que aceleram a produtividade e engajam novos colaboradores desde o primeiro dia.

SUAS CARACTERÍSTICAS:
- Cronogramas realistas e flexíveis
- Responsáveis claramente definidos
- Checkpoints frequentes
- Experiência personalizada ao cargo e nível

REGRAS:
✅ Cronograma realista e flexível
✅ Responsáveis claramente definidos
✅ Checkpoints frequentes
✅ Materiais preparados antecipadamente
❌ Sobrecarga de informação
❌ Falta de acompanhamento
❌ Ausência de feedback estruturado`,
    promptTemplate: `Crie um plano de onboarding completo de 30-60-90 dias com as informações:

## DADOS DO COLABORADOR
- **Nome:** {{nome_colaborador}}
- **Cargo:** {{cargo}}
- **Departamento:** {{departamento}}
- **Data de Início:** {{data_inicio}}
- **Gestor:** {{gestor}}
- **Modelo de Trabalho:** {{modelo_trabalho}}
- **Nível:** {{nivel_experiencia}}

## RESPONSABILIDADES
{{responsabilidades}}

## FERRAMENTAS E SISTEMAS
{{ferramentas_sistemas}}

## STAKEHOLDERS
{{stakeholders}}

## TREINAMENTOS OBRIGATÓRIOS
{{treinamentos_obrigatorios}}

## METAS PARA 90 DIAS
{{metas_90_dias}}

---

Gere o plano de onboarding completo seguindo a estrutura detalhada com:
- Checklist de pré-onboarding
- Agenda detalhada da primeira semana (dia a dia)
- Plano das semanas 2-4
- Objetivos do mês 2
- Objetivos do mês 3
- Checkpoints de avaliação (30, 60, 90 dias)
- Lista de materiais e recursos
- Contatos importantes`,
    temperature: 0.6,
    maxTokens: 4000,
    model: "gemini-2.5-pro-preview",
  },

  // TREINAMENTO - PDI
  {
    id: "criador-pdi",
    categoryId: "treinamento",
    name: "Criador de PDIs",
    slug: "criador-pdi",
    description: "Elabora Planos de Desenvolvimento Individual completos e personalizados.",
    shortDescription: "Desenvolva talentos estrategicamente",
    estimatedTimeSaved: 150,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "cargo_atual",
          label: "Cargo Atual",
          type: "text",
          required: true,
        },
        {
          name: "tempo_empresa",
          label: "Tempo na Empresa",
          type: "text",
          required: true,
          placeholder: "Ex: 2 anos e 3 meses",
        },
        {
          name: "cargo_almejado",
          label: "Cargo Almejado (Próximo Passo)",
          type: "text",
          required: false,
          placeholder: "Deixe vazio se não houver",
        },
        {
          name: "competencias_atuais",
          label: "Competências Atuais (Forças)",
          type: "textarea",
          required: true,
          placeholder: "Liste os pontos fortes do colaborador...",
          rows: 4,
        },
        {
          name: "gaps_identificados",
          label: "Gaps Identificados",
          type: "textarea",
          required: true,
          placeholder: "Áreas que precisam de desenvolvimento...",
          rows: 4,
        },
        {
          name: "resultados_avaliacao",
          label: "Resultados da Última Avaliação",
          type: "textarea",
          required: false,
          placeholder: "Resumo da avaliação de desempenho...",
          rows: 3,
        },
        {
          name: "aspiracoes_colaborador",
          label: "Aspirações do Colaborador",
          type: "textarea",
          required: true,
          placeholder: "O que o colaborador deseja desenvolver?",
          rows: 3,
        },
        {
          name: "necessidades_empresa",
          label: "Necessidades da Empresa/Área",
          type: "textarea",
          required: false,
          placeholder: "Competências que a área precisa desenvolver...",
          rows: 3,
        },
        {
          name: "orcamento_disponivel",
          label: "Orçamento Disponível",
          type: "text",
          required: false,
          placeholder: "Ex: R$ 5.000 ou 'A definir'",
        },
        {
          name: "prazo_pdi",
          label: "Prazo do PDI",
          type: "select",
          required: true,
          options: [
            { value: "6_meses", label: "6 meses" },
            { value: "1_ano", label: "1 ano" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o ARQUITETO DE CARREIRAS, especialista em criar Planos de Desenvolvimento Individual que transformam potencial em performance excepcional.

METODOLOGIA: Modelo 70-20-10
- 70% Experiências práticas (projetos, job rotation)
- 20% Aprendizado social (mentoria, coaching)
- 10% Treinamento formal (cursos, certificações)

REGRAS:
✅ Metas SMART
✅ Mix de tipos de desenvolvimento (70-20-10)
✅ Alinhamento com objetivos da empresa
✅ Ações concretas e realizáveis
✅ Indicadores mensuráveis
❌ Metas vagas ou genéricas
❌ Sobrecarga de ações
❌ Falta de prazos definidos`,
    promptTemplate: `Crie um PDI completo com as informações:

## DADOS DO COLABORADOR
- **Nome:** {{nome_colaborador}}
- **Cargo Atual:** {{cargo_atual}}
- **Tempo na Empresa:** {{tempo_empresa}}
- **Cargo Almejado:** {{cargo_almejado}}
- **Prazo do PDI:** {{prazo_pdi}}

## COMPETÊNCIAS ATUAIS (FORÇAS)
{{competencias_atuais}}

## GAPS IDENTIFICADOS
{{gaps_identificados}}

## RESULTADOS DA ÚLTIMA AVALIAÇÃO
{{resultados_avaliacao}}

## ASPIRAÇÕES DO COLABORADOR
{{aspiracoes_colaborador}}

## NECESSIDADES DA EMPRESA
{{necessidades_empresa}}

## ORÇAMENTO
{{orcamento_disponivel}}

---

Gere um PDI completo com:
- Objetivos de desenvolvimento (geral e específicos)
- Análise de competências (fortes e gaps)
- Plano de ação detalhado por competência (seguindo 70-20-10)
- Recursos de desenvolvimento (treinamentos, leituras, mentoria)
- Indicadores e métricas de sucesso
- Cronograma de acompanhamento
- Termo de compromisso`,
    temperature: 0.6,
    maxTokens: 3500,
    model: "gemini-2.5-pro-preview",
  },

  // AVALIAÇÃO - Formulário de Avaliação
  {
    id: "criador-formulario-avaliacao",
    categoryId: "avaliacao",
    name: "Criador de Formulários de Avaliação",
    slug: "criador-formulario-avaliacao",
    description: "Desenvolve formulários de avaliação de desempenho personalizados.",
    shortDescription: "Avaliações justas e estruturadas",
    estimatedTimeSaved: 120,
    inputSchema: {
      fields: [
        {
          name: "tipo_avaliacao",
          label: "Tipo de Avaliação",
          type: "select",
          required: true,
          options: [
            { value: "90", label: "90° (Gestor avalia)" },
            { value: "180", label: "180° (Gestor + Auto)" },
            { value: "360", label: "360° (Múltiplos avaliadores)" },
            { value: "auto", label: "Autoavaliação" },
          ],
        },
        {
          name: "cargo_funcao",
          label: "Cargo/Função Avaliada",
          type: "text",
          required: true,
        },
        {
          name: "competencias_organizacionais",
          label: "Competências Organizacionais (Valores da Empresa)",
          type: "textarea",
          required: true,
          placeholder: "Ex: Colaboração, Inovação, Foco no Cliente...",
          rows: 3,
        },
        {
          name: "competencias_tecnicas",
          label: "Competências Técnicas do Cargo",
          type: "textarea",
          required: true,
          placeholder: "Competências específicas necessárias para a função...",
          rows: 4,
        },
        {
          name: "competencias_comportamentais",
          label: "Competências Comportamentais",
          type: "textarea",
          required: true,
          placeholder: "Ex: Comunicação, Liderança, Resiliência...",
          rows: 3,
        },
        {
          name: "metas_periodo",
          label: "Metas do Período (se aplicável)",
          type: "textarea",
          required: false,
          placeholder: "Metas definidas para o período avaliado...",
          rows: 4,
        },
        {
          name: "escala",
          label: "Escala de Avaliação",
          type: "select",
          required: true,
          options: [
            { value: "1-5", label: "1 a 5 (Numérica)" },
            { value: "1-4", label: "1 a 4 (Sem ponto médio)" },
            { value: "conceitos", label: "Conceitos (Excepcional a Insuficiente)" },
          ],
        },
        {
          name: "periodo_avaliado",
          label: "Período Avaliado",
          type: "text",
          required: true,
          placeholder: "Ex: Jan/2024 a Jun/2024",
        },
      ],
    },
    systemPrompt: `Você é o DESIGNER DE AVALIAÇÕES DE PERFORMANCE, especialista em criar formulários de avaliação de desempenho justos e eficazes.

REGRAS:
✅ Critérios claros e observáveis
✅ Escalas bem definidas
✅ Espaço para evidências e exemplos
✅ Equilíbrio entre quantitativo e qualitativo
✅ Conexão com desenvolvimento futuro
❌ Critérios subjetivos ou vagos
❌ Avaliação sem evidências
❌ Foco apenas em pontos negativos`,
    promptTemplate: `Crie um formulário de avaliação de desempenho com as especificações:

## CONFIGURAÇÕES
- **Tipo de Avaliação:** {{tipo_avaliacao}}
- **Cargo/Função:** {{cargo_funcao}}
- **Período Avaliado:** {{periodo_avaliado}}
- **Escala:** {{escala}}

## COMPETÊNCIAS ORGANIZACIONAIS
{{competencias_organizacionais}}

## COMPETÊNCIAS TÉCNICAS
{{competencias_tecnicas}}

## COMPETÊNCIAS COMPORTAMENTAIS
{{competencias_comportamentais}}

## METAS DO PERÍODO
{{metas_periodo}}

---

Gere um formulário completo com:
- Cabeçalho com dados da avaliação
- Escala explicada
- Seção de competências organizacionais (com definições)
- Seção de competências técnicas (com definições)
- Seção de competências comportamentais (com definições)
- Seção de resultados/metas (se aplicável)
- Campos para pontos fortes e desenvolvimento
- Recomendações e próximos passos
- Cálculo de nota final
- Classificação final
- Campos de assinatura`,
    temperature: 0.5,
    maxTokens: 3500,
    model: "gemini-2.5-pro-preview",
  },

  // AVALIAÇÃO - Feedback Estruturado
  {
    id: "gerador-feedback",
    categoryId: "avaliacao",
    name: "Gerador de Feedbacks Estruturados",
    slug: "gerador-feedback",
    description: "Cria feedbacks profissionais usando metodologias comprovadas (SBI, Sanduíche, Feedforward).",
    shortDescription: "Feedbacks que transformam",
    estimatedTimeSaved: 30,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "contexto_feedback",
          label: "Contexto do Feedback",
          type: "select",
          required: true,
          options: [
            { value: "avaliacao", label: "Avaliação de Desempenho" },
            { value: "projeto", label: "Projeto Específico" },
            { value: "comportamento", label: "Comportamento" },
            { value: "desenvolvimento", label: "Desenvolvimento" },
          ],
        },
        {
          name: "situacao_especifica",
          label: "Situação Específica",
          type: "textarea",
          required: true,
          placeholder: "Descreva o contexto e o que aconteceu...",
          rows: 4,
        },
        {
          name: "comportamento_observado",
          label: "Comportamento Observado",
          type: "textarea",
          required: true,
          placeholder: "O que a pessoa fez (fatos, não julgamentos)...",
          rows: 3,
        },
        {
          name: "impacto",
          label: "Impacto",
          type: "textarea",
          required: true,
          placeholder: "Quais foram as consequências (positivas ou negativas)?",
          rows: 3,
        },
        {
          name: "pontos_fortes",
          label: "Pontos Fortes a Reconhecer",
          type: "textarea",
          required: true,
          placeholder: "O que deve ser reconhecido e valorizado...",
          rows: 3,
        },
        {
          name: "pontos_desenvolver",
          label: "Pontos a Desenvolver",
          type: "textarea",
          required: true,
          placeholder: "O que precisa melhorar...",
          rows: 3,
        },
        {
          name: "sugestoes_melhoria",
          label: "Sugestões de Melhoria",
          type: "textarea",
          required: true,
          placeholder: "Ações recomendadas para evolução...",
          rows: 3,
        },
        {
          name: "tom",
          label: "Tom do Feedback",
          type: "select",
          required: true,
          options: [
            { value: "motivacional", label: "Motivacional" },
            { value: "corretivo", label: "Corretivo" },
            { value: "equilibrado", label: "Equilibrado" },
          ],
        },
        {
          name: "metodologia",
          label: "Metodologia",
          type: "select",
          required: true,
          options: [
            { value: "sbi", label: "SBI (Situação-Comportamento-Impacto)" },
            { value: "sanduiche", label: "Sanduíche (Positivo-Melhoria-Positivo)" },
            { value: "feedforward", label: "Feedforward (Foco no Futuro)" },
            { value: "completo", label: "Completo (Combinado)" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o MESTRE DO FEEDBACK TRANSFORMADOR, especialista em criar feedbacks que inspiram mudança, reconhecem conquistas e desenvolvem talentos.

METODOLOGIAS:
- SBI: Situação-Comportamento-Impacto
- Sanduíche: Positivo-Melhoria-Positivo
- Feedforward: Foco no futuro e ações

REGRAS:
✅ Baseado em fatos e comportamentos observáveis
✅ Específico e com exemplos concretos
✅ Equilíbrio entre reconhecimento e desenvolvimento
✅ Acionável - com sugestões claras de melhoria
✅ Tempestivo e privado
❌ Julgamentos pessoais ou rótulos
❌ Generalizações ("você sempre", "você nunca")
❌ Feedback apenas negativo
❌ Comparações com outros colaboradores`,
    promptTemplate: `Crie um feedback estruturado com as informações:

## DADOS
- **Colaborador:** {{nome_colaborador}}
- **Contexto:** {{contexto_feedback}}
- **Tom:** {{tom}}
- **Metodologia:** {{metodologia}}

## SITUAÇÃO ESPECÍFICA
{{situacao_especifica}}

## COMPORTAMENTO OBSERVADO
{{comportamento_observado}}

## IMPACTO
{{impacto}}

## PONTOS FORTES
{{pontos_fortes}}

## PONTOS A DESENVOLVER
{{pontos_desenvolver}}

## SUGESTÕES DE MELHORIA
{{sugestoes_melhoria}}

---

Gere um feedback estruturado seguindo a metodologia selecionada, incluindo:
- Reconhecimento (SBI aplicado aos pontos fortes)
- Desenvolvimento (SBI aplicado aos pontos de melhoria)
- Feedforward (expectativas futuras)
- Compromisso do gestor
- Abertura para diálogo
- Resumo e próximos passos`,
    temperature: 0.6,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // DEPARTAMENTO PESSOAL - Comunicados
  {
    id: "gerador-comunicados",
    categoryId: "dp",
    name: "Gerador de Comunicados Oficiais",
    slug: "gerador-comunicados",
    description: "Cria comunicações internas profissionais para diferentes situações.",
    shortDescription: "Comunique com clareza e profissionalismo",
    estimatedTimeSaved: 30,
    inputSchema: {
      fields: [
        {
          name: "tipo_comunicado",
          label: "Tipo de Comunicado",
          type: "select",
          required: true,
          options: [
            { value: "informativo", label: "Informativo" },
            { value: "mudanca", label: "Mudança Organizacional" },
            { value: "beneficio", label: "Novo Benefício" },
            { value: "evento", label: "Evento" },
            { value: "politica", label: "Nova Política" },
            { value: "urgente", label: "Urgente" },
          ],
        },
        {
          name: "assunto",
          label: "Assunto Principal",
          type: "text",
          required: true,
          placeholder: "Tema central do comunicado",
        },
        {
          name: "publico_alvo",
          label: "Público-Alvo",
          type: "select",
          required: true,
          options: [
            { value: "todos", label: "Todos os Colaboradores" },
            { value: "departamento", label: "Departamento Específico" },
            { value: "lideranca", label: "Liderança" },
            { value: "novos", label: "Novos Colaboradores" },
          ],
        },
        {
          name: "informacoes",
          label: "Informações Principais",
          type: "textarea",
          required: true,
          placeholder: "Conteúdo principal que precisa ser comunicado...",
          rows: 6,
        },
        {
          name: "tom",
          label: "Tom do Comunicado",
          type: "select",
          required: true,
          options: [
            { value: "formal", label: "Formal" },
            { value: "cordial", label: "Cordial" },
            { value: "celebrativo", label: "Celebrativo" },
            { value: "urgente", label: "Urgente" },
          ],
        },
        {
          name: "canal",
          label: "Canal de Distribuição",
          type: "select",
          required: true,
          options: [
            { value: "email", label: "E-mail" },
            { value: "intranet", label: "Intranet" },
            { value: "teams", label: "Teams/Slack" },
            { value: "mural", label: "Mural Físico" },
          ],
        },
        {
          name: "remetente",
          label: "Remetente",
          type: "text",
          required: true,
          placeholder: "Ex: Recursos Humanos, Diretoria, CEO",
        },
        {
          name: "data_vigencia",
          label: "Data de Vigência (se aplicável)",
          type: "date",
          required: false,
        },
        {
          name: "contato_duvidas",
          label: "Contato para Dúvidas",
          type: "text",
          required: true,
          placeholder: "Email ou nome do responsável",
        },
      ],
    },
    systemPrompt: `Você é o REDATOR CORPORATIVO OFICIAL, especialista em criar comunicados internos claros, profissionais e engajadores.

REGRAS:
✅ Informações claras e completas
✅ Tom adequado à situação
✅ Estrutura fácil de escanear
✅ Contato para dúvidas sempre presente
✅ Data de vigência quando aplicável
❌ Jargões desnecessários
❌ Textos muito longos
❌ Informações ambíguas`,
    promptTemplate: `Crie um comunicado oficial com as informações:

## CONFIGURAÇÕES
- **Tipo:** {{tipo_comunicado}}
- **Assunto:** {{assunto}}
- **Público:** {{publico_alvo}}
- **Tom:** {{tom}}
- **Canal:** {{canal}}
- **Remetente:** {{remetente}}
- **Data de Vigência:** {{data_vigencia}}
- **Contato para Dúvidas:** {{contato_duvidas}}

## INFORMAÇÕES PRINCIPAIS
{{informacoes}}

---

Gere um comunicado formatado e profissional adequado ao tipo e tom selecionados.`,
    temperature: 0.6,
    maxTokens: 1500,
    model: "gemini-2.5-pro-preview",
  },

  // DESLIGAMENTO - Entrevista de Desligamento
  {
    id: "roteiro-entrevista-desligamento",
    categoryId: "desligamento",
    name: "Roteiro de Entrevista de Desligamento",
    slug: "roteiro-entrevista-desligamento",
    description: "Cria roteiros completos de exit interview para coletar feedback valioso.",
    shortDescription: "Transforme saídas em aprendizado",
    estimatedTimeSaved: 60,
    inputSchema: {
      fields: [
        {
          name: "tipo_desligamento",
          label: "Tipo de Desligamento",
          type: "select",
          required: true,
          options: [
            { value: "voluntario", label: "Voluntário (Pedido de Demissão)" },
            { value: "involuntario", label: "Involuntário (Demissão)" },
            { value: "acordo", label: "Acordo" },
          ],
        },
        {
          name: "cargo_colaborador",
          label: "Cargo do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "tempo_empresa",
          label: "Tempo de Empresa",
          type: "text",
          required: true,
          placeholder: "Ex: 2 anos e 6 meses",
        },
        {
          name: "departamento",
          label: "Departamento",
          type: "text",
          required: true,
        },
        {
          name: "motivo_conhecido",
          label: "Motivo Conhecido (se houver)",
          type: "textarea",
          required: false,
          placeholder: "Se já souber o motivo principal...",
          rows: 3,
        },
        {
          name: "historico",
          label: "Histórico do Colaborador",
          type: "textarea",
          required: false,
          placeholder: "Performance, problemas anteriores, destaques...",
          rows: 3,
        },
        {
          name: "sensibilidade",
          label: "Sensibilidade da Situação",
          type: "select",
          required: true,
          options: [
            { value: "baixa", label: "Baixa" },
            { value: "media", label: "Média" },
            { value: "alta", label: "Alta" },
          ],
        },
        {
          name: "informacoes_prioritarias",
          label: "Informações Prioritárias a Coletar",
          type: "textarea",
          required: false,
          placeholder: "O que a empresa mais quer saber?",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o ESPECIALISTA EM EXIT INTERVIEWS, mestre em conduzir entrevistas de desligamento que extraem insights valiosos de forma respeitosa.

REGRAS:
✅ Ambiente privado e confidencial
✅ Tom empático e respeitoso
✅ Escuta ativa sem julgamentos
✅ Perguntas abertas que estimulam elaboração
✅ Registro sistemático para análise
❌ Tentar reter o colaborador durante a entrevista
❌ Fazer promessas que não podem ser cumpridas
❌ Confrontar ou culpar o colaborador
❌ Pressionar por respostas`,
    promptTemplate: `Crie um roteiro de entrevista de desligamento com as informações:

## DADOS DO DESLIGAMENTO
- **Tipo:** {{tipo_desligamento}}
- **Cargo:** {{cargo_colaborador}}
- **Tempo de Empresa:** {{tempo_empresa}}
- **Departamento:** {{departamento}}
- **Sensibilidade:** {{sensibilidade}}

## MOTIVO CONHECIDO
{{motivo_conhecido}}

## HISTÓRICO
{{historico}}

## INFORMAÇÕES PRIORITÁRIAS
{{informacoes_prioritarias}}

---

Gere um roteiro completo de exit interview com:
- Script de abertura (explicação da confidencialidade)
- Perguntas sobre motivo do desligamento
- Perguntas sobre experiência na empresa
- Perguntas sobre ambiente e cultura
- Perguntas sobre cargo e atividades
- Perguntas sobre remuneração e benefícios
- Perguntas de insights e recomendações
- Script de encerramento
- Formulário de registro para o entrevistador`,
    temperature: 0.5,
    maxTokens: 3500,
    model: "gemini-2.5-pro-preview",
  },
  // RECRUTAMENTO - Gerador de Perguntas de Entrevista
  {
    id: "gerador-perguntas-entrevista",
    categoryId: "recrutamento",
    name: "Gerador de Perguntas de Entrevista",
    slug: "gerador-perguntas-entrevista",
    description: "Cria roteiros de entrevista completos e estruturados baseados em competências.",
    shortDescription: "Roteiros de entrevista profissionais",
    estimatedTimeSaved: 45,
    inputSchema: {
      fields: [
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          required: true,
          placeholder: "Ex: Desenvolvedor Frontend Pleno",
        },
        {
          name: "nivel",
          label: "Nível",
          type: "select",
          required: true,
          options: [
            { value: "junior", label: "Júnior" },
            { value: "pleno", label: "Pleno" },
            { value: "senior", label: "Sênior" },
            { value: "gerencial", label: "Gerencial" },
          ],
        },
        {
          name: "competencias_tecnicas",
          label: "Competências Técnicas (Hard Skills)",
          type: "textarea",
          required: true,
          placeholder: "Liste as 3-5 competências técnicas principais...",
          rows: 3,
        },
        {
          name: "competencias_comportamentais",
          label: "Competências Comportamentais (Soft Skills)",
          type: "textarea",
          required: true,
          placeholder: "Liste as 3-5 soft skills principais...",
          rows: 3,
        },
        {
          name: "valores_empresa",
          label: "Valores da Empresa",
          type: "textarea",
          required: true,
          placeholder: "Valores para avaliar fit cultural...",
          rows: 3,
        },
        {
          name: "desafios_vaga",
          label: "Desafios da Vaga",
          type: "textarea",
          required: false,
          placeholder: "Desafios específicos que o candidato enfrentará...",
          rows: 3,
        },
        {
          name: "duracao_entrevista",
          label: "Duração da Entrevista",
          type: "select",
          required: true,
          options: [
            { value: "30_min", label: "30 minutos" },
            { value: "45_min", label: "45 minutos" },
            { value: "60_min", label: "60 minutos" },
            { value: "90_min", label: "90 minutos" },
          ],
        },
        {
          name: "tipo_entrevista",
          label: "Tipo de Entrevista",
          type: "select",
          required: true,
          options: [
            { value: "tecnica", label: "Técnica" },
            { value: "comportamental", label: "Comportamental" },
            { value: "completa", label: "Completa (Técnica + Comportamental)" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o ESPECIALISTA EM ENTREVISTAS POR COMPETÊNCIAS, capaz de criar roteiros que revelam o verdadeiro potencial dos candidatos.

SUAS CARACTERÍSTICAS:
- Perguntas comportamentais baseadas na metodologia STAR (Situação, Tarefa, Ação, Resultado)
- Perguntas técnicas que avaliam profundidade e raciocínio
- Foco em evidências concretas, não em opiniões
- Estrutura lógica e progressiva

REGRAS:
✅ Usar metodologia STAR para soft skills
✅ Perguntas abertas que exigem exemplos
✅ Evitar perguntas de "sim/não"
✅ Incluir critérios de avaliação para cada pergunta
❌ Evitar perguntas hipotéticas ("o que você faria se...")
❌ Evitar perguntas tendenciosas
❌ Não usar "pegadinhas" ou charadas`,
    promptTemplate: `Crie um roteiro de entrevista estruturado com as informações:

## DADOS DA VAGA
- **Cargo:** {{cargo}}
- **Nível:** {{nivel}}
- **Duração:** {{duracao_entrevista}}
- **Tipo:** {{tipo_entrevista}}

## COMPETÊNCIAS TÉCNICAS
{{competencias_tecnicas}}

## COMPETÊNCIAS COMPORTAMENTAIS
{{competencias_comportamentais}}

## VALORES E CULTURA
{{valores_empresa}}

## DESAFIOS DA VAGA
{{desafios_vaga}}

---

Gere o roteiro completo contendo:
1. **Script de Abertura:** Apresentação e quebra-gelo.
2. **Perguntas Técnicas:** Com sugestões de follow-up para aprofundamento.
3. **Perguntas Comportamentais (STAR):** Focadas nas soft skills listadas.
4. **Perguntas de Fit Cultural:** Alinhadas aos valores da empresa.
5. **Cenários Situacionais:** Baseados nos desafios da vaga (se fornecidos).
6. **Script de Encerramento:** Próximos passos e espaço para dúvidas.
7. **Ficha de Avaliação:** Critérios claros para pontuar as respostas.`,
    temperature: 0.6,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // RECRUTAMENTO - Avaliador de Fit Cultural
  {
    id: "avaliador-fit-cultural",
    categoryId: "recrutamento",
    name: "Avaliador de Fit Cultural",
    slug: "avaliador-fit-cultural",
    description: "Cria frameworks de avaliação para garantir alinhamento entre candidato e cultura da empresa.",
    shortDescription: "Avalie a compatibilidade cultural",
    estimatedTimeSaved: 40,
    inputSchema: {
      fields: [
        {
          name: "valores_empresa",
          label: "Valores da Empresa",
          type: "textarea",
          required: true,
          placeholder: "Liste os 3-5 valores principais...",
          rows: 3,
        },
        {
          name: "tipo_cultura",
          label: "Tipo de Cultura",
          type: "select",
          required: true,
          options: [
            { value: "inovadora", label: "Inovadora/Ágil" },
            { value: "tradicional", label: "Tradicional/Hierárquica" },
            { value: "colaborativa", label: "Colaborativa/Humana" },
            { value: "resultados", label: "Focada em Resultados/Agressiva" },
          ],
        },
        {
          name: "estilo_lideranca",
          label: "Estilo de Liderança",
          type: "select",
          required: true,
          options: [
            { value: "horizontal", label: "Horizontal/Autonomia" },
            { value: "vertical", label: "Vertical/Comando e Controle" },
            { value: "misto", label: "Misto/Situacional" },
          ],
        },
        {
          name: "ritmo_trabalho",
          label: "Ritmo de Trabalho",
          type: "select",
          required: true,
          options: [
            { value: "startup", label: "Startup/Acelerado" },
            { value: "corporativo", label: "Corporativo/Estruturado" },
            { value: "flexivel", label: "Flexível/Assíncrono" },
          ],
        },
        {
          name: "comportamentos_valorizados",
          label: "Comportamentos Valorizados",
          type: "textarea",
          required: true,
          placeholder: "O que a empresa celebra e reconhece?",
          rows: 3,
        },
        {
          name: "comportamentos_nao_tolerados",
          label: "Comportamentos Não Tolerados (Red Flags)",
          type: "textarea",
          required: true,
          placeholder: "O que é inaceitável na cultura?",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o GUARDIÃO DA CULTURA, especialista em identificar a ressonância entre valores pessoais e organizacionais.

SUAS CARACTERÍSTICAS:
- Foco em comportamentos observáveis, não apenas discurso
- Identificação de nuances culturais
- Detecção de "red flags" sutis
- Abordagem holística do candidato

REGRAS:
✅ Avaliar comportamentos passados como preditores
✅ Criar cenários que testam valores sob pressão
✅ Diferenciar "cultural add" (soma) de "cultural fit" (igualdade)
❌ Não buscar clones dos fundadores
❌ Não confundir cultura com "gostar das mesmas coisas"
❌ Evitar viés de afinidade`,
    promptTemplate: `Crie um framework de avaliação de fit cultural com as informações:

## CULTURA DA EMPRESA
- **Valores:** {{valores_empresa}}
- **Tipo:** {{tipo_cultura}}
- **Liderança:** {{estilo_lideranca}}
- **Ritmo:** {{ritmo_trabalho}}

## COMPORTAMENTOS
- **Valorizados:** {{comportamentos_valorizados}}
- **Não Tolerados:** {{comportamentos_nao_tolerados}}

---

Gere o framework contendo:
1. **Questionário por Valor:** Perguntas específicas para cada valor da empresa.
2. **Assessment de Estilo de Trabalho:** Para verificar alinhamento com ritmo e liderança.
3. **Matriz de Compatibilidade:** Como interpretar as respostas.
4. **Red Flags:** Sinais de alerta específicos para observar.
5. **Sistema de Scoring:** Como pontuar a aderência cultural.
6. **Guia de Interpretação:** Como diferenciar diversidade de desalinhamento.`,
    temperature: 0.6,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // RECRUTAMENTO - Criador de Testes Técnicos
  {
    id: "criador-testes-tecnicos",
    categoryId: "recrutamento",
    name: "Criador de Testes Técnicos",
    slug: "criador-testes-tecnicos",
    description: "Desenvolve avaliações técnicas personalizadas, cases e testes práticos.",
    shortDescription: "Crie testes técnicos precisos",
    estimatedTimeSaved: 120,
    inputSchema: {
      fields: [
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          required: true,
          placeholder: "Ex: Analista Financeiro",
        },
        {
          name: "nivel",
          label: "Nível",
          type: "select",
          required: true,
          options: [
            { value: "junior", label: "Júnior" },
            { value: "pleno", label: "Pleno" },
            { value: "senior", label: "Sênior" },
          ],
        },
        {
          name: "area",
          label: "Área de Atuação",
          type: "select",
          required: true,
          options: [
            { value: "ti", label: "Tecnologia/Dev" },
            { value: "marketing", label: "Marketing" },
            { value: "financeiro", label: "Financeiro" },
            { value: "vendas", label: "Vendas" },
            { value: "rh", label: "RH" },
            { value: "outro", label: "Outro" },
          ],
        },
        {
          name: "habilidades_testar",
          label: "Habilidades a Testar",
          type: "textarea",
          required: true,
          placeholder: "Liste 3-5 habilidades técnicas específicas...",
          rows: 3,
        },
        {
          name: "ferramentas",
          label: "Ferramentas/Linguagens",
          type: "textarea",
          required: false,
          placeholder: "Ex: Excel avançado, Python, Google Analytics...",
          rows: 2,
        },
        {
          name: "duracao_teste",
          label: "Duração Estimada",
          type: "select",
          required: true,
          options: [
            { value: "30_min", label: "30 minutos" },
            { value: "60_min", label: "1 hora" },
            { value: "120_min", label: "2 horas" },
            { value: "take_home", label: "Take-home (Prazo de dias)" },
          ],
        },
        {
          name: "formato",
          label: "Formato do Teste",
          type: "select",
          required: true,
          options: [
            { value: "multipla_escolha", label: "Múltipla Escolha" },
            { value: "dissertativo", label: "Dissertativo/Teórico" },
            { value: "case", label: "Estudo de Caso Prático" },
            { value: "misto", label: "Misto" },
          ],
        },
        {
          name: "contexto_empresa",
          label: "Contexto para o Case",
          type: "textarea",
          required: false,
          placeholder: "Cenário real da empresa para basear o teste...",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o AVALIADOR TÉCNICO EXPERT, capaz de criar desafios que separam o conhecimento teórico da prática real.

SUAS CARACTERÍSTICAS:
- Foco em resolução de problemas reais
- Cenários verossímeis e contextualizados
- Critérios de correção objetivos
- Equilíbrio entre teoria e prática

REGRAS:
✅ Testes alinhados ao nível de senioridade
✅ Instruções claras e inequívocas
✅ Gabarito ou critérios de correção detalhados
✅ Cenários realistas do dia a dia
❌ Não pedir trabalho gratuito (projetos reais completos)
❌ Não criar "pegadinhas" sem propósito
❌ Evitar ambiguidades no enunciado`,
    promptTemplate: `Crie uma avaliação técnica completa com as informações:

## DADOS DA AVALIAÇÃO
- **Cargo:** {{cargo}}
- **Nível:** {{nivel}}
- **Área:** {{area}}
- **Duração:** {{duracao_teste}}
- **Formato:** {{formato}}

## ESCOPO
- **Habilidades:** {{habilidades_testar}}
- **Ferramentas:** {{ferramentas}}
- **Contexto:** {{contexto_empresa}}

---

Gere a avaliação contendo:
1. **Instruções ao Candidato:** Regras, tempo e o que é esperado.
2. **Questões/Desafios:**
   - Se Múltipla Escolha: Questões com alternativas.
   - Se Case: Cenário detalhado e entregáveis.
   - Se Dissertativo: Perguntas teóricas e práticas.
3. **Gabarito/Critérios de Correção:**
   - Respostas corretas.
   - O que avaliar em cada resposta.
   - Pontuação sugerida.
4. **Tabela de Interpretação:** Como classificar o candidato baseada na nota.`,
    temperature: 0.5,
    maxTokens: 3500,
    model: "gemini-2.5-pro-preview",
  },

  // RECRUTAMENTO - Gerador de Feedback de Candidatos
  {
    id: "gerador-feedback-candidatos",
    categoryId: "recrutamento",
    name: "Gerador de Feedback de Candidatos",
    slug: "gerador-feedback-candidatos",
    description: "Cria comunicações de feedback personalizadas, empáticas e construtivas para candidatos.",
    shortDescription: "Feedbacks humanizados e ágeis",
    estimatedTimeSaved: 15,
    inputSchema: {
      fields: [
        {
          name: "nome_candidato",
          label: "Nome do Candidato",
          type: "text",
          required: true,
        },
        {
          name: "cargo",
          label: "Vaga",
          type: "text",
          required: true,
        },
        {
          name: "estagio_processo",
          label: "Estágio do Processo",
          type: "select",
          required: true,
          options: [
            { value: "triagem", label: "Triagem de Currículo" },
            { value: "entrevista_rh", label: "Entrevista com RH" },
            { value: "entrevista_tecnica", label: "Entrevista Técnica/Gestor" },
            { value: "teste", label: "Teste Técnico" },
            { value: "final", label: "Etapa Final" },
          ],
        },
        {
          name: "resultado",
          label: "Resultado",
          type: "select",
          required: true,
          options: [
            { value: "aprovado", label: "Aprovado (Proposta)" },
            { value: "reprovado", label: "Reprovado" },
            { value: "banco", label: "Banco de Talentos (Stand-by)" },
          ],
        },
        {
          name: "pontos_fortes",
          label: "Pontos Fortes (Opcional)",
          type: "textarea",
          required: false,
          placeholder: "O que o candidato mandou bem...",
          rows: 3,
        },
        {
          name: "motivo_decisao",
          label: "Motivo da Decisão (Se Reprovado)",
          type: "textarea",
          required: false,
          placeholder: "Por que não avançou (se quiser dar feedback específico)...",
          rows: 3,
        },
        {
          name: "tom",
          label: "Tom da Comunicação",
          type: "select",
          required: true,
          options: [
            { value: "formal", label: "Formal/Corporativo" },
            { value: "cordial", label: "Cordial/Profissional" },
            { value: "caloroso", label: "Caloroso/Humanizado" },
          ],
        },
        {
          name: "proximos_passos",
          label: "Próximos Passos (Se Aprovado)",
          type: "textarea",
          required: false,
          placeholder: "O que acontece agora...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o EMBAIXADOR DA MARCA EMPREGADORA, especialista em comunicação com candidatos que gera respeito e admiração, mesmo em negativas.

SUAS CARACTERÍSTICAS:
- Empatia genuína
- Clareza e transparência
- Foco na experiência do candidato
- Linguagem humanizada

REGRAS:
✅ Sempre agradecer o tempo e interesse
✅ Ser claro sobre a decisão
✅ Se houver feedback específico, ser construtivo e gentil
✅ Manter portas abertas quando apropriado
❌ Nunca usar clichês frios ("buscamos um perfil mais aderente" sem contexto)
❌ Nunca dar falsas esperanças
❌ Evitar linguagem robótica`,
    promptTemplate: `Crie uma mensagem de feedback para o candidato com as informações:

## DADOS
- **Candidato:** {{nome_candidato}}
- **Vaga:** {{cargo}}
- **Etapa:** {{estagio_processo}}
- **Resultado:** {{resultado}}
- **Tom:** {{tom}}

## CONTEXTO
- **Pontos Fortes:** {{pontos_fortes}}
- **Motivo (se reprovado):** {{motivo_decisao}}
- **Próximos Passos (se aprovado):** {{proximos_passos}}

---

Gere a comunicação completa (formato e-mail) contendo:
1. **Assunto:** Claro e profissional.
2. **Abertura:** Personalizada e agradecendo.
3. **Corpo:** Comunicando a decisão de forma empática.
   - Se Aprovado: Entusiasmo e próximos passos.
   - Se Reprovado: Gentileza, feedback (se fornecido) e incentivo.
4. **Fechamento:** Profissional e assinatura.`,
    temperature: 0.6,
    maxTokens: 1500,
    model: "gemini-2.5-pro-preview",
  },
  // ONBOARDING - Gerador de Checklists de Integração
  {
    id: "gerador-checklists-integracao",
    categoryId: "onboarding",
    name: "Gerador de Checklists de Integração",
    slug: "gerador-checklists-integracao",
    description: "Cria checklists detalhados e personalizados para garantir que nenhuma etapa da integração seja esquecida.",
    shortDescription: "Checklists à prova de falhas",
    estimatedTimeSaved: 30,
    inputSchema: {
      fields: [
        {
          name: "tipo_checklist",
          label: "Tipo de Checklist",
          type: "select",
          required: true,
          options: [
            { value: "pre_admissao", label: "Pré-Admissão (Antes do Dia 1)" },
            { value: "primeiro_dia", label: "Primeiro Dia" },
            { value: "primeira_semana", label: "Primeira Semana" },
            { value: "primeiro_mes", label: "Primeiro Mês (30 Dias)" },
            { value: "completo", label: "Ciclo Completo (0-90 Dias)" },
          ],
        },
        {
          name: "destinatario",
          label: "Quem usará o checklist?",
          type: "select",
          required: true,
          options: [
            { value: "rh", label: "RH / People Team" },
            { value: "gestor", label: "Gestor Direto" },
            { value: "ti", label: "TI / Infraestrutura" },
            { value: "colaborador", label: "O Próprio Colaborador" },
            { value: "buddy", label: "Buddy / Mentor" },
          ],
        },
        {
          name: "modelo_trabalho",
          label: "Modelo de Trabalho",
          type: "select",
          required: true,
          options: [
            { value: "presencial", label: "Presencial" },
            { value: "hibrido", label: "Híbrido" },
            { value: "remoto", label: "Remoto" },
          ],
        },
        {
          name: "cargo_nivel",
          label: "Cargo/Nível (Opcional)",
          type: "text",
          required: false,
          placeholder: "Ex: Desenvolvedor Sênior",
        },
        {
          name: "sistemas",
          label: "Sistemas/Acessos Necessários",
          type: "textarea",
          required: false,
          placeholder: "Ex: Email, Slack, Jira, GitHub...",
          rows: 2,
        },
        {
          name: "particularidades",
          label: "Particularidades/Observações",
          type: "textarea",
          required: false,
          placeholder: "Requisitos específicos da área ou empresa...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o ORGANIZADOR METÓDICO, especialista em criar processos à prova de falhas que garantem conformidade e experiência excepcional.

SUAS CARACTERÍSTICAS:
- Atenção extrema aos detalhes
- Sequenciamento lógico de tarefas
- Clareza nas instruções
- Foco na responsabilidade (quem faz o quê)

REGRAS:
✅ Agrupar tarefas por categoria (Documentação, Acessos, Cultura, etc.)
✅ Definir prazos relativos claros (ex: "Dia -5", "Dia 1")
✅ Incluir verificações de sucesso
✅ Adaptar ao modelo de trabalho (Remoto vs Presencial)
❌ Não criar tarefas vagas ("Fazer integração")
❌ Não misturar responsabilidades de áreas diferentes
❌ Não esquecer itens críticos de compliance`,
    promptTemplate: `Crie um checklist de integração estruturado com as informações:

## DADOS
- **Tipo:** {{tipo_checklist}}
- **Destinatário:** {{destinatario}}
- **Modelo:** {{modelo_trabalho}}
- **Cargo:** {{cargo_nivel}}

## CONTEXTO
- **Sistemas:** {{sistemas}}
- **Particularidades:** {{particularidades}}

---

Gere o checklist contendo:
1. **Cabeçalho:** Dados da integração e instruções de uso.
2. **Itens do Checklist:** Organizados por categorias (ex: Administrativo, Tech, Social).
   - Cada item deve ter: Ação clara, Prazo sugerido e Checkbox [ ].
3. **Observações Importantes:** Dicas para garantir o sucesso da etapa.
4. **Campos de Validação:** Espaço para data e assinatura (se aplicável).`,
    temperature: 0.5,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // ONBOARDING - Criador de Manuais do Colaborador
  {
    id: "criador-manuais-colaborador",
    categoryId: "onboarding",
    name: "Criador de Manuais do Colaborador",
    slug: "criador-manuais-colaborador",
    description: "Gera a estrutura e conteúdo base para manuais do colaborador (handbooks) personalizados.",
    shortDescription: "Crie o guia definitivo da empresa",
    estimatedTimeSaved: 240,
    inputSchema: {
      fields: [
        {
          name: "nome_empresa",
          label: "Nome da Empresa",
          type: "text",
          required: true,
        },
        {
          name: "historia_empresa",
          label: "Breve História",
          type: "textarea",
          required: false,
          placeholder: "Fundação, marcos importantes...",
          rows: 3,
        },
        {
          name: "missao_visao_valores",
          label: "Missão, Visão e Valores",
          type: "textarea",
          required: true,
          placeholder: "O norte estratégico da empresa...",
          rows: 4,
        },
        {
          name: "politicas_principais",
          label: "Políticas Principais",
          type: "textarea",
          required: true,
          placeholder: "Home office, férias, dress code, ética...",
          rows: 4,
        },
        {
          name: "beneficios",
          label: "Benefícios",
          type: "textarea",
          required: true,
          placeholder: "Resumo do pacote de benefícios...",
          rows: 3,
        },
        {
          name: "canais_comunicacao",
          label: "Canais de Comunicação",
          type: "textarea",
          required: true,
          placeholder: "Onde encontrar informações e falar com quem...",
          rows: 3,
        },
        {
          name: "contatos_importantes",
          label: "Contatos Importantes",
          type: "textarea",
          required: true,
          placeholder: "Emails do RH, TI, Financeiro...",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o CURADOR DE CULTURA, especialista em traduzir a identidade e regras da empresa em documentos acolhedores e úteis.

SUAS CARACTERÍSTICAS:
- Linguagem convidativa e clara
- Estrutura fácil de navegar
- Equilíbrio entre inspiração e regra
- Foco na utilidade para o dia a dia

REGRAS:
✅ Usar tom de voz consistente com a cultura
✅ Explicar o "porquê" das regras, não apenas o "o quê"
✅ Tornar informações complexas (benefícios) em algo simples
✅ Incluir elementos de boas-vindas calorosos
❌ Não usar "juridiquês" desnecessário
❌ Não criar um documento punitivo ou ameaçador
❌ Não deixar ambiguidades em regras críticas`,
    promptTemplate: `Crie a estrutura e conteúdo de um Manual do Colaborador (Handbook) com as informações:

## EMPRESA
- **Nome:** {{nome_empresa}}
- **História:** {{historia_empresa}}
- **MVV:** {{missao_visao_valores}}

## POLÍTICAS E BENEFÍCIOS
- **Políticas:** {{politicas_principais}}
- **Benefícios:** {{beneficios}}

## COMUNICAÇÃO
- **Canais:** {{canais_comunicacao}}
- **Contatos:** {{contatos_importantes}}

---

Gere o manual contendo:
1. **Capa e Boas-vindas:** Mensagem inspiradora da liderança.
2. **Quem Somos:** História e Cultura (MVV) explicados de forma prática.
3. **Nossa Vida Juntos:** Políticas de trabalho, horários, dress code, etc.
4. **Seus Benefícios:** Explicação clara do pacote oferecido.
5. **Desenvolvimento:** Como crescer na empresa (visão geral).
6. **Guia de Sobrevivência:** Canais de comunicação, ferramentas e contatos úteis.
7. **FAQ:** Respostas para dúvidas comuns de novatos.
8. **Termo de Recebimento:** Texto padrão para ciência.`,
    temperature: 0.6,
    maxTokens: 4000,
    model: "gemini-2.5-pro-preview",
  },

  // ONBOARDING - Gerador de Cronogramas de Treinamento
  {
    id: "gerador-cronogramas-treinamento",
    categoryId: "onboarding",
    name: "Gerador de Cronogramas de Treinamento",
    slug: "gerador-cronogramas-treinamento",
    description: "Cria cronogramas de capacitação inicial organizados e sequenciais.",
    shortDescription: "Organize a capacitação inicial",
    estimatedTimeSaved: 60,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          required: true,
        },
        {
          name: "data_inicio",
          label: "Data de Início",
          type: "date",
          required: true,
        },
        {
          name: "treinamentos_obrigatorios",
          label: "Treinamentos Obrigatórios (Compliance/Institucional)",
          type: "textarea",
          required: true,
          placeholder: "Ex: Código de Ética, LGPD, Segurança...",
          rows: 3,
        },
        {
          name: "treinamentos_tecnicos",
          label: "Treinamentos Técnicos (Função)",
          type: "textarea",
          required: true,
          placeholder: "Ex: Sistema X, Processo Y, Ferramenta Z...",
          rows: 3,
        },
        {
          name: "disponibilidade_diaria",
          label: "Disponibilidade Diária para Estudo",
          type: "select",
          required: true,
          options: [
            { value: "1_hora", label: "1 hora/dia" },
            { value: "2_horas", label: "2 horas/dia" },
            { value: "4_horas", label: "4 horas/dia (Meio período)" },
            { value: "integral", label: "Período Integral (Imersão)" },
          ],
        },
        {
          name: "formato_preferencial",
          label: "Formato Preferencial",
          type: "select",
          required: true,
          options: [
            { value: "online", label: "100% Online/Gravado" },
            { value: "presencial", label: "Presencial/Ao Vivo" },
            { value: "misto", label: "Híbrido/Misto" },
          ],
        },
        {
          name: "recursos_disponiveis",
          label: "Recursos Disponíveis",
          type: "textarea",
          required: false,
          placeholder: "Plataforma LMS, Mentores, Documentação...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o ARQUITETO DE APRENDIZAGEM, especialista em desenhar jornadas de conhecimento lógicas e eficientes.

SUAS CARACTERÍSTICAS:
- Sequenciamento pedagógico (do simples ao complexo)
- Respeito à carga cognitiva (não sobrecarregar)
- Variedade de métodos de aprendizado
- Foco em aplicação prática

REGRAS:
✅ Começar pelo básico/institucional antes do técnico específico
✅ Alternar teoria com prática/observação
✅ Incluir tempos de pausa e assimilação
✅ Definir verificações de aprendizado
❌ Não agendar 8 horas seguidas de vídeos
❌ Não pular pré-requisitos lógicos
❌ Não esquecer de reservar tempo para configuração de acessos`,
    promptTemplate: `Crie um cronograma de treinamento inicial com as informações:

## DADOS
- **Colaborador:** {{nome_colaborador}}
- **Cargo:** {{cargo}}
- **Início:** {{data_inicio}}
- **Disponibilidade:** {{disponibilidade_diaria}}
- **Formato:** {{formato_preferencial}}

## CONTEÚDO
- **Obrigatórios:** {{treinamentos_obrigatorios}}
- **Técnicos:** {{treinamentos_tecnicos}}
- **Recursos:** {{recursos_disponiveis}}

---

Gere o cronograma contendo:
1. **Visão Geral:** Objetivos de aprendizado e estrutura do programa.
2. **Cronograma Detalhado:** Dia a dia (ou semana a semana, dependendo da duração), com horários ou blocos de tempo sugeridos.
3. **Detalhamento dos Módulos:** O que será coberto em cada tópico.
4. **Recursos Necessários:** Links, acessos ou materiais para cada etapa.
5. **Avaliações:** Como verificar se o aprendizado ocorreu.
6. **Certificações:** Se aplicável.`,
    temperature: 0.5,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },
  // TREINAMENTO - Gerador de Conteúdos de Treinamento
  {
    id: "gerador-conteudos-treinamento",
    categoryId: "treinamento",
    name: "Gerador de Conteúdos de Treinamento",
    slug: "gerador-conteudos-treinamento",
    description: "Cria materiais de treinamento estruturados, planos de aula e exercícios.",
    shortDescription: "Crie cursos completos em minutos",
    estimatedTimeSaved: 120,
    inputSchema: {
      fields: [
        {
          name: "tema_treinamento",
          label: "Tema do Treinamento",
          type: "text",
          required: true,
          placeholder: "Ex: Liderança Situacional",
        },
        {
          name: "objetivo_aprendizagem",
          label: "Objetivo de Aprendizagem",
          type: "textarea",
          required: true,
          placeholder: "Ao final, o aluno deve ser capaz de...",
          rows: 3,
        },
        {
          name: "publico_alvo",
          label: "Público-Alvo",
          type: "text",
          required: true,
          placeholder: "Ex: Novos Gestores",
        },
        {
          name: "duracao",
          label: "Duração Estimada",
          type: "select",
          required: true,
          options: [
            { value: "1_hora", label: "1 hora (Workshop Rápido)" },
            { value: "4_horas", label: "4 horas (Meio Período)" },
            { value: "8_horas", label: "8 horas (Dia Inteiro)" },
            { value: "modulos", label: "Múltiplos Módulos" },
          ],
        },
        {
          name: "formato",
          label: "Formato",
          type: "select",
          required: true,
          options: [
            { value: "presencial", label: "Presencial" },
            { value: "online_ao_vivo", label: "Online Ao Vivo" },
            { value: "ead_gravado", label: "EAD / Gravado" },
          ],
        },
        {
          name: "nivel_profundidade",
          label: "Nível de Profundidade",
          type: "select",
          required: true,
          options: [
            { value: "basico", label: "Básico / Introdutório" },
            { value: "intermediario", label: "Intermediário" },
            { value: "avancado", label: "Avançado / Especialista" },
          ],
        },
        {
          name: "pre_requisitos",
          label: "Pré-requisitos",
          type: "textarea",
          required: false,
          placeholder: "Conhecimentos prévios necessários...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o DESIGNER INSTRUCIONAL, especialista em transformar informações complexas em experiências de aprendizado engajadoras.

SUAS CARACTERÍSTICAS:
- Estrutura didática clara
- Foco na retenção do conhecimento
- Uso de metodologias ativas
- Adaptação ao público-alvo

REGRAS:
✅ Usar Taxonomia de Bloom para objetivos
✅ Incluir momentos de prática e reflexão
✅ Variar os estímulos (visual, auditivo, cinestésico)
✅ Criar avaliações alinhadas aos objetivos
❌ Não criar "palestras" monótonas
❌ Não usar linguagem acadêmica desnecessária
❌ Não esquecer de verificar o aprendizado`,
    promptTemplate: `Crie um plano de aula/conteúdo de treinamento com as informações:

## DADOS
- **Tema:** {{tema_treinamento}}
- **Objetivo:** {{objetivo_aprendizagem}}
- **Público:** {{publico_alvo}}
- **Duração:** {{duracao}}
- **Formato:** {{formato}}
- **Nível:** {{nivel_profundidade}}
- **Pré-requisitos:** {{pre_requisitos}}

---

Gere o material contendo:
1. **Plano de Aula:** Roteiro minuto a minuto (ou por blocos).
2. **Conteúdo Programático:** Tópicos detalhados que serão abordados.
3. **Estrutura de Slides:** Sugestão do que colocar em cada slide/tela.
4. **Dinâmicas/Exercícios:** Atividades práticas para fixação.
5. **Avaliação:** Perguntas ou desafios para testar o conhecimento.
6. **Material de Apoio:** Sugestões de leituras ou vídeos complementares.`,
    temperature: 0.6,
    maxTokens: 3500,
    model: "gemini-2.5-pro-preview",
  },

  // TREINAMENTO - Avaliador de Necessidades de Capacitação
  {
    id: "avaliador-necessidades-capacitacao",
    categoryId: "treinamento",
    name: "Avaliador de Necessidades de Capacitação",
    slug: "avaliador-necessidades-capacitacao",
    description: "Realiza diagnósticos de gaps de competência e sugere planos de treinamento corporativo.",
    shortDescription: "Diagnostique gaps de treinamento",
    estimatedTimeSaved: 90,
    inputSchema: {
      fields: [
        {
          name: "area_departamento",
          label: "Área/Departamento",
          type: "text",
          required: true,
          placeholder: "Ex: Equipe de Vendas",
        },
        {
          name: "funcoes_cargos",
          label: "Cargos Analisados",
          type: "textarea",
          required: true,
          placeholder: "Ex: SDRs, Executivos de Contas, Gerentes...",
          rows: 2,
        },
        {
          name: "competencias_necessarias",
          label: "Competências Necessárias (Ideal)",
          type: "textarea",
          required: true,
          placeholder: "O que eles precisam saber fazer bem?",
          rows: 3,
        },
        {
          name: "resultados_avaliacoes",
          label: "Gaps Observados / Resultados Atuais",
          type: "textarea",
          required: true,
          placeholder: "Onde estão falhando? Quais os indicadores ruins?",
          rows: 3,
        },
        {
          name: "objetivos_estrategicos",
          label: "Objetivos Estratégicos da Área",
          type: "textarea",
          required: true,
          placeholder: "Onde a área precisa chegar?",
          rows: 3,
        },
        {
          name: "orcamento_disponivel",
          label: "Orçamento Disponível",
          type: "select",
          required: true,
          options: [
            { value: "baixo", label: "Baixo (Foco em interno/gratuito)" },
            { value: "medio", label: "Médio (Alguns cursos externos)" },
            { value: "alto", label: "Alto (Consultorias/Imersões)" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o CONSULTOR DE DHO ESTRATÉGICO, especialista em alinhar pessoas aos objetivos do negócio através do desenvolvimento.

SUAS CARACTERÍSTICAS:
- Visão sistêmica (Causa x Efeito)
- Foco em ROI de treinamento
- Soluções criativas além de "cursos"
- Priorização baseada em impacto

REGRAS:
✅ Diferenciar problemas de treinamento vs problemas de processo/ferramenta
✅ Sugerir mix de soluções (70-20-10)
✅ Priorizar ações de alto impacto e baixo esforço
✅ Definir indicadores de sucesso claros
❌ Não sugerir treinamento para tudo (às vezes é falta de ferramenta)
❌ Não ignorar restrições orçamentárias
❌ Não propor soluções genéricas sem conexão com o gap`,
    promptTemplate: `Faça um diagnóstico de necessidades de treinamento (LNT) com as informações:

## CONTEXTO
- **Área:** {{area_departamento}}
- **Cargos:** {{funcoes_cargos}}
- **Objetivos:** {{objetivos_estrategicos}}

## ANÁLISE
- **Competências Necessárias:** {{competencias_necessarias}}
- **Gaps/Problemas:** {{resultados_avaliacoes}}
- **Budget:** {{orcamento_disponivel}}

---

Gere o diagnóstico contendo:
1. **Diagnóstico da Situação:** Resumo dos gaps e suas prováveis causas.
2. **Matriz de Priorização:** O que treinar primeiro (Urgência x Impacto).
3. **Plano de Soluções:**
   - Ações de Curto Prazo (Quick Wins).
   - Ações Estruturantes (Médio/Longo Prazo).
   - Sugestões além da sala de aula (Mentoria, Job Rotation, etc.).
4. **Estimativa de Investimento:** Como usar o budget disponível.
5. **ROI Esperado:** Como medir se funcionou (Indicadores).`,
    temperature: 0.6,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // TREINAMENTO - Criador de Trilhas de Aprendizagem
  {
    id: "criador-trilhas-aprendizagem",
    categoryId: "treinamento",
    name: "Criador de Trilhas de Aprendizagem",
    slug: "criador-trilhas-aprendizagem",
    description: "Desenvolve percursos formativos completos para desenvolvimento de competências complexas.",
    shortDescription: "Desenhe jornadas de evolução",
    estimatedTimeSaved: 100,
    inputSchema: {
      fields: [
        {
          name: "nome_trilha",
          label: "Nome da Trilha",
          type: "text",
          required: true,
          placeholder: "Ex: Formação de Líderes do Futuro",
        },
        {
          name: "objetivo_trilha",
          label: "Objetivo Principal",
          type: "textarea",
          required: true,
          placeholder: "Competência macro a ser desenvolvida...",
          rows: 2,
        },
        {
          name: "publico_alvo",
          label: "Público-Alvo",
          type: "text",
          required: true,
        },
        {
          name: "duracao_total",
          label: "Duração Total Estimada",
          type: "select",
          required: true,
          options: [
            { value: "1_mes", label: "1 Mês (Intensivo)" },
            { value: "3_meses", label: "3 Meses (Trimestral)" },
            { value: "6_meses", label: "6 Meses (Semestral)" },
            { value: "continuo", label: "Contínuo / On-going" },
          ],
        },
        {
          name: "nivel_inicial",
          label: "Nível Inicial dos Participantes",
          type: "select",
          required: true,
          options: [
            { value: "iniciante", label: "Iniciante (Nenhum conhecimento)" },
            { value: "praticante", label: "Praticante (Já atua, precisa melhorar)" },
            { value: "experiente", label: "Experiente (Reciclagem/Avançado)" },
          ],
        },
        {
          name: "recursos_disponiveis",
          label: "Recursos Disponíveis",
          type: "textarea",
          required: false,
          placeholder: "Udemy, Coursera, Mentores internos, Livros...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o ARQUITETO DE JORNADAS, especialista em conectar pontos de aprendizado para formar competências robustas.

SUAS CARACTERÍSTICAS:
- Visão de longo prazo
- Conexão entre teoria e prática
- Gamificação e engajamento
- Curadoria de conteúdo

REGRAS:
✅ Dividir a trilha em níveis ou módulos lógicos
✅ Incluir marcos de celebração (badges, certificados)
✅ Misturar formatos (vídeo, leitura, prática, discussão)
✅ Garantir aplicabilidade no trabalho real
❌ Não criar trilhas lineares chatas
❌ Não esquecer de validar o progresso
❌ Não sobrecarregar com conteúdo irrelevante`,
    promptTemplate: `Crie uma trilha de aprendizagem com as informações:

## DADOS
- **Nome:** {{nome_trilha}}
- **Objetivo:** {{objetivo_trilha}}
- **Público:** {{publico_alvo}}
- **Duração:** {{duracao_total}}
- **Nível Inicial:** {{nivel_inicial}}
- **Recursos:** {{recursos_disponiveis}}

---

Gere a trilha contendo:
1. **Mapa da Jornada:** Visão geral dos módulos e etapas.
2. **Detalhamento dos Módulos:**
   - Tema.
   - Objetivos específicos.
   - Conteúdos sugeridos (curadoria).
   - Atividades práticas.
3. **Avaliações de Passagem:** O que é preciso para avançar de nível.
4. **Projeto Final:** Desafio prático para consolidação.
5. **Certificação:** Critérios para conclusão.`,
    temperature: 0.6,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // AVALIAÇÃO - Gerador de Feedbacks Estruturados
  {
    id: "gerador-feedbacks-estruturados",
    categoryId: "avaliacao",
    name: "Gerador de Feedbacks Estruturados",
    slug: "gerador-feedbacks-estruturados",
    description: "Cria roteiros de feedback profissional utilizando metodologias como SBI, SCI e Feedforward.",
    shortDescription: "Feedbacks que desenvolvem",
    estimatedTimeSaved: 20,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "contexto_feedback",
          label: "Contexto",
          type: "select",
          required: true,
          options: [
            { value: "projeto", label: "Projeto Específico" },
            { value: "comportamento", label: "Comportamento Recorrente" },
            { value: "avaliacao", label: "Ciclo de Avaliação Formal" },
            { value: "pontual", label: "Situação Pontual" },
          ],
        },
        {
          name: "situacao_especifica",
          label: "Situação (Onde/Quando)",
          type: "textarea",
          required: true,
          placeholder: "Descreva o contexto onde ocorreu...",
          rows: 2,
        },
        {
          name: "comportamento_observado",
          label: "Comportamento (O que fez)",
          type: "textarea",
          required: true,
          placeholder: "Descreva as ações observáveis (sem julgamento)...",
          rows: 3,
        },
        {
          name: "impacto",
          label: "Impacto (Consequência)",
          type: "textarea",
          required: true,
          placeholder: "Qual foi o resultado ou impacto disso?",
          rows: 3,
        },
        {
          name: "pontos_fortes",
          label: "Pontos Fortes (Para equilibrar)",
          type: "textarea",
          required: false,
          placeholder: "O que a pessoa já faz bem...",
          rows: 2,
        },
        {
          name: "metodologia",
          label: "Metodologia Preferida",
          type: "select",
          required: true,
          options: [
            { value: "sbi", label: "SBI (Situação-Comportamento-Impacto)" },
            { value: "feedforward", label: "Feedforward (Foco no Futuro)" },
            { value: "sanduiche", label: "Sanduíche (Elogio-Crítica-Elogio)" },
          ],
        },
        {
          name: "tom",
          label: "Tom da Conversa",
          type: "select",
          required: true,
          options: [
            { value: "motivacional", label: "Motivacional / Reconhecimento" },
            { value: "corretivo", label: "Corretivo / Ajuste de Rota" },
            { value: "equilibrado", label: "Equilibrado / Desenvolvimento" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o MENTOR DE COMUNICAÇÃO, especialista em transformar conversas difíceis em momentos de crescimento.

SUAS CARACTERÍSTICAS:
- Comunicação Não-Violenta (CNV)
- Foco em fatos e dados, não em pessoas
- Orientação para o futuro (solução)
- Empatia e clareza

REGRAS:
✅ Usar a metodologia escolhida (SBI, etc.) rigorosamente
✅ Separar a pessoa do problema
✅ Focar em comportamentos observáveis
✅ Garantir que o impacto seja claro
❌ Não usar generalizações ("você sempre", "você nunca")
❌ Não fazer julgamentos de valor ("você foi preguiçoso")
❌ Não esquecer de validar o entendimento`,
    promptTemplate: `Crie um roteiro de feedback estruturado com as informações:

## DADOS
- **Colaborador:** {{nome_colaborador}}
- **Contexto:** {{contexto_feedback}}
- **Metodologia:** {{metodologia}}
- **Tom:** {{tom}}

## ELEMENTOS DO FEEDBACK
- **Situação:** {{situacao_especifica}}
- **Comportamento:** {{comportamento_observado}}
- **Impacto:** {{impacto}}
- **Pontos Fortes:** {{pontos_fortes}}

---

Gere o roteiro contendo:
1. **Preparação Mental:** Dicas para o gestor antes da conversa.
2. **Abertura:** Como iniciar a conversa de forma segura.
3. **O Feedback (Script):** O texto sugerido seguindo a metodologia {{metodologia}}.
4. **Perguntas de Engajamento:** Para ouvir o outro lado.
5. **Plano de Ação/Acordo:** Como definir os próximos passos.
6. **Fechamento:** Como encerrar positivamente.`,
    temperature: 0.6,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // AVALIAÇÃO - Analisador de Performance
  {
    id: "analisador-performance",
    categoryId: "avaliacao",
    name: "Analisador de Performance",
    slug: "analisador-performance",
    description: "Analisa dados de desempenho, metas e competências para gerar insights profundos sobre a performance.",
    shortDescription: "Insights de performance",
    estimatedTimeSaved: 45,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          required: true,
        },
        {
          name: "periodo_analisado",
          label: "Período Analisado",
          type: "text",
          required: true,
          placeholder: "Ex: 2º Semestre 2024",
        },
        {
          name: "metas_definidas",
          label: "Metas Definidas",
          type: "textarea",
          required: true,
          placeholder: "Quais eram os objetivos?",
          rows: 3,
        },
        {
          name: "resultados_alcancados",
          label: "Resultados Alcançados",
          type: "textarea",
          required: true,
          placeholder: "O que foi entregue de fato?",
          rows: 3,
        },
        {
          name: "notas_avaliacao",
          label: "Notas/Conceitos (Competências)",
          type: "textarea",
          required: false,
          placeholder: "Resumo das notas de competências...",
          rows: 2,
        },
        {
          name: "feedback_recebido",
          label: "Feedback de Pares/Gestores",
          type: "textarea",
          required: false,
          placeholder: "Principais comentários recebidos...",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o ANALISTA DE PERFORMANCE, especialista em conectar dados dispersos para formar uma visão holística do desempenho.

SUAS CARACTERÍSTICAS:
- Visão analítica e baseada em dados
- Identificação de padrões e tendências
- Correlação entre esforço e resultado
- Foco em desenvolvimento

REGRAS:
✅ Cruzar metas quantitativas com competências qualitativas
✅ Identificar causas raiz prováveis
✅ Sugerir ações de desenvolvimento específicas
✅ Manter tom profissional e objetivo
❌ Não fazer julgamentos pessoais
❌ Não ignorar o contexto (se fornecido)
❌ Não ser determinista (usar "parece indicar", "sugere")`,
    promptTemplate: `Faça uma análise de performance detalhada com as informações:

## DADOS
- **Colaborador:** {{nome_colaborador}}
- **Cargo:** {{cargo}}
- **Período:** {{periodo_analisado}}

## PERFORMANCE
- **Metas:** {{metas_definidas}}
- **Resultados:** {{resultados_alcancados}}
- **Competências:** {{notas_avaliacao}}
- **Feedback:** {{feedback_recebido}}

---

Gere o relatório de análise contendo:
1. **Resumo Executivo:** Visão geral do desempenho no período.
2. **Análise Metas vs. Resultados:** O que foi atingido, superado ou não alcançado.
3. **Análise de Competências:** Pontos fortes e áreas de melhoria comportamental/técnica.
4. **Tendências:** Padrões identificados (evolução ou involução).
5. **Matriz 9-Box (Sugestão):** Onde este colaborador parece se encaixar (Potencial x Desempenho).
6. **Recomendações:** Ações sugeridas para o gestor e para o colaborador.`,
    temperature: 0.5,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // AVALIAÇÃO - Criador de Metas SMART
  {
    id: "criador-metas-smart",
    categoryId: "avaliacao",
    name: "Criador de Metas SMART",
    slug: "criador-metas-smart",
    description: "Transforma objetivos vagos em metas SMART (Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais).",
    shortDescription: "Crie metas que funcionam",
    estimatedTimeSaved: 25,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador/Equipe",
          type: "text",
          required: true,
        },
        {
          name: "objetivo_geral",
          label: "Objetivo Geral (O que quer atingir?)",
          type: "textarea",
          required: true,
          placeholder: "Ex: Aumentar as vendas, Melhorar o atendimento...",
          rows: 3,
        },
        {
          name: "prazo",
          label: "Prazo Desejado",
          type: "text",
          required: true,
          placeholder: "Ex: Até o final do ano, Em 3 meses...",
        },
        {
          name: "recursos",
          label: "Recursos Disponíveis",
          type: "textarea",
          required: false,
          placeholder: "Equipe, orçamento, ferramentas...",
          rows: 2,
        },
        {
          name: "nivel_dificuldade",
          label: "Nível de Desafio",
          type: "select",
          required: true,
          options: [
            { value: "conservador", label: "Conservador (Fácil/Seguro)" },
            { value: "moderado", label: "Moderado (Desafiador mas provável)" },
            { value: "agressivo", label: "Agressivo (Moonshot/Difícil)" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o ESTRATEGISTA DE METAS, especialista em transformar intenções vagas em planos de ação mensuráveis.

SUAS CARACTERÍSTICAS:
- Rigor metodológico (SMART)
- Clareza absoluta
- Foco em resultados mensuráveis
- Viabilidade prática

REGRAS:
✅ Garantir que cada letra do SMART seja atendida
✅ Definir indicadores de sucesso (KPIs) claros
✅ Quebrar grandes objetivos em marcos menores
✅ Verificar a relevância (o "porquê")
❌ Não aceitar verbos vagos ("melhorar", "tentar", "buscar")
❌ Não criar metas impossíveis (a menos que pedido "agressivo")
❌ Não esquecer de definir o "como" medir`,
    promptTemplate: `Transforme o objetivo abaixo em Metas SMART:

## DADOS
- **Responsável:** {{nome_colaborador}}
- **Objetivo Vago:** {{objetivo_geral}}
- **Prazo:** {{prazo}}
- **Recursos:** {{recursos}}
- **Desafio:** {{nivel_dificuldade}}

---

Gere o plano de metas contendo:
1. **Análise do Objetivo:** O que está bom e o que precisa de clareza.
2. **A Meta SMART Principal:**
   - **S (Específica):** O que exatamente?
   - **M (Mensurável):** Qual o número/indicador?
   - **A (Atingível):** Por que é possível?
   - **R (Relevante):** Por que importa?
   - **T (Temporal):** Até quando?
3. **KPIs de Acompanhamento:** Como medir o progresso semanal/mensal.
4. **Plano de Ação:** 3-5 passos principais para começar.
5. **Possíveis Obstáculos:** O que pode atrapalhar e como mitigar.`,
    temperature: 0.6,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },
  // CLIMA E CULTURA - Pesquisa de Clima
  {
    id: "pesquisa-clima",
    categoryId: "clima",
    name: "Pesquisa de Clima e Pulso",
    slug: "pesquisa-clima",
    description: "Cria questionários de pesquisa de clima organizacional e pesquisas de pulso.",
    shortDescription: "Meça o engajamento do time",
    estimatedTimeSaved: 60,
    inputSchema: {
      fields: [
        {
          name: "tipo_pesquisa",
          label: "Tipo de Pesquisa",
          type: "select",
          required: true,
          options: [
            { value: "clima_anual", label: "Pesquisa de Clima Anual (Completa)" },
            { value: "pulso", label: "Pesquisa de Pulso (Rápida/Frequente)" },
            { value: "tematica", label: "Temática (Ex: Diversidade, Liderança)" },
          ],
        },
        {
          name: "objetivo",
          label: "Objetivo Principal",
          type: "textarea",
          required: true,
          placeholder: "O que você quer descobrir ou medir?",
          rows: 2,
        },
        {
          name: "publico_alvo",
          label: "Público-Alvo",
          type: "text",
          required: true,
          placeholder: "Toda a empresa, área específica...",
        },
        {
          name: "dimensoes",
          label: "Dimensões a Avaliar",
          type: "textarea",
          required: true,
          placeholder: "Ex: Liderança, Comunicação, Reconhecimento, Infraestrutura...",
          rows: 3,
        },
        {
          name: "anonimato",
          label: "Nível de Anonimato",
          type: "select",
          required: true,
          options: [
            { value: "total", label: "Totalmente Anônima" },
            { value: "identificada", label: "Identificada" },
            { value: "area", label: "Identificada por Área" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o CIENTISTA DE DADOS HUMANOS, especialista em criar instrumentos de pesquisa que geram dados confiáveis sobre o ambiente de trabalho.

SUAS CARACTERÍSTICAS:
- Neutralidade e isenção
- Clareza nas perguntas (sem viés)
- Foco em ação (perguntar o que pode ser mudado)
- Proteção psicológica do respondente

REGRAS:
✅ Usar escala Likert (1-5 ou 1-7) consistentemente
✅ Evitar perguntas duplas ("Você gosta do chefe e do salário?")
✅ Garantir que a pergunta seja neutra
✅ Incluir perguntas abertas para qualitativo
❌ Não fazer perguntas que induzem a resposta
❌ Não perguntar sobre coisas imutáveis
❌ Não criar questionários exaustivos (máx 50 para clima, 5-10 para pulso)`,
    promptTemplate: `Crie um questionário de pesquisa com as informações:

## DADOS
- **Tipo:** {{tipo_pesquisa}}
- **Objetivo:** {{objetivo}}
- **Público:** {{publico_alvo}}
- **Dimensões:** {{dimensoes}}
- **Anonimato:** {{anonimato}}

---

Gere a pesquisa contendo:
1. **Convite/Intro:** Texto engajador explicando o porquê da pesquisa e garantindo o anonimato (se aplicável).
2. **Blocos de Perguntas:** Organizados pelas dimensões solicitadas (usando escala Likert).
3. **Perguntas Abertas:** Para comentários qualitativos.
4. **Dados Demográficos:** O que coletar para segmentação (sem quebrar anonimato).
5. **Agradecimento:** Mensagem final.`,
    temperature: 0.5,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // CLIMA E CULTURA - Plano de Ação de Clima
  {
    id: "plano-acao-clima",
    categoryId: "clima",
    name: "Plano de Ação de Clima",
    slug: "plano-acao-clima",
    description: "Desenvolve planos de ação estruturados para responder aos resultados da pesquisa de clima.",
    shortDescription: "Transforme feedback em melhoria",
    estimatedTimeSaved: 90,
    inputSchema: {
      fields: [
        {
          name: "area_foco",
          label: "Área/Tema de Foco",
          type: "text",
          required: true,
          placeholder: "Ex: Comunicação Interna",
        },
        {
          name: "resultado_pesquisa",
          label: "Resultado da Pesquisa (Problema)",
          type: "textarea",
          required: true,
          placeholder: "O que a pesquisa mostrou? (Baixa nota em...)",
          rows: 3,
        },
        {
          name: "causa_raiz",
          label: "Provável Causa Raiz",
          type: "textarea",
          required: false,
          placeholder: "Por que isso está acontecendo?",
          rows: 2,
        },
        {
          name: "sugestoes_equipe",
          label: "Sugestões da Equipe (se houver)",
          type: "textarea",
          required: false,
          placeholder: "O que os colaboradores pediram?",
          rows: 2,
        },
        {
          name: "orcamento",
          label: "Orçamento Disponível",
          type: "text",
          required: false,
          placeholder: "Recursos financeiros disponíveis...",
        },
      ],
    },
    systemPrompt: `Você é o AGENTE DE MUDANÇA ORGANIZACIONAL, especialista em transformar insatisfação em engajamento através de ações práticas.

SUAS CARACTERÍSTICAS:
- Foco na solução e não no culpado
- Ações participativas (envolvendo o time)
- Quick wins (ganhos rápidos) + Estruturantes
- Comunicação transparente

REGRAS:
✅ Conectar a ação diretamente à dor apontada
✅ Definir donos e prazos claros
✅ Sugerir rituais de acompanhamento
✅ Celebrar pequenas vitórias
❌ Não prometer o que não pode cumprir
❌ Não criar "comitês" que não decidem nada
❌ Não ignorar a causa raiz`,
    promptTemplate: `Crie um plano de ação de clima com as informações:

## DADOS
- **Foco:** {{area_foco}}
- **Problema:** {{resultado_pesquisa}}
- **Causa:** {{causa_raiz}}
- **Sugestões:** {{sugestoes_equipe}}
- **Budget:** {{orcamento}}

---

Gere o plano de ação contendo:
1. **Diagnóstico Rápido:** Entendimento do problema.
2. **Objetivo do Plano:** O que queremos melhorar (meta numérica se possível).
3. **Ações de Curto Prazo (Quick Wins):** Para gerar impacto imediato.
4. **Ações de Médio/Longo Prazo:** Para resolver a causa raiz.
5. **Estratégia de Comunicação:** Como divulgar as ações para o time.
6. **Indicadores de Sucesso:** Como saberemos se melhorou.`,
    temperature: 0.6,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // CLIMA E CULTURA - Comunicados de Cultura
  {
    id: "comunicados-cultura",
    categoryId: "clima",
    name: "Comunicados de Cultura",
    slug: "comunicados-cultura",
    description: "Cria campanhas e comunicados para reforçar valores, celebrar datas e promover a cultura.",
    shortDescription: "Fortaleça a cultura da empresa",
    estimatedTimeSaved: 45,
    inputSchema: {
      fields: [
        {
          name: "tipo_acao",
          label: "Tipo de Ação",
          type: "select",
          required: true,
          options: [
            { value: "reforco_valores", label: "Reforço de Valores" },
            { value: "celebracao", label: "Celebração/Data Comemorativa" },
            { value: "reconhecimento", label: "Programa de Reconhecimento" },
            { value: "diversidade", label: "Ação de Diversidade & Inclusão" },
          ],
        },
        {
          name: "tema",
          label: "Tema Central",
          type: "text",
          required: true,
          placeholder: "Ex: Mês do Orgulho, Valor 'Inovação'...",
        },
        {
          name: "mensagem_chave",
          label: "Mensagem Chave",
          type: "textarea",
          required: true,
          placeholder: "O que as pessoas precisam entender/sentir?",
          rows: 3,
        },
        {
          name: "publico",
          label: "Público-Alvo",
          type: "text",
          required: true,
          placeholder: "Toda a empresa, Liderança...",
        },
        {
          name: "canais",
          label: "Canais de Divulgação",
          type: "textarea",
          required: true,
          placeholder: "Email, Slack, TV Corporativa, Evento...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o STORYTELLER DA CULTURA, especialista em criar narrativas que conectam pessoas ao propósito da empresa.

SUAS CARACTERÍSTICAS:
- Tom inspirador e autêntico
- Conexão emocional
- Criatividade na abordagem
- Coerência com a marca empregadora

REGRAS:
✅ Usar exemplos reais e histórias
✅ Evitar clichês corporativos vazios
✅ Fazer chamadas para ação (participação)
✅ Ser inclusivo e respeitoso
❌ Não fazer "lavagem cerebral"
❌ Não ser desconectado da realidade (tom surdo)
❌ Não criar campanhas sem sustentação prática`,
    promptTemplate: `Crie uma campanha/comunicado de cultura com as informações:

## DADOS
- **Tipo:** {{tipo_acao}}
- **Tema:** {{tema}}
- **Mensagem:** {{mensagem_chave}}
- **Público:** {{publico}}
- **Canais:** {{canais}}

---

Gere o material contendo:
1. **Conceito Criativo:** Nome da campanha e slogan.
2. **Texto do Comunicado Principal:** Para email ou intranet.
3. **Peças de Apoio:** Sugestões de posts para Slack/Teams ou cartazes.
4. **Ideias de Ativação:** Como trazer o tema para a prática (dinâmicas, rituais).
5. **Call to Action:** O que o colaborador deve fazer.`,
    temperature: 0.7,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // CLIMA E CULTURA - Ações de Engajamento
  {
    id: "acoes-engajamento",
    categoryId: "clima",
    name: "Ações de Engajamento",
    slug: "acoes-engajamento",
    description: "Sugere dinâmicas, team buildings e rituais para aumentar o engajamento e coesão dos times.",
    shortDescription: "Engaje e motive o time",
    estimatedTimeSaved: 40,
    inputSchema: {
      fields: [
        {
          name: "objetivo_engajamento",
          label: "Objetivo do Engajamento",
          type: "select",
          required: true,
          options: [
            { value: "integracao", label: "Integração/Quebra-gelo" },
            { value: "confianca", label: "Construção de Confiança" },
            { value: "celebracao", label: "Celebração de Conquista" },
            { value: "resiliencia", label: "Gestão de Estresse/Resiliência" },
            { value: "criatividade", label: "Estímulo à Criatividade" },
          ],
        },
        {
          name: "perfil_time",
          label: "Perfil do Time",
          type: "textarea",
          required: true,
          placeholder: "Tamanho, idade média, estilo (introvertido/extrovertido)...",
          rows: 2,
        },
        {
          name: "formato",
          label: "Formato",
          type: "select",
          required: true,
          options: [
            { value: "presencial", label: "Presencial" },
            { value: "remoto", label: "Remoto/Online" },
            { value: "hibrido", label: "Híbrido" },
          ],
        },
        {
          name: "tempo_disponivel",
          label: "Tempo Disponível",
          type: "select",
          required: true,
          options: [
            { value: "rapidinha", label: "15-30 min (Rapidinha)" },
            { value: "sessao", label: "1-2 horas (Sessão)" },
            { value: "offsite", label: "Meio período ou Dia todo (Offsite)" },
          ],
        },
        {
          name: "orcamento",
          label: "Orçamento",
          type: "select",
          required: true,
          options: [
            { value: "zero", label: "Custo Zero" },
            { value: "baixo", label: "Baixo Custo" },
            { value: "alto", label: "Investimento Disponível" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o FACILITADOR DE EXPERIÊNCIAS, especialista em criar momentos que conectam pessoas genuinamente.

SUAS CARACTERÍSTICAS:
- Criatividade e diversão
- Foco no objetivo (não é só brincadeira)
- Inclusão (ninguém fica de fora)
- Adaptabilidade ao contexto

REGRAS:
✅ Respeitar os limites das pessoas (não forçar exposição)
✅ Adaptar ao formato (remoto precisa de mais estrutura)
✅ Conectar a atividade ao trabalho/objetivo
✅ Garantir segurança psicológica
❌ Não sugerir atividades constrangedoras
❌ Não ignorar restrições físicas ou técnicas
❌ Não criar competições tóxicas`,
    promptTemplate: `Sugira uma ação de engajamento/team building com as informações:

## DADOS
- **Objetivo:** {{objetivo_engajamento}}
- **Time:** {{perfil_time}}
- **Formato:** {{formato}}
- **Tempo:** {{tempo_disponivel}}
- **Budget:** {{orcamento}}

---

Gere a sugestão contendo:
1. **Nome da Dinâmica:** Criativo e convidativo.
2. **Conceito:** Por que isso vai ajudar no objetivo?
3. **Passo a Passo:** Instruções claras de como facilitar.
4. **Materiais Necessários:** O que precisa preparar.
5. **Debriefing (Reflexão):** Perguntas para fazer ao final para conectar com o trabalho.
6. **Dicas de Facilitação:** Como lidar com silêncio ou resistência.`,
    temperature: 0.7,
    maxTokens: 2500,
    model: "gemini-2.5-pro-preview",
  },

  // REMUNERAÇÃO - Criador de Faixas Salariais
  {
    id: "criador-faixas-salariais",
    categoryId: "remuneracao",
    name: "Criador de Faixas Salariais",
    slug: "criador-faixas-salariais",
    description: "Estrutura faixas salariais baseadas em mercado e estratégia da empresa.",
    shortDescription: "Estruture cargos e salários",
    estimatedTimeSaved: 60,
    inputSchema: {
      fields: [
        {
          name: "cargo",
          label: "Cargo Base",
          type: "text",
          required: true,
          placeholder: "Ex: Analista de Marketing",
        },
        {
          name: "nivel",
          label: "Nível",
          type: "text",
          required: true,
          placeholder: "Ex: Pleno",
        },
        {
          name: "estrategia_remuneracao",
          label: "Estratégia de Remuneração",
          type: "select",
          required: true,
          options: [
            { value: "mediana", label: "Na Mediana do Mercado (P50)" },
            { value: "agressiva", label: "Acima do Mercado (P75/P90)" },
            { value: "conservadora", label: "Abaixo do Mercado (P25) + Benefícios" },
          ],
        },
        {
          name: "valor_referencia",
          label: "Valor de Referência (Mercado)",
          type: "text",
          required: true,
          placeholder: "Ex: R$ 5.000,00",
        },
        {
          name: "amplitude_faixa",
          label: "Amplitude da Faixa (%)",
          type: "select",
          required: true,
          options: [
            { value: "20", label: "20% (Operacional)" },
            { value: "30", label: "30% (Tático/Técnico)" },
            { value: "40", label: "40% (Estratégico/Gestão)" },
            { value: "50", label: "50% (Executivo)" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o ESPECIALISTA EM COMPENSAÇÃO, expert em criar estruturas salariais justas e competitivas.

SUAS CARACTERÍSTICAS:
- Precisão matemática
- Visão de equidade interna e externa
- Estruturação lógica (Steps/Graus)
- Clareza na progressão

REGRAS:
✅ Calcular steps com progressão lógica
✅ Garantir sobreposição saudável entre níveis (se solicitado)
✅ Explicar a lógica do cálculo
✅ Considerar a estratégia da empresa
❌ Não criar faixas sem amplitude
❌ Não ignorar o valor de mercado
❌ Não criar steps com diferenças insignificantes`,
    promptTemplate: `Crie uma estrutura de faixa salarial com as informações:

## DADOS
- **Cargo:** {{cargo}} {{nivel}}
- **Estratégia:** {{estrategia_remuneracao}}
- **Referência (Midpoint):** {{valor_referencia}}
- **Amplitude:** {{amplitude_faixa}}%

---

Gere a estrutura da faixa contendo:
1. **Definição da Faixa:** Mínimo, Médio (Midpoint) e Máximo.
2. **Cálculo dos Steps (Progressão):** Divida a faixa em 5 a 7 steps (degraus) para evolução salarial.
3. **Descrição dos Critérios:** O que é esperado para estar em cada região da faixa (Início = Aprendizado, Meio = Proficiência, Fim = Maestria).
4. **Análise de Competitividade:** Comentário sobre como essa faixa se posiciona na estratégia escolhida.`,
    temperature: 0.4,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },

  // REMUNERAÇÃO - Calculadora de Benefícios
  {
    id: "calculadora-beneficios",
    categoryId: "remuneracao",
    name: "Calculadora de Pacote de Benefícios",
    slug: "calculadora-beneficios",
    description: "Estrutura e comunica o valor total do pacote de benefícios (Total Rewards).",
    shortDescription: "Mostre o valor além do salário",
    estimatedTimeSaved: 30,
    inputSchema: {
      fields: [
        {
          name: "salario_base",
          label: "Salário Base Mensal",
          type: "text",
          required: true,
          placeholder: "Ex: R$ 5.000,00",
        },
        {
          name: "beneficios_fixos",
          label: "Benefícios Fixos (Valor Mensal)",
          type: "textarea",
          required: true,
          placeholder: "VR: 800, VT: 200, Saúde: 400...",
          rows: 3,
        },
        {
          name: "beneficios_variaveis",
          label: "Benefícios Variáveis/Anuais",
          type: "textarea",
          required: false,
          placeholder: "PLR (alvo), Bônus, 13º, Férias...",
          rows: 3,
        },
        {
          name: "beneficios_intangiveis",
          label: "Benefícios Intangíveis/Flexíveis",
          type: "textarea",
          required: false,
          placeholder: "Home office, Horário flexível, Gympass...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o CONSULTOR DE TOTAL REWARDS, especialista em demonstrar o valor completo da remuneração.

SUAS CARACTERÍSTICAS:
- Foco na percepção de valor
- Clareza financeira
- Valorização do intangível
- Comunicação atrativa

REGRAS:
✅ Somar tudo para chegar ao "Pacote Anual Total"
✅ Destacar a representatividade dos benefícios sobre o salário
✅ Valorizar o que não é dinheiro (flexibilidade, cultura)
✅ Usar linguagem de "investimento no colaborador"
❌ Não inflar valores irrealistas
❌ Não esquecer encargos que viram benefício direto (FGTS)
❌ Não apresentar apenas uma planilha fria`,
    promptTemplate: `Crie um demonstrativo de Total Rewards (Remuneração Total) com as informações:

## DADOS FINANCEIROS
- **Salário:** {{salario_base}}
- **Fixos:** {{beneficios_fixos}}
- **Variáveis:** {{beneficios_variaveis}}
- **Intangíveis:** {{beneficios_intangiveis}}

---

Gere o demonstrativo contendo:
1. **Resumo Mensal:** Salário + Benefícios Mensais.
2. **Resumo Anual:** O valor total investido no ano (incluindo 13º, férias, bônus).
3. **Gráfico de Composição (Texto):** Quanto % é salário e quanto % é benefício.
4. **Valor dos Intangíveis:** Destaque para flexibilidade e qualidade de vida.
5. **Carta de Valorização:** Texto para entregar ao colaborador explicando seu pacote total.`,
    temperature: 0.5,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },

  // REMUNERAÇÃO - Gerador de Propostas Salariais
  {
    id: "gerador-propostas-salariais",
    categoryId: "remuneracao",
    name: "Gerador de Propostas Salariais",
    slug: "gerador-propostas-salariais",
    description: "Cria cartas proposta (Job Offers) formais e atrativas para candidatos aprovados.",
    shortDescription: "Crie propostas irrecusáveis",
    estimatedTimeSaved: 20,
    inputSchema: {
      fields: [
        {
          name: "nome_candidato",
          label: "Nome do Candidato",
          type: "text",
          required: true,
        },
        {
          name: "cargo",
          label: "Cargo Ofertado",
          type: "text",
          required: true,
        },
        {
          name: "data_inicio",
          label: "Data de Início Prevista",
          type: "date",
          required: true,
        },
        {
          name: "salario",
          label: "Salário Base",
          type: "text",
          required: true,
        },
        {
          name: "beneficios_destaque",
          label: "Principais Benefícios",
          type: "textarea",
          required: true,
          placeholder: "Liste os mais atrativos...",
          rows: 3,
        },
        {
          name: "bonus_comissao",
          label: "Bônus/Comissão (se houver)",
          type: "text",
          required: false,
          placeholder: "Regra geral de variável...",
        },
        {
          name: "validade_proposta",
          label: "Validade da Proposta",
          type: "text",
          required: true,
          placeholder: "Ex: 48 horas, até sexta-feira...",
        },
      ],
    },
    systemPrompt: `Você é o CLOSER DE TALENTOS, especialista em criar ofertas de emprego que geram o "SIM".

SUAS CARACTERÍSTICAS:
- Profissionalismo e entusiasmo
- Clareza nas condições
- Valorização da oportunidade
- Senso de urgência saudável

REGRAS:
✅ Incluir todas as informações legais necessárias (sem ser contrato)
✅ Vender a empresa e o desafio novamente
✅ Deixar claro os próximos passos para o aceite
✅ Ser transparente sobre valores
❌ Não deixar dúvidas sobre valores brutos/líquidos (usar bruto padrão)
❌ Não esconder condições importantes
❌ Não ser frio ou burocrático demais`,
    promptTemplate: `Crie uma Carta Proposta (Job Offer) com as informações:

## DADOS
- **Candidato:** {{nome_candidato}}
- **Cargo:** {{cargo}}
- **Início:** {{data_inicio}}
- **Salário:** {{salario}}
- **Benefícios:** {{beneficios_destaque}}
- **Variável:** {{bonus_comissao}}
- **Validade:** {{validade_proposta}}

---

Gere a carta contendo:
1. **Celebração:** Abertura entusiasmada sobre a aprovação.
2. **A Oferta:** Detalhes do cargo, salário e início.
3. **O Pacote:** Destaque dos benefícios e diferenciais.
4. **Por que Você?:** Breve reforço do fit com o candidato.
5. **Como Aceitar:** Instruções claras de aceite e prazo.
6. **Encerramento:** Boas-vindas antecipadas.`,
    temperature: 0.6,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },

  // REMUNERAÇÃO - Analisador de Equidade Salarial
  {
    id: "analisador-equidade-salarial",
    categoryId: "remuneracao",
    name: "Analisador de Equidade Salarial",
    slug: "analisador-equidade-salarial",
    description: "Analisa dados de uma equipe para identificar desvios e sugerir ajustes de equidade.",
    shortDescription: "Garanta justiça salarial",
    estimatedTimeSaved: 45,
    inputSchema: {
      fields: [
        {
          name: "equipe_analisada",
          label: "Equipe/Departamento",
          type: "text",
          required: true,
        },
        {
          name: "dados_colaboradores",
          label: "Dados (Anônimos) - Cargo/Nível/Salário/Tempo Casa/Gênero",
          type: "textarea",
          required: true,
          placeholder: "Ex: Colab A, Senior, 8000, 2 anos, M\nColab B, Senior, 6500, 3 anos, F...",
          rows: 6,
        },
        {
          name: "faixa_referencia",
          label: "Faixa de Referência (Min-Mid-Max)",
          type: "text",
          required: true,
          placeholder: "Ex: Senior = 6000 - 8000 - 10000",
        },
        {
          name: "orcamento_ajustes",
          label: "Orçamento para Ajustes",
          type: "text",
          required: false,
          placeholder: "Valor disponível para equiparação...",
        },
      ],
    },
    systemPrompt: `Você é o AUDITOR DE EQUIDADE, especialista em identificar e corrigir distorções salariais injustas.

SUAS CARACTERÍSTICAS:
- Olhar crítico para viés (gênero, raça, idade)
- Análise estatística (comparativos)
- Foco em mérito e tempo de casa
- Recomendações éticas

REGRAS:
✅ Identificar desvios inexplicáveis (ex: mesmo cargo/performance, salários muito diferentes)
✅ Alertar para possíveis vieses de gênero/minoria
✅ Sugerir planos de correção graduais se necessário
✅ Priorizar os casos mais críticos (abaixo do mínimo ou desigualdade grave)
❌ Não justificar desigualdade sem critério claro (performance/tempo)
❌ Não expor nomes (tratar dados com sigilo)
❌ Não sugerir redução salarial (ilegal)`,
    promptTemplate: `Faça uma análise de equidade salarial com as informações:

## DADOS
- **Equipe:** {{equipe_analisada}}
- **Dados:** {{dados_colaboradores}}
- **Referência:** {{faixa_referencia}}
- **Budget:** {{orcamento_ajustes}}

---

Gere o relatório contendo:
1. **Diagnóstico Geral:** Como está a saúde salarial da equipe.
2. **Análise de Dispersão:** Quem está fora da faixa ou descolado dos pares.
3. **Verificação de Viés:** Análise específica de gênero/diversidade (se dados permitirem).
4. **Casos Críticos:** Quem precisa de ajuste urgente.
5. **Plano de Ajuste:** Sugestão de distribuição do orçamento para corrigir distorções.
6. **Recomendações de Governança:** Como evitar que isso aconteça novamente.`,
    temperature: 0.5,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // DEPARTAMENTO PESSOAL - Gerador de Políticas Internas
  {
    id: "gerador-politicas-internas",
    categoryId: "dp",
    name: "Gerador de Políticas Internas",
    slug: "gerador-politicas-internas",
    description: "Cria documentos de políticas e normas internas em conformidade com a legislação.",
    shortDescription: "Crie políticas claras e seguras",
    estimatedTimeSaved: 120,
    inputSchema: {
      fields: [
        {
          name: "tema_politica",
          label: "Tema da Política",
          type: "text",
          required: true,
          placeholder: "Ex: Home Office, Reembolso, Vestimenta...",
        },
        {
          name: "objetivo",
          label: "Objetivo Principal",
          type: "textarea",
          required: true,
          placeholder: "Para que serve esta política?",
          rows: 2,
        },
        {
          name: "regras_principais",
          label: "Regras Principais/Diretrizes",
          type: "textarea",
          required: true,
          placeholder: "O que pode e o que não pode...",
          rows: 4,
        },
        {
          name: "publico_alvo",
          label: "A quem se aplica",
          type: "text",
          required: true,
          placeholder: "Todos, Vendas, Diretoria...",
        },
        {
          name: "excecoes",
          label: "Exceções Permitidas",
          type: "textarea",
          required: false,
          placeholder: "Casos onde a regra não se aplica...",
          rows: 2,
        },
        {
          name: "sancoes",
          label: "Sanções por Descumprimento",
          type: "textarea",
          required: false,
          placeholder: "O que acontece se não cumprir...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o CONSULTOR JURÍDICO-TRABALHISTA, especialista em criar normas internas seguras e claras.

SUAS CARACTERÍSTICAS:
- Linguagem formal mas acessível
- Foco em segurança jurídica
- Clareza nas regras (sem dubiedade)
- Tom educativo

REGRAS:
✅ Citar a base legal quando pertinente (CLT)
✅ Definir vigência e abrangência
✅ Usar estrutura de tópicos numerados
✅ Incluir glossário se necessário
❌ Não criar regras ilegais (ex: proibir ir ao banheiro)
❌ Não usar "juridiquês" incompreensível
❌ Não deixar brechas óbvias`,
    promptTemplate: `Crie uma Política Interna com as informações:

## DADOS
- **Tema:** {{tema_politica}}
- **Objetivo:** {{objetivo}}
- **Público:** {{publico_alvo}}
- **Regras:** {{regras_principais}}
- **Exceções:** {{excecoes}}
- **Sanções:** {{sancoes}}

---

Gere o documento contendo:
1. **Cabeçalho:** Título, Versão e Data.
2. **Objetivo e Abrangência:** A quem se destina.
3. **Definições:** Termos importantes.
4. **Diretrizes Gerais:** As regras macro.
5. **Procedimentos:** O passo a passo (como solicitar, como fazer).
6. **Deveres e Responsabilidades:** O que se espera do colaborador e da empresa.
7. **Disposições Finais:** Vigência e dúvidas.`,
    temperature: 0.5,
    maxTokens: 3000,
    model: "gemini-2.5-pro-preview",
  },

  // DEPARTAMENTO PESSOAL - Respositor de Dúvidas Trabalhistas
  {
    id: "respondedor-duvidas-trabalhistas",
    categoryId: "dp",
    name: "Tira-Dúvidas Trabalhista (IA)",
    slug: "respondedor-duvidas-trabalhistas",
    description: "Responde dúvidas comuns sobre legislação trabalhista, benefícios e rotinas de DP.",
    shortDescription: "Respostas rápidas de DP",
    estimatedTimeSaved: 15,
    inputSchema: {
      fields: [
        {
          name: "pergunta",
          label: "Dúvida do Colaborador/Gestor",
          type: "textarea",
          required: true,
          placeholder: "Ex: Como funciona o banco de horas? Quantos dias de férias posso vender?",
          rows: 3,
        },
        {
          name: "contexto_empresa",
          label: "Contexto Específico (Opcional)",
          type: "textarea",
          required: false,
          placeholder: "Ex: Temos acordo coletivo de 40h...",
          rows: 2,
        },
        {
          name: "perfil_solicitante",
          label: "Quem está perguntando?",
          type: "select",
          required: true,
          options: [
            { value: "colaborador", label: "Colaborador" },
            { value: "gestor", label: "Gestor" },
            { value: "rh", label: "Profissional de RH" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o ASSISTENTE DE DP, especialista em legislação trabalhista brasileira (CLT) e rotinas de pessoal.

SUAS CARACTERÍSTICAS:
- Precisão técnica
- Linguagem didática
- Cautela jurídica
- Prestatividade

REGRAS:
✅ Basear respostas na CLT e práticas comuns
✅ Alertar que "depende de convenção coletiva" quando aplicável
✅ Diferenciar regras para gestor (como agir) e colaborador (direitos)
✅ Sugerir consultar o RH local para casos específicos
❌ Não dar "parecer jurídico" definitivo (sempre recomendar validação)
❌ Não inventar leis
❌ Não ser rude ou impaciente`,
    promptTemplate: `Responda à dúvida trabalhista abaixo:

## DADOS
- **Pergunta:** {{pergunta}}
- **Contexto:** {{contexto_empresa}}
- **Perfil:** {{perfil_solicitante}}

---

Gere a resposta contendo:
1. **Resposta Direta:** Sim, não ou depende.
2. **Explicação Legal/Técnica:** O que diz a lei ou prática (de forma simples).
3. **Exemplo Prático:** Para facilitar o entendimento.
4. **Pontos de Atenção:** Exceções ou cuidados (ex: Acordo Coletivo).
5. **Recomendação:** O que fazer agora.`,
    temperature: 0.4,
    maxTokens: 1500,
    model: "gemini-2.5-pro-preview",
  },

  // DEPARTAMENTO PESSOAL - Gerador de Documentos Oficiais
  {
    id: "gerador-documentos-oficiais",
    categoryId: "dp",
    name: "Gerador de Documentos Oficiais",
    slug: "gerador-documentos-oficiais",
    description: "Cria minutas de advertências, suspensões, termos de responsabilidade e declarações.",
    shortDescription: "Documentos formais em segundos",
    estimatedTimeSaved: 40,
    inputSchema: {
      fields: [
        {
          name: "tipo_documento",
          label: "Tipo de Documento",
          type: "select",
          required: true,
          options: [
            { value: "advertencia", label: "Advertência Disciplinar" },
            { value: "suspensao", label: "Suspensão Disciplinar" },
            { value: "termo_equipamento", label: "Termo de Entrega de Equipamento" },
            { value: "declaracao_trabalho", label: "Declaração de Vínculo/Trabalho" },
          ],
        },
        {
          name: "dados_colaborador",
          label: "Dados do Colaborador",
          type: "textarea",
          required: true,
          placeholder: "Nome, CPF, Cargo...",
          rows: 2,
        },
        {
          name: "motivo_fato",
          label: "Motivo/Fato Ocorrido (para disciplinares)",
          type: "textarea",
          required: false,
          placeholder: "Descreva o que aconteceu, data e hora...",
          rows: 3,
        },
        {
          name: "itens_detalhes",
          label: "Itens/Detalhes (para termos/declarações)",
          type: "textarea",
          required: false,
          placeholder: "Lista de equipamentos ou finalidade da declaração...",
          rows: 3,
        },
      ],
    },
    systemPrompt: `Você é o ANALISTA DE ADMINISTRAÇÃO DE PESSOAL, rigoroso com a formalização de documentos.

SUAS CARACTERÍSTICAS:
- Formalidade e impessoalidade
- Precisão nos dados
- Clareza jurídica
- Objetividade

REGRAS:
✅ Usar linguagem padrão de documentos legais
✅ Incluir campos para assinatura e testemunhas
✅ Citar embasamento legal (artigo 482 CLT para advertência, etc.)
✅ Ser específico sobre o fato (quem, quando, onde)
❌ Não usar gírias ou linguagem informal
❌ Não fazer acusações sem provas (usar "suposto" ou focar no fato observado)
❌ Não esquecer datas e locais`,
    promptTemplate: `Crie o documento oficial solicitado:

## DADOS
- **Tipo:** {{tipo_documento}}
- **Colaborador:** {{dados_colaborador}}
- **Motivo (se disciplinar):** {{motivo_fato}}
- **Detalhes (se termo/declaração):** {{itens_detalhes}}

---

Gere o documento pronto para impressão contendo:
1. **Cabeçalho:** Dados da empresa e título.
2. **Corpo do Texto:** Redação jurídica adequada ao tipo.
3. **Cláusulas/Detalhamento:** Descrição do fato ou itens.
4. **Ciência:** Espaço para assinatura do colaborador.
5. **Testemunhas:** Espaço para 2 testemunhas (se aplicável).
6. **Rodapé:** Data e local.`,
    temperature: 0.4,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },

  // DESLIGAMENTO - Comunicado de Desligamento
  {
    id: "comunicado-desligamento",
    categoryId: "desligamento",
    name: "Comunicado de Desligamento",
    slug: "comunicado-desligamento",
    description: "Cria textos para comunicar saídas de colaboradores para a equipe ou empresa.",
    shortDescription: "Comunique saídas com respeito",
    estimatedTimeSaved: 20,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          required: true,
        },
        {
          name: "tempo_casa",
          label: "Tempo de Casa",
          type: "text",
          required: true,
        },
        {
          name: "motivo_saida",
          label: "Motivo (Genérico)",
          type: "select",
          required: true,
          options: [
            { value: "novos_desafios", label: "Novos Desafios (Voluntário)" },
            { value: "reestruturacao", label: "Reestruturação (Involuntário)" },
            { value: "pessoal", label: "Motivos Pessoais" },
            { value: "transicao", label: "Transição de Carreira" },
          ],
        },
        {
          name: "tom",
          label: "Tom do Comunicado",
          type: "select",
          required: true,
          options: [
            { value: "agradecimento", label: "Foco em Agradecimento (Positivo)" },
            { value: "neutro", label: "Neutro/Informativo" },
            { value: "breve", label: "Breve (Apenas informa)" },
          ],
        },
        {
          name: "proximos_passos",
          label: "Próximos Passos (Substituição)",
          type: "textarea",
          required: true,
          placeholder: "Quem assume as funções? Vaga aberta?",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o ESPECIALISTA EM COMUNICAÇÃO INTERNA, hábil em dar notícias difíceis com tato e respeito.

SUAS CARACTERÍSTICAS:
- Empatia e respeito
- Discrição
- Clareza
- Foco na continuidade

REGRAS:
✅ Preservar a imagem de quem sai e de quem fica
✅ Evitar especulações (ser claro e breve)
✅ Agradecer contribuições (se o tom permitir)
✅ Informar claramente quem assume as demandas
❌ Não expor motivos disciplinares ou polêmicos
❌ Não ser excessivamente emotivo se não for genuíno
❌ Não deixar o time inseguro sobre o futuro`,
    promptTemplate: `Crie um comunicado de desligamento com as informações:

## DADOS
- **Colaborador:** {{nome_colaborador}}
- **Cargo:** {{cargo}}
- **Motivo (Tom):** {{motivo_saida}} / {{tom}}
- **Transição:** {{proximos_passos}}

---

Gere o comunicado contendo:
1. **Assunto:** Claro e direto.
2. **Anúncio:** A informação da saída.
3. **Agradecimento:** Reconhecimento pelo tempo de casa (se aplicável).
4. **Transição:** Quem assume ou como ficam os projetos.
5. **Mensagem Final:** Desejos de sucesso.`,
    temperature: 0.6,
    maxTokens: 1000,
    model: "gemini-2.5-pro-preview",
  },

  // DESLIGAMENTO - Checklist de Offboarding
  {
    id: "checklist-offboarding",
    categoryId: "desligamento",
    name: "Checklist de Offboarding",
    slug: "checklist-offboarding",
    description: "Gera listas de tarefas personalizadas para garantir um desligamento seguro e organizado.",
    shortDescription: "Não esqueça nada na saída",
    estimatedTimeSaved: 30,
    inputSchema: {
      fields: [
        {
          name: "cargo",
          label: "Cargo do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "departamento",
          label: "Departamento",
          type: "text",
          required: true,
        },
        {
          name: "acessos_sistemas",
          label: "Sistemas Utilizados",
          type: "textarea",
          required: true,
          placeholder: "Email, CRM, ERP, Github, AWS...",
          rows: 3,
        },
        {
          name: "equipamentos",
          label: "Equipamentos em Posse",
          type: "textarea",
          required: true,
          placeholder: "Notebook, Celular, Crachá, Chaves...",
          rows: 2,
        },
        {
          name: "pendencias_trabalho",
          label: "Tipo de Passagem de Bastão",
          type: "select",
          required: true,
          options: [
            { value: "simples", label: "Simples (Poucas pendências)" },
            { value: "complexa", label: "Complexa (Muitos projetos/contas)" },
            { value: "lideranca", label: "Liderança (Pessoas e Estratégia)" },
          ],
        },
      ],
    },
    systemPrompt: `Você é o ORGANIZADOR DE PROCESSOS, obcecado por segurança e conformidade.

SUAS CARACTERÍSTICAS:
- Detalhismo
- Foco em segurança da informação
- Visão de processos (começo, meio e fim)
- Prevenção de passivos

REGRAS:
✅ Cobrir 3 pilares: Acessos (TI), Equipamentos (Infra) e Conhecimento (Negócio)
✅ Incluir etapas burocráticas (Exame demissional, assinatura)
✅ Definir prazos (Imediato vs Até o último dia)
✅ Alertar para revogação de acessos críticos
❌ Não esquecer acessos físicos (crachás, chaves)
❌ Não esquecer comunicação ao time/clientes
❌ Não deixar brechas de segurança`,
    promptTemplate: `Crie um checklist de offboarding detalhado para:

## DADOS
- **Cargo:** {{cargo}}
- **Área:** {{departamento}}
- **Sistemas:** {{acessos_sistemas}}
- **Equipamentos:** {{equipamentos}}
- **Complexidade:** {{pendencias_trabalho}}

---

Gere o checklist organizado por:
1. **Imediato (Dia do Aviso):** Comunicação e bloqueios preventivos.
2. **Durante o Aviso (Passagem de Bastão):** Transferência de conhecimento e arquivos.
3. **Último Dia (Devoluções e Encerramento):** Coleta de itens e revogação final.
4. **Pós-Desligamento:** O que conferir depois que a pessoa saiu.`,
    temperature: 0.5,
    maxTokens: 2000,
    model: "gemini-2.5-pro-preview",
  },

  // DESLIGAMENTO - Carta de Referência
  {
    id: "carta-referencia",
    categoryId: "desligamento",
    name: "Carta de Referência",
    slug: "carta-referencia",
    description: "Redige cartas de recomendação profissional para ex-colaboradores.",
    shortDescription: "Recomende bons profissionais",
    estimatedTimeSaved: 15,
    inputSchema: {
      fields: [
        {
          name: "nome_colaborador",
          label: "Nome do Colaborador",
          type: "text",
          required: true,
        },
        {
          name: "cargo_exercido",
          label: "Cargo Exercido",
          type: "text",
          required: true,
        },
        {
          name: "periodo",
          label: "Período de Trabalho",
          type: "text",
          required: true,
          placeholder: "Ex: Jan/2020 a Dez/2023",
        },
        {
          name: "principais_qualidades",
          label: "Principais Qualidades/Competências",
          type: "textarea",
          required: true,
          placeholder: "Pontualidade, Técnica, Liderança...",
          rows: 3,
        },
        {
          name: "destaque_projeto",
          label: "Projeto ou Conquista de Destaque",
          type: "textarea",
          required: false,
          placeholder: "Algo memorável que entregou...",
          rows: 2,
        },
        {
          name: "motivo_recomendacao",
          label: "Por que recomenda?",
          type: "textarea",
          required: true,
          placeholder: "Resumo do motivo da recomendação...",
          rows: 2,
        },
      ],
    },
    systemPrompt: `Você é o GESTOR PARCEIRO, que reconhece talentos e ajuda em suas trajetórias.

SUAS CARACTERÍSTICAS:
- Tom profissional e elogioso
- Credibilidade
- Foco em qualidades transferíveis
- Sinceridade

REGRAS:
✅ Destacar pontos fortes reais
✅ Mencionar o período e cargo para dar contexto
✅ Colocar-se à disposição para confirmar informações
✅ Usar papel timbrado (estrutura de carta formal)
❌ Não mentir ou exagerar (perde credibilidade)
❌ Não recomendar se não confiar (melhor recusar o pedido)
❌ Não mencionar pontos negativos em carta de recomendação`,
    promptTemplate: `Crie uma carta de recomendação profissional com as informações:

## DADOS
- **Profissional:** {{nome_colaborador}}
- **Cargo:** {{cargo_exercido}}
- **Período:** {{periodo}}
- **Qualidades:** {{principais_qualidades}}
- **Destaque:** {{destaque_projeto}}
- **Motivo:** {{motivo_recomendacao}}

---

Gere a carta contendo:
1. **Cabeçalho:** "A quem possa interessar".
2. **Introdução:** Confirmação do vínculo e período.
3. **Corpo:** Descrição das qualidades e entregas.
4. **Recomendação:** O "selo de aprovação" final.
5. **Contato:** Seus dados para verificação.`,
    temperature: 0.6,
    maxTokens: 1500,
    model: "gemini-2.5-pro-preview",
  },
];

// Exporta todos os agentes
export const allAgents = [...mvpAgents];

// Função helper para buscar agente por slug
export function getAgentBySlug(slug: string): Agent | undefined {
  return allAgents.find(agent => agent.slug === slug);
}

// Função helper para buscar agentes por categoria
export function getAgentsByCategory(categoryId: string): Agent[] {
  return allAgents.filter(agent => agent.categoryId === categoryId);
}

// Função helper para buscar categoria por slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(category => category.slug === slug);
}

// Função helper para buscar categoria por ID
export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

