## Plano de Correção: Sincronizar Função Netlify com Edge Function do Supabase

### ✅ CONCLUÍDO

A função `netlify/functions/generate-itinerary.ts` foi completamente reescrita para ter paridade com a Edge Function do Supabase.

### Mudanças Implementadas

1. **System Prompt Completo** (~60 linhas)
   - Hierarquia de prioridade (conversa > datas > quiz > sugestões)
   - Regras críticas de duração
   - Instruções detalhadas sobre coordenadas [lat, lng]
   - Regras de datas reais

2. **Cálculo Correto de Duração**
   - Usa `quizAnswers.duration` (weekend, week, twoweeks, month, flexible)
   - Não depende mais de datas inexistentes

3. **Tool Calling Implementado**
   - Estrutura completa de tool calling para resultados estruturados
   - Fallback para extração de JSON do conteúdo

4. **Todos os Destinos Suportados (20+)**
   - Américas: Brasil, Argentina, Peru, EUA, México, Canadá
   - Europa: Itália, França, Espanha, Portugal, Grécia, Holanda, Alemanha, Suíça
   - Ásia: Japão, Tailândia, Indonésia
   - Oceania: Austrália
   - Oriente Médio/África: Emirados Árabes, Egito, Marrocos, África do Sul

5. **Campos Adicionais Processados**
   - `quizAnswers.destinations` (array de múltiplos destinos)
   - `quizAnswers.destinationDetails` (regiões específicas)
   - `quizAnswers.customRequests` (pedidos especiais - prioridade máxima)
   - `quizAnswers.startDate` (data real de início com calendário)

6. **Conversa Sofia com Prioridade Máxima**
   - `conversationSummary` incluído com instruções detalhadas
   - Regras obrigatórias para cidades, bairros, restaurantes, atrações

7. **Coordenadas no Formato Correto**
   - Mudou de `{ lat, lng }` para `[lat, lng]`

8. **Validação e Ajuste de Dias**
   - Corta/ajusta dias para corresponder à duração esperada
