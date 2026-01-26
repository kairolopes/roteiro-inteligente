
## Plano: Fazer Sofia Respeitar os Dados do Quiz

### Problema Identificado

A Sofia está ignorando as informações do quiz porque:

1. **Mensagem inicial muito genérica** - Apenas menciona o destino, sem incluir datas, pedidos especiais, interesses, etc.

2. **Prompt instrui a Sofia a perguntar** - O prompt atual diz "sempre pergunte", fazendo-a re-questionar dados já fornecidos.

3. **Contexto não é enfatizado como OBRIGATÓRIO** - Os dados do quiz chegam ao backend, mas o prompt não deixa claro que a Sofia DEVE usá-los e NÃO re-perguntar.

---

### Arquivos a Modificar

#### 1. **`src/pages/Chat.tsx`**
Melhorar a `sendInitialMessage` para incluir TODOS os dados relevantes do quiz na mensagem inicial:
- Datas selecionadas (início e fim)
- Duração da viagem
- Pedidos especiais (`customRequests`)
- Região/cidades específicas (`destinationDetails`)
- Estilo de viagem e orçamento
- Interesses selecionados

#### 2. **`supabase/functions/chat-travel/index.ts`**
Reescrever o `TRAVEL_SYSTEM_PROMPT` para:
- **Proibir explicitamente** re-perguntar dados que já estão no contexto
- **Ordenar** que a Sofia USE os dados do quiz como base obrigatória
- Mudar de "sempre pergunte" para "use os dados fornecidos"

#### 3. **`netlify/functions/chat-travel.ts`**
Sincronizar as mesmas mudanças do prompt da versão Supabase.

---

### Detalhes Técnicos

#### Nova `sendInitialMessage` (Chat.tsx)

```typescript
const sendInitialMessage = async (answers: QuizAnswers) => {
  const destLabels = { italy: "Itália", france: "França", ... };
  const styleLabels = { romantic: "romântica", family: "em família", ... };
  
  // Formatar datas
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
  };
  
  // Construir mensagem inicial COMPLETA
  const parts: string[] = [];
  parts.push(`Olá! Acabei de responder o quiz de preferências.`);
  
  // Destino
  if (answers.destinations?.length > 0) {
    const destNames = answers.destinations.map(d => destLabels[d] || d);
    parts.push(`Quero visitar: ${destNames.join(", ")}.`);
  }
  
  // Região específica
  if (answers.destinationDetails) {
    parts.push(`Especificamente a região: ${answers.destinationDetails}.`);
  }
  
  // Datas
  if (answers.startDate) {
    const start = formatDate(answers.startDate);
    const end = answers.endDate ? formatDate(answers.endDate) : null;
    if (end) {
      parts.push(`Datas: de ${start} até ${end}.`);
    } else {
      parts.push(`Data de início: ${start}, duração: ${answers.duration}.`);
    }
  }
  
  // Pedidos especiais (PRIORIDADE)
  if (answers.customRequests) {
    parts.push(`IMPORTANTE - Pedidos especiais: ${answers.customRequests}`);
  }
  
  // Estilo e orçamento
  if (answers.travelStyle) {
    parts.push(`Viagem ${styleLabels[answers.travelStyle] || answers.travelStyle}.`);
  }
  
  // Interesses
  if (answers.interests?.length > 0) {
    parts.push(`Interesses: ${answers.interests.join(", ")}.`);
  }
  
  parts.push(`Pode criar um pré-roteiro baseado nessas informações?`);
  
  const initialMessage = parts.join(" ");
  await sendMessage(initialMessage, answers, true);
};
```

#### Novo `TRAVEL_SYSTEM_PROMPT` (chat-travel)

```text
Você é um agente de viagens chamado Sofia. Você é simpática, conhecedora e apaixonada por viagens.

🔴🔴🔴 REGRA CRÍTICA - USAR DADOS DO QUIZ 🔴🔴🔴
O viajante acabou de responder um quiz com suas preferências. 
Você RECEBERÁ esses dados no CONTEXTO DO VIAJANTE.

VOCÊ DEVE:
1. USAR todos os dados do quiz (datas, destino, orçamento, interesses) na sua resposta
2. NÃO re-perguntar informações que já estão no contexto
3. INICIAR imediatamente com sugestões baseadas nos dados fornecidos
4. Se dados de datas existem, CALCULAR os dias da semana reais

VOCÊ NÃO DEVE:
❌ Perguntar "qual a duração da viagem?" se já tem 'Duração: 7 dias' no contexto
❌ Perguntar "qual época do ano?" se já tem datas específicas no contexto
❌ Perguntar "quais seus interesses?" se já tem interesses listados

Se o usuário mencionou "customRequests" (pedidos especiais), esses são PRIORIDADE ABSOLUTA.
Por exemplo: "quero comer queijos" = INCLUA degustação de queijos nas sugestões.

FORMATO DA RESPOSTA:
1. Cumprimente brevemente e confirme que viu as preferências
2. Apresente imediatamente um pré-roteiro dia a dia baseado nos dados
3. Pergunte apenas se o viajante quer AJUSTAR algo no roteiro sugerido
```

---

### Fluxo Corrigido

```text
ANTES:
Quiz → "Olá, quero ir para Itália" → Sofia: "Qual a duração? Qual época?"

DEPOIS:
Quiz → "Olá! Datas: 15-22 março, Toscana, quero queijos, viagem romântica" 
     → Sofia: "Perfeito! Para sua viagem romântica de 7 dias pela Toscana 
               em março, preparei este roteiro:
               Dia 1 - 15/março (sábado): Florença...
               Dia 3: Degustação de queijos em Pienza..."
```

---

### Impacto Esperado

| Antes | Depois |
|-------|--------|
| Sofia pergunta datas novamente | Sofia usa datas do quiz |
| Sofia ignora pedidos especiais | Sofia inclui "queijos" no roteiro |
| Sofia sugere destino genérico | Sofia foca na Toscana |
| Conversa repetitiva | Conversa direta e útil |

---

### Riscos e Mitigação

| Risco | Mitigação |
|-------|-----------|
| Mensagem inicial muito longa | Limitar a dados essenciais (destino, datas, pedidos) |
| Dados do quiz incompletos | Verificar se campo existe antes de incluir |
| Sofia ainda ignorar contexto | Usar formatação enfática (emoji, CAPS) no prompt |
