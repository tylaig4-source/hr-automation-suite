# **DOCUMENTO DE ESPECIFICAÇÃO TÉCNICA E FUNCIONAL**

## **HR AUTOMATION SUITE \- Sistema SaaS de Automação de RH com Agentes de IA**

---

## **1\. VISÃO GERAL DO PRODUTO**

### **1.1 O Que É**

O HR Automation Suite é uma plataforma SaaS (Software as a Service) que utiliza inteligência artificial para automatizar tarefas operacionais e estratégicas do departamento de Recursos Humanos. O sistema funciona como um "escritório virtual de RH" onde cada tarefa específica é executada por um agente de IA especializado, treinado para aquela função específica.

Pense no sistema como uma equipe completa de especialistas de RH disponível 24/7, onde cada especialista (agente) domina uma tarefa específica: um é expert em escrever descrições de vagas, outro em analisar currículos, outro em criar planos de onboarding, e assim por diante.

### **1.2 Problema que Resolve**

Profissionais de RH gastam em média 60-70% do seu tempo em tarefas operacionais e repetitivas:

* Redigir descrições de vagas (1-2 horas por vaga)  
* Criar roteiros de entrevista (30-60 minutos)  
* Elaborar planos de onboarding (2-4 horas)  
* Redigir comunicados internos (30-60 minutos)  
* Criar formulários de avaliação (1-2 horas)  
* Elaborar feedbacks estruturados (20-40 minutos cada)

O HR Automation Suite reduz essas tarefas de horas para minutos, liberando o profissional de RH para atividades estratégicas e de relacionamento humano.

### **1.3 Proposta de Valor**

* **Redução de 85-95% no tempo** de execução de tarefas documentais  
* **Padronização de qualidade** em todos os documentos e processos  
* **Consistência na comunicação** institucional  
* **Escalabilidade** \- mesmo time de RH atende empresa em crescimento  
* **Disponibilidade 24/7** \- tarefas podem ser executadas a qualquer momento  
* **Redução de erros** e esquecimentos em processos complexos

---

## **2\. ARQUITETURA DO SISTEMA**

### **2.1 Estrutura Conceitual**

O sistema é organizado em três camadas principais:

CAMADA 1: CATEGORIAS (Departamentos/Áreas de RH)  
    └── CAMADA 2: AGENTES (Tarefas Específicas)  
            └── CAMADA 3: EXECUÇÃO (Input → Processamento IA → Output)

### **2.2 Categorias do Sistema (Módulos Principais)**

O sistema possui 8 módulos principais, cada um representando uma área funcional do RH:

| \# | Módulo | Descrição | Qtd. Agentes |
| ----- | ----- | ----- | ----- |
| 1 | Recrutamento e Seleção | Todo o ciclo de atração e contratação de talentos | 6 |
| 2 | Onboarding e Integração | Processos de entrada e adaptação de novos colaboradores | 4 |
| 3 | Treinamento e Desenvolvimento | Capacitação e evolução profissional | 4 |
| 4 | Avaliação de Desempenho | Mensuração e feedback de performance | 4 |
| 5 | Clima e Cultura | Engajamento, pesquisas e ações de cultura | 4 |
| 6 | Departamento Pessoal | Comunicações oficiais, políticas e documentos | 4 |
| 7 | Remuneração e Benefícios | Estruturas salariais e pacotes de benefícios | 4 |
| 8 | Desligamento | Processos de saída e offboarding | 4 |

**Total: 34 agentes especializados**

### **2.3 O Que É um Agente**

Um agente é uma unidade funcional do sistema que executa uma tarefa específica. Cada agente possui:

1. **Identidade**: Nome, descrição e propósito claro  
2. **Inputs estruturados**: Campos de formulário que o usuário deve preencher  
3. **Prompt de execução**: Instruções detalhadas para a IA processar a tarefa  
4. **Template de output**: Estrutura padronizada do resultado gerado  
5. **Regras de qualidade**: Critérios que garantem consistência e profissionalismo

**Exemplo \- Agente "Criador de Descrições de Vagas":**

IDENTIDADE: Especialista em redigir anúncios de vagas atrativos  
INPUTS: Título, departamento, responsabilidades, requisitos, benefícios, etc.  
PROCESSAMENTO: IA recebe inputs \+ prompt especializado  
OUTPUT: Descrição de vaga completa, formatada e pronta para publicar

---

## **3\. FLUXO DE FUNCIONAMENTO**

### **3.1 Jornada do Usuário**

┌──────────────────────────────────────────────────────────────────┐  
│                    FLUXO COMPLETO DE USO                         │  
└──────────────────────────────────────────────────────────────────┘

ETAPA 1: AUTENTICAÇÃO  
┌─────────────┐  
│   LOGIN     │ → Usuário acessa com e-mail/senha ou SSO  
└─────────────┘  
       ↓  
ETAPA 2: NAVEGAÇÃO  
┌─────────────┐  
│  DASHBOARD  │ → Visão geral, atalhos, histórico recente  
└─────────────┘  
       ↓  
ETAPA 3: SELEÇÃO DE CATEGORIA  
┌─────────────┐  
│  CATEGORIAS │ → Usuário escolhe área (ex: Recrutamento)  
└─────────────┘  
       ↓  
ETAPA 4: SELEÇÃO DE AGENTE  
┌─────────────┐  
│   AGENTES   │ → Usuário escolhe tarefa (ex: Criar Vaga)  
└─────────────┘  
       ↓  
ETAPA 5: PREENCHIMENTO  
┌─────────────┐  
│ FORMULÁRIO  │ → Usuário preenche campos obrigatórios e opcionais  
└─────────────┘  
       ↓  
ETAPA 6: PROCESSAMENTO  
┌─────────────┐  
│  EXECUÇÃO   │ → Sistema envia para IA e processa (5-30 segundos)  
└─────────────┘  
       ↓  
ETAPA 7: RESULTADO  
┌─────────────┐  
│   OUTPUT    │ → Resultado exibido formatado na tela  
└─────────────┘  
       ↓  
ETAPA 8: AÇÕES FINAIS  
┌─────────────┐  
│   AÇÕES     │ → Copiar, exportar PDF/DOCX, editar, salvar, regenerar  
└─────────────┘

### **3.2 Detalhamento Técnico do Fluxo de Execução**

Quando o usuário clica em "Gerar", o sistema executa:

1\. VALIDAÇÃO  
   └── Verifica se todos os campos obrigatórios estão preenchidos  
   └── Valida formato dos dados (datas, e-mails, etc.)  
   └── Retorna erros se houver problemas

2\. MONTAGEM DO PROMPT  
   └── Recupera o prompt-base do agente selecionado  
   └── Substitui variáveis {{campo}} pelos valores do formulário  
   └── Adiciona contexto da empresa (se configurado)  
   └── Gera prompt final completo

3\. CHAMADA À API DE IA  
   └── Envia prompt para API (OpenAI, Anthropic, etc.)  
   └── Aguarda resposta (timeout configurável)  
   └── Trata erros de API se houver

4\. PROCESSAMENTO DO RESULTADO  
   └── Recebe texto bruto da IA  
   └── Aplica formatação (markdown → HTML)  
   └── Valida estrutura do output  
   └── Armazena no histórico

5\. EXIBIÇÃO  
   └── Renderiza resultado formatado na interface  
   └── Habilita botões de ação (copiar, exportar, etc.)  
   └── Registra métricas de uso

---

## **4\. ESPECIFICAÇÃO DOS MÓDULOS E AGENTES**

### **4.1 MÓDULO 1: RECRUTAMENTO E SELEÇÃO**

Este módulo cobre todo o ciclo de atração e seleção de talentos.

#### **Agente 1.1: Criador de Descrições de Vagas**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Gera descrições de vagas completas e atrativas |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 2-5 minutos |
| **Economia** | \~90% |

**Campos do formulário (inputs):**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| titulo\_vaga | texto | Sim | Nome do cargo |
| departamento | select | Sim | Área da empresa |
| modelo\_trabalho | select | Sim | Presencial/Híbrido/Remoto |
| localizacao | texto | Sim | Cidade/Estado |
| nivel\_senioridade | select | Sim | Júnior/Pleno/Sênior/etc. |
| responsabilidades | textarea | Sim | Lista de atividades principais |
| requisitos\_obrigatorios | textarea | Sim | Formação, experiência, skills |
| requisitos\_desejaveis | textarea | Não | Diferenciais |
| faixa\_salarial | texto | Não | Valor ou "a combinar" |
| beneficios | textarea | Sim | Lista de benefícios |
| sobre\_empresa | textarea | Não | Descrição institucional |
| diferenciais\_vaga | textarea | Não | O que torna a vaga especial |

**Estrutura do output:**

* Título formatado  
* Seção "Sobre a Empresa"  
* Seção "Sobre a Oportunidade"  
* Lista de responsabilidades  
* Requisitos obrigatórios  
* Diferenciais desejáveis  
* Benefícios oferecidos  
* Informações adicionais  
* Call-to-action final

---

#### **Agente 1.2: Analisador de Currículos**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Analisa CV vs. requisitos e gera relatório de fit |
| **Tempo manual** | 15-30 minutos por CV |
| **Tempo com IA** | 1-2 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| curriculo\_texto | textarea | Sim | Conteúdo do currículo (cole o texto) |
| requisitos\_vaga | textarea | Sim | Requisitos da posição |
| competencias\_criticas | textarea | Sim | 3-5 competências mais importantes |
| experiencia\_minima | texto | Sim | Anos/tipo de experiência exigida |
| formacao\_exigida | texto | Sim | Nível e área de formação |

**Estrutura do output:**

* Dados do candidato extraídos  
* Score de aderência (0-10) com barra visual  
* Tabela de match por requisito  
* Pontos fortes identificados  
* Gaps e pontos de atenção  
* Análise de formação  
* Análise de experiência  
* Perguntas sugeridas para entrevista  
* Recomendação final (aprovado/reprovado/ressalvas)

---

#### **Agente 1.3: Gerador de Perguntas de Entrevista**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria roteiro completo de entrevista por competências |
| **Tempo manual** | 30-60 minutos |
| **Tempo com IA** | 3-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| cargo | texto | Sim | Nome da posição |
| nivel | select | Sim | Júnior/Pleno/Sênior/Gerencial |
| competencias\_tecnicas | textarea | Sim | 3-5 competências técnicas |
| competencias\_comportamentais | textarea | Sim | 3-5 soft skills |
| valores\_empresa | textarea | Sim | Valores para avaliar fit cultural |
| desafios\_vaga | textarea | Não | Desafios específicos da posição |
| duracao\_entrevista | select | Sim | 30/45/60/90 minutos |
| tipo\_entrevista | select | Sim | Técnica/Comportamental/Completa |

**Estrutura do output:**

* Roteiro completo por seções  
* Script de abertura  
* Perguntas técnicas com follow-ups  
* Perguntas comportamentais (metodologia STAR)  
* Perguntas de fit cultural  
* Cenários situacionais  
* Script de encerramento  
* Ficha de avaliação com escala

---

#### **Agente 1.4: Avaliador de Fit Cultural**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria framework de avaliação de compatibilidade cultural |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 3-5 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| valores\_empresa | textarea | Sim | 3-5 valores principais |
| tipo\_cultura | select | Sim | Inovadora/Tradicional/Colaborativa/etc. |
| estilo\_lideranca | select | Sim | Horizontal/Vertical/Misto |
| ritmo\_trabalho | select | Sim | Startup/Corporativo/Flexível |
| perfil\_equipe | textarea | Não | Características do time atual |
| comportamentos\_valorizados | textarea | Sim | O que a empresa celebra |
| comportamentos\_nao\_tolerados | textarea | Sim | Red flags culturais |

**Estrutura do output:**

* Framework de avaliação  
* Questionário por valor  
* Assessment de estilo de trabalho  
* Matriz de compatibilidade  
* Red flags a observar  
* Sistema de scoring  
* Interpretação de resultados

---

#### **Agente 1.5: Criador de Testes Técnicos**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve avaliações técnicas personalizadas |
| **Tempo manual** | 2-4 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| cargo | texto | Sim | Nome da posição |
| nivel | select | Sim | Júnior/Pleno/Sênior |
| area | select | Sim | TI/Marketing/Financeiro/etc. |
| habilidades\_testar | textarea | Sim | 3-5 habilidades específicas |
| ferramentas | textarea | Não | Softwares/linguagens a avaliar |
| duracao\_teste | select | Sim | 30min/1h/2h/take-home |
| formato | multiselect | Sim | Múltipla escolha/Dissertativo/Case |
| contexto\_empresa | textarea | Não | Para criar cases realistas |

**Estrutura do output:**

* Instruções para o candidato  
* Seção de conhecimentos fundamentais  
* Case prático com contexto  
* Cenários de resolução de problemas  
* Gabarito completo  
* Critérios de correção  
* Tabela de interpretação de resultados

---

#### **Agente 1.6: Gerador de Feedback de Candidatos**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria comunicações personalizadas para candidatos |
| **Tempo manual** | 10-20 minutos por candidato |
| **Tempo com IA** | 1-2 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_candidato | texto | Sim | Nome completo |
| cargo | texto | Sim | Vaga disputada |
| estagio\_processo | select | Sim | Triagem/Entrevista/Teste/Final |
| resultado | select | Sim | Aprovado/Reprovado/Banco de talentos |
| pontos\_fortes | textarea | Condicional | Se aprovação ou feedback detalhado |
| pontos\_desenvolvimento | textarea | Condicional | Se reprovação com feedback |
| motivo\_decisao | textarea | Condicional | Razão objetiva (se reprovação) |
| tom | select | Sim | Formal/Cordial/Caloroso |
| nome\_empresa | texto | Sim | Nome da empresa |
| proximos\_passos | textarea | Condicional | Se aprovação |

**Estrutura do output:**

* E-mail formatado completo  
* Assunto sugerido  
* Corpo personalizado conforme resultado  
* Tom adequado à situação  
* Próximos passos claros  
* Assinatura profissional

---

### **4.2 MÓDULO 2: ONBOARDING E INTEGRAÇÃO**

#### **Agente 2.1: Criador de Planos de Onboarding**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Gera plano completo de 30-60-90 dias |
| **Tempo manual** | 3-5 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome do novo funcionário |
| cargo | texto | Sim | Posição |
| departamento | select | Sim | Área |
| data\_inicio | date | Sim | Primeiro dia |
| gestor | texto | Sim | Nome do líder direto |
| modelo\_trabalho | select | Sim | Presencial/Híbrido/Remoto |
| nivel\_experiencia | select | Sim | Júnior/Pleno/Sênior/Gerencial |
| responsabilidades | textarea | Sim | Atividades principais |
| ferramentas\_sistemas | textarea | Sim | Softwares que usará |
| stakeholders | textarea | Não | Com quem precisará interagir |
| treinamentos\_obrigatorios | textarea | Não | Compliance, segurança, etc. |
| metas\_90\_dias | textarea | Sim | Objetivos do período |

**Estrutura do output:**

* Dados do colaborador  
* Checklist pré-onboarding  
* Agenda detalhada da primeira semana (dia a dia)  
* Plano semanas 2-4  
* Objetivos e atividades do mês 2  
* Objetivos e atividades do mês 3  
* Checkpoints de avaliação  
* Lista de materiais e recursos  
* Contatos importantes  
* Checklist geral de conclusão

---

#### **Agente 2.2: Gerador de Checklists de Integração**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria checklists específicos por etapa e responsável |
| **Tempo manual** | 30-60 minutos |
| **Tempo com IA** | 2-3 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tipo\_checklist | select | Sim | Pré-admissão/1º dia/1ª semana/30-60-90 |
| destinatario | select | Sim | RH/Gestor/TI/Colaborador |
| modelo\_trabalho | select | Sim | Presencial/Híbrido/Remoto |
| cargo\_nivel | texto | Não | Tipo de posição |
| sistemas | textarea | Não | Ferramentas da empresa |
| particularidades | textarea | Não | Requisitos específicos |

**Estrutura do output:**

* Cabeçalho com dados  
* Itens organizados por categoria  
* Responsável por item  
* Prazo por item  
* Campo de status (checkbox)  
* Espaço para observações  
* Campos de assinatura

---

#### **Agente 2.3: Criador de Manuais do Colaborador**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Gera manual/handbook personalizado |
| **Tempo manual** | 8-20 horas |
| **Tempo com IA** | 15-30 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_empresa | texto | Sim | Nome da empresa |
| historia\_empresa | textarea | Não | Breve histórico |
| missao\_visao\_valores | textarea | Sim | MVV da empresa |
| politicas\_principais | textarea | Sim | Principais políticas |
| beneficios | textarea | Sim | Lista de benefícios |
| horarios\_jornada | textarea | Sim | Regras de horário |
| dress\_code | textarea | Não | Código de vestimenta |
| canais\_comunicacao | textarea | Sim | E-mail, Slack, etc. |
| estrutura\_organizacional | textarea | Não | Organograma |
| contatos\_importantes | textarea | Sim | RH, TI, etc. |
| faq | textarea | Não | Perguntas frequentes |

**Estrutura do output:**

* Capa e índice  
* Mensagem de boas-vindas  
* Sobre a empresa  
* Cultura e valores  
* Políticas e procedimentos  
* Benefícios detalhados  
* Dia a dia na empresa  
* Desenvolvimento de carreira  
* Canais de comunicação  
* FAQ  
* Termo de ciência

---

#### **Agente 2.4: Gerador de Cronogramas de Treinamento**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria cronograma de capacitação inicial |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 3-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome |
| cargo | texto | Sim | Posição |
| data\_inicio | date | Sim | Início |
| treinamentos\_obrigatorios | textarea | Sim | Compliance, segurança, etc. |
| treinamentos\_tecnicos | textarea | Sim | Sistemas, ferramentas |
| treinamentos\_soft | textarea | Não | Cultura, comunicação |
| disponibilidade\_diaria | select | Sim | Horas/dia para treinamento |
| formato\_preferencial | select | Sim | Online/Presencial/Misto |
| recursos\_disponiveis | textarea | Não | Plataformas LMS, etc. |

**Estrutura do output:**

* Visão geral do programa  
* Cronograma semana a semana  
* Detalhamento por treinamento  
* Recursos e links  
* Avaliações previstas  
* Certificações esperadas

---

### **4.3 MÓDULO 3: TREINAMENTO E DESENVOLVIMENTO**

#### **Agente 3.1: Criador de PDIs (Planos de Desenvolvimento Individual)**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Elabora PDI completo e personalizado |
| **Tempo manual** | 2-4 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome |
| cargo\_atual | texto | Sim | Posição atual |
| tempo\_empresa | texto | Sim | Anos/meses |
| cargo\_almejado | texto | Não | Próximo passo desejado |
| competencias\_atuais | textarea | Sim | Pontos fortes |
| gaps\_identificados | textarea | Sim | Áreas de desenvolvimento |
| resultados\_avaliacao | textarea | Não | Resumo da última avaliação |
| aspiracoes\_colaborador | textarea | Sim | O que deseja desenvolver |
| necessidades\_empresa | textarea | Não | Competências necessárias |
| orcamento\_disponivel | texto | Não | Para treinamentos externos |
| prazo\_pdi | select | Sim | 6 meses/1 ano |

**Estrutura do output:**

* Dados do colaborador  
* Objetivos de desenvolvimento (geral e específicos)  
* Análise de competências (fortes e gaps)  
* Plano de ação detalhado por competência  
* Recursos de desenvolvimento  
* Indicadores e métricas  
* Cronograma de acompanhamento  
* Termo de compromisso

---

#### **Agente 3.2: Gerador de Conteúdos de Treinamento**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria materiais de treinamento estruturados |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 10-20 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tema\_treinamento | texto | Sim | Assunto principal |
| objetivo\_aprendizagem | textarea | Sim | O que o aluno deve aprender |
| publico\_alvo | textarea | Sim | Perfil dos participantes |
| duracao | select | Sim | 1h/2h/4h/8h/módulos |
| formato | select | Sim | Presencial/Online/Híbrido |
| nivel\_profundidade | select | Sim | Básico/Intermediário/Avançado |
| pre\_requisitos | textarea | Não | Conhecimentos necessários |
| recursos\_disponiveis | textarea | Não | Ferramentas, materiais |

**Estrutura do output:**

* Plano de aula completo  
* Objetivos de aprendizagem  
* Conteúdo programático  
* Slides/material de apresentação (estrutura)  
* Exercícios práticos  
* Avaliação de aprendizagem  
* Material de apoio

---

#### **Agente 3.3: Avaliador de Necessidades de Capacitação**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Diagnóstico de gaps de treinamento |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| area\_departamento | texto | Sim | Área analisada |
| funcoes\_cargos | textarea | Sim | Cargos do departamento |
| competencias\_necessarias | textarea | Sim | Skills requeridas |
| resultados\_avaliacoes | textarea | Não | Gaps identificados |
| feedback\_gestores | textarea | Não | Observações dos líderes |
| objetivos\_estrategicos | textarea | Sim | Metas da empresa/área |
| orcamento\_disponivel | texto | Não | Budget para T\&D |

**Estrutura do output:**

* Diagnóstico da situação atual  
* Mapeamento de gaps por cargo  
* Matriz de priorização  
* Recomendações de treinamento  
* Cronograma sugerido  
* Estimativa de investimento  
* ROI esperado

---

#### **Agente 3.4: Criador de Trilhas de Aprendizagem**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve percursos formativos estruturados |
| **Tempo manual** | 3-6 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_trilha | texto | Sim | Nome do percurso |
| objetivo\_trilha | textarea | Sim | Competência desenvolvida |
| publico\_alvo | textarea | Sim | Para quem é a trilha |
| duracao\_total | select | Sim | Semanas/meses |
| formato | select | Sim | Online/Presencial/Misto |
| recursos\_disponiveis | textarea | Não | Cursos, materiais, etc. |
| nivel\_inicial | select | Sim | De onde o aluno parte |
| nivel\_final | select | Sim | Onde deve chegar |

**Estrutura do output:**

* Visão geral da trilha  
* Pré-requisitos  
* Módulos sequenciais  
* Conteúdo por módulo  
* Atividades práticas  
* Avaliações por etapa  
* Certificação final  
* Recursos complementares

---

### **4.4 MÓDULO 4: AVALIAÇÃO DE DESEMPENHO**

#### **Agente 4.1: Criador de Formulários de Avaliação**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve formulários de avaliação completos |
| **Tempo manual** | 2-4 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tipo\_avaliacao | select | Sim | 90°/180°/360°/Auto |
| cargo\_funcao | texto | Sim | Posição avaliada |
| competencias\_organizacionais | textarea | Sim | Valores/competências da empresa |
| competencias\_tecnicas | textarea | Sim | Específicas do cargo |
| competencias\_comportamentais | textarea | Sim | Soft skills |
| metas\_periodo | textarea | Não | Se avaliação por resultados |
| escala | select | Sim | 1-5/1-4/Conceitos |
| periodo\_avaliado | texto | Sim | Trimestre/Semestre/Ano |
| avaliadores | textarea | Não | Quem avalia quem |

**Estrutura do output:**

* Cabeçalho com dados  
* Escala de avaliação explicada  
* Seção competências organizacionais  
* Seção competências técnicas  
* Seção competências comportamentais  
* Seção resultados/metas  
* Avaliação geral  
* Recomendações  
* Cálculo de nota final  
* Classificação  
* Campos de assinatura

---

#### **Agente 4.2: Gerador de Feedbacks Estruturados**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria feedbacks profissionais e construtivos |
| **Tempo manual** | 20-40 minutos |
| **Tempo com IA** | 2-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome |
| contexto\_feedback | select | Sim | Avaliação/Projeto/Comportamento |
| situacao\_especifica | textarea | Sim | O que aconteceu |
| comportamento\_observado | textarea | Sim | O que a pessoa fez |
| impacto | textarea | Sim | Consequências |
| pontos\_fortes | textarea | Sim | O que reconhecer |
| pontos\_desenvolver | textarea | Sim | O que melhorar |
| sugestoes\_melhoria | textarea | Sim | Ações recomendadas |
| tom | select | Sim | Motivacional/Corretivo/Equilibrado |
| metodologia | select | Sim | SBI/Sanduíche/Feedforward |

**Estrutura do output:**

* Feedback formatado por metodologia  
* Reconhecimentos (SBI)  
* Pontos de desenvolvimento (SBI)  
* Feedforward (expectativas futuras)  
* Compromisso do gestor  
* Abertura para diálogo  
* Resumo e próximos passos

---

#### **Agente 4.3: Analisador de Performance**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Analisa dados de desempenho e gera insights |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 3-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome |
| cargo | texto | Sim | Posição |
| periodo\_analisado | texto | Sim | Período |
| metas\_definidas | textarea | Sim | Objetivos do período |
| resultados\_alcancados | textarea | Sim | O que foi entregue |
| notas\_avaliacao | textarea | Não | Scores das competências |
| feedback\_recebido | textarea | Não | Comentários de avaliadores |
| contexto\_adicional | textarea | Não | Fatores externos |

**Estrutura do output:**

* Resumo executivo  
* Análise de metas vs. resultados  
* Análise de competências  
* Tendências identificadas  
* Pontos de destaque  
* Áreas de atenção  
* Comparativo histórico  
* Recomendações de ação  
* Potencial identificado

---

#### **Agente 4.4: Criador de Metas SMART**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve metas bem estruturadas |
| **Tempo manual** | 30-60 minutos |
| **Tempo com IA** | 3-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome |
| cargo | texto | Sim | Posição |
| area\_departamento | texto | Sim | Área |
| objetivos\_estrategicos | textarea | Sim | Metas da empresa/área |
| responsabilidades\_cargo | textarea | Sim | Atividades principais |
| periodo\_metas | texto | Sim | Trimestre/Semestre/Ano |
| quantidade\_metas | select | Sim | 3/4/5/6 metas |
| recursos\_disponiveis | textarea | Não | Budget, equipe, etc. |
| contexto | textarea | Não | Informações adicionais |

**Estrutura do output:**

* Contexto e alinhamento estratégico  
* Metas SMART detalhadas (cada uma com):  
  * Específica: descrição clara  
  * Mensurável: indicador e meta  
  * Atingível: justificativa  
  * Relevante: conexão com objetivos  
  * Temporal: prazo definido  
* Plano de acompanhamento  
* Critérios de sucesso

---

### **4.5 MÓDULO 5: CLIMA E CULTURA ORGANIZACIONAL**

#### **Agente 5.1: Criador de Pesquisas de Clima**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve questionários de pesquisa de clima |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 10-15 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_empresa | texto | Sim | Nome |
| dimensoes\_avaliar | multiselect | Sim | Liderança, comunicação, etc. |
| quantidade\_perguntas | select | Sim | 20/30/40/50 perguntas |
| escala | select | Sim | Likert 5/Likert 7/NPS |
| publico | select | Sim | Todos/Área específica |
| anonimato | select | Sim | Anônima/Identificada |
| temas\_especificos | textarea | Não | Questões adicionais |
| benchmarks | textarea | Não | Comparações desejadas |

**Estrutura do output:**

* Introdução e instruções  
* Perguntas por dimensão  
* Escala padronizada  
* Perguntas abertas  
* Dados demográficos  
* Encerramento  
* Guia de aplicação

---

#### **Agente 5.2: Analisador de Resultados de Pesquisa**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Interpreta dados de pesquisa de clima |
| **Tempo manual** | 8-16 horas |
| **Tempo com IA** | 10-20 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| dados\_pesquisa | textarea/file | Sim | Resultados da pesquisa |
| dimensoes\_avaliadas | textarea | Sim | Categorias analisadas |
| total\_respondentes | number | Sim | Quantidade de respostas |
| taxa\_participacao | number | Sim | % de adesão |
| comparativo\_anterior | textarea | Não | Dados da pesquisa anterior |
| segmentacoes | textarea | Não | Cortes por área, nível, etc. |

**Estrutura do output:**

* Sumário executivo  
* Visão geral dos resultados  
* Análise por dimensão  
* Destaques positivos  
* Áreas críticas  
* Comparativo histórico  
* Análise de comentários abertos  
* Correlações identificadas  
* Recomendações prioritárias

---

#### **Agente 5.3: Gerador de Planos de Ação de Clima**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria planos de ação para melhorar clima |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 10-15 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| resultados\_pesquisa | textarea | Sim | Principais findings |
| areas\_criticas | textarea | Sim | Dimensões com pior resultado |
| recursos\_disponiveis | textarea | Não | Budget, pessoas |
| restricoes | textarea | Não | Limitações |
| prazo\_implementacao | select | Sim | 3/6/12 meses |
| prioridades\_empresa | textarea | Não | Foco estratégico |

**Estrutura do output:**

* Diagnóstico resumido  
* Priorização de ações  
* Plano de ação detalhado por área  
* Responsáveis  
* Cronograma  
* Indicadores de sucesso  
* Comunicação do plano  
* Monitoramento

---

#### **Agente 5.4: Criador de Programas de Engajamento**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve iniciativas de engajamento |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 10-15 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| objetivo\_programa | textarea | Sim | O que quer alcançar |
| publico\_alvo | textarea | Sim | Quem participará |
| orcamento | texto | Não | Verba disponível |
| duracao | select | Sim | Pontual/Trimestral/Anual |
| tipo\_programa | select | Sim | Reconhecimento/Bem-estar/Social |
| cultura\_empresa | textarea | Não | Valores e estilo |
| modelo\_trabalho | select | Sim | Presencial/Híbrido/Remoto |

**Estrutura do output:**

* Conceito do programa  
* Objetivos e indicadores  
* Público e elegibilidade  
* Mecânica/funcionamento  
* Cronograma  
* Orçamento detalhado  
* Comunicação  
* Medição de resultados

---

### **4.6 MÓDULO 6: DEPARTAMENTO PESSOAL**

#### **Agente 6.1: Gerador de Comunicados Oficiais**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria comunicações internas profissionais |
| **Tempo manual** | 20-40 minutos |
| **Tempo com IA** | 2-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tipo\_comunicado | select | Sim | Informativo/Mudança/Evento/Urgente |
| assunto | texto | Sim | Tema principal |
| publico\_alvo | select | Sim | Todos/Área/Liderança |
| informacoes | textarea | Sim | Conteúdo principal |
| tom | select | Sim | Formal/Cordial/Celebrativo |
| canal | select | Sim | E-mail/Intranet/Teams |
| remetente | texto | Sim | Quem assina |
| data\_vigencia | date | Não | Se aplicável |
| contato\_duvidas | texto | Sim | Para esclarecimentos |

**Estrutura do output:**

* Comunicado formatado  
* Cabeçalho institucional  
* Corpo estruturado  
* Destaques visuais  
* Contato  
* Assinatura

---

#### **Agente 6.2: Criador de Políticas Internas**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve políticas e procedimentos |
| **Tempo manual** | 8-20 horas |
| **Tempo com IA** | 20-40 minutos |
| **Economia** | \~95% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_politica | texto | Sim | Título da política |
| objetivo | textarea | Sim | Propósito do documento |
| abrangencia | textarea | Sim | Quem deve seguir |
| diretrizes\_principais | textarea | Sim | Regras principais |
| procedimentos | textarea | Sim | Como deve ser feito |
| responsabilidades | textarea | Sim | Quem faz o quê |
| excecoes | textarea | Não | Casos especiais |
| consequencias | textarea | Não | Descumprimento |
| referencias\_legais | textarea | Não | Leis aplicáveis |

**Estrutura do output:**

* Cabeçalho com controle de versão  
* Objetivo  
* Abrangência  
* Definições  
* Diretrizes  
* Procedimentos detalhados  
* Responsabilidades  
* Exceções  
* Consequências  
* Documentos relacionados  
* Histórico de revisões  
* Aprovações

---

#### **Agente 6.3: Elaborador de Contratos e Aditivos**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Gera minutas de contratos de trabalho |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tipo\_contrato | select | Sim | CLT/PJ/Estágio/Temporário |
| tipo\_documento | select | Sim | Contrato novo/Aditivo |
| dados\_empresa | textarea | Sim | CNPJ, razão social, etc. |
| dados\_colaborador | textarea | Sim | Nome, CPF, etc. |
| cargo | texto | Sim | Função |
| salario | texto | Sim | Remuneração |
| beneficios | textarea | Sim | Pacote de benefícios |
| jornada | texto | Sim | Horário de trabalho |
| clausulas\_especiais | textarea | Não | Adicional específico |

**Estrutura do output:**

* Minuta de contrato completa  
* Qualificação das partes  
* Objeto  
* Remuneração e benefícios  
* Jornada  
* Obrigações das partes  
* Confidencialidade  
* Rescisão  
* Foro  
* Assinaturas

**AVISO:** Output é minuta sugerida. Deve ser revisado por advogado.

---

#### **Agente 6.4: Gerador de Termos e Declarações**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria termos, declarações e documentos diversos |
| **Tempo manual** | 15-30 minutos |
| **Tempo com IA** | 2-5 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tipo\_documento | select | Sim | Declaração/Termo/Autorização |
| finalidade | textarea | Sim | Para que serve |
| dados\_colaborador | textarea | Sim | Nome, cargo, etc. |
| conteudo\_especifico | textarea | Sim | Informações necessárias |
| dados\_empresa | textarea | Sim | Nome, CNPJ |
| assinantes | textarea | Sim | Quem assina |

**Estrutura do output:**

* Documento formatado  
* Cabeçalho  
* Corpo do texto  
* Local e data  
* Assinaturas

---

### **4.7 MÓDULO 7: REMUNERAÇÃO E BENEFÍCIOS**

#### **Agente 7.1: Analisador de Estrutura Salarial**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Analisa equidade e competitividade salarial |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 10-20 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| dados\_salariais | textarea | Sim | Cargos e salários atuais |
| dados\_mercado | textarea | Não | Pesquisas salariais |
| estrutura\_cargos | textarea | Sim | Níveis e faixas |
| setor\_empresa | select | Sim | Segmento de atuação |
| regiao | texto | Sim | Localização |
| tamanho\_empresa | select | Sim | Porte |

**Estrutura do output:**

* Análise da estrutura atual  
* Comparativo de mercado  
* Identificação de gaps  
* Análise de equidade interna  
* Recomendações de ajustes  
* Impacto financeiro  
* Plano de implementação

---

#### **Agente 7.2: Criador de Propostas Salariais**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Elabora propostas de remuneração |
| **Tempo manual** | 30-60 minutos |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~85% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_candidato | texto | Sim | Nome |
| cargo | texto | Sim | Posição |
| salario\_proposto | texto | Sim | Valor |
| beneficios | textarea | Sim | Pacote completo |
| bonus\_variavel | textarea | Não | Se houver |
| data\_inicio | date | Sim | Início previsto |
| condicoes\_especiais | textarea | Não | Negociações |

**Estrutura do output:**

* Carta proposta formal  
* Detalhamento da remuneração  
* Descrição dos benefícios  
* Bônus e variáveis  
* Condições de contratação  
* Prazo para resposta

---

#### **Agente 7.3: Gerador de Políticas de Benefícios**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Documenta políticas de benefícios |
| **Tempo manual** | 4-8 horas |
| **Tempo com IA** | 15-30 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| beneficios\_oferecidos | textarea | Sim | Lista completa |
| elegibilidade | textarea | Sim | Quem tem direito |
| regras\_utilizacao | textarea | Sim | Como usar cada um |
| fornecedores | textarea | Não | Operadoras, parceiros |
| custos\_coparticipacao | textarea | Não | Se houver |

**Estrutura do output:**

* Política completa  
* Descrição por benefício  
* Elegibilidade  
* Regras de uso  
* Procedimentos  
* Contatos  
* FAQ

---

#### **Agente 7.4: Comparador de Pacotes de Remuneração**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Compara propostas e pacotes totais |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~85% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| proposta\_1 | textarea | Sim | Primeira opção |
| proposta\_2 | textarea | Sim | Segunda opção |
| proposta\_3 | textarea | Não | Terceira opção |
| criterios\_comparacao | textarea | Sim | O que comparar |
| perfil\_profissional | textarea | Não | Prioridades |

**Estrutura do output:**

* Tabela comparativa  
* Análise por critério  
* Valor total de cada pacote  
* Prós e contras  
* Recomendação

---

### **4.8 MÓDULO 8: DESLIGAMENTO**

#### **Agente 8.1: Criador de Roteiros de Entrevista de Desligamento**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Desenvolve roteiro de exit interview |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| tipo\_desligamento | select | Sim | Voluntário/Involuntário/Acordo |
| cargo\_colaborador | texto | Sim | Posição |
| tempo\_empresa | texto | Sim | Anos/meses |
| departamento | texto | Sim | Área |
| motivo\_conhecido | textarea | Não | Se souber |
| historico | textarea | Não | Performance, problemas |
| sensibilidade | select | Sim | Baixa/Média/Alta |
| informacoes\_prioritarias | textarea | Não | O que quer saber |

**Estrutura do output:**

* Roteiro completo  
* Script de abertura  
* Perguntas por seção  
* Follow-ups sugeridos  
* Script de encerramento  
* Formulário de registro  
* Categorização de motivos

---

#### **Agente 8.2: Gerador de Cartas de Desligamento**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Cria comunicações formais de desligamento |
| **Tempo manual** | 20-40 minutos |
| **Tempo com IA** | 3-5 minutos |
| **Economia** | \~85% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| nome\_colaborador | texto | Sim | Nome completo |
| cargo | texto | Sim | Posição |
| tipo\_desligamento | select | Sim | Sem justa causa/Acordo/Pedido |
| data\_desligamento | date | Sim | Último dia |
| motivo | textarea | Condicional | Se aplicável |
| aviso\_previo | select | Sim | Trabalhado/Indenizado |
| informacoes\_rescisao | textarea | Não | Detalhes adicionais |

**Estrutura do output:**

* Carta formal de comunicação  
* Termos do desligamento  
* Informações sobre rescisão  
* Próximos passos  
* Devolução de materiais  
* Agradecimento (quando aplicável)

---

#### **Agente 8.3: Elaborador de Termos de Rescisão**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Gera minutas de documentos rescisórios |
| **Tempo manual** | 30-60 minutos |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~85% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| dados\_colaborador | textarea | Sim | Nome, CPF, etc. |
| dados\_empresa | textarea | Sim | Razão social, CNPJ |
| tipo\_rescisao | select | Sim | Modalidade |
| data\_admissao | date | Sim | Início do contrato |
| data\_demissao | date | Sim | Fim do contrato |
| verbas\_rescisorias | textarea | Não | Valores calculados |
| clausulas\_especiais | textarea | Não | Acordos específicos |

**Estrutura do output:**

* Termo de rescisão  
* Qualificação das partes  
* Modalidade  
* Verbas rescisórias  
* Quitação  
* Obrigações pós-contratuais  
* Assinaturas

**AVISO:** Documento sugerido. Deve ser validado pelo DP/Contabilidade.

---

#### **Agente 8.4: Criador de Relatórios de Offboarding**

| Aspecto | Especificação |
| ----- | ----- |
| **Função** | Consolida informações do processo de saída |
| **Tempo manual** | 1-2 horas |
| **Tempo com IA** | 5-10 minutos |
| **Economia** | \~90% |

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
| ----- | ----- | ----- | ----- |
| dados\_colaborador | textarea | Sim | Informações básicas |
| tipo\_desligamento | select | Sim | Modalidade |
| motivo\_principal | select | Sim | Razão da saída |
| resultado\_exit\_interview | textarea | Não | Resumo da entrevista |
| pendencias | textarea | Não | Equipamentos, acessos |
| feedback\_gestor | textarea | Não | Comentários do líder |
| substituicao | textarea | Não | Plano de sucessão |

**Estrutura do output:**

* Relatório consolidado  
* Dados do colaborador  
* Histórico resumido  
* Motivo do desligamento  
* Insights da exit interview  
* Checklist de offboarding  
* Recomendações  
* Lições aprendidas

---

## **5\. ESPECIFICAÇÕES TÉCNICAS DE DESENVOLVIMENTO**

### **5.1 Stack Tecnológica Recomendada**

#### **Frontend**

\- Framework: Next.js 14+ (React)  
\- Estilização: Tailwind CSS  
\- Componentes: shadcn/ui ou Radix UI  
\- Estado: Zustand ou React Query  
\- Formulários: React Hook Form \+ Zod  
\- Editor de texto: TipTap ou Slate

#### **Backend**

\- Runtime: Node.js 20+  
\- Framework: Express.js ou Fastify  
\- ORM: Prisma  
\- Validação: Zod  
\- Autenticação: NextAuth.js ou Clerk

#### **Banco de Dados**

\- Principal: PostgreSQL  
\- Cache: Redis  
\- Busca: Algolia ou Meilisearch (opcional)

#### **Infraestrutura**

\- Hospedagem: Vercel (frontend) \+ Railway/Render (backend)  
\- Storage: AWS S3 ou Cloudflare R2  
\- CDN: Cloudflare

#### **Integrações de IA**

\- Primária: OpenAI GPT-4 / GPT-4-turbo  
\- Alternativa: Anthropic Claude 3  
\- Fallback: Mistral ou Llama via Together AI

### **5.2 Modelo de Dados Simplificado**

\-- Usuários  
CREATE TABLE users (  
  id UUID PRIMARY KEY,  
  email VARCHAR(255) UNIQUE NOT NULL,  
  name VARCHAR(255) NOT NULL,  
  company\_id UUID REFERENCES companies(id),  
  role ENUM('admin', 'hr\_manager', 'hr\_analyst', 'manager', 'employee'),  
  created\_at TIMESTAMP,  
  updated\_at TIMESTAMP  
);

\-- Empresas (multi-tenant)  
CREATE TABLE companies (  
  id UUID PRIMARY KEY,  
  name VARCHAR(255) NOT NULL,  
  plan ENUM('starter', 'professional', 'enterprise'),  
  settings JSONB, \-- configurações customizadas  
  created\_at TIMESTAMP  
);

\-- Categorias  
CREATE TABLE categories (  
  id UUID PRIMARY KEY,  
  name VARCHAR(255) NOT NULL,  
  slug VARCHAR(100) UNIQUE NOT NULL,  
  description TEXT,  
  icon VARCHAR(50),  
  order\_index INTEGER,  
  is\_active BOOLEAN DEFAULT true  
);

\-- Agentes  
CREATE TABLE agents (  
  id UUID PRIMARY KEY,  
  category\_id UUID REFERENCES categories(id),  
  name VARCHAR(255) NOT NULL,  
  slug VARCHAR(100) UNIQUE NOT NULL,  
  description TEXT,  
  prompt\_template TEXT NOT NULL, \-- prompt com variáveis {{campo}}  
  input\_schema JSONB NOT NULL, \-- definição dos campos do formulário  
  output\_template TEXT, \-- estrutura esperada do output  
  estimated\_time\_saved INTEGER, \-- minutos economizados  
  is\_active BOOLEAN DEFAULT true,  
  version INTEGER DEFAULT 1,  
  created\_at TIMESTAMP,  
  updated\_at TIMESTAMP  
);

\-- Execuções  
CREATE TABLE executions (  
  id UUID PRIMARY KEY,  
  user\_id UUID REFERENCES users(id),  
  company\_id UUID REFERENCES companies(id),  
  agent\_id UUID REFERENCES agents(id),  
  inputs JSONB NOT NULL, \-- dados preenchidos pelo usuário  
  prompt\_sent TEXT NOT NULL, \-- prompt final enviado para IA  
  output TEXT NOT NULL, \-- resposta da IA  
  tokens\_used INTEGER,  
  execution\_time\_ms INTEGER,  
  rating INTEGER, \-- 1-5 feedback do usuário  
  created\_at TIMESTAMP  
);

\-- Templates salvos pelo usuário  
CREATE TABLE user\_templates (  
  id UUID PRIMARY KEY,  
  user\_id UUID REFERENCES users(id),  
  agent\_id UUID REFERENCES agents(id),  
  name VARCHAR(255) NOT NULL,  
  inputs JSONB NOT NULL, \-- inputs pré-preenchidos  
  created\_at TIMESTAMP  
);

\-- Configurações de prompt por empresa (customização)  
CREATE TABLE company\_prompts (  
  id UUID PRIMARY KEY,  
  company\_id UUID REFERENCES companies(id),  
  agent\_id UUID REFERENCES agents(id),  
  custom\_prompt TEXT, \-- sobrescreve o prompt padrão  
  additional\_context TEXT, \-- contexto adicional da empresa  
  is\_active BOOLEAN DEFAULT true  
);

### **5.3 Arquitetura de API**

BASE URL: /api/v1

AUTENTICAÇÃO  
POST   /auth/login           \- Login  
POST   /auth/register        \- Registro  
POST   /auth/refresh         \- Refresh token  
POST   /auth/logout          \- Logout

CATEGORIAS  
GET    /categories           \- Lista categorias  
GET    /categories/:slug     \- Detalhes da categoria

AGENTES  
GET    /agents               \- Lista todos os agentes  
GET    /agents/:slug         \- Detalhes do agente  
GET    /categories/:slug/agents \- Agentes de uma categoria

EXECUÇÕES  
POST   /execute/:agentSlug   \- Executa um agente  
GET    /executions           \- Histórico de execuções  
GET    /executions/:id       \- Detalhes de uma execução  
POST   /executions/:id/rate  \- Avalia uma execução

TEMPLATES  
GET    /templates            \- Lista templates do usuário  
POST   /templates            \- Salva novo template  
PUT    /templates/:id        \- Atualiza template  
DELETE /templates/:id        \- Remove template

EXPORTAÇÃO  
POST   /export/pdf           \- Exporta para PDF  
POST   /export/docx          \- Exporta para Word

ADMIN (apenas admins)  
GET    /admin/analytics      \- Dashboard de uso  
GET    /admin/prompts        \- Gerenciar prompts  
PUT    /admin/prompts/:id    \- Atualizar prompt

### **5.4 Fluxo de Execução de Agente (Detalhado)**

// Endpoint: POST /api/v1/execute/:agentSlug

async function executeAgent(agentSlug, inputs, userId, companyId) {  
    
  // 1\. VALIDAÇÃO  
  const agent \= await getAgentBySlug(agentSlug);  
  if (\!agent || \!agent.is\_active) {  
    throw new Error('Agente não encontrado ou inativo');  
  }  
    
  const validatedInputs \= validateInputs(inputs, agent.input\_schema);  
    
  // 2\. CONSTRUÇÃO DO PROMPT  
  let promptTemplate \= agent.prompt\_template;  
    
  // Verifica se empresa tem prompt customizado  
  const customPrompt \= await getCompanyPrompt(companyId, agent.id);  
  if (customPrompt?.custom\_prompt) {  
    promptTemplate \= customPrompt.custom\_prompt;  
  }  
    
  // Substitui variáveis  
  let finalPrompt \= promptTemplate;  
  for (const \[key, value\] of Object.entries(validatedInputs)) {  
    finalPrompt \= finalPrompt.replace(new RegExp(\`{{${key}}}\`, 'g'), value);  
  }  
    
  // Adiciona contexto da empresa se houver  
  if (customPrompt?.additional\_context) {  
    finalPrompt \+= \`\\n\\nContexto adicional da empresa:\\n${customPrompt.additional\_context}\`;  
  }  
    
  // 3\. CHAMADA À API DE IA  
  const startTime \= Date.now();  
    
  const aiResponse \= await callOpenAI({  
    model: 'gpt-4-turbo',  
    messages: \[  
      { role: 'system', content: 'Você é um especialista em RH...' },  
      { role: 'user', content: finalPrompt }  
    \],  
    temperature: 0.7,  
    max\_tokens: 4000  
  });  
    
  const executionTime \= Date.now() \- startTime;  
    
  // 4\. PROCESSAMENTO DO RESULTADO  
  const output \= aiResponse.choices\[0\].message.content;  
  const tokensUsed \= aiResponse.usage.total\_tokens;  
    
  // 5\. PERSISTÊNCIA  
  const execution \= await saveExecution({  
    user\_id: userId,  
    company\_id: companyId,  
    agent\_id: agent.id,  
    inputs: validatedInputs,  
    prompt\_sent: finalPrompt,  
    output: output,  
    tokens\_used: tokensUsed,  
    execution\_time\_ms: executionTime  
  });  
    
  // 6\. RETORNO  
  return {  
    id: execution.id,  
    output: output,  
    formatted\_output: formatOutput(output), // markdown → HTML  
    execution\_time: executionTime,  
    tokens\_used: tokensUsed,  
    created\_at: execution.created\_at  
  };  
}

### **5.5 Schema de Input de Agente (Exemplo)**

{  
  "agent\_slug": "criador-descricao-vagas",  
  "input\_schema": {  
    "fields": \[  
      {  
        "name": "titulo\_vaga",  
        "label": "Título da Vaga",  
        "type": "text",  
        "required": true,  
        "placeholder": "Ex: Analista de Marketing Digital Sênior",  
        "maxLength": 100  
      },  
      {  
        "name": "departamento",  
        "label": "Departamento",  
        "type": "select",  
        "required": true,  
        "options": \[  
          { "value": "marketing", "label": "Marketing" },  
          { "value": "vendas", "label": "Vendas" },  
          { "value": "ti", "label": "Tecnologia" },  
          { "value": "rh", "label": "Recursos Humanos" },  
          { "value": "financeiro", "label": "Financeiro" },  
          { "value": "operacoes", "label": "Operações" },  
          { "value": "outro", "label": "Outro" }  
        \]  
      },  
      {  
        "name": "modelo\_trabalho",  
        "label": "Modelo de Trabalho",  
        "type": "select",  
        "required": true,  
        "options": \[  
          { "value": "presencial", "label": "Presencial" },  
          { "value": "hibrido", "label": "Híbrido" },  
          { "value": "remoto", "label": "Remoto" }  
        \]  
      },  
      {  
        "name": "responsabilidades",  
        "label": "Principais Responsabilidades",  
        "type": "textarea",  
        "required": true,  
        "placeholder": "Liste as 5-8 principais atividades do cargo...",  
        "rows": 6,  
        "helperText": "Descreva as principais atividades que o profissional irá desempenhar"  
      },  
      {  
        "name": "requisitos\_obrigatorios",  
        "label": "Requisitos Obrigatórios",  
        "type": "textarea",  
        "required": true,  
        "placeholder": "Formação, experiência mínima, habilidades técnicas...",  
        "rows": 5  
      },  
      {  
        "name": "beneficios",  
        "label": "Benefícios Oferecidos",  
        "type": "textarea",  
        "required": true,  
        "placeholder": "Liste todos os benefícios: VR, VT, plano de saúde...",  
        "rows": 4  
      },  
      {  
        "name": "faixa\_salarial",  
        "label": "Faixa Salarial",  
        "type": "text",  
        "required": false,  
        "placeholder": "Ex: R$ 5.000 \- R$ 7.000 ou 'A combinar'"  
      }  
    \]  
  }  
}

---

## **6\. INTERFACE DO USUÁRIO**

### **6.1 Telas Principais**

#### **Tela 1: Dashboard**

┌─────────────────────────────────────────────────────────────────┐  
│  \[Logo\] HR Automation Suite                    \[🔔\] \[👤 João\]   │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                 │  
│  Olá, João\! 👋                                                  │  
│                                                                 │  
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │  
│  │ 📊 47       │ │ ⏱️ 23h      │ │ 📈 94%      │               │  
│  │ Execuções   │ │ Economizadas│ │ Satisfação  │               │  
│  │ este mês    │ │ este mês    │ │ média       │               │  
│  └─────────────┘ └─────────────┘ └─────────────┘               │  
│                                                                 │  
│  ⚡ ACESSO RÁPIDO                                               │  
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │  
│  │📝 Vaga │ │📋 CV   │ │📊 PDI  │ │💬 Feed │                   │  
│  └────────┘ └────────┘ └────────┘ └────────┘                   │  
│                                                                 │  
│  📂 CATEGORIAS                                                  │  
│  ┌───────────────────────────────────────────────────────┐     │  
│  │ 👥 Recrutamento │ 🚀 Onboarding │ 📚 Treinamento │ ...│     │  
│  └───────────────────────────────────────────────────────┘     │  
│                                                                 │  
│  🕐 HISTÓRICO RECENTE                                          │  
│  ┌───────────────────────────────────────────────────────┐     │  
│  │ • Descrição de vaga \- Analista Marketing \- há 2h      │     │  
│  │ • Feedback candidato \- Maria Silva \- há 5h            │     │  
│  │ • Plano de onboarding \- Carlos Santos \- ontem         │     │  
│  └───────────────────────────────────────────────────────┘     │  
│                                                                 │  
└─────────────────────────────────────────────────────────────────┘

#### **Tela 2: Categoria com Lista de Agentes**

┌─────────────────────────────────────────────────────────────────┐  
│  \[←\] Dashboard    RECRUTAMENTO E SELEÇÃO                        │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                 │  
│  Automatize todo o ciclo de atração e seleção de talentos       │  
│                                                                 │  
│  ┌─────────────────────────────────────────────────────────┐   │  
│  │ 📝 Criador de Descrições de Vagas                       │   │  
│  │ Gera descrições completas e atrativas para suas vagas   │   │  
│  │ ⏱️ Economia: \~90% do tempo │ ⭐ 4.8/5 (234 usos)        │   │  
│  │                                           \[USAR AGENTE\] │   │  
│  └─────────────────────────────────────────────────────────┘   │  
│                                                                 │  
│  ┌─────────────────────────────────────────────────────────┐   │  
│  │ 📋 Analisador de Currículos                             │   │  
│  │ Analisa CVs e gera relatório de fit com a vaga          │   │  
│  │ ⏱️ Economia: \~95% do tempo │ ⭐ 4.7/5 (189 usos)        │   │  
│  │                                           \[USAR AGENTE\] │   │  
│  └─────────────────────────────────────────────────────────┘   │  
│                                                                 │  
│  ┌─────────────────────────────────────────────────────────┐   │  
│  │ 🎤 Gerador de Perguntas de Entrevista                   │   │  
│  │ Cria roteiros completos de entrevista por competências  │   │  
│  │ ⏱️ Economia: \~90% do tempo │ ⭐ 4.9/5 (312 usos)        │   │  
│  │                                           \[USAR AGENTE\] │   │  
│  └─────────────────────────────────────────────────────────┘   │  
│                                                                 │  
│  \[... mais agentes ...\]                                         │  
│                                                                 │  
└─────────────────────────────────────────────────────────────────┘

#### **Tela 3: Execução de Agente**

┌─────────────────────────────────────────────────────────────────┐  
│  \[←\] Recrutamento    CRIADOR DE DESCRIÇÕES DE VAGAS             │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                 │  
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │  
│  │ 📝 PREENCHA OS DADOS    │  │ 📄 RESULTADO                │  │  
│  │                         │  │                             │  │  
│  │ Título da Vaga \*        │  │ \[Área vazia ou com          │  │  
│  │ ┌─────────────────────┐ │  │  resultado da última        │  │  
│  │ │                     │ │  │  execução\]                  │  │  
│  │ └─────────────────────┘ │  │                             │  │  
│  │                         │  │                             │  │  
│  │ Departamento \*          │  │                             │  │  
│  │ ┌─────────────────────┐ │  │                             │  │  
│  │ │ Selecione...      ▼ │ │  │                             │  │  
│  │ └─────────────────────┘ │  │                             │  │  
│  │                         │  │                             │  │  
│  │ Modelo de Trabalho \*    │  │                             │  │  
│  │ ○ Presencial            │  │                             │  │  
│  │ ○ Híbrido               │  │                             │  │  
│  │ ○ Remoto                │  │                             │  │  
│  │                         │  │                             │  │  
│  │ Responsabilidades \*     │  │                             │  │  
│  │ ┌─────────────────────┐ │  │                             │  │  
│  │ │                     │ │  │                             │  │  
│  │ │                     │ │  │                             │  │  
│  │ └─────────────────────┘ │  │                             │  │  
│  │                         │  │                             │  │  
│  │ \[... mais campos ...\]   │  │ ┌─────────────────────────┐ │  │  
│  │                         │  │ │ \[📋 Copiar\] \[📥 PDF\]   │ │  │  
│  │ \[🚀 GERAR DESCRIÇÃO\]    │  │ │ \[📝 Word\] \[🔄 Regenerar\]│ │  │  
│  │                         │  │ └─────────────────────────┘ │  │  
│  └─────────────────────────┘  └─────────────────────────────┘  │  
│                                                                 │  
└─────────────────────────────────────────────────────────────────┘

#### **Tela 4: Resultado com Output**

┌─────────────────────────────────────────────────────────────────┐  
│  \[←\] Recrutamento    CRIADOR DE DESCRIÇÕES DE VAGAS             │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                 │  
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │  
│  │ 📝 DADOS PREENCHIDOS    │  │ 📄 RESULTADO               ✓│  │  
│  │                         │  │                             │  │  
│  │ ✓ Analista de Marketing │  │ ══════════════════════════  │  │  
│  │ ✓ Marketing             │  │ ANALISTA DE MARKETING       │  │  
│  │ ✓ Híbrido               │  │ DIGITAL SÊNIOR \- HÍBRIDO    │  │  
│  │ ✓ 5 responsabilidades   │  │ ══════════════════════════  │  │  
│  │ ✓ 6 requisitos          │  │                             │  │  
│  │ ✓ 8 benefícios          │  │ 🏢 SOBRE A EMPRESA          │  │  
│  │                         │  │ Somos uma empresa líder...  │  │  
│  │                         │  │                             │  │  
│  │ ─────────────────────── │  │ 🎯 SOBRE A OPORTUNIDADE     │  │  
│  │                         │  │ Buscamos um profissional... │  │  
│  │ ⏱️ Gerado em 4.2s       │  │                             │  │  
│  │ 📊 1,247 tokens         │  │ 📋 RESPONSABILIDADES        │  │  
│  │                         │  │ • Desenvolver estratégias   │  │  
│  │                         │  │ • Gerenciar campanhas...    │  │  
│  │ ─────────────────────── │  │                             │  │  
│  │                         │  │ \[... continua ...\]          │  │  
│  │ Como foi o resultado?   │  │                             │  │  
│  │ ⭐⭐⭐⭐⭐               │  │ ┌─────────────────────────┐ │  │  
│  │                         │  │ │ \[📋 Copiar\] \[📥 PDF\]   │ │  │  
│  │ \[💾 Salvar template\]    │  │ │ \[📝 Word\] \[🔄 Regenerar\]│ │  │  
│  │ \[🔄 Nova execução\]      │  │ └─────────────────────────┘ │  │  
│  └─────────────────────────┘  └─────────────────────────────┘  │  
│                                                                 │  
└─────────────────────────────────────────────────────────────────┘

---

## **7\. MODELO DE NEGÓCIO E PRECIFICAÇÃO**

### **7.1 Planos Sugeridos**

| Aspecto | Starter | Professional | Enterprise |
| ----- | ----- | ----- | ----- |
| **Preço** | R$ 197/mês | R$ 497/mês | Customizado |
| **Usuários** | 2 | 10 | Ilimitados |
| **Execuções/mês** | 100 | 500 | Ilimitadas |
| **Categorias** | 4 básicas | Todas | Todas \+ custom |
| **Histórico** | 30 dias | 1 ano | Ilimitado |
| **Suporte** | E-mail | Chat \+ E-mail | Dedicado |
| **Customização** | Não | Básica | Completa |
| **API** | Não | Não | Sim |
| **SSO** | Não | Não | Sim |

### **7.2 Métricas de Sucesso**

**KPIs do Produto:**

* Execuções por usuário/mês  
* Taxa de conclusão de formulários  
* NPS das execuções (rating)  
* Tempo economizado (calculado)  
* Retenção mensal (churn)

**KPIs de Negócio:**

* MRR (Monthly Recurring Revenue)  
* CAC (Customer Acquisition Cost)  
* LTV (Lifetime Value)  
* Churn rate  
* Expansão de planos

---

## **8\. ROADMAP DE DESENVOLVIMENTO**

### **Fase 1: MVP (8-12 semanas)**

* \[ \] Autenticação básica  
* \[ \] 8 agentes core (2 por categoria principal)  
* \[ \] Interface de execução  
* \[ \] Exportação PDF/Copiar  
* \[ \] Histórico básico

### **Fase 2: Crescimento (12-16 semanas)**

* \[ \] Todos os 34 agentes  
* \[ \] Templates salvos  
* \[ \] Customização de prompts por empresa  
* \[ \] Analytics básico  
* \[ \] Exportação Word

### **Fase 3: Escala (16-24 semanas)**

* \[ \] Integrações (ATS, HRIS)  
* \[ \] API pública  
* \[ \] SSO enterprise  
* \[ \] Analytics avançado  
* \[ \] Agentes customizados

### **Fase 4: Expansão (24+ semanas)**

* \[ \] Mobile app  
* \[ \] Workflow automation  
* \[ \] AI suggestions  
* \[ \] Marketplace de agentes  
* \[ \] White-label

---

## **9\. CONSIDERAÇÕES FINAIS**

### **9.1 Diferenciais Competitivos**

1. **Especialização em RH:** Diferente de ferramentas genéricas de IA, este sistema é 100% focado em tarefas de RH com prompts especializados.

2. **Agentes calibrados:** Cada prompt foi desenvolvido especificamente para gerar outputs profissionais de RH, não respostas genéricas.

3. **Estrutura de outputs:** Os resultados seguem templates profissionais usados no mercado, não texto corrido sem formatação.

4. **Customização por empresa:** Permite que cada empresa adapte os prompts à sua cultura, tom de voz e processos.

5. **Multi-tenant desde o início:** Arquitetura preparada para escalar com múltiplas empresas.

### **9.2 Riscos e Mitigações**

| Risco | Probabilidade | Impacto | Mitigação |
| ----- | ----- | ----- | ----- |
| Outputs de baixa qualidade | Média | Alto | Testes extensivos, ratings, iteração |
| Custos de API elevados | Alta | Médio | Cache, otimização de tokens, planos |
| Concorrência | Alta | Médio | Especialização, UX superior |
| Resistência à adoção | Média | Alto | Onboarding, demonstração de valor |
| Questões legais (contratos) | Baixa | Alto | Disclaimers, revisão por advogados |

### **9.3 Próximos Passos**

1. **Validar MVP:** Construir versão mínima com 8 agentes e testar com 10-20 profissionais de RH  
2. **Iterar prompts:** Refinar outputs baseado em feedback real  
3. **Definir precificação:** Testar diferentes modelos e preços  
4. **Escalar desenvolvimento:** Adicionar agentes e funcionalidades  
5. **Go-to-market:** Lançamento oficial com estratégia de aquisição

---

**Este documento serve como especificação completa para o desenvolvimento do HR Automation Suite. Qualquer dúvida ou necessidade de detalhamento adicional, a equipe de produto está disponível para esclarecimentos.**

