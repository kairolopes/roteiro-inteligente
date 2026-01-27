
# Correção: Edge Function de Geração de Roteiro Falhando

## Problema Identificado

Os logs mostram dois problemas distintos:

### 1. Modelo de Fallback Descontinuado
```
ERROR AI Gateway error (gemini-1.5-pro): 404
"models/gemini-1.5-pro is not found for API version v1main"
```
O modelo `gemini-1.5-pro` foi descontinuado pela Google e não existe mais.

### 2. Respostas Mal Formatadas
```json
"finish_reason": "function_call_filter: MALFORMED_FUNCTION_CALL"
```
O modelo `gemini-2.0-flash` está gerando respostas com tool calls mal formatados. Como o fallback falha, retorna erro 500.

---

## Solução

### Fase 1: Atualizar Modelos de IA

Trocar a lista de modelos para usar modelos válidos e atuais:

```text
Antes:  ["gemini-2.0-flash", "gemini-1.5-pro"]
Depois: ["gemini-2.5-flash", "gemini-2.0-flash"]
```

Os modelos válidos em 2026:
- `gemini-2.5-flash` - Modelo rápido e confiável (primário)
- `gemini-2.0-flash` - Fallback

### Fase 2: Melhorar Tratamento de Respostas Malformadas

Adicionar lógica para fazer retry quando receber `MALFORMED_FUNCTION_CALL`:
1. Detectar o erro específico na resposta
2. Tentar novamente com o mesmo modelo (até 2 tentativas)
3. Só então passar para o próximo modelo

### Fase 3: Simplificar Schema do Tool Call

O schema atual é muito complexo (linhas 496-568). Simplificar pode reduzir erros:
1. Remover campos opcionais desnecessários
2. Tornar alguns campos menos restritivos

---

## Mudanças Técnicas

### Arquivo: `supabase/functions/generate-itinerary/index.ts`

**Linha 205 - Atualizar modelos:**
```typescript
// Antes
const AI_MODELS = ["gemini-2.0-flash", "gemini-1.5-pro"];

// Depois
const AI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
```

**Função `callAIGateway` (linhas 207-258) - Detectar MALFORMED_FUNCTION_CALL:**
```typescript
// Adicionar detecção do erro específico
const finishReason = data.choices?.[0]?.finish_reason;
if (finishReason?.includes("MALFORMED_FUNCTION_CALL")) {
  console.log(`Malformed function call from ${model}, will retry...`);
  return { success: false, error: "MALFORMED_FUNCTION_CALL", retryable: true };
}
```

**Loop de modelos (linhas 590-660) - Adicionar retry interno:**
```typescript
// Para cada modelo, tentar até 2 vezes antes de ir para o próximo
for (const model of AI_MODELS) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await callAIGateway(...);
    
    if (result.success && result.data) {
      itinerary = extractItineraryFromResponse(result.data);
      if (itinerary) break;
    }
    
    // Se não for retryable, não tentar de novo
    if (!result.retryable) break;
  }
  if (itinerary) break;
}
```

---

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| gemini-2.0-flash falha com MALFORMED | Tenta gemini-2.5-flash primeiro |
| gemini-1.5-pro retorna 404 | gemini-2.0-flash como fallback válido |
| Erro 500 | Retry automático em caso de resposta mal formatada |

---

## Sequência de Implementação

1. Atualizar lista `AI_MODELS` para modelos válidos
2. Adicionar detecção de `MALFORMED_FUNCTION_CALL` na resposta
3. Implementar retry interno por modelo (2 tentativas)
4. Deploy da Edge Function
5. Testar geração de roteiro
