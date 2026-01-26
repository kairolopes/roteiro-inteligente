

## Plano de Correção: Sincronizar Função Netlify com Edge Function do Supabase

### Diagnóstico

A versão **Netlify** da função `generate-itinerary` está muito mais simples que a versão **Supabase Edge Function**, causando roteiros menores e menos detalhados em produção.

### Comparação das Diferenças

| Aspecto | Supabase (correto) | Netlify (problema) |
|---------|-------------------|-------------------|
| Prompt | ~60 linhas detalhadas com hierarquia de prioridade | ~45 linhas básicas |
| Método AI | Tool calling (estruturado) | JSON texto livre |
| Duração | Usa campo `duration` (weekend, week, etc.) | Tenta calcular por datas inexistentes |
| Contexto conversa | Prioridade máxima, instruções detalhadas | Simples menção |
| Pedidos especiais | Suporta `customRequests`, `destinationDetails` | Ignora |
| Destinos | Suporta 20+ países | Apenas 9 países europeus |
| Coordenadas | Exige arrays [lat, lng] | Usa objetos {lat, lng} |

### Arquivos a Modificar

1. **`netlify/functions/generate-itinerary.ts`** - Atualizar completamente

### Detalhes da Implementação

#### 1. Atualizar o System Prompt
Copiar o prompt completo da versão Supabase incluindo:
- Hierarquia de prioridade (conversa > quiz > sugestões)
- Regras críticas de duração
- Instruções detalhadas sobre coordenadas
- Regras de datas reais

#### 2. Corrigir Cálculo de Duração
```typescript
// DE (errado):
let numDays = 7;
if (quizAnswers.dates?.startDate && quizAnswers.dates?.endDate) { ... }

// PARA (correto):
const durationLabels: Record<string, number> = {
  weekend: 4, week: 7, twoweeks: 14, month: 21, flexible: 7
};
const numDays = durationLabels[quizAnswers?.duration] || 7;
```

#### 3. Adicionar Suporte a Tool Calling
Implementar a mesma estrutura de tool calling que o Supabase usa para obter resultados mais estruturados e confiáveis.

#### 4. Expandir Labels de Destinos
Adicionar todos os 20+ destinos suportados (Brasil, Japão, Tailândia, etc.)

#### 5. Processar Campos Adicionais
- `quizAnswers.destinations` (array de múltiplos destinos)
- `quizAnswers.destinationDetails` (regiões específicas)
- `quizAnswers.customRequests` (pedidos especiais)
- `quizAnswers.startDate` (data real de início)

#### 6. Melhorar Contexto da Conversa
Incluir o `conversationSummary` com instruções de prioridade máxima, igual ao Supabase.

#### 7. Ajustar Formato de Coordenadas
Mudar de `{ lat, lng }` para `[lat, lng]` para compatibilidade com o mapa.

### Impacto Esperado

Após a correção:
- Roteiros terão o número correto de dias baseado no campo `duration`
- Atividades mais detalhadas com 3-5 por dia
- Coordenadas funcionarão corretamente no mapa
- Pedidos especiais e conversa com Sofia serão respeitados
- Roteiros para qualquer destino global (não apenas Europa)

### Riscos e Mitigação

- **Risco**: Quebrar produção
- **Mitigação**: Manter fallback de modelos AI e tratamento de erros

