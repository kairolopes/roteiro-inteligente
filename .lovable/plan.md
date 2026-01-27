
# Plano: Adicionar GOOGLE_GEMINI_API_KEY no Netlify

## Diagnóstico Final

O erro "Falha temporária no servidor" acontece porque a função `generate-itinerary.ts` verifica se `GOOGLE_GEMINI_API_KEY` existe (linha 691-698) e retorna erro 500 se não encontrar:

```typescript
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
if (!GOOGLE_GEMINI_API_KEY) {
  console.error("GOOGLE_GEMINI_API_KEY not configured");
  return {
    statusCode: 500,  // <-- Aqui está o erro
    body: JSON.stringify({ error: "API key não configurada" }),
  };
}
```

## Solução

Você precisa criar uma chave da **Google AI Studio** (Gemini) e adicioná-la no Netlify.

---

## Passo a Passo

### 1. Criar chave no Google AI Studio

1. Acesse: https://aistudio.google.com/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada (começa com `AIza...`)

### 2. Adicionar no Netlify

1. Vá para o painel do Netlify → Seu site
2. **Site configuration → Environment variables**
3. Clique em **"Add a variable"**
4. Nome: `GOOGLE_GEMINI_API_KEY`
5. Valor: Cole a chave que você copiou do Google AI Studio

### 3. Fazer Redeploy

1. No Netlify, vá em **Deploys**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde o deploy finalizar

---

## Lista de Verificação Final

Após adicionar, você deve ter estas variáveis no Netlify:

| Variável | Status |
|----------|--------|
| `VITE_SUPABASE_URL` | ✅ Configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configurado |
| `GOOGLE_PLACES_API_KEY` | ✅ Configurado |
| `GOOGLE_GEMINI_API_KEY` | ❌ **ADICIONAR AGORA** |

---

## Por que são chaves diferentes?

- **Google Places API** (Cloud Console) - É uma API de geolocalização para buscar coordenadas, fotos e avaliações de lugares reais.

- **Google Gemini API** (AI Studio) - É a API de Inteligência Artificial que gera o roteiro de viagem baseado nas preferências do usuário.

São produtos diferentes do Google, por isso precisam de chaves separadas.

---

## Resumo

O código está correto. O problema é apenas **configuração**: falta a variável `GOOGLE_GEMINI_API_KEY` no Netlify.

Após adicionar e fazer redeploy, o roteiro será gerado normalmente.
