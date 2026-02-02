

# Usar OpenAI Diretamente (Sem Lovable AI Gateway)

## O Que Você Precisa

1. **Conta na OpenAI**: https://platform.openai.com/signup
2. **API Key da OpenAI**: Gerar em https://platform.openai.com/api-keys
3. **Créditos**: A OpenAI cobra por uso (aproximadamente $0.15 por 1M tokens de input)

---

## Configuração

### 1. Adicionar Secret no Lovable Cloud

Para as Edge Functions (chat-travel e generate-itinerary):
- Ir em **Settings > Cloud > Secrets**
- Adicionar: `OPENAI_API_KEY` = sua chave da OpenAI (começa com `sk-...`)

### 2. Adicionar no Netlify (Produção)

- Ir em **Site configuration > Environment variables**
- Adicionar: `OPENAI_API_KEY` = mesma chave

---

## Arquivos a Modificar

### 1. `supabase/functions/chat-travel/index.ts`

**Mudanças:**
```typescript
// Trocar de:
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", ...);
body: { model: "openai/gpt-5-mini", ... }

// Para:
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const response = await fetch("https://api.openai.com/v1/chat/completions", ...);
body: { model: "gpt-4o-mini", ... }
```

### 2. `supabase/functions/generate-itinerary/index.ts`

**Mudanças:**
```typescript
// Trocar AI_MODELS de:
const AI_MODELS = ["openai/gpt-5-mini", "openai/gpt-5-nano"];

// Para:
const AI_MODELS = ["gpt-4o-mini", "gpt-4o-mini"]; // fallback igual

// Trocar endpoint de:
"https://ai.gateway.lovable.dev/v1/chat/completions"

// Para:
"https://api.openai.com/v1/chat/completions"

// Trocar variável de:
LOVABLE_API_KEY

// Para:
OPENAI_API_KEY
```

### 3. `netlify/functions/chat-travel.ts`

**Mudanças:**
```typescript
// Trocar de:
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", ...);
body: { model: "openai/gpt-5-mini", ... }

// Para:
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const response = await fetch("https://api.openai.com/v1/chat/completions", ...);
body: { model: "gpt-4o-mini", ... }
```

---

## Comparação: Lovable AI vs OpenAI Direto

| Aspecto | Lovable AI Gateway | OpenAI Direto |
|---------|-------------------|---------------|
| API Key | Automática (LOVABLE_API_KEY) | Sua própria (OPENAI_API_KEY) |
| Cobrança | Créditos Lovable | Sua conta OpenAI |
| Modelos | openai/gpt-5-mini | gpt-4o-mini |
| Endpoint | ai.gateway.lovable.dev | api.openai.com |
| Controle | Limitado | Total |

---

## Passos de Implementação

1. **Você cria a API Key na OpenAI** (preciso que você faça isso)
2. **Adiciona como secret** via ferramenta do Lovable
3. **Eu modifico os 3 arquivos** para usar OpenAI direto
4. **Deploy automático** das Edge Functions
5. **Você adiciona no Netlify** para produção

---

## Próximo Passo

Quando você tiver a API Key da OpenAI (formato `sk-proj-...` ou `sk-...`), me avise e eu:
1. Peço para você adicionar como secret
2. Modifico o código para usar OpenAI diretamente

