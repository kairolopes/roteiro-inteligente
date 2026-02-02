

# Trocar Gemini por ChatGPT 4o Mini

## Resposta Curta

**SIM, é possível!** As APIs do Google Places, Google Maps e outras integrações de mapeamento usam uma chave diferente (`GOOGLE_PLACES_API_KEY`) e não serão afetadas. A IA de chat/geração de roteiros usa `GOOGLE_GEMINI_API_KEY`, que pode ser substituída.

---

## O Que Muda vs O Que Permanece

| Componente | API Key Atual | Ação |
|------------|---------------|------|
| Chat com Sofia | `GOOGLE_GEMINI_API_KEY` | Trocar para OpenAI |
| Geração de Roteiros | `GOOGLE_GEMINI_API_KEY` | Trocar para OpenAI |
| Google Places (validação de lugares) | `GOOGLE_PLACES_API_KEY` | Manter igual |
| Mapas/Coordenadas | `GOOGLE_PLACES_API_KEY` | Manter igual |

---

## Opção Recomendada: Usar Lovable AI Gateway

O projeto já tem o `LOVABLE_API_KEY` configurado. Esse gateway dá acesso a modelos OpenAI **sem precisar de uma chave da OpenAI separada**.

### Modelos Disponíveis via Lovable AI

- `openai/gpt-5-mini` - Equivalente melhorado do GPT-4o mini
- `openai/gpt-5-nano` - Mais rápido e econômico
- `openai/gpt-5` - Mais capaz (equivalente ao GPT-4)

---

## Arquivos a Modificar

### 1. `supabase/functions/chat-travel/index.ts`

**Antes (Gemini):**
```typescript
const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

const response = await fetchWithFallback(
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  ...
);
```

**Depois (OpenAI via Lovable AI):**
```typescript
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-5-mini", // ou gpt-5-nano
    messages: [...],
    stream: true,
  }),
});
```

### 2. `supabase/functions/generate-itinerary/index.ts`

Mesma mudança:
- Substituir `GOOGLE_GEMINI_API_KEY` por `LOVABLE_API_KEY`
- Mudar URL para `https://ai.gateway.lovable.dev/v1/chat/completions`
- Usar modelo `openai/gpt-5-mini`

### 3. `netlify/functions/chat-travel.ts` (Produção)

Se o site de produção usa Netlify Functions, também precisará atualizar essa função.

---

## Mudanças Técnicas Detalhadas

### A. Atualizar `chat-travel/index.ts`

1. Trocar variável de ambiente:
   ```typescript
   const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
   if (!LOVABLE_API_KEY) {
     throw new Error("LOVABLE_API_KEY is not configured");
   }
   ```

2. Simplificar `fetchWithFallback` para usar um único modelo:
   ```typescript
   const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${LOVABLE_API_KEY}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       model: "openai/gpt-5-mini",
       messages: [
         { role: "system", content: systemPrompt },
         ...messages,
       ],
       stream: true,
     }),
   });
   ```

3. O tratamento de streaming SSE já é compatível (OpenAI e Gemini usam o mesmo formato)

### B. Atualizar `generate-itinerary/index.ts`

1. Mesma troca de API key e endpoint
2. Atualizar array `AI_MODELS`:
   ```typescript
   const AI_MODELS = ["openai/gpt-5-mini", "openai/gpt-5-nano"];
   ```
3. Atualizar `callAIGateway` para usar novo endpoint

### C. Netlify Functions (Produção)

Para o site de produção no Netlify:
- Adicionar `LOVABLE_API_KEY` nas variáveis de ambiente do Netlify
- Atualizar os arquivos em `netlify/functions/`

---

## Impacto

| Aspecto | Resultado |
|---------|-----------|
| Google Places | Sem mudança, continua funcionando |
| Google Maps/Coordenadas | Sem mudança, continua funcionando |
| Qualidade das respostas | Similar ou melhor (GPT-5-mini é bem capaz) |
| Custo | Usa créditos do Lovable AI (já incluídos) |
| Latência | Geralmente mais rápido que Gemini |

---

## Resumo

A migração é simples porque:
1. As APIs do Google (Places, Maps) usam uma chave separada
2. O projeto já tem `LOVABLE_API_KEY` configurado
3. O formato de resposta streaming é compatível entre Gemini e OpenAI
4. Só precisamos mudar 2-3 arquivos de Edge Functions

