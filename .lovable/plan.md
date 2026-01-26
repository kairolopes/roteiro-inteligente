

## Plano: Assinatura em Negrito e Antes da Mensagem

### Alteração Identificada

**Arquivo: `supabase/functions/send-whatsapp/index.ts`**

Na linha 62, a ordem está:
```
mensagem

assinatura
```

Precisa ser:
```
*assinatura*

mensagem
```

### Correção Necessária

**Linha 62 - De:**
```typescript
const finalMessage = signature ? `${message}\n\n${signature}` : message;
```

**Para:**
```typescript
const finalMessage = signature ? `*${signature}*\n\n${message}` : message;
```

### Explicação

| Mudança | Antes | Depois |
|---------|-------|--------|
| Ordem | `mensagem + assinatura` | `assinatura + mensagem` |
| Formatação | texto normal | `*negrito*` (WhatsApp) |

### Resultado Esperado

Quando você enviar "teste", a mensagem no WhatsApp será:

```
*Kairo Lopes - Tecnologia*

teste
```

Que aparecerá como:

**Kairo Lopes - Tecnologia**

teste

### Arquivo a Modificar

1. **`supabase/functions/send-whatsapp/index.ts`** (linha 62)
   - Inverter ordem: assinatura primeiro
   - Adicionar asteriscos para negrito: `*${signature}*`

