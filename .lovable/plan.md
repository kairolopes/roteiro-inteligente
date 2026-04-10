

## Migrar chat da Sofia para Gemini via Lovable AI

O chat da Sofia será migrado da API do ChatGPT (OpenAI) para o Gemini, usando o Lovable AI Gateway que já está configurado no projeto.

**Por que usar o Lovable AI Gateway em vez da chave direta?**
- A chave `LOVABLE_API_KEY` já está configurada e funcionando
- Gerenciamento automático de billing e rate limits
- Não precisa expor chaves de API no código

### Mudanças

**1. Edge Function `supabase/functions/chat-travel/index.ts`**
- Trocar URL de `api.openai.com` para `ai.gateway.lovable.dev`
- Trocar `OPENAI_API_KEY` por `LOVABLE_API_KEY`
- Trocar modelo de `gpt-4o-mini` para `google/gemini-2.5-flash`
- Manter todos os prompts e lógica de contexto do quiz intactos

**2. Roteamento `src/lib/apiRouting.ts`**
- Atualizar `getChatUrl()` para sempre usar a Edge Function do Lovable Cloud (igual ao `getGenerateItineraryUrl`)
- Isso resolve o problema do "OCUPADO" no domínio viagecomsofia.com

**3. Chat page `src/pages/Chat.tsx`**
- Atualizar headers para usar `VITE_SUPABASE_PUBLISHABLE_KEY` ao chamar a Edge Function

### Resultado
- Sofia volta a funcionar em todos os domínios
- Usa Gemini (mais rápido e sem limite de rate da OpenAI)
- Sem custo adicional de API da OpenAI

