

## Plano: Corrigir Envio de Mensagens WhatsApp

### Problema Identificado

O Z-API retornou erro `"your client-token is not configured"`. Isso significa que a API agora exige um **Client-Token** adicional no header das requisições HTTP.

---

### O que é o Client-Token?

O Client-Token é uma chave de segurança adicional do Z-API que você encontra no painel da instância. É diferente do token que já está na URL.

---

### Etapa 1: Adicionar Novo Secret

Você precisará fornecer o **Client-Token** do Z-API:

1. Acesse seu painel Z-API
2. Vá na instância conectada
3. Copie o **Client-Token** (geralmente visível junto com Instance ID e Token)
4. Vou solicitar para você adicionar esse secret

---

### Etapa 2: Atualizar Edge Function

Modificar `supabase/functions/send-whatsapp/index.ts` para incluir o Client-Token no header:

```typescript
// Antes (linhas 41-50)
const zapiResponse = await fetch(zapiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({...}),
});

// Depois
const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

const zapiResponse = await fetch(zapiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Client-Token": zapiClientToken || "",
  },
  body: JSON.stringify({...}),
});
```

---

### Sobre a Assinatura

Você mencionou que deveria aparecer seu nome "Tecnologia" como assinatura. Isso já está implementado no `useAdminAuth` hook, mas preciso verificar:

1. Se você tem um perfil na tabela `admin_users`
2. Se o `signature_type` está configurado como 'personal' ou 'department'
3. Se o `display_name` ou `custom_signature` está preenchido

Após aprovar, vou também verificar sua configuração de assinatura.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-whatsapp/index.ts` | Adicionar header Client-Token |

### Secrets a Adicionar

| Secret | Descrição |
|--------|-----------|
| `ZAPI_CLIENT_TOKEN` | Token de cliente do Z-API |

---

### Resultado

1. Mensagens serão enviadas corretamente via Z-API
2. Assinatura aparecerá conforme seu perfil de admin

