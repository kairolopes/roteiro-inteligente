

## Plano: Adicionar Client-Token ao Envio de WhatsApp

### Resumo

Agora que você identificou o Client-Token (`CC91F1EC21501AFE9182A3BC`), vou implementar a correção na Edge Function para resolver o erro "your client-token is not configured".

---

### Etapa 1: Adicionar Secret

Você precisará adicionar o secret `ZAPI_CLIENT_TOKEN` com o valor que você encontrou.

---

### Etapa 2: Atualizar Edge Function

Modificar `supabase/functions/send-whatsapp/index.ts` (linhas 40-50):

**Antes:**
```typescript
const zapiResponse = await fetch(zapiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phone: formattedPhone,
    message: message,
  }),
});
```

**Depois:**
```typescript
const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

const zapiResponse = await fetch(zapiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Client-Token": zapiClientToken || "",
  },
  body: JSON.stringify({
    phone: formattedPhone,
    message: message,
  }),
});
```

---

### Etapa 3: Verificar Assinatura

Após a correção do envio, vou verificar sua configuração na tabela `admin_users` para garantir que a assinatura "Tecnologia" apareça corretamente nas mensagens.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-whatsapp/index.ts` | Adicionar header Client-Token |

### Secrets a Adicionar

| Secret | Valor |
|--------|-------|
| `ZAPI_CLIENT_TOKEN` | `CC91F1EC21501AFE9182A3BC` |

---

### Resultado Esperado

1. ✅ Mensagens WhatsApp serão enviadas com sucesso
2. ✅ Assinatura do admin aparecerá nas mensagens (após verificação)

