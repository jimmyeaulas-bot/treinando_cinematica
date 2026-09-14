// =========================================================================
// CADERNO DE CINEMÁTICA – PROF. ANDRÉ (V8.1 – CORREÇÃO DE TEMPO EM SALA)
// =========================================================================
// • Migração automática V7/V5 → V8
// • Equações corrigidas (6 fórmulas, \frac)
// • Cronômetro digital oculto (só barra verde)
// • Cores de fundo por dificuldade
// • Sistema de zoom auto-ocultável
// • Sorteio com preview e seed reprodutível (864 combinações)
// • NTP obrigatório (modo sala)
// • Horários de aula com penalidades proporcionais
// • Fechamento automático 3 min antes do sinal
// • Modos Simulado × Sala de Aula
// • Transições sem alert()
// • [V8.1] Timestamp absoluto de fechamento (não mais offset relativo)
// • [V8.1] Revalidação do tempo no momento da confirmação do preview
// • [V8.1] Teste de sanidade: soma das etapas ≤ tempo real restante
// • [V8.1] Painel de diretrizes ao professor no preview do sorteio
// =========================================================================

// ===== 1. ÍCONE SVG DA MEDALHA DE MADEIRA =====
const SVG_MEDALHA_MADEIRA = `<svg viewBox="0 0 36 36" width="38" height="38" style="display:inline-block; vertical-align:middle;"><circle cx="18" cy="18" r="16" fill="#8B5A2B" stroke="#5C3A21" stroke-width="2"/><circle cx="18" cy="18" r="12" fill="#A0522D" stroke="#D2B48C" stroke-width="1.5" stroke-dasharray="3,2"/><path d="M12 18h12M14 14h8M14 22h8" stroke="#F5DEB3" stroke-width="2" stroke-linecap="round"/></svg>`;

const EMBLEMAS = [
  { id: 1, nome: "Medalha de Madeira", icone: SVG_MEDALHA_MADEIRA, kitsNecessarios: 1, mensagem: "Primeiro kit finalizado! As sinapses de decodificação de variáveis estão ativas." },
  { id: 2, nome: "Medalha de Ferro", icone: "⛓️", kitsNecessarios: 2, mensagem: "Dois kits dominados! A extração de dados e conversão de unidades tornam-se rotineiras." },
  { id: 3, nome: "Medalha de Bronze", icone: "🥉", kitsNecessarios: 3, mensagem: "Três kits concluídos! A hesitação diante do enunciado desaparece por completo." },
  { id: 4, nome: "Medalha de Prata", icone: "🥈", kitsNecessarios: 4, mensagem: "Quatro kits vencidos! Retenção acima de 80% das operações algébricas." },
  { id: 5, nome: "Medalha de Ouro", icone: "🥇", kitsNecessarios: 5, mensagem: "Cinco kits! Ritmo e precisão de vestibulando de elite." },
  { id: 6, nome: "Medalha de Diamante", icone: "💎", kitsNecessarios: 6, mensagem: "Maestria Suprema! Todos os 6 kits concluídos. Memória permanente assegurada!" }
];

// ===== 2. EQUAÇÕES CORRIGIDAS (6 fórmulas com \frac) =====
const DATABASE_EQUACOES = [
  { badge: "MRU", concept: "Velocidade Média", katex: "v_m = \\frac{\\Delta S}{\\Delta t}", desc: "Variação de posição pelo tempo sem aceleração." },
  { badge: "MRU", concept: "Posição (Sorvete)", katex: "S = S_0 + v \\cdot t", desc: "Localização final do móvel no MRU." },
  { badge: "MRUV", concept: "Aceleração Média", katex: "a_m = \\frac{\\Delta v}{\\Delta t}", desc: "Taxa com que a velocidade é alterada." },
  { badge: "MRUV", concept: "Velocidade (Vovô Ateu)", katex: "v = v_0 + a \\cdot t", desc: "Velocidade no instante t sob aceleração constante." },
  { badge: "MRUV", concept: "Posição (Sorvetão)", katex: "S = S_0 + v_0 \\cdot t + \\frac{1}{2} \\cdot a \\cdot t^2", desc: "Posição com aceleração conhecida." },
  { badge: "MRUV", concept: "Torricelli (Sem tempo)", katex: "v^2 = v_0^2 + 2 \\cdot a \\cdot \\Delta S", desc: "Relação fundamental quando o tempo não é informado." }
];

// ===== 3. TEMPOS DE AVALIAÇÃO (SIMULADO) =====
const TEMPOS_AVALIACAO = {
  facil: 8 * 60,
  medio: 10 * 60,
  dificil: 12 * 60,
  revisao: 15 * 60
};

// ===== 4. HORÁRIOS DE AULA (MODO SALA) =====
const HORARIOS_AULA = [
  { periodo: 'Manhã', inicio: '07:00', fim: '07:50' },
  { periodo: 'Manhã', inicio: '07:50', fim: '08:40' },
  { periodo: 'Manhã', inicio: '08:40', fim: '09:30' },
  { periodo: 'Manhã', inicio: '09:45', fim: '10:35' },
  { periodo: 'Manhã', inicio: '10:35', fim: '11:25' },
  { periodo: 'Manhã', inicio: '11:25', fim: '12:15' },
  { periodo: 'Manhã', inicio: '12:15', fim: '13:05' },
  { periodo: 'Tarde', inicio: '13:10', fim: '14:00' },
  { periodo: 'Tarde', inicio: '14:00', fim: '14:50' },
  { periodo: 'Tarde', inicio: '14:50', fim: '15:40' },
  { periodo: 'Tarde', inicio: '15:55', fim: '16:45' },
  { periodo: 'Tarde', inicio: '16:45', fim: '17:35' },
  { periodo: 'Tarde', inicio: '17:35', fim: '18:25' },
  { periodo: 'Noite', inicio: '18:30', fim: '19:15' },
  { periodo: 'Noite', inicio: '19:15', fim: '20:00' },
  { periodo: 'Noite', inicio: '20:15', fim: '21:00' },
  { periodo: 'Noite', inicio: '21:00', fim: '21:45' },
  { periodo: 'Noite', inicio: '21:45', fim: '22:30' }
];

const BUFFER_SINAL_SEG = 180; // 3 minutos antes do sinal
const TOTAL_COMBINACOES = 864; // 12 fáceis × 12 médias × 6 difíceis

// ===== 5. MIGRAÇÃO DE DADOS (V7/V5 → V8) =====
const CHAVE_STORAGE = "CINEMATICA_TREINO_PROFA_V8";
const CHAVES_ANTIGAS = [
  "CINEMATICA_TREINO_PROFA_V7",
  "CINEMATICA_TREINO_PROFA_V5"
];

function detectarEMigrarDados() {
  const v8 = localStorage.getItem(CHAVE_STORAGE);
  if (v8) {
    try { return JSON.parse(v8); } catch (e) { console.warn("V8 corrompida."); }
  }
  for (const chave of CHAVES_ANTIGAS) {
    const dadosSalvos = localStorage.getItem(chave);
    if (dadosSalvos) {
      try {
        const antigo = JSON.parse(dadosSalvos);
        const migrado = {
          nomeAluno: antigo.nomeAluno || "",
          acordoAceito: antigo.acordoAceito || false,
          barraRecolhida: antigo.barraRecolhida || false,
          kitAtivo: antigo.kitAtivo || 1,
          respostas: antigo.respostas || {},
          modoProfessor: antigo.modoProfessor || false,
          historico: antigo.historico || [],
          provaLiberada: antigo.provaLiberada || false,
          provaQuestoes: antigo.provaQuestoes || [],
          provaFinalizada: antigo.provaFinalizada || false,
          provaTempo: antigo.provaTempo || 0,
          zoomLevel: 1.5,
          avaliacao: {
            semente: null,
            questoesIds: [],
            etapaAtual: 'pre_prova',
            tempoRestante: 0,
            tempoTotalGasto: 0,
            modoProva: 'simulado'
          }
        };
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(migrado));
        console.log(`✓ Dados migrados de ${chave} para V8`);
        return migrado;
      } catch (e) {
        console.warn(`Erro ao migrar de ${chave}:`, e);
      }
    }
  }
  return null;
}

// ===== 6. ESTADO E PERSISTÊNCIA =====
const ESTADO_PADRAO = {
  nomeAluno: "",
  acordoAceito: false,
  barraRecolhida: false,
  kitAtivo: 1,
  respostas: {},
  modoProfessor: false,
  historico: [],
  provaLiberada: false,
  provaQuestoes: [],
  provaFinalizada: false,
  provaTempo: 0,
  zoomLevel: 1.5,
  avaliacao: {
    semente: null,
    questoesIds: [],
    etapaAtual: 'pre_prova',
    tempoRestante: 0,
    tempoTotalGasto: 0,
    modoProva: 'simulado'
  }
};

let ESTADO = {};

function carregarStorage() {
  const migrado = detectarEMigrarDados();
  if (migrado) {
    ESTADO = { ...ESTADO_PADRAO, ...migrado };
    if (!ESTADO.avaliacao) ESTADO.avaliacao = { ...ESTADO_PADRAO.avaliacao };
    if (!ESTADO.avaliacao.modoProva) ESTADO.avaliacao.modoProva = 'simulado';
    if (ESTADO.zoomLevel === undefined) ESTADO.zoomLevel = 1.5;
  } else {
    ESTADO = JSON.parse(JSON.stringify(ESTADO_PADRAO));
  }
  return ESTADO;
}

function salvarStorage() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(ESTADO));
  } catch (e) {
    console.error("Erro ao salvar LocalStorage:", e);
  }
}

// ===== 7. BANCO DE KITS (IDÊNTICO À V7) =====
const kit1 = [
  {
    id: "K1_Q1", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um ciclista trafega em linha reta com velocidade escalar constante de $8\\text{ m/s}$. Sabendo que ele partiu da posição $S_0 = 35\\text{ m}$, qual será a sua posição após $10\\text{ segundos}$?",
    dica1: "Identifique quem é o ponto de partida ($S_0 = 35\\text{ m}$), a velocidade constante ($v = 8\\text{ m/s}$) e o tempo ($t = 10\\text{ s}$).",
    dica2: "A velocidade é uniforme (sem aceleração). Aplique a função horária do MRU: $S = S_0 + v \\cdot t$.",
    dica3: "Multiplique $8 \\times 10 = 80$ e some com $35$ para obter o valor exato.",
    gabarito: {
      fase1: ["$v = 8\\text{ m/s}$", "$S_0 = 35\\text{ m}$", "$t = 10\\text{ s}$", "Incógnita: $S$"],
      fase2: "Função Horária do MRU: $S = S_0 + v \\cdot t$",
      fase3: ["$S = 35 + 8 \\cdot 10$", "$S = 35 + 80$", "$\\mathbf{S = 115\\text{ m}}$"]
    }
  },
  {
    id: "K1_Q2", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um veículo com velocidade de $14\\text{ m/s}$ acelera a uma taxa constante de $3\\text{ m/s}^2$ durante $7\\text{ segundos}$. Qual a velocidade final atingida pelo veículo?",
    dica1: "Separe os dados: $v_0 = 14\\text{ m/s}$, taxa de aceleração $a = 3\\text{ m/s}^2$ e tempo decorrido $t = 7\\text{ s}$.",
    dica2: "Trata-se de MRUV com aceleração constante: use a função horária da velocidade $v = v_0 + a \\cdot t$.",
    dica3: "Calcule a parcela do ganho de velocidade ($3 \\times 7 = 21$) e adicione aos $14$ iniciais.",
    gabarito: {
      fase1: ["$v_0 = 14\\text{ m/s}$", "$a = 3\\text{ m/s}^2$", "$t = 7\\text{ s}$", "Incógnita: $v$"],
      fase2: "Função da Velocidade: $v = v_0 + a \\cdot t$",
      fase3: ["$v = 14 + 3 \\cdot 7$", "$v = 14 + 21$", "$\\mathbf{v = 35\\text{ m/s}}$"]
    }
  },
  {
    id: "K1_Q3", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um trem de passageiros mantém velocidade escalar constante de $22\\text{ m/s}$. Qual a distância total percorrida pelo trem, em metros, durante uma viagem de $5\\text{ minutos}$?",
    dica1: "Atenção à unidade: converta $5\\text{ minutos}$ para segundos ($5 \\times 60 = 300\\text{ s}$) e anote $v = 22\\text{ m/s}$.",
    dica2: "Velocidade constante sem aceleração: use a definição de velocidade média $\\Delta S = v \\cdot \\Delta t$.",
    dica3: "Multiplique $22 \\times 300$. Dica mental: $22 \\times 3 = 66$, depois acrescente os dois zeros.",
    gabarito: {
      fase1: ["$v = 22\\text{ m/s}$", "$\\Delta t = 5\\text{ min} = 300\\text{ s}$", "Incógnita: $\\Delta S$"],
      fase2: "Equação: $\\Delta S = v \\cdot \\Delta t$",
      fase3: ["$\\Delta S = 22 \\cdot 300$", "$\\mathbf{\\Delta S = 6.600\\text{ m}}$"]
    }
  },
  {
    id: "K1_Q4", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um atleta em arrancada parte do repouso e mantém aceleração constante de $4\\text{ m/s}^2$ até atingir a distância de $32\\text{ metros}$. Qual a velocidade atingida ao final desse percurso?",
    dica1: "'Parte do repouso' significa $v_0 = 0$. Temos $a = 4\\text{ m/s}^2$ e deslocamento $\\Delta S = 32\\text{ m}$.",
    dica2: "Como o enunciado não informa nem pede o tempo decorrido, use a Equação de Torricelli: $v^2 = v_0^2 + 2 \\cdot a \\cdot \\Delta S$.",
    dica3: "$v^2 = 0 + 2 \\cdot 4 \\cdot 32 = 256$. Tire a raiz quadrada de 256.",
    gabarito: {
      fase1: ["$v_0 = 0$", "$a = 4\\text{ m/s}^2$", "$\\Delta S = 32\\text{ m}$", "Incógnita: $v$"],
      fase2: "Equação de Torricelli: $v^2 = v_0^2 + 2 \\cdot a \\cdot \\Delta S$",
      fase3: ["$v^2 = 0 + 2 \\cdot 4 \\cdot 32 = 256$", "$v = \\sqrt{256}$", "$\\mathbf{v = 16\\text{ m/s}}$"]
    }
  },
  {
    id: "K1_Q5", tipo: "dificil", nivelTexto: "Difícil (1D)",
    enunciado: "Dois automóveis, A e B, movem-se na mesma rodovia no mesmo sentido com velocidades constantes. No instante $t = 0$, o automóvel A está na posição $S_A = 60\\text{ m}$ com velocidade de $24\\text{ m/s}$, enquanto o automóvel B está na posição $S_B = 180\\text{ m}$ com velocidade de $16\\text{ m/s}$. Em que instante $t$ e em qual posição $S$ o automóvel A alcançará o automóvel B?",
    dica1: "Extraia as funções de posição: $S_A = 60 + 24t$ e $S_B = 180 + 16t$. O encontro ocorre quando $S_A = S_B$.",
    dica2: "Iguale as duas funções horárias: $60 + 24t = 180 + 16t$.",
    dica3: "Agrupe os termos em $t$: $24t - 16t = 180 - 60 \\implies 8t = 120$. Depois substitua o tempo achado em qualquer uma das equações.",
    gabarito: {
      fase1: ["$S_A = 60 + 24t$", "$S_B = 180 + 16t$", "Condição: $S_A = S_B$"],
      fase2: "Igualdade: $60 + 24t = 180 + 16t$",
      fase3: ["$8t = 120 \\implies \\mathbf{t = 15\\text{ s}}$", "$S = 60 + 24(15) \\implies \\mathbf{S = 420\\text{ m}}$"]
    }
  }
];

const kit2 = [
  {
    id: "K2_Q1", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um corredor percorre uma pista retilínea a uma velocidade constante de $6\\text{ m/s}$. Sabendo que ele partiu da origem ($S_0 = 0$), quanto tempo ele levará para atingir a marca de $168\\text{ metros}$?",
    dica1: "Identifique: deslocamento $\\Delta S = 168\\text{ m}$ e velocidade constante $v = 6\\text{ m/s}$.",
    dica2: "Isole o tempo na relação do MRU: $\\Delta t = \\frac{\\Delta S}{v}$.",
    dica3: "Divida 168 por 6.",
    gabarito: {
      fase1: ["$S_0 = 0$", "$S = 168\\text{ m}$", "$v = 6\\text{ m/s}$"],
      fase2: "Equação: $\\Delta t = \\frac{\\Delta S}{v}$",
      fase3: ["$\\Delta t = \\frac{168}{6}$", "$\\mathbf{\\Delta t = 28\\text{ s}}$"]
    }
  },
  {
    id: "K2_Q2", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um móvel parte do repouso com aceleração constante de $6\\text{ m/s}^2$. Qual o deslocamento escalar realizado por esse corpo nos primeiros $4\\text{ segundos}$ de movimento?",
    dica1: "Dados: parte do repouso ($v_0 = 0$), aceleração $a = 6\\text{ m/s}^2$ e tempo $t = 4\\text{ s}$.",
    dica2: "Aplique a função do deslocamento (Sorvetão): $\\Delta S = v_0 t + \\frac{1}{2} a t^2$.",
    dica3: "Como $v_0 = 0$, calcule apenas $\\frac{1}{2} \\cdot 6 \\cdot 4^2 = 3 \\times 16$.",
    gabarito: {
      fase1: ["$v_0 = 0$", "$a = 6\\text{ m/s}^2$", "$t = 4\\text{ s}$"],
      fase2: "Função: $\\Delta S = \\frac{1}{2} a t^2$",
      fase3: ["$\\Delta S = \\frac{1}{2} \\cdot 6 \\cdot 16$", "$\\mathbf{\\Delta S = 48\\text{ m}}$"]
    }
  },
  {
    id: "K2_Q3", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um caminhão trafega a uma velocidade constante de $108\\text{ km/h}$. Quantos metros ele percorrerá durante um intervalo de tempo de $12\\text{ segundos}$?",
    dica1: "Converta a velocidade para m/s dividindo por 3,6: $108 / 3{,}6 = 30\\text{ m/s}$. O tempo é $12\\text{ s}$.",
    dica2: "No MRU: $\\Delta S = v \\cdot \\Delta t$.",
    dica3: "Multiplique $30 \\times 12$.",
    gabarito: {
      fase1: ["$v = 108\\text{ km/h} = 30\\text{ m/s}$", "$\\Delta t = 12\\text{ s}$"],
      fase2: "Equação: $\\Delta S = v \\cdot \\Delta t$",
      fase3: ["$\\Delta S = 30 \\cdot 12$", "$\\mathbf{\\Delta S = 360\\text{ m}}$"]
    }
  },
  {
    id: "K2_Q4", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um carro se desloca a $24\\text{ m/s}$ quando o motorista avista um obstáculo e aciona os freios, sofrendo desaceleração constante de $4\\text{ m/s}^2$ até parar completamente. Qual foi a distância percorrida durante a frenagem?",
    dica1: "Velocidade inicial $v_0 = 24\\text{ m/s}$, parada final $v = 0$, aceleração de frenagem $a = -4\\text{ m/s}^2$.",
    dica2: "Sem tempo fornecido: use Torricelli $v^2 = v_0^2 + 2 \\cdot a \\cdot \\Delta S$.",
    dica3: "$0 = 24^2 + 2(-4)\\Delta S \\implies 8\\Delta S = 576$. Divida 576 por 8.",
    gabarito: {
      fase1: ["$v_0 = 24\\text{ m/s}$", "$v = 0$", "$a = -4\\text{ m/s}^2$"],
      fase2: "Torricelli: $v^2 = v_0^2 + 2 a \\Delta S$",
      fase3: ["$0 = 576 - 8\\Delta S \\implies 8\\Delta S = 576$", "$\\mathbf{\\Delta S = 72\\text{ m}}$"]
    }
  },
  {
    id: "K2_Q5", tipo: "dificil", nivelTexto: "Difícil (1D)",
    enunciado: "Dois blocos sobre um trilho retilíneo movem-se um ao encontro do outro. No instante $t = 0$, o bloco 1 parte de $S_1 = 40\\text{ m}$ com velocidade de $+12\\text{ m/s}$, e o bloco 2 parte de $S_2 = 250\\text{ m}$ com velocidade de $18\\text{ m/s}$ em sentido oposto ($-18\\text{ m/s}$). Em qual instante e posição ocorre a colisão?",
    dica1: "Sentidos opostos: monte $S_1 = 40 + 12t$ e $S_2 = 250 - 18t$.",
    dica2: "Condição de colisão: iguale as posições $S_1 = S_2$.",
    dica3: "$40 + 12t = 250 - 18t \\implies 30t = 210$. Encontre $t$ e calcule a posição.",
    gabarito: {
      fase1: ["$S_1 = 40 + 12t$", "$S_2 = 250 - 18t$"],
      fase2: "Igualdade: $S_1 = S_2$",
      fase3: ["$30t = 210 \\implies \\mathbf{t = 7\\text{ s}}$", "$S = 40 + 12(7) \\implies \\mathbf{S = 124\\text{ m}}$"]
    }
  }
];

const kit3 = [
  {
    id: "K3_Q1", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Uma partícula tem sua velocidade alterada de $5\\text{ m/s}$ para $29\\text{ m/s}$ de forma constante em um período de $8\\text{ segundos}$. Determine a aceleração escalar média da partícula.",
    dica1: "Calcule a variação da velocidade: $\\Delta v = 29 - 5 = 24\\text{ m/s}$ e anote $\\Delta t = 8\\text{ s}$.",
    dica2: "Definição de aceleração média: $a_m = \\frac{\\Delta v}{\\Delta t}$.",
    dica3: "Divida 24 por 8.",
    gabarito: {
      fase1: ["$v_0 = 5\\text{ m/s}$", "$v = 29\\text{ m/s}$", "$\\Delta t = 8\\text{ s}$"],
      fase2: "Aceleração: $a_m = \\frac{\\Delta v}{\\Delta t}$",
      fase3: ["$a_m = \\frac{24}{8}$", "$\\mathbf{a_m = 3\\text{ m/s}^2}$"]
    }
  },
  {
    id: "K3_Q2", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um barco a motor navega em águas calmas a uma velocidade constante de $7\\text{ m/s}$. Partindo da posição $S_0 = 15\\text{ m}$, em qual instante de tempo ele atingirá a posição $S = 99\\text{ m}$?",
    dica1: "Posição inicial $S_0 = 15\\text{ m}$, final $S = 99\\text{ m}$ e velocidade $v = 7\\text{ m/s}$.",
    dica2: "Função horária da posição: $S = S_0 + v \\cdot t$.",
    dica3: "$99 = 15 + 7t \\implies 7t = 84$. Divida 84 por 7.",
    gabarito: {
      fase1: ["$S_0 = 15\\text{ m}$", "$S = 99\\text{ m}$", "$v = 7\\text{ m/s}$"],
      fase2: "Função Horária: $S = S_0 + v \\cdot t$",
      fase3: ["$7t = 84 \\implies t = \\frac{84}{7}$", "$\\mathbf{t = 12\\text{ s}}$"]
    }
  },
  {
    id: "K3_Q3", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um trem acelera uniformemente saindo de uma estação com velocidade de $18\\text{ km/h}$ até atingir $90\\text{ km/h}$. Qual a velocidade média do trem durante essa aceleração, em m/s?",
    dica1: "Converta ambas para m/s dividindo por 3,6: $18 / 3{,}6 = 5\\text{ m/s}$ e $90 / 3{,}6 = 25\\text{ m/s}$.",
    dica2: "No MUV, a velocidade média é a média aritmética dos extremos: $v_m = \\frac{v_0 + v}{2}$.",
    dica3: "Some 5 com 25 e divida por 2.",
    gabarito: {
      fase1: ["$v_0 = 5\\text{ m/s}$", "$v = 25\\text{ m/s}$"],
      fase2: "Velocidade Média no MUV: $v_m = \\frac{v_0 + v}{2}$",
      fase3: ["$v_m = \\frac{5 + 25}{2} = \\frac{30}{2}$", "$\\mathbf{v_m = 15\\text{ m/s}}$"]
    }
  },
  {
    id: "K3_Q4", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um carro trafega a $72\\text{ km/h}$ quando o sinal fecha. O condutor freia uniformemente com desaceleração de $5\\text{ m/s}^2$. Quantos segundos o veículo levará até parar completamente?",
    dica1: "$72\\text{ km/h} = 20\\text{ m/s}$. Ao parar: $v = 0$. Aceleração: $a = -5\\text{ m/s}^2$.",
    dica2: "Função horária da velocidade: $v = v_0 + a \\cdot t$.",
    dica3: "$0 = 20 - 5t \\implies 5t = 20$. Divida 20 por 5.",
    gabarito: {
      fase1: ["$v_0 = 20\\text{ m/s}$", "$v = 0$", "$a = -5\\text{ m/s}^2$"],
      fase2: "Função: $v = v_0 + a \\cdot t$",
      fase3: ["$5t = 20$", "$\\mathbf{t = 4\\text{ s}}$"]
    }
  },
  {
    id: "K3_Q5", tipo: "dificil", nivelTexto: "Difícil (1D)",
    enunciado: "Em uma pista reta, o carro Alfa parte de $S_A = 100\\text{ m}$ com velocidade constante de $28\\text{ m/s}$. À sua frente, o carro Beta parte de $S_B = 220\\text{ m}$ com velocidade de $16\\text{ m/s}$ no mesmo sentido. Determine em que instante de tempo e em qual posição o carro Alfa alcançará o carro Beta.",
    dica1: "Construa as posições: $S_A = 100 + 28t$ e $S_B = 220 + 16t$.",
    dica2: "Iguale as posições no encontro: $S_A = S_B$.",
    dica3: "$100 + 28t = 220 + 16t \\implies 12t = 120$. Encontre $t$ e a posição $S$.",
    gabarito: {
      fase1: ["$S_A = 100 + 28t$", "$S_B = 220 + 16t$"],
      fase2: "Igualdade: $S_A = S_B$",
      fase3: ["$12t = 120 \\implies \\mathbf{t = 10\\text{ s}}$", "$S = 100 + 28(10) \\implies \\mathbf{S = 380\\text{ m}}$"]
    }
  }
];

const kit4 = [
  {
    id: "K4_Q1", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um drone parte com velocidade de $2\\text{ m/s}$ e acelera a uma taxa constante de $5\\text{ m/s}^2$. Qual será o deslocamento total realizado pelo drone após $4\\text{ segundos}$ de voo?",
    dica1: "Dados: $v_0 = 2\\text{ m/s}$, $a = 5\\text{ m/s}^2$ e $t = 4\\text{ s}$.",
    dica2: "Função horária do deslocamento: $\\Delta S = v_0 t + \\frac{1}{2} a t^2$.",
    dica3: "$v_0 t = 2(4) = 8$. Parcela acelerada: $\\frac{1}{2}(5)(16) = 40$. Some 8 com 40.",
    gabarito: {
      fase1: ["$v_0 = 2\\text{ m/s}$", "$a = 5\\text{ m/s}^2$", "$t = 4\\text{ s}$"],
      fase2: "Deslocamento: $\\Delta S = v_0 t + \\frac{1}{2} a t^2$",
      fase3: ["$\\Delta S = 8 + 40$", "$\\mathbf{\\Delta S = 48\\text{ m}}$"]
    }
  },
  {
    id: "K4_Q2", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "A função horária da posição de um carrinho elétrico em trajetória retilínea é dada por $S(t) = 45 + 9t$ (unidades no S.I.). Em que instante o carrinho estará na posição $S = 117\\text{ metros}$?",
    dica1: "Identifique a equação $S = 45 + 9t$ e a posição-alvo $S = 117\\text{ m}$.",
    dica2: "Substitua 117 no lugar de $S$: $117 = 45 + 9t$.",
    dica3: "$9t = 117 - 45 = 72$. Divida 72 por 9.",
    gabarito: {
      fase1: ["$S(t) = 45 + 9t$", "$S = 117\\text{ m}$"],
      fase2: "Equação: $117 = 45 + 9t$",
      fase3: ["$9t = 72 \\implies t = \\frac{72}{9}$", "$\\mathbf{t = 8\\text{ s}}$"]
    }
  },
  {
    id: "K4_Q3", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Uma composição metroviária aproxima-se da estação a $54\\text{ km/h}$. Os freios são ativados gerando desaceleração uniforme de módulo $1{,}5\\text{ m/s}^2$ até a parada completa. Determine a distância percorrida pelo metrô desde o início da frenagem até parar.",
    dica1: "Converta: $54\\text{ km/h} = 15\\text{ m/s}$. Parada final: $v = 0$. Aceleração: $a = -1{,}5\\text{ m/s}^2$.",
    dica2: "Sem menção ao tempo: utilize a Equação de Torricelli $v^2 = v_0^2 + 2 a \\Delta S$.",
    dica3: "$0 = 15^2 + 2(-1{,}5)\\Delta S \\implies 3\\Delta S = 225$. Divida 225 por 3.",
    gabarito: {
      fase1: ["$v_0 = 15\\text{ m/s}$", "$v = 0$", "$a = -1{,}5\\text{ m/s}^2$"],
      fase2: "Torricelli: $v^2 = v_0^2 + 2 a \\Delta S$",
      fase3: ["$0 = 225 - 3\\Delta S \\implies 3\\Delta S = 225$", "$\\mathbf{\\Delta S = 75\\text{ m}}$"]
    }
  },
  {
    id: "K4_Q4", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um navio de carga navega a uma velocidade uniforme de $8\\text{ m/s}$. Sabendo que ele viajou durante $15\\text{ minutos}$, qual a distância total percorrida em metros?",
    dica1: "Converta $15\\text{ minutos}$ para segundos ($15 \\times 60 = 900\\text{ s}$) e note que $v = 8\\text{ m/s}$.",
    dica2: "Velocidade constante: $\\Delta S = v \\cdot \\Delta t$.",
    dica3: "Multiplique 8 por 900.",
    gabarito: {
      fase1: ["$v = 8\\text{ m/s}$", "$\\Delta t = 900\\text{ s}$"],
      fase2: "Equação: $\\Delta S = v \\cdot \\Delta t$",
      fase3: ["$\\Delta S = 8 \\cdot 900$", "$\\mathbf{\\Delta S = 7.200\\text{ m}}$"]
    }
  },
  {
    id: "K4_Q5", tipo: "dificil", nivelTexto: "Difícil (1D)",
    enunciado: "Dois ciclistas trafegam em sentidos opostos numa ciclovia retilínea. No instante $t = 0$, o ciclista 1 está em $S_1 = 50\\text{ m}$ com velocidade constante de $+9\\text{ m/s}$ e o ciclista 2 está em $S_2 = 320\\text{ m}$ com velocidade de $6\\text{ m/s}$ em sentido negativo ($-6\\text{ m/s}$). Determine após quantos segundos e em qual posição ocorrerá o cruzamento entre eles.",
    dica1: "Funções de posição: $S_1 = 50 + 9t$ e $S_2 = 320 - 6t$.",
    dica2: "Condição de encontro: $S_1 = S_2$.",
    dica3: "$50 + 9t = 320 - 6t \\implies 15t = 270$. Encontre $t$ e depois a posição.",
    gabarito: {
      fase1: ["$S_1 = 50 + 9t$", "$S_2 = 320 - 6t$"],
      fase2: "Igualdade: $S_1 = S_2$",
      fase3: ["$15t = 270 \\implies \\mathbf{t = 18\\text{ s}}$", "$S = 50 + 9(18) \\implies \\mathbf{S = 212\\text{ m}}$"]
    }
  }
];

const kit5 = [
  {
    id: "K5_Q1", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um móvel executa MRU com posição inicial $S_0 = 80\\text{ m}$ e velocidade constante de $14\\text{ m/s}$. Qual a sua posição após $6\\text{ segundos}$?",
    dica1: "Identifique: $S_0 = 80\\text{ m}$, $v = 14\\text{ m/s}$ e $t = 6\\text{ s}$.",
    dica2: "Função horária do MRU: $S = S_0 + v \\cdot t$.",
    dica3: "$14 \\times 6 = 84$. Some com 80.",
    gabarito: {
      fase1: ["$S_0 = 80\\text{ m}$", "$v = 14\\text{ m/s}$", "$t = 6\\text{ s}$"],
      fase2: "Função: $S = S_0 + v \\cdot t$",
      fase3: ["$S = 80 + 14(6) = 80 + 84$", "$\\mathbf{S = 164\\text{ m}}$"]
    }
  },
  {
    id: "K5_Q2", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um automóvel parte do repouso e, com aceleração escalar constante de $5\\text{ m/s}^2$, acelera durante $7\\text{ segundos}$. Qual a velocidade escalar alcançada ao término desse tempo?",
    dica1: "Dados: parte do repouso ($v_0 = 0$), aceleração $a = 5\\text{ m/s}^2$ e tempo $t = 7\\text{ s}$.",
    dica2: "Função da velocidade: $v = v_0 + a \\cdot t$.",
    dica3: "Como $v_0 = 0$, multiplique diretamente 5 por 7.",
    gabarito: {
      fase1: ["$v_0 = 0$", "$a = 5\\text{ m/s}^2$", "$t = 7\\text{ s}$"],
      fase2: "Função: $v = v_0 + a \\cdot t$",
      fase3: ["$v = 0 + 5(7)$", "$\\mathbf{v = 35\\text{ m/s}}$"]
    }
  },
  {
    id: "K5_Q3", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um avião de caça parte do repouso sobre a pista de um porta-aviões e atinge a velocidade de decolagem de $216\\text{ km/h}$ em um trajeto de $90\\text{ metros}$. Qual a aceleração uniforme transmitida pela catapulta ao caça?",
    dica1: "Converta $216\\text{ km/h}$ para m/s ($216 / 3{,}6 = 60\\text{ m/s}$). $v_0 = 0$ e $\\Delta S = 90\\text{ m}$.",
    dica2: "Sem informação do tempo: utilize a Equação de Torricelli $v^2 = v_0^2 + 2 a \\Delta S$.",
    dica3: "$60^2 = 0 + 2 \\cdot a \\cdot 90 \\implies 3.600 = 180a$. Divida 3.600 por 180.",
    gabarito: {
      fase1: ["$v_0 = 0$", "$v = 60\\text{ m/s}$", "$\\Delta S = 90\\text{ m}$"],
      fase2: "Torricelli: $v^2 = v_0^2 + 2 a \\Delta S$",
      fase3: ["$3.600 = 180 a \\implies a = \\frac{3.600}{180}$", "$\\mathbf{a = 20\\text{ m/s}^2}$"]
    }
  },
  {
    id: "K5_Q4", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Uma esteira transportadora industrial opera com velocidade contínua de $3\\text{ m/s}$. Quantos metros de material ela transporta durante um ciclo de funcionamento de $4\\text{ minutos}$?",
    dica1: "Converta $4\\text{ minutos}$ em segundos ($4 \\times 60 = 240\\text{ s}$). $v = 3\\text{ m/s}$.",
    dica2: "MRU: $\\Delta S = v \\cdot \\Delta t$.",
    dica3: "Multiplique 3 por 240.",
    gabarito: {
      fase1: ["$v = 3\\text{ m/s}$", "$\\Delta t = 240\\text{ s}$"],
      fase2: "Equação: $\\Delta S = v \\cdot \\Delta t$",
      fase3: ["$\\Delta S = 3 \\cdot 240$", "$\\mathbf{\\Delta S = 720\\text{ m}}$"]
    }
  },
  {
    id: "K5_Q5", tipo: "dificil", nivelTexto: "Difícil (1D)",
    enunciado: "Dois atletas treinam na mesma raia retilínea. O corredor A parte de $S_A = 30\\text{ m}$ com velocidade de $11\\text{ m/s}$. Mais adiante, o corredor B parte de $S_B = 110\\text{ m}$ com velocidade de $7\\text{ m/s}$ no mesmo sentido. Em quanto tempo e em qual posição o corredor A alcançará o corredor B?",
    dica1: "Monte $S_A = 30 + 11t$ e $S_B = 110 + 7t$.",
    dica2: "Condição de alcance: $S_A = S_B$.",
    dica3: "$30 + 11t = 110 + 7t \\implies 4t = 80$. Encontre $t$ e calcule a posição.",
    gabarito: {
      fase1: ["$S_A = 30 + 11t$", "$S_B = 110 + 7t$"],
      fase2: "Igualdade: $S_A = S_B$",
      fase3: ["$4t = 80 \\implies \\mathbf{t = 20\\text{ s}}$", "$S = 30 + 11(20) \\implies \\mathbf{S = 250\\text{ m}}$"]
    }
  }
];

const kit6 = [
  {
    id: "K6_Q1", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um veículo com velocidade de $12\\text{ m/s}$ acelera uniformemente a $4\\text{ m/s}^2$ durante $5\\text{ segundos}$. Qual o deslocamento total percorrido pelo veículo nesse intervalo de tempo?",
    dica1: "Dados: $v_0 = 12\\text{ m/s}$, $a = 4\\text{ m/s}^2$ e $t = 5\\text{ s}$.",
    dica2: "Função do deslocamento (Sorvetão): $\\Delta S = v_0 t + \\frac{1}{2} a t^2$.",
    dica3: "$12(5) = 60$ e $\\frac{1}{2}(4)(25) = 50$. Some 60 com 50.",
    gabarito: {
      fase1: ["$v_0 = 12\\text{ m/s}$", "$a = 4\\text{ m/s}^2$", "$t = 5\\text{ s}$"],
      fase2: "Deslocamento: $\\Delta S = v_0 t + \\frac{1}{2} a t^2$",
      fase3: ["$\\Delta S = 60 + 50$", "$\\mathbf{\\Delta S = 110\\text{ m}}$"]
    }
  },
  {
    id: "K6_Q2", tipo: "facil", nivelTexto: "Fácil (2F)",
    enunciado: "Um ciclista viaja em linha reta com velocidade constante de $15\\text{ m/s}$. Quanto tempo ele levará para percorrer uma distância de $450\\text{ metros}$?",
    dica1: "Dados: velocidade $v = 15\\text{ m/s}$ e distância $\\Delta S = 450\\text{ m}$.",
    dica2: "Equação de tempo: $\\Delta t = \\frac{\\Delta S}{v}$.",
    dica3: "Divida 450 por 15.",
    gabarito: {
      fase1: ["$v = 15\\text{ m/s}$", "$\\Delta S = 450\\text{ m}$"],
      fase2: "Equação: $\\Delta t = \\frac{\\Delta S}{v}$",
      fase3: ["$\\Delta t = \\frac{450}{15}$", "$\\mathbf{\\Delta t = 30\\text{ s}}$"]
    }
  },
  {
    id: "K6_Q3", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um automóvel esportivo acelera de $72\\text{ km/h}$ para $144\\text{ km/h}$ em um intervalo de $4\\text{ segundos}$. Qual a sua aceleração escalar média, em m/s²?",
    dica1: "Converta ambas as velocidades dividindo por 3,6: $72 / 3{,}6 = 20\\text{ m/s}$ e $144 / 3{,}6 = 40\\text{ m/s}$.",
    dica2: "Aceleração média: $a_m = \\frac{\\Delta v}{\\Delta t} = \\frac{40 - 20}{4}$.",
    dica3: "Divida 20 por 4.",
    gabarito: {
      fase1: ["$v_0 = 20\\text{ m/s}$", "$v = 40\\text{ m/s}$", "$\\Delta t = 4\\text{ s}$"],
      fase2: "Aceleração: $a_m = \\frac{v - v_0}{\\Delta t}$",
      fase3: ["$a_m = \\frac{20}{4}$", "$\\mathbf{a_m = 5\\text{ m/s}^2}$"]
    }
  },
  {
    id: "K6_Q4", tipo: "medio", nivelTexto: "Intermediário (2I)",
    enunciado: "Um caminhão trafega a $108\\text{ km/h}$ quando o motorista pisa nos freios de emergência, imprimindo desaceleração constante de $3\\text{ m/s}^2$ até a parada total. Calcule a distância percorrida pelo caminhão durante essa frenagem.",
    dica1: "Converta $108\\text{ km/h} = 30\\text{ m/s}$. Ao parar: $v = 0$. Taxa: $a = -3\\text{ m/s}^2$.",
    dica2: "Sem menção ao tempo: Equação de Torricelli $v^2 = v_0^2 + 2 a \\Delta S$.",
    dica3: "$0 = 30^2 + 2(-3)\\Delta S \\implies 6\\Delta S = 900$. Divida 900 por 6.",
    gabarito: {
      fase1: ["$v_0 = 30\\text{ m/s}$", "$v = 0$", "$a = -3\\text{ m/s}^2$"],
      fase2: "Torricelli: $v^2 = v_0^2 + 2 a \\Delta S$",
      fase3: ["$6\\Delta S = 900 \\implies \\Delta S = \\frac{900}{6}$", "$\\mathbf{\\Delta S = 150\\text{ m}}$"]
    }
  },
  {
    id: "K6_Q5", tipo: "dificil", nivelTexto: "Difícil (1D)",
    enunciado: "Dois trens em trilhos paralelos movem-se em sentidos opostos. No instante $t = 0$, o trem 1 está na posição $S_1 = 100\\text{ m}$ com velocidade de $+22\\text{ m/s}$ e o trem 2 está na posição $S_2 = 580\\text{ m}$ com velocidade de $18\\text{ m/s}$ no sentido oposto ($-18\\text{ m/s}$). Em que instante de tempo e posição as frentes dos dois trens se cruzam?",
    dica1: "Sentidos opostos: $S_1 = 100 + 22t$ e $S_2 = 580 - 18t$.",
    dica2: "Iguale as funções no cruzamento: $S_1 = S_2$.",
    dica3: "$100 + 22t = 580 - 18t \\implies 40t = 480$. Calcule $t$ e a posição.",
    gabarito: {
      fase1: ["$S_1 = 100 + 22t$", "$S_2 = 580 - 18t$"],
      fase2: "Igualdade: $S_1 = S_2$",
      fase3: ["$40t = 480 \\implies \\mathbf{t = 12\\text{ s}}$", "$S = 100 + 22(12) \\implies \\mathbf{S = 364\\text{ m}}$"]
    }
  }
];

const BANCO_KITS = { 1: kit1, 2: kit2, 3: kit3, 4: kit4, 5: kit5, 6: kit6 };

function obterQuestaoPorId(id) {
  for (let k = 1; k <= 6; k++) {
    const q = BANCO_KITS[k].find(item => item.id === id);
    if (q) return q;
  }
  return null;
}

function obterTodasPorNivel(nivel) {
  const lista = [];
  for (let k = 1; k <= 6; k++) {
    BANCO_KITS[k].forEach(q => { if (q.tipo === nivel) lista.push(q); });
  }
  return lista;
}

const TODAS_FACEIS = obterTodasPorNivel('facil');   // 12
const TODAS_MEDIAS = obterTodasPorNivel('medio');   // 12
const TODAS_DIFICEIS = obterTodasPorNivel('dificil'); // 6

// ===== 8. REGRAS DE CONCLUSÃO E EMBLEMAS =====
function isQuestaoConcluida(id) {
  return Boolean(ESTADO.respostas[id]?.concluida);
}

function isKitConcluido(kitNum) {
  const questoes = BANCO_KITS[kitNum];
  if (!questoes) return false;
  return questoes.every(q => isQuestaoConcluida(q.id));
}

function getQuantidadeKitsConcluidos() {
  let concluidos = 0;
  for (let k = 1; k <= 6; k++) {
    if (isKitConcluido(k)) concluidos++;
  }
  return concluidos;
}

function contarQuestoesConcluidas() {
  return Object.values(ESTADO.respostas || {}).filter(r => r.concluida).length;
}

function resetarKitEspecifico(kitNum) {
  if (!confirm(`Deseja realmente zerar o progresso do Kit ${kitNum}? Apenas os dados deste kit serão reiniciados.`)) return;
  const questoes = BANCO_KITS[kitNum] || [];
  questoes.forEach(q => { delete ESTADO.respostas[q.id]; });
  salvarStorage();
  renderizarTudo();
}
window.resetarKitEspecifico = resetarKitEspecifico;

// ===== 9. LATEX RENDERER =====
function garantirRenderizacaoLatex(container) {
  if (window.renderMathInElement && container) {
    try {
      window.renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render erro:", e);
    }
  }
}

// ===== 10. CRONÔMETRO DAS 3 FASES (KITS) =====
let timerInterval = null;
let cronoAtivo = { questId: null, faseNum: null, inicioTimestamp: null };

function getDadosQuestao(questId) {
  if (!ESTADO.respostas[questId]) {
    ESTADO.respostas[questId] = {
      fase1_t: null, fase2_t: null, fase3_t: null,
      tempoTotal: 0, concluida: false, dicasUsadas: 0
    };
  }
  return ESTADO.respostas[questId];
}

function acaoFase(questId, faseNum) {
  const dados = getDadosQuestao(questId);
  if (cronoAtivo.questId === questId && cronoAtivo.faseNum === faseNum) {
    const decorridoMs = Date.now() - cronoAtivo.inicioTimestamp;
    const s = Math.max(1, Math.round(decorridoMs / 1000));
    pararCronometro();
    dados[`fase${faseNum}_t`] = s;
    dados.tempoTotal = (dados.fase1_t || 0) + (dados.fase2_t || 0) + (dados.fase3_t || 0);
    const eraConcluida = Boolean(dados.concluida);
    if (faseNum === 3 || (dados.fase1_t && dados.fase2_t && dados.fase3_t)) {
      dados.concluida = true;
      if (!eraConcluida) {
        if (!ESTADO.historico) ESTADO.historico = [];
        ESTADO.historico.push({
          id: Date.now().toString(),
          questId: questId,
          data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          f1: dados.fase1_t || 0,
          f2: dados.fase2_t || 0,
          f3: dados.fase3_t || 0,
          total: dados.tempoTotal || 0
        });
      }
    }
    salvarStorage();
    renderizarTudo();
    return;
  }
  if (cronoAtivo.questId !== null) {
    if (!confirm("Há outro cronômetro em andamento. Deseja encerrá-lo e iniciar este?")) return;
    pararCronometro();
  }
  cronoAtivo.questId = questId;
  cronoAtivo.faseNum = faseNum;
  cronoAtivo.inicioTimestamp = Date.now();
  const elBtn = document.getElementById(`btn-fase-${questId}-${faseNum}`);
  if (elBtn) {
    elBtn.classList.add('btn-gravando');
    elBtn.textContent = '⏹️ Parar e Gravar';
  }
  timerInterval = setInterval(() => {
    const seg = Math.floor((Date.now() - cronoAtivo.inicioTimestamp) / 1000);
    const elRelogio = document.getElementById(`tempo-fase-${questId}-${faseNum}`);
    if (elRelogio) elRelogio.textContent = `${seg}s`;
  }, 500);
}
window.acaoFase = acaoFase;

function pararCronometro() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  cronoAtivo.questId = null;
  cronoAtivo.faseNum = null;
  cronoAtivo.inicioTimestamp = null;
}

function alternarDicaFase(questId, faseNum) {
  const boxDica = document.getElementById(`dica-fase-${questId}-${faseNum}`);
  if (boxDica) {
    boxDica.classList.toggle('oculto');
    const dados = getDadosQuestao(questId);
    dados.dicasUsadas = Math.max(dados.dicasUsadas || 0, faseNum);
    salvarStorage();
  }
}
window.alternarDicaFase = alternarDicaFase;

// ===== 11. SISTEMA DE ZOOM =====
let zoomTimeout = null;

function aplicarZoom(nivel) {
  const scale = Math.max(1.0, Math.min(2.0, nivel));
  ESTADO.zoomLevel = scale;
  document.documentElement.style.setProperty('--font-scale', scale);
  salvarStorage();
  atualizarIndicadorZoom();
  reiniciarTimerOcultacaoZoom();
}

function atualizarIndicadorZoom() {
  const indicador = document.getElementById('zoom-indicador');
  if (indicador) indicador.textContent = `${Math.round(ESTADO.zoomLevel * 100)}%`;
}

function reiniciarTimerOcultacaoZoom() {
  const controles = document.getElementById('controles-zoom');
  if (!controles) return;
  controles.classList.remove('oculto-zoom');
  if (zoomTimeout) clearTimeout(zoomTimeout);
  zoomTimeout = setTimeout(() => {
    controles.classList.add('oculto-zoom');
  }, 3000);
}

function iniciarControlesZoom() {
  const btnIn = document.getElementById('btn-zoom-in');
  const btnOut = document.getElementById('btn-zoom-out');
  const controles = document.getElementById('controles-zoom');
  if (btnIn) btnIn.addEventListener('click', () => aplicarZoom(ESTADO.zoomLevel + 0.1));
  if (btnOut) btnOut.addEventListener('click', () => aplicarZoom(ESTADO.zoomLevel - 0.1));
  if (controles) {
    controles.addEventListener('mouseenter', () => {
      if (zoomTimeout) clearTimeout(zoomTimeout);
      controles.classList.remove('oculto-zoom');
    });
    controles.addEventListener('mouseleave', reiniciarTimerOcultacaoZoom);
    controles.addEventListener('click', reiniciarTimerOcultacaoZoom);
  }
  aplicarZoom(ESTADO.zoomLevel || 1.5);
}

// ===== 12. NTP (SINCRONIZAÇÃO DE HORA) =====
let OFFSET_NTP_MS = 0;
let NTP_SINCRONIZADO = false;

async function sincronizarNTP() {
  const apis = [
    {
      url: 'https://worldtimeapi.org/api/timezone/America/Sao_Paulo',
      parse: (data) => new Date(data.datetime).getTime()
    },
    {
      url: 'https://timeapi.io/api/time/current/zone?timeZone=America/Sao_Paulo',
      parse: (data) => {
        const dt = data.dateTime || data.datetime;
        return new Date(dt).getTime();
      }
    }
  ];
  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const horaNTP = api.parse(data);
        if (!isNaN(horaNTP)) {
          OFFSET_NTP_MS = horaNTP - Date.now();
          NTP_SINCRONIZADO = true;
          console.log("✓ NTP sincronizado. Offset:", OFFSET_NTP_MS, "ms");
          return true;
        }
      }
    } catch (e) {
      console.warn('NTP falhou:', api.url, e.message);
    }
  }
  NTP_SINCRONIZADO = false;
  return false;
}

function agoraSincronizado() {
  return new Date(Date.now() + OFFSET_NTP_MS);
}

// ===== 13. CÁLCULO DE TEMPO POR HORÁRIO DE AULA =====
function horaParaSegundos(horaStr) {
  const [h, m] = horaStr.split(':').map(Number);
  return h * 3600 + m * 60;
}

function segundosParaHora(seg) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatarSegundos(s) {
  if (!s || isNaN(s) || s < 0) return '00:00';
  const m = Math.floor(s / 60);
  const seg = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}
window.formatarSegundos = formatarSegundos;

// [V8.1] Agora devolve TIMESTAMPS ABSOLUTOS (fechamentoMs, sinalMs)
// para que o instante de encerramento não seja recalculado com base
// em tempo decorrido desde o preview.
function calcularProvaSala() {
  const agora = agoraSincronizado();
  const segAtual = agora.getHours() * 3600 + agora.getMinutes() * 60 + agora.getSeconds();
  const agoraMs  = agora.getTime();

  let proximaAula = null;
  for (const aula of HORARIOS_AULA) {
    const fimSeg = horaParaSegundos(aula.fim);
    if (fimSeg > segAtual) {
      proximaAula = aula;
      break;
    }
  }

  if (!proximaAula) {
    return { valido: false, motivo: 'fora_horario', mensagem: 'Fora do horário de aulas. Use o modo Simulado.' };
  }

  const sinalSeg = horaParaSegundos(proximaAula.fim);
  const fechamentoSeg = sinalSeg - BUFFER_SINAL_SEG;
  const tempoTotal = fechamentoSeg - segAtual;

  if (tempoTotal <= 0) {
    return { valido: false, motivo: 'tempo_insuficiente', mensagem: 'A aula está terminando. Aguarde o próximo período.' };
  }

  // Timestamps absolutos (mesmo referencial de Date.now() + OFFSET_NTP_MS)
  const meiaNoiteMs = new Date(
    agora.getFullYear(), agora.getMonth(), agora.getDate()
  ).getTime();
  const sinalMs      = meiaNoiteMs + sinalSeg * 1000;
  const fechamentoMs = meiaNoiteMs + fechamentoSeg * 1000;

  const MINIMO_VIAVEL = 10 * 60;
  const ALERTA_MAXIMO = 15 * 60;
  const TEMPO_PADRAO  = 30 * 60;

  const infoBase = {
    aula: proximaAula,
    sinal: segundosParaHora(sinalSeg),
    fechamento: segundosParaHora(fechamentoSeg),
    tempoTotal,
    sinalMs,
    fechamentoMs,
    calculadoEmMs: agoraMs
  };

  if (tempoTotal < MINIMO_VIAVEL) {
    return {
      ...infoBase,
      valido: false,
      motivo: 'tempo_insuficiente',
      mensagem: `⛔ Tempo insuficiente (${formatarSegundos(tempoTotal)}). Mínimo: 10 min. Aguarde a próxima aula.`
    };
  }

  if (tempoTotal <= ALERTA_MAXIMO) {
    const tempoCada = Math.floor(tempoTotal / 2);
    return {
      ...infoBase,
      valido: true,
      modo: 'reduzido_2questoes',
      etapas: [
        { nivel: 'facil', tempo: tempoCada },
        { nivel: 'medio', tempo: tempoTotal - tempoCada }
      ],
      mensagem: '⚠️ Aula curta: prova reduzida para 2 questões (Fácil + Média).'
    };
  }

  if (tempoTotal < TEMPO_PADRAO) {
    const deficit = TEMPO_PADRAO - tempoTotal;
    const reducaoPorQuestao = Math.ceil(deficit / 3);
    return {
      ...infoBase,
      valido: true,
      modo: 'penalidade_proporcional',
      etapas: [
        { nivel: 'facil',   tempo: Math.max(60, 8  * 60 - reducaoPorQuestao) },
        { nivel: 'medio',   tempo: Math.max(60, 10 * 60 - reducaoPorQuestao) },
        { nivel: 'dificil', tempo: Math.max(60, 12 * 60 - reducaoPorQuestao) }
      ],
      mensagem: `⏱️ Penalidade por atraso: ${reducaoPorQuestao}s a menos por questão.`
    };
  }

  // [V8.1] Caso padrão: só inclui a etapa de revisão se sobrar tempo
  // significativo (>= 60s) além do tempo padrão de 30 min.
  const sobraRevisao = tempoTotal - TEMPO_PADRAO;
  const etapas = [
    { nivel: 'facil',   tempo: 8  * 60 },
    { nivel: 'medio',   tempo: 10 * 60 },
    { nivel: 'dificil', tempo: 12 * 60 }
  ];
  if (sobraRevisao >= 60) {
    etapas.push({ nivel: 'revisao', tempo: sobraRevisao });
  }

  return {
    ...infoBase,
    valido: true,
    modo: 'padrao',
    etapas,
    mensagem: ''
  };
}

// ===== 14. SORTEIO COM SEED REPRODUTÍVEL =====
function sortearComSeed(seed) {
  const s = Math.max(1, Math.min(TOTAL_COMBINACOES, seed)) - 1;
  const indiceFacil = s % TODAS_FACEIS.length;
  const indiceMedio = Math.floor(s / TODAS_FACEIS.length) % TODAS_MEDIAS.length;
  const indiceDificil = Math.floor(s / (TODAS_FACEIS.length * TODAS_MEDIAS.length)) % TODAS_DIFICEIS.length;
  return {
    facil: TODAS_FACEIS[indiceFacil],
    medio: TODAS_MEDIAS[indiceMedio],
    dificil: TODAS_DIFICEIS[indiceDificil]
  };
}

function gerarSeedAleatorio() {
  return Math.floor(Math.random() * TOTAL_COMBINACOES) + 1;
}

// ===== 15. ESTADO DA PROVA =====
let timerAvaliacao = null;
let etapasProvaAtual = [];
let indiceEtapaAtual = 0;
let tempoRestanteEtapa = 0;
let tempoMaximoEtapa = 0;
let fechamentoProvaTimestamp = null;

// ===== 16. RENDERIZAÇÃO GERAL =====
function renderizarTudo() {
  atualizarBarraTopo();
  renderizarQuadroEquacoes();
  renderizarMuralMedalhas();
  renderizarAbaAtual();
}

function atualizarBarraTopo() {
  const barra = document.getElementById('barra-topo-principal');
  const btnReabrir = document.getElementById('btn-reabrir-topo');
  const pctMini = document.getElementById('reabrir-pct-mini');
  const nome = ESTADO.nomeAluno.trim();
  const rotuloNome = document.getElementById('rotulo-nome-topo');
  const tagAcordo = document.getElementById('status-acordo-tag');
  const inputNome = document.getElementById('input-nome-aluno-topo');
  const chkAcordo = document.getElementById('chk-acordo-topo');
  const txtPct = document.getElementById('texto-percentual-geral');
  const txtFracao = document.getElementById('texto-fracao-geral');
  const barraFill = document.getElementById('barra-progresso-fill');
  const statusGeral = document.getElementById('status-geral');
  const btnAbaProva = document.getElementById('btn-aba-prova');

  if (rotuloNome) rotuloNome.textContent = nome.length > 0 ? nome : "Estudante";
  if (inputNome && document.activeElement !== inputNome) inputNome.value = nome;
  if (chkAcordo) chkAcordo.checked = Boolean(ESTADO.acordoAceito);
  if (tagAcordo) {
    if (ESTADO.acordoAceito && nome.length > 0) {
      tagAcordo.className = "badge-acordo assinado";
      tagAcordo.textContent = "✓ Termo Assinado";
    } else {
      tagAcordo.className = "badge-acordo";
      tagAcordo.textContent = "⚠️ Termo Pendente";
    }
  }

  const totalFeitas = contarQuestoesConcluidas();
  const pct = Math.round((totalFeitas / 30) * 100);
  const kitsCompletos = getQuantidadeKitsConcluidos();

  if (txtPct) txtPct.textContent = `${pct}%`;
  if (pctMini) pctMini.textContent = `${pct}%`;
  if (txtFracao) txtFracao.textContent = `(${totalFeitas}/30 questões)`;
  if (barraFill) barraFill.style.width = `${pct}%`;
  if (statusGeral) statusGeral.textContent = `${kitsCompletos} de 6 Kits Concluídos`;

  if (barra && btnReabrir) {
    if (ESTADO.barraRecolhida) {
      barra.classList.add('oculto');
      btnReabrir.classList.remove('oculto');
    } else {
      barra.classList.remove('oculto');
      btnReabrir.classList.add('oculto');
    }
  }

  const provaLiberada = (kitsCompletos === 6) || ESTADO.modoProfessor;
  if (btnAbaProva) {
    if (provaLiberada) {
      btnAbaProva.classList.remove('bloqueada');
      btnAbaProva.textContent = ESTADO.modoProfessor ? "🎯 PROVA" : "🎯 SIMULADO";
      btnAbaProva.title = "Simulado liberado! Clique para iniciar.";
    } else {
      btnAbaProva.classList.add('bloqueada');
      btnAbaProva.textContent = `🔒 SIMULADO (${kitsCompletos}/6 Kits)`;
      btnAbaProva.title = "Conclua os 6 kits de treinamento para destravar o simulado.";
    }
  }
}

function renderizarMuralMedalhas() {
  const container = document.getElementById('grade-medalhas');
  if (!container) return;
  const kitsConcluidos = getQuantidadeKitsConcluidos();
  container.innerHTML = '';
  EMBLEMAS.forEach(emb => {
    const conquistada = kitsConcluidos >= emb.kitsNecessarios;
    const card = document.createElement('div');
    card.className = `card-medalha ${conquistada ? 'conquistada' : ''}`;
    card.innerHTML = `<span class="icone-medalha">${emb.icone}</span><div class="nome-medalha">${emb.nome}</div><div class="meta-medalha">${emb.kitsNecessarios} ${emb.kitsNecessarios === 1 ? 'Kit concluído' : 'Kits concluídos'}</div>`;
    card.title = conquistada ? `Conquistado! ${emb.mensagem}` : `Bloqueado. Conclua quaisquer ${emb.kitsNecessarios} kits para destravar.`;
    container.appendChild(card);
  });
}

function renderizarQuadroEquacoes() {
  const painel = document.getElementById('painel-equacoes');
  const painelOverlay = document.getElementById('painel-equacoes-overlay');
  if (!painel) return;
  const htmlFormulas = DATABASE_EQUACOES.map(eq => `<div class="card-formula"><div style="display:flex; justify-content:space-between; align-items:center;"><span class="tag-tipo">${eq.badge}</span><strong style="font-size: 1.05rem; color: var(--ink);">${eq.concept}</strong></div><div class="formula-render">$${eq.katex}$</div><div style="font-size:0.85rem; color:#495057;">${eq.desc}</div></div>`).join('');
  painel.innerHTML = htmlFormulas;
  if (painelOverlay) painelOverlay.innerHTML = htmlFormulas;
  garantirRenderizacaoLatex(painel);
  if (painelOverlay) garantirRenderizacaoLatex(painelOverlay);
}

function renderizarAbaAtual() {
  const kitId = ESTADO.kitAtivo;
  const secKit = document.getElementById('conteudo-kit');
  const secCert = document.getElementById('secao-certificado');
  const secProva = document.getElementById('secao-prova');

  document.querySelectorAll('.btn-aba').forEach(btn => {
    btn.classList.toggle('ativa', String(btn.dataset.kit) === String(kitId));
  });

  if (kitId === 'cert') {
    secKit.classList.add('oculto');
    secCert.classList.remove('oculto');
    secProva.classList.add('oculto');
    renderizarPainelCertificado();
    return;
  }
  if (kitId === 'prova') {
    secKit.classList.add('oculto');
    secCert.classList.add('oculto');
    secProva.classList.remove('oculto');
    renderizarPainelProvaSimulado();
    return;
  }

  secKit.classList.remove('oculto');
  secCert.classList.add('oculto');
  secProva.classList.add('oculto');

  const kitNum = parseInt(kitId, 10);
  const questoes = BANCO_KITS[kitNum] || [];
  const kitFinalizado = isKitConcluido(kitNum);

  let html = `<div class="topo-kit-ativo"><div><h2 class="titulo-kit">Caderno de Exercícios &bull; Kit ${kitNum}</h2><span style="font-size: 1.1rem; color: #495057;">${questoes.filter(q => isQuestaoConcluida(q.id)).length} de 5 questões concluídas</span></div><button type="button" class="btn-reset-kit" onclick="resetarKitEspecifico(${kitNum})">🔄 Zerar este Kit ${kitNum}</button></div>`;

  questoes.forEach((q, idx) => {
    const dados = getDadosQuestao(q.id);
    const concluida = dados.concluida;
    html += `
      <article class="questao-card" id="card-${q.id}">
        <div class="card-cabecalho">
          <span class="num-q">${idx + 1}</span>
          <span class="tag-nivel ${q.tipo}">${q.nivelTexto}</span>
          <span style="font-family:'Fira Code', monospace; color:#868e96; font-size:0.95rem;">ID: ${q.id}</span>
          ${concluida ? '<span style="color:var(--green); font-weight:bold; margin-left:auto;">✓ Concluída</span>' : ''}
        </div>
        <div class="enunciado" style="font-size: 1.25rem; margin: 14px 0;">${q.enunciado}</div>
        <div class="fases-grade">
          <div class="bloco-fase ${dados.fase1_t ? 'concluida' : ''}">
            <div class="titulo-fase"><span>I. Dados Isolados</span><span class="cronometro-fase" id="tempo-fase-${q.id}-1">${dados.fase1_t ? `${dados.fase1_t}s` : '--'}</span></div>
            <button type="button" id="btn-fase-${q.id}-1" class="btn-acao ${dados.fase1_t ? 'concluido' : ''}" onclick="acaoFase('${q.id}', 1)">${dados.fase1_t ? `✓ Feito (${dados.fase1_t}s)` : '▶️ Iniciar Fase 1'}</button>
            <button type="button" class="btn-dica-fase" onclick="alternarDicaFase('${q.id}', 1)">💡 Dica da Fase 1 (Dados)</button>
            <div id="dica-fase-${q.id}-1" class="caixa-dica-fase oculto">${q.dica1}</div>
          </div>
          <div class="bloco-fase ${dados.fase2_t ? 'concluida' : ''}">
            <div class="titulo-fase"><span>II. Equação</span><span class="cronometro-fase" id="tempo-fase-${q.id}-2">${dados.fase2_t ? `${dados.fase2_t}s` : '--'}</span></div>
            <button type="button" id="btn-fase-${q.id}-2" class="btn-acao ${dados.fase2_t ? 'concluido' : ''}" onclick="acaoFase('${q.id}', 2)">${dados.fase2_t ? `✓ Feito (${dados.fase2_t}s)` : '▶️ Iniciar Fase 2'}</button>
            <button type="button" class="btn-dica-fase" onclick="alternarDicaFase('${q.id}', 2)">💡 Dica da Fase 2 (Equação)</button>
            <div id="dica-fase-${q.id}-2" class="caixa-dica-fase oculto">${q.dica2}</div>
          </div>
          <div class="bloco-fase ${dados.fase3_t ? 'concluida' : ''}">
            <div class="titulo-fase"><span>III. Resolução</span><span class="cronometro-fase" id="tempo-fase-${q.id}-3">${dados.fase3_t ? `${dados.fase3_t}s` : '--'}</span></div>
            <button type="button" id="btn-fase-${q.id}-3" class="btn-acao ${dados.fase3_t ? 'concluido' : ''}" onclick="acaoFase('${q.id}', 3)">${dados.fase3_t ? `✓ Feito (${dados.fase3_t}s)` : '▶️ Iniciar Fase 3'}</button>
            <button type="button" class="btn-dica-fase" onclick="alternarDicaFase('${q.id}', 3)">💡 Dica da Fase 3 (Cálculo)</button>
            <div id="dica-fase-${q.id}-3" class="caixa-dica-fase oculto">${q.dica3}</div>
          </div>
        </div>
      </article>`;
  });

  if (kitFinalizado) {
    html += `<section class="box-gabarito-kit"><h3 style="color: var(--green); font-size: 1.8rem; margin-top: 0;">🎉 Gabarito Didático Completo &bull; Kit ${kitNum}</h3><p>Parabéns! Todas as 5 questões deste kit foram concluídas. Confira a resolução oficial:</p><div class="lista-resolucoes">`;
    questoes.forEach((q, i) => {
      html += `<div style="border-top: 1px dashed #ced4da; padding: 12px 0;"><h4 style="margin: 0 0 6px 0; font-size: 1.35rem;">Questão ${i + 1} (${q.id}):</h4><div style="margin-left: 10px; font-size: 1.1rem;"><div><strong>I. Dados:</strong> ${q.gabarito.fase1.join(' &bull; ')}</div><div><strong>II. Equação:</strong> ${q.gabarito.fase2}</div><div><strong>III. Resolução:</strong> ${q.gabarito.fase3.join(' ➔ ')}</div></div></div>`;
    });
    html += `</div></section>`;
  } else {
    html += `<div class="box-gabarito-bloqueado">🔒 <strong>Gabarito do Kit ${kitNum} Bloqueado:</strong> Conclua as 5 questões deste kit para liberar as resoluções passo a passo.</div>`;
  }

  secKit.innerHTML = html;
  garantirRenderizacaoLatex(secKit);
}

function renderizarPainelCertificado() {
  const statusGrid = document.getElementById('grade-kits-status');
  const diplomaNome = document.getElementById('diploma-nome-exibicao');
  const dataCert = document.getElementById('data-cert');
  const diplomaMedalhas = document.getElementById('medalhas-diploma');
  const diplomaResumo = document.getElementById('resumo-diploma');
  const nome = ESTADO.nomeAluno.trim();

  if (diplomaNome) diplomaNome.textContent = nome.length > 0 ? nome : "Estudante";
  if (dataCert) dataCert.textContent = new Date().toLocaleDateString('pt-BR');

  if (statusGrid) {
    statusGrid.innerHTML = '';
    for (let k = 1; k <= 6; k++) {
      const conc = isKitConcluido(k);
      const qtdFeitas = BANCO_KITS[k].filter(q => isQuestaoConcluida(q.id)).length;
      const card = document.createElement('div');
      card.className = `card-kit-metrica ${conc ? 'concluido' : ''}`;
      card.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><strong style="font-size: 1.3rem;">Kit ${k}</strong><span>${conc ? '✅ Concluído' : `${qtdFeitas}/5 Feitas`}</span></div><p style="font-size:0.95rem; margin:8px 0; color:#495057;">${conc ? 'Gabarito liberado e domínio consolidado.' : 'Resolva as 5 questões para destravar o gabarito.'}</p><button type="button" class="btn-acao pequeno" onclick="mudarAba(${k})">Abrir Kit ${k}</button>`;
      statusGrid.appendChild(card);
    }
  }

  const kitsConcluidos = getQuantidadeKitsConcluidos();
  if (diplomaResumo) {
    diplomaResumo.innerHTML = `<div style="font-size: 1.3rem; margin: 12px 0;"><strong>Kits Concluídos:</strong> ${kitsConcluidos} de 6 &bull; <strong>Questões Finalizadas:</strong> ${contarQuestoesConcluidas()} de 30</div>`;
  }
  if (diplomaMedalhas) {
    const iconesGanhos = EMBLEMAS.filter(e => kitsConcluidos >= e.kitsNecessarios).map(e => `<span style="margin: 0 4px;">${e.icone}</span>`).join('');
    diplomaMedalhas.innerHTML = `<div style="font-size: 2.2rem; display: flex; justify-content: center; align-items: center; gap: 8px;">${iconesGanhos || '🌱'}</div>`;
  }

  // ===== MÉTRICAS VISUAIS =====
  let tempoTotalGlobal = 0, somaF1 = 0, somaF2 = 0, somaF3 = 0;
  let contF1 = 0, contF2 = 0, contF3 = 0;
  Object.values(ESTADO.respostas || {}).forEach(r => {
    if (r.concluida) {
      tempoTotalGlobal += (r.tempoTotal || 0);
      if (r.fase1_t) { somaF1 += r.fase1_t; contF1++; }
      if (r.fase2_t) { somaF2 += r.fase2_t; contF2++; }
      if (r.fase3_t) { somaF3 += r.fase3_t; contF3++; }
    }
  });
  const medF1 = contF1 > 0 ? Math.round(somaF1 / contF1) : 0;
  const medF2 = contF2 > 0 ? Math.round(somaF2 / contF2) : 0;
  const medF3 = contF3 > 0 ? Math.round(somaF3 / contF3) : 0;
  const totalConcluidas = contarQuestoesConcluidas();
  if (diplomaResumo) {
    diplomaResumo.innerHTML += `<div style="margin-top:6px;">Tempo Total Acumulado: <strong>${formatarSegundos(tempoTotalGlobal)}</strong> &bull; Média por Questão: <strong>${formatarSegundos(totalConcluidas ? Math.round(tempoTotalGlobal / totalConcluidas) : 0)}</strong></div>`;
  }
  requestAnimationFrame(() => {
    desenharGraficoFases(medF1, medF2, medF3);
    desenharGraficoNiveis();
  });
  renderizarTabelaHistorico();
}

// ===== 17. SEÇÃO DE PROVA / SIMULADO =====
function renderizarPainelProvaSimulado() {
  const pBloqueio = document.getElementById('painel-bloqueio-prova');
  const pPre = document.getElementById('painel-pre-prova');
  const pExec = document.getElementById('painel-execucao-prova');
  const pFim = document.getElementById('painel-fim-prova');
  const kitsConcluidos = getQuantidadeKitsConcluidos();
  const liberada = (kitsConcluidos === 6) || ESTADO.modoProfessor;

  if (!liberada) {
    pBloqueio.classList.remove('oculto');
    pPre.classList.add('oculto');
    pExec.classList.add('oculto');
    pFim.classList.add('oculto');
    document.getElementById('qtd-kits-concluidos-aviso').textContent = `${kitsConcluidos}`;
    return;
  }

  pBloqueio.classList.add('oculto');
  const av = ESTADO.avaliacao;

  if (av.etapaAtual === 'fim') {
    pPre.classList.add('oculto');
    pExec.classList.add('oculto');
    pFim.classList.remove('oculto');
    exibirFimDeProva();
  } else if (av.etapaAtual === 'pre_prova' || !av.etapaAtual) {
    pPre.classList.remove('oculto');
    pExec.classList.add('oculto');
    pFim.classList.add('oculto');
    atualizarInfoModoSala();
  } else {
    pPre.classList.add('oculto');
    pExec.classList.remove('oculto');
    pFim.classList.add('oculto');
    iniciarTemporizadorAvaliacao();
  }
}

function atualizarInfoModoSala() {
  const radios = document.querySelectorAll('input[name="modo-prova"]');
  const infoSala = document.getElementById('info-modo-sala');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'sala' && radio.checked) {
        infoSala.classList.remove('oculto');
        calcularEExibirInfoSala();
      } else {
        infoSala.classList.add('oculto');
      }
    });
  });
}

async function calcularEExibirInfoSala() {
  const elAula = document.getElementById('info-aula-atual');
  const elSinal = document.getElementById('info-sinal');
  const elEncerramento = document.getElementById('info-encerramento');
  const elTempoTotal = document.getElementById('info-tempo-total');
  const elTempoRevisao = document.getElementById('info-tempo-revisao');

  elAula.textContent = 'Sincronizando NTP...';
  const okNTP = await sincronizarNTP();

  if (!okNTP) {
    elAula.textContent = '❌ Falha na sincronização NTP. Verifique a internet.';
    elSinal.textContent = '--';
    elEncerramento.textContent = '--';
    elTempoTotal.textContent = '--';
    elTempoRevisao.textContent = '--';
    return;
  }

  const resultado = calcularProvaSala();
  if (!resultado.valido) {
    elAula.textContent = resultado.mensagem;
    elSinal.textContent = resultado.sinal || '--';
    elEncerramento.textContent = resultado.fechamento || '--';
    elTempoTotal.textContent = '--';
    elTempoRevisao.textContent = '--';
    return;
  }

  elAula.textContent = `${resultado.aula.periodo} • ${resultado.aula.inicio} - ${resultado.aula.fim}`;
  elSinal.textContent = resultado.sinal;
  elEncerramento.textContent = resultado.fechamento;
  elTempoTotal.textContent = formatarSegundos(resultado.tempoTotal);
  const etapaRevisao = resultado.etapas.find(e => e.nivel === 'revisao');
  elTempoRevisao.textContent = etapaRevisao ? formatarSegundos(etapaRevisao.tempo) : 'Não disponível';
}

// ===== 18. SORTEIO COM PREVIEW =====
let seedPreviewAtual = null;

function executarSorteioAvaliacao() {
  const modoSelecionado = document.querySelector('input[name="modo-prova"]:checked')?.value || 'simulado';

  if (modoSelecionado === 'sala') {
    sincronizarNTP().then(ok => {
      if (!ok) {
        alert("❌ Não foi possível sincronizar com NTP. Verifique a conexão com a internet.");
        return;
      }
      const resultado = calcularProvaSala();
      if (!resultado.valido) {
        alert(resultado.mensagem);
        return;
      }
      abrirPreviewSorteio(modoSelecionado, resultado);
    });
  } else {
    abrirPreviewSorteio(modoSelecionado, null);
  }
}

// [V8.1] Painel de diretrizes ao professor no preview.
function montarPainelInfoSala(container, resultadoSala) {
  let painelInfo = document.getElementById('preview-info-sala');
  if (!painelInfo) {
    painelInfo = document.createElement('div');
    painelInfo.id = 'preview-info-sala';
    // Insere antes do container de botões, se existir; senão, no fim do modal
    const modal = document.getElementById('modal-preview-sorteio');
    if (modal) modal.appendChild(painelInfo);
  }
  if (!resultadoSala) {
    painelInfo.classList.add('oculto');
    painelInfo.innerHTML = '';
    return;
  }
  painelInfo.classList.remove('oculto');
  painelInfo.innerHTML = `
    <div style="background:#f1f3f5; border-left:4px solid #173fa6; padding:12px 14px; border-radius:6px; font-size:0.95rem; margin:12px 0; text-align:left;">
      <div><strong>📅 Aula:</strong> ${resultadoSala.aula.periodo} • ${resultadoSala.aula.inicio}–${resultadoSala.aula.fim}</div>
      <div><strong>🔔 Sinal:</strong> ${resultadoSala.sinal} &nbsp;|&nbsp; <strong>🛑 Fechamento (−3 min):</strong> ${resultadoSala.fechamento}</div>
      <div><strong>⏱️ Tempo real disponível:</strong> ${formatarSegundos(resultadoSala.tempoTotal)}</div>
      <div><strong>🎯 Modo:</strong> ${String(resultadoSala.modo).replace(/_/g,' ')}</div>
      ${resultadoSala.mensagem ? `<div style="color:#e8590c; margin-top:4px;">${resultadoSala.mensagem}</div>` : ''}
      <div style="margin-top:8px; color:#495057; font-style:italic;">
        💡 O tempo será revalidado ao confirmar. Se demorar, a prova é redistribuída automaticamente.
      </div>
    </div>`;
}

function abrirPreviewSorteio(modo, resultadoSala) {
  seedPreviewAtual = gerarSeedAleatorio();
  document.getElementById('preview-seed').textContent = String(seedPreviewAtual).padStart(3, '0');
  document.getElementById('modal-preview-sorteio').classList.remove('oculto');

  // [V8.1] Painel de diretrizes ao professor
  montarPainelInfoSala(null, resultadoSala);

  document.getElementById('btn-resortear').onclick = () => {
    seedPreviewAtual = gerarSeedAleatorio();
    document.getElementById('preview-seed').textContent = String(seedPreviewAtual).padStart(3, '0');
  };

  document.getElementById('btn-digitar-seed').onclick = () => {
    const input = prompt(`Digite o número da combinação (1 a ${TOTAL_COMBINACOES}):`);
    if (input !== null) {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num >= 1 && num <= TOTAL_COMBINACOES) {
        seedPreviewAtual = num;
        document.getElementById('preview-seed').textContent = String(num).padStart(3, '0');
      } else {
        alert(`Número inválido. Use um valor entre 1 e ${TOTAL_COMBINACOES}.`);
      }
    }
  };

  // [V8.1] Confirmação com revalidação do tempo em modo sala.
  document.getElementById('btn-confirmar-inicio').onclick = () => {
    if (modo === 'sala') {
      // Recalcula com o relógio atual — o preview pode estar defasado.
      const reval = calcularProvaSala();
      if (!reval.valido) {
        alert(reval.mensagem);
        return;
      }
      const tempoOriginal = resultadoSala ? resultadoSala.tempoTotal : 0;
      const tempoAgora    = reval.tempoTotal;
      const modoOriginal  = resultadoSala ? resultadoSala.modo : '';
      const mudouModo     = resultadoSala && reval.modo !== modoOriginal;
      const perdeuTempo   = resultadoSala && (tempoOriginal - tempoAgora) >= 120;

      if (mudouModo || perdeuTempo) {
        const msg = `⚠️ O tempo disponível mudou durante o preview.\n\n` +
                    `Antes: ${formatarSegundos(tempoOriginal)} (${String(modoOriginal).replace(/_/g,' ')})\n` +
                    `Agora: ${formatarSegundos(tempoAgora)} (${String(reval.modo).replace(/_/g,' ')})\n\n` +
                    `Deseja prosseguir com o novo cálculo?`;
        if (!confirm(msg)) return;
      }
      document.getElementById('modal-preview-sorteio').classList.add('oculto');
      // Monta painel novamente no próximo preview
      const pInfo = document.getElementById('preview-info-sala');
      if (pInfo) { pInfo.classList.add('oculto'); pInfo.innerHTML = ''; }
      iniciarProvaComSeed(seedPreviewAtual, modo, reval);
    } else {
      document.getElementById('modal-preview-sorteio').classList.add('oculto');
      const pInfo = document.getElementById('preview-info-sala');
      if (pInfo) { pInfo.classList.add('oculto'); pInfo.innerHTML = ''; }
      iniciarProvaComSeed(seedPreviewAtual, modo, null);
    }
  };
}

// [V8.1] Recalcula/revalida o tempo real e usa fechamentoMs absoluto.
function iniciarProvaComSeed(seed, modo, resultadoSala) {
  const sorteio = sortearComSeed(seed);
  const av = ESTADO.avaliacao;
  av.semente = seed;
  av.questoesIds = [sorteio.facil.id, sorteio.medio.id, sorteio.dificil.id];
  av.modoProva = modo;
  av.tempoTotalGasto = 0;

  if (modo === 'sala') {
    // Se o resultado do preview não veio, recalcula agora.
    if (!resultadoSala || !resultadoSala.valido) {
      const r = calcularProvaSala();
      if (!r.valido) {
        alert(r.mensagem);
        return;
      }
      resultadoSala = r;
    }
    etapasProvaAtual = resultadoSala.etapas.map(e => ({ ...e }));
    fechamentoProvaTimestamp = resultadoSala.fechamentoMs; // absoluto!
  } else {
    etapasProvaAtual = [
      { nivel: 'facil',   tempo: TEMPOS_AVALIACAO.facil },
      { nivel: 'medio',   tempo: TEMPOS_AVALIACAO.medio },
      { nivel: 'dificil', tempo: TEMPOS_AVALIACAO.dificil },
      { nivel: 'revisao', tempo: TEMPOS_AVALIACAO.revisao }
    ];
    fechamentoProvaTimestamp = null;
  }

  // [V8.1] Teste de sanidade: se a soma das etapas exceder o tempo real,
  // redistribui proporcionalmente (cada etapa com piso de 30s).
  if (fechamentoProvaTimestamp) {
    const somaEtapas = etapasProvaAtual.reduce((acc, e) => acc + e.tempo, 0);
    const restanteReal = Math.max(
      0,
      Math.floor((fechamentoProvaTimestamp - agoraSincronizado().getTime()) / 1000)
    );
    if (somaEtapas > restanteReal && etapasProvaAtual.length > 0) {
      const n = etapasProvaAtual.length;
      const base  = Math.floor(restanteReal / n);
      const resto = restanteReal - base * n;
      etapasProvaAtual = etapasProvaAtual.map((e, i) => ({
        ...e,
        tempo: Math.max(30, base + (i < resto ? 1 : 0))
      }));
      console.warn('⚠️ Etapas redistribuídas. Soma original:', somaEtapas,
                   '| Tempo real:', restanteReal);
    }
  }

  indiceEtapaAtual = 0;
  tempoRestanteEtapa = etapasProvaAtual[0].tempo;
  tempoMaximoEtapa = etapasProvaAtual[0].tempo;
  av.etapaAtual = etapasProvaAtual[0].nivel;
  av.tempoRestante = tempoRestanteEtapa;

  salvarStorage();
  renderizarPainelProvaSimulado();
}

// ===== 19. TEMPORIZADOR DA PROVA =====
function iniciarTemporizadorAvaliacao() {
  if (timerAvaliacao) clearInterval(timerAvaliacao);
  atualizarInterfaceAvaliacao();

  timerAvaliacao = setInterval(() => {
    const av = ESTADO.avaliacao;

    // [V8.1] Compara com timestamp absoluto (evita aplicar OFFSET duas vezes)
    if (fechamentoProvaTimestamp && agoraSincronizado().getTime() >= fechamentoProvaTimestamp) {
      finalizarProvaPorSinal();
      return;
    }

    if (tempoRestanteEtapa > 0) {
      tempoRestanteEtapa--;
      av.tempoRestante = tempoRestanteEtapa;
      av.tempoTotalGasto++;
      atualizarVisorTempoAvaliacao();
      salvarStorage();
    } else {
      avancarProximaEtapaAvaliacao();
    }
  }, 1000);
}

function avancarProximaEtapaAvaliacao() {
  indiceEtapaAtual++;
  const av = ESTADO.avaliacao;

  if (indiceEtapaAtual >= etapasProvaAtual.length) {
    finalizarAvaliacaoDefinitiva();
    return;
  }

  const etapa = etapasProvaAtual[indiceEtapaAtual];
  av.etapaAtual = etapa.nivel;
  tempoRestanteEtapa = etapa.tempo;
  tempoMaximoEtapa = etapa.tempo;
  av.tempoRestante = tempoRestanteEtapa;

  salvarStorage();
  atualizarInterfaceAvaliacao();
}

function finalizarProvaPorSinal() {
  if (timerAvaliacao) { clearInterval(timerAvaliacao); timerAvaliacao = null; }
  ESTADO.avaliacao.etapaAtual = 'fim';
  salvarStorage();
  mostrarTelaFimDeProvaSala();
}

function mostrarTelaFimDeProvaSala() {
  const pExec = document.getElementById('painel-execucao-prova');
  const pFim = document.getElementById('painel-fim-prova');
  if (pExec) pExec.classList.add('oculto');
  if (pFim) {
    pFim.classList.remove('oculto');
    const titulo = pFim.querySelector('.titulo-fim-prova');
    if (titulo) titulo.textContent = 'FIM DE PROVA';
    const subtitulo = pFim.querySelector('p');
    if (subtitulo) subtitulo.textContent = 'O tempo da aula terminou. Entregue sua prova ao professor.';
    const btnGab = document.getElementById('btn-ver-gabarito-simulado');
    if (btnGab) btnGab.style.display = 'none';
    const btnNovo = document.getElementById('btn-novo-simulado');
    if (btnNovo) btnNovo.style.display = 'none';
  }
}

function adicionarTempoExtra(minutos) {
  tempoRestanteEtapa += minutos * 60;
  tempoMaximoEtapa += minutos * 60;
  ESTADO.avaliacao.tempoRestante = tempoRestanteEtapa;
  salvarStorage();
  atualizarVisorTempoAvaliacao();
}
window.adicionarTempoExtra = adicionarTempoExtra;

function finalizarAvaliacaoDefinitiva() {
  if (timerAvaliacao) { clearInterval(timerAvaliacao); timerAvaliacao = null; }
  ESTADO.avaliacao.etapaAtual = 'fim';
  salvarStorage();
  renderizarPainelProvaSimulado();
}

function atualizarInterfaceAvaliacao() {
  const av = ESTADO.avaliacao;
  const tagSemente = document.getElementById('tag-semente-prova');
  const tagAluno = document.getElementById('tag-aluno-prova');
  const bannerEtapa = document.getElementById('banner-fase-etapa');
  const container = document.getElementById('container-questao-ativa');
  const painelExtra = document.getElementById('controles-tempo-extra');

  if (tagSemente) tagSemente.textContent = `Sorteio #${String(av.semente || 1).padStart(3, '0')}`;
  if (tagAluno) tagAluno.textContent = `Aluno: ${ESTADO.nomeAluno.trim() || 'Estudante'}`;

  const questoes = (av.questoesIds || []).map(id => obterQuestaoPorId(id)).filter(Boolean);
  container.innerHTML = '';

  const etapaAtual = etapasProvaAtual[indiceEtapaAtual];
  const nivelAtual = etapaAtual ? etapaAtual.nivel : 'facil';

  container.className = '';
  if (nivelAtual === 'facil') container.classList.add('etapa-facil');
  else if (nivelAtual === 'medio') container.classList.add('etapa-medio');
  else if (nivelAtual === 'dificil') container.classList.add('etapa-dificil');

  const banners = {
    facil: `🟢 <strong>ETAPA 1 — QUESTÃO FÁCIL</strong> (Foco Exclusivo • ${formatarSegundos(tempoMaximoEtapa)})`,
    medio: `🟡 <strong>ETAPA 2 — QUESTÃO MÉDIA</strong> (Foco Exclusivo • ${formatarSegundos(tempoMaximoEtapa)})`,
    dificil: `🔴 <strong>ETAPA 3 — QUESTÃO DIFÍCIL</strong> (Foco Exclusivo • ${formatarSegundos(tempoMaximoEtapa)})`,
    revisao: `🟣 <strong>ETAPA FINAL — REVISÃO GERAL</strong> (Todas as questões visíveis • ${formatarSegundos(tempoMaximoEtapa)})`
  };

  if (bannerEtapa) bannerEtapa.innerHTML = banners[nivelAtual] || banners.facil;

  if (nivelAtual === 'revisao') {
    if (painelExtra) painelExtra.classList.remove('oculto');
    const rotulos = ["Fácil", "Média", "Difícil"];
    questoes.forEach((q, idx) => {
      renderizarQuestaoCardSimulado(q, container, idx + 1, rotulos[idx]);
    });
  } else {
    if (painelExtra) painelExtra.classList.add('oculto');
    const idxQuestao = nivelAtual === 'facil' ? 0 : (nivelAtual === 'medio' ? 1 : 2);
    const labels = { facil: 'Fácil', medio: 'Média', dificil: 'Difícil' };
    const qAtual = questoes[idxQuestao];
    if (qAtual) renderizarQuestaoCardSimulado(qAtual, container, idxQuestao + 1, labels[nivelAtual]);
  }

  garantirRenderizacaoLatex(container);
  atualizarVisorTempoAvaliacao();
}

function renderizarQuestaoCardSimulado(q, container, num, label) {
  if (!q) return;
  const card = document.createElement('article');
  card.className = "questao-card";
  card.innerHTML = `<div class="card-cabecalho"><span class="num-q">${num}</span><span class="tag-nivel ${q.tipo}">${label}</span><span style="font-family:'Fira Code', monospace; color:#868e96; font-size:0.95rem;">ID: ${q.id}</span></div><div class="enunciado" style="font-size: 1.35rem; margin: 16px 0;">${q.enunciado}</div><div class="postit">✍️ <strong>Resolução no Caderno:</strong> Estruture: <strong>I. Dados</strong> &bull; <strong>II. Equação</strong> &bull; <strong>III. Resolução</strong>.</div>`;
  container.appendChild(card);
}

function atualizarVisorTempoAvaliacao() {
  const barra = document.getElementById('barra-tempo-preenchimento');
  if (barra && tempoMaximoEtapa > 0) {
    const pct = Math.max(0, (tempoRestanteEtapa / tempoMaximoEtapa) * 100);
    barra.style.width = `${pct}%`;
  }
}

function exibirFimDeProva() {
  const folhaNome = document.getElementById('folha-nome-aluno');
  const folhaData = document.getElementById('folha-data');
  const btnNovo = document.getElementById('btn-novo-simulado');
  const btnGab = document.getElementById('btn-ver-gabarito-simulado');
  const boxGab = document.getElementById('gabarito-pos-prova');

  if (folhaNome) folhaNome.textContent = ESTADO.nomeAluno.trim() || 'Estudante';
  if (folhaData) folhaData.textContent = new Date().toLocaleDateString('pt-BR');
  if (btnNovo) {
    btnNovo.style.display = '';
    btnNovo.onclick = () => {
      ESTADO.avaliacao.etapaAtual = 'pre_prova';
      salvarStorage();
      renderizarPainelProvaSimulado();
    };
  }
  if (btnGab) {
    btnGab.style.display = '';
    btnGab.onclick = () => {
      if (!boxGab) return;
      boxGab.classList.toggle('oculto');
      const questoes = (ESTADO.avaliacao.questoesIds || []).map(id => obterQuestaoPorId(id)).filter(Boolean);
      boxGab.innerHTML = `<h3>📖 Resolução Comentada do Simulado</h3>${questoes.map((q, i) => `<div style="border-top:1px dashed #ced4da; padding:12px 0;"><h4>Questão ${i + 1} (${q.id}) - ${q.nivelTexto}</h4><div><strong>I. Dados:</strong> ${q.gabarito.fase1.join(' • ')}</div><div><strong>II. Equação:</strong> ${q.gabarito.fase2}</div><div><strong>III. Resolução:</strong> ${q.gabarito.fase3.join(' ➔ ')}</div></div>`).join('')}`;
      garantirRenderizacaoLatex(boxGab);
    };
  }
}

// ===== GRÁFICOS E HISTÓRICO (resgatados da V5) =====
function desenharGraficoFases(medF1, medF2, medF3) {
  const canvas = document.getElementById('grafico-fases');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const dados = [
    { label: 'Fase I (Dados)', aluno: medF1, meta: 30 },
    { label: 'Fase II (Eq.)', aluno: medF2, meta: 20 },
    { label: 'Fase III (Res.)', aluno: medF3, meta: 80 }
  ];
  const barWidth = 32, startX = 40, baseY = 210, scale = 1.3;
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, baseY);
  ctx.lineTo(370, baseY);
  ctx.stroke();
  dados.forEach((d, i) => {
    const x = startX + i * 110;
    const hAluno = Math.min(d.aluno * scale, 170);
    ctx.fillStyle = '#173fa6';
    ctx.fillRect(x, baseY - hAluno, barWidth, hAluno);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#21315e';
    ctx.fillText(`${d.aluno}s`, x + 4, baseY - hAluno - 5);
    const hMeta = d.meta * scale;
    ctx.fillStyle = '#fab005';
    ctx.fillRect(x + barWidth + 4, baseY - hMeta, barWidth, hMeta);
    ctx.fillStyle = '#d9480f';
    ctx.fillText(`${d.meta}s`, x + barWidth + 8, baseY - hMeta - 5);
    ctx.fillStyle = '#21315e';
    ctx.font = "12px 'Patrick Hand', sans-serif";
    ctx.fillText(d.label, x, baseY + 20);
  });
  ctx.fillStyle = '#173fa6';
  ctx.fillRect(80, 245, 14, 10);
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.fillText('Seu Tempo', 100, 254);
  ctx.fillStyle = '#fab005';
  ctx.fillRect(200, 245, 14, 10);
  ctx.fillStyle = '#000';
  ctx.fillText('Meta Vestibular', 220, 254);
}

function desenharGraficoNiveis() {
  const canvas = document.getElementById('grafico-niveis');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  let somaF = 0, countF = 0, somaI = 0, countI = 0, somaD = 0, countD = 0;
  for (let k = 1; k <= 6; k++) {
    (BANCO_KITS[k] || []).forEach(q => {
      const resp = ESTADO.respostas[q.id];
      if (resp && resp.concluida) {
        if (q.tipo === 'facil') { somaF += resp.tempoTotal; countF++; }
        if (q.tipo === 'medio') { somaI += resp.tempoTotal; countI++; }
        if (q.tipo === 'dificil') { somaD += resp.tempoTotal; countD++; }
      }
    });
  }
  const medF = countF > 0 ? Math.round(somaF / countF) : 0;
  const medI = countI > 0 ? Math.round(somaI / countI) : 0;
  const medD = countD > 0 ? Math.round(somaD / countD) : 0;
  const niveis = [
    { label: 'Fáceis (2F)', val: medF, meta: 60, cor: '#2f9e44', temDados: countF > 0 },
    { label: 'Médios (2I)', val: medI, meta: 120, cor: '#f59f00', temDados: countI > 0 },
    { label: 'Difíceis (1D)', val: medD, meta: 180, cor: '#e03131', temDados: countD > 0 }
  ];
  const barWidth = 32, startX = 40, baseY = 210, scale = 0.85;
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, baseY);
  ctx.lineTo(370, baseY);
  ctx.stroke();
  niveis.forEach((n, i) => {
    const x = startX + i * 110;
    const hReal = Math.min(n.val * scale, 170);
    ctx.fillStyle = n.temDados ? n.cor : '#ced4da';
    ctx.fillRect(x, baseY - hReal, barWidth, hReal);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#21315e';
    ctx.fillText(`${n.val}s`, x + 4, baseY - hReal - 5);
    const hMeta = n.meta * scale;
    ctx.fillStyle = '#e9ecef';
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.fillRect(x + barWidth + 4, baseY - hMeta, barWidth, hMeta);
    ctx.strokeRect(x + barWidth + 4, baseY - hMeta, barWidth, hMeta);
    ctx.fillStyle = '#495057';
    ctx.fillText(`${n.meta}s`, x + barWidth + 8, baseY - hMeta - 5);
    ctx.fillStyle = '#21315e';
    ctx.font = "12px 'Patrick Hand', sans-serif";
    ctx.fillText(n.label, x, baseY + 20);
  });
  ctx.fillStyle = '#2f9e44';
  ctx.fillRect(70, 245, 14, 10);
  ctx.fillStyle = '#000';
  ctx.font = '12px sans-serif';
  ctx.fillText('Tempo Obtido', 90, 254);
  ctx.fillStyle = '#adb5bd';
  ctx.fillRect(200, 245, 14, 10);
  ctx.fillStyle = '#000';
  ctx.fillText('Meta Vestibular', 220, 254);
}

function renderizarTabelaHistorico() {
  const container = document.getElementById('tabela-tentativas-container');
  if (!container) return;
  const hist = ESTADO.historico || [];
  if (hist.length === 0) {
    container.innerHTML = `<p style="font-style:italic; color:#868e96;">Nenhuma tentativa registrada até o momento.</p>`;
    return;
  }
  let html = `<table class="tabela-historico"> <thead> <tr> <th>Questão</th> <th>Horário</th> <th>Fase I (Dados)</th> <th>Fase II (Eq.)</th> <th>Fase III (Res.)</th> <th>Tempo Total</th> <th>Ação</th> </tr> </thead> <tbody>`;
  hist.slice().reverse().forEach(item => {
    html += `<tr> <td><strong>${item.questId}</strong></td> <td>${item.data || '--'}</td> <td>${item.f1 || 0}s</td> <td>${item.f2 || 0}s</td> <td>${item.f3 || 0}s</td> <td><strong>${formatarSegundos(item.total || 0)}</strong></td> <td> <button type="button" class="btn-excluir-tentativa" onclick="window.dispatchEvent(new CustomEvent('excluirTentativa', {detail: {id: '${item.id}'}}))">Excluir</button> </td> </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

function recomporHistoricoAusente() {
  if (!ESTADO.historico) ESTADO.historico = [];
  if (ESTADO.historico.length > 0) return;
  Object.entries(ESTADO.respostas || {}).forEach(([qid, r]) => {
    if (r && r.concluida) {
      ESTADO.historico.push({
        id: 'rec-' + qid,
        questId: qid,
        data: '(registro recuperado)',
        f1: r.fase1_t || 0, f2: r.fase2_t || 0, f3: r.fase3_t || 0,
        total: r.tempoTotal || 0
      });
    }
  });
  if (ESTADO.historico.length) salvarStorage();
}

// ===== 20. NAVEGAÇÃO DE ABAS =====
function mudarAba(kit) {
  ESTADO.kitAtivo = kit;
  salvarStorage();
  renderizarTudo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.mudarAba = mudarAba;

// ===== 21. INICIALIZAÇÃO DO DOM =====
document.addEventListener('DOMContentLoaded', () => {
  carregarStorage();
  iniciarControlesZoom();

  const btnEditarNome = document.getElementById('btn-editar-nome-topo');
  const gavetaPerfil = document.getElementById('gaveta-perfil');
  const inputNome = document.getElementById('input-nome-aluno-topo');
  const chkAcordo = document.getElementById('chk-acordo-topo');
  const btnSalvarPerfil = document.getElementById('btn-salvar-perfil');
  const btnOcultarTopo = document.getElementById('btn-ocultar-barra-topo');
  const btnReabrirTopo = document.getElementById('btn-reabrir-topo');

  if (btnEditarNome && gavetaPerfil) {
    btnEditarNome.addEventListener('click', () => {
      gavetaPerfil.classList.toggle('oculto');
      if (!gavetaPerfil.classList.contains('oculto') && inputNome) {
        inputNome.focus();
        inputNome.select();
      }
    });
  }

  function salvarIdentificacao() {
    if (inputNome) ESTADO.nomeAluno = inputNome.value.trim();
    if (chkAcordo) ESTADO.acordoAceito = chkAcordo.checked;
    salvarStorage();
    atualizarBarraTopo();
  }

  if (inputNome) inputNome.addEventListener('input', salvarIdentificacao);
  if (chkAcordo) chkAcordo.addEventListener('change', salvarIdentificacao);
  if (btnSalvarPerfil) {
    btnSalvarPerfil.addEventListener('click', () => {
      salvarIdentificacao();
      if (gavetaPerfil) gavetaPerfil.classList.add('oculto');
    });
  }

  if (btnOcultarTopo) {
    btnOcultarTopo.addEventListener('click', () => {
      ESTADO.barraRecolhida = true;
      salvarStorage();
      atualizarBarraTopo();
    });
  }
  if (btnReabrirTopo) {
    btnReabrirTopo.addEventListener('click', () => {
      ESTADO.barraRecolhida = false;
      salvarStorage();
      atualizarBarraTopo();
    });
  }

  window.addEventListener('excluirTentativa', (e) => {
    if (confirm('Deseja apagar esta medição do histórico?')) {
      ESTADO.historico = (ESTADO.historico || []).filter(t => t.id !== e.detail.id);
      salvarStorage();
      renderizarTabelaHistorico();
    }
  });
  recomporHistoricoAusente();

  document.querySelectorAll('.btn-aba').forEach(btn => {
    btn.addEventListener('click', () => {
      const kit = btn.dataset.kit;
      if (kit === 'prova' && btn.classList.contains('bloqueada')) {
        alert("🔒 O Simulado Oficial requer a conclusão dos 6 kits (30 questões). Continue treinando!");
        return;
      }
      mudarAba(kit);
    });
  });

  const modalPreview = document.getElementById('modal-preview-sorteio');
  const btnFecharPreview = document.getElementById('btn-fechar-preview');
  if (btnFecharPreview && modalPreview) {
    btnFecharPreview.addEventListener('click', () => modalPreview.classList.add('oculto'));
  }
  if (modalPreview) {
    modalPreview.addEventListener('click', (e) => {
      if (e.target === modalPreview) modalPreview.classList.add('oculto');
    });
  }

  const gatilhoForm = document.getElementById('gatilho-formulas');
  const painelForm = document.getElementById('painel-equacoes');
  const setaForm = document.getElementById('seta-form');
  if (gatilhoForm && painelForm) {
    gatilhoForm.addEventListener('click', () => {
      painelForm.classList.toggle('oculto');
      if (setaForm) setaForm.textContent = painelForm.classList.contains('oculto') ? '▶' : '▼';
    });
  }

  const btnFlutuante = document.getElementById('btn-flutuante-equacoes');
  const overlayEq = document.getElementById('overlay-equacoes');
  const btnFecharEq = document.getElementById('btn-fechar-equacoes');
  if (btnFlutuante && overlayEq) {
    btnFlutuante.addEventListener('click', () => overlayEq.classList.remove('oculto'));
  }
  if (btnFecharEq && overlayEq) {
    btnFecharEq.addEventListener('click', () => overlayEq.classList.add('oculto'));
  }

  const btnSortear = document.getElementById('btn-iniciar-avaliacao-oficial');
  if (btnSortear) btnSortear.addEventListener('click', executarSorteioAvaliacao);

  const btnEncerrarAntecipado = document.getElementById('btn-encerrar-antecipado');
  if (btnEncerrarAntecipado) {
    btnEncerrarAntecipado.addEventListener('click', () => {
      if (confirm("Deseja realmente entregar e finalizar a avaliação agora?")) {
        finalizarAvaliacaoDefinitiva();
      }
    });
  }
  const btnEncerrarAntecipado2 = document.getElementById('btn-encerrar-antecipado-2');
  if (btnEncerrarAntecipado2) {
    btnEncerrarAntecipado2.addEventListener('click', () => {
      if (confirm("Deseja realmente entregar e finalizar a avaliação agora?")) {
        finalizarAvaliacaoDefinitiva();
      }
    });
  }

  const btnProf = document.getElementById('btn-professor');
  if (btnProf) {
    btnProf.addEventListener('click', () => {
      const pass = prompt("Digite a senha do Professor:");
      if (pass) {
        const passNorm = pass.trim().normalize("NFC").toUpperCase();
        if (passNorm === "FÍSICA" || passNorm === "FISICA") {
          ESTADO.modoProfessor = !ESTADO.modoProfessor;
          salvarStorage();
          renderizarTudo();
          alert(ESTADO.modoProfessor ? "Modo Professor ATIVADO (Simulado desbloqueado)." : "Modo Aluno ATIVADO.");
        } else {
          alert("Senha incorreta.");
        }
      }
    });
  }

  renderizarTudo();
});
