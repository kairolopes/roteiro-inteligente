

## Plano: Corrigir Assinatura nas Mensagens WhatsApp

### Problema Identificado

O frontend está enviando o campo errado para identificar o admin:

| Local | Campo Enviado | Campo Esperado |
|-------|--------------|----------------|
| Frontend (WhatsAppTab.tsx) | `adminProfile?.id` (ID da tabela) | `adminProfile?.user_id` (UUID do auth) |
| Edge Function | Busca por `user_id` | Recebe o `id` da tabela |

**Resultado**: A query não encontra nenhum perfil, então `signature` fica vazia.

---

### Correção Necessária

Alterar **uma linha** no arquivo `src/components/admin/whatsapp/WhatsAppTab.tsx`:

**Linha 113 - De:**
```typescript
admin_user_id: adminProfile?.id,
```

**Para:**
```typescript
admin_user_id: adminProfile?.user_id,
```

---

### Arquivos a Modificar

1. **`src/components/admin/whatsapp/WhatsAppTab.tsx`** (linha 113)
   - Trocar `adminProfile?.id` por `adminProfile?.user_id`

2. **`src/components/admin/whatsapp/MessageComposer.tsx`** (linha 58) - mesmo problema
   - Trocar `adminProfile?.id` por `adminProfile?.user_id`

---

### Por que isso vai funcionar

- O `adminProfile` contém `user_id: "645d964d-3b1d-4268-946e-90ec8fc66ba1"` (seu UUID real)
- A Edge Function busca na tabela `admin_users` pelo campo `user_id`
- Com essa correção, a busca vai encontrar seu perfil e aplicar a assinatura `"- Equipe Tecnologia Sofia 💻"`

