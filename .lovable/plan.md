
## Plano: Corrigir Assinatura WhatsApp - "Kairo Lopes - Tecnologia"

### Problemas Identificados

1. **Assinatura duplicada**: Frontend e Edge Function estão aplicando assinatura
2. **Formato errado**: Configurado "- Equipe Tecnologia Sofia 💻" quando deveria ser "Kairo Lopes - Tecnologia"
3. **Departamento errado**: "administracao" ao invés de um departamento personalizado

### Solução

#### Parte 1: Atualizar perfil no banco de dados

Atualizar seu perfil `admin_users` com:

| Campo | Valor Atual | Novo Valor |
|-------|------------|------------|
| `display_name` | "Kairo" | "Kairo Lopes" |
| `custom_signature` | "- Equipe Tecnologia Sofia 💻" | "Kairo Lopes - Tecnologia" |

```sql
UPDATE admin_users 
SET 
  display_name = 'Kairo Lopes',
  custom_signature = 'Kairo Lopes - Tecnologia'
WHERE user_id = '645d964d-3b1d-4268-946e-90ec8fc66ba1';
```

#### Parte 2: Remover duplicação de assinatura

O frontend **não deve** adicionar assinatura porque a Edge Function já faz isso.

**Arquivo: `src/components/admin/whatsapp/WhatsAppTab.tsx`**
- Linha 105-106: Remover adição de assinatura no frontend
- Enviar apenas `content` para a Edge Function (sem assinatura)

**De:**
```typescript
const signature = getSignature();
const fullMessage = signature ? `${content}\n\n${signature}` : content;
// ...
message: fullMessage,
```

**Para:**
```typescript
// Edge Function aplica a assinatura automaticamente
// ...
message: content,
```

**Arquivo: `src/components/admin/whatsapp/MessageComposer.tsx`**
- Mesma correção nas linhas 54-62

### Resultado Esperado

Após as correções, quando você enviar "ola", a mensagem final será:

```
ola

Kairo Lopes - Tecnologia
```

### Arquivos a Modificar

1. **Banco de dados**: UPDATE na tabela `admin_users`
2. **`src/components/admin/whatsapp/WhatsAppTab.tsx`**: Remover assinatura duplicada (linhas 105-106, 112)
3. **`src/components/admin/whatsapp/MessageComposer.tsx`**: Remover assinatura duplicada (linhas 54-58, 63)
