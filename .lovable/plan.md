

# Plano: Configurar Variáveis de Ambiente no Netlify

## Diagnóstico Final

O erro "Falha temporária no servidor" acontece porque a função `generate-itinerary.ts` do Netlify não consegue acessar as variáveis de ambiente necessárias.

O código verifica na **linha 691-698**:
```typescript
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
if (!GOOGLE_GEMINI_API_KEY) {
  console.error("GOOGLE_GEMINI_API_KEY not configured");
  return {
    statusCode: 500,  // <-- Erro 500 retornado aqui
    body: JSON.stringify({ error: "API key não configurada" }),
  };
}
```

As API keys estão configuradas no **Lovable Cloud**, mas o Netlify é um ambiente separado e precisa de suas próprias variáveis.

---

## Variáveis Obrigatórias no Netlify

Você precisa adicionar estas variáveis no painel do Netlify:

| Variável | Onde Encontrar | Status |
|----------|----------------|--------|
| `VITE_SUPABASE_URL` | Seu projeto Supabase → Settings → API | ⚠️ Verificar |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Seu projeto Supabase → Settings → API (anon key) | ⚠️ Verificar |
| `SUPABASE_SERVICE_ROLE_KEY` | Seu projeto Supabase → Settings → API (service_role) | ✅ Você já adicionou |
| `GOOGLE_GEMINI_API_KEY` | Google AI Studio | ❌ **FALTA ADICIONAR** |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console | ⚠️ Verificar |

---

## Passo a Passo para Corrigir

### 1. Obter GOOGLE_GEMINI_API_KEY

1. Acesse: https://aistudio.google.com/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada

### 2. Adicionar no Netlify

1. No Netlify, vá em **Site configuration → Environment variables**
2. Adicione a variável `GOOGLE_GEMINI_API_KEY` com o valor da chave
3. Verifique se as outras variáveis existem:
   - `VITE_SUPABASE_URL` = `https://wedkggroqorsvgrshcdu.supabase.co`
   - `GOOGLE_PLACES_API_KEY` = sua chave do Google Places

### 3. Redeploy

Após adicionar todas as variáveis, faça um redeploy no Netlify (**Deploys → Trigger deploy → Deploy site**).

---

## Lista de Verificação das Variáveis

Me confirma quais dessas variáveis você **JÁ TEM** no Netlify:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (você disse que adicionou)
- [ ] `GOOGLE_GEMINI_API_KEY`
- [ ] `GOOGLE_PLACES_API_KEY`

---

## Resumo

O problema é **configuração de variáveis de ambiente**, não código. A função `generate-itinerary.ts` está correta, mas retorna erro 500 porque `GOOGLE_GEMINI_API_KEY` não está definida no Netlify.

