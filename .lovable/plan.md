

## Plano: Sistema de Conversas WhatsApp no Admin

### Visão Geral

Transformar a aba WhatsApp em um sistema de conversas estilo chat, onde você verá todas as pessoas que enviaram mensagens e poderá visualizar o histórico completo de cada conversa.

---

### Arquitetura

```text
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  WhatsApp       │ ──▶ │  Z-API               │ ──▶ │  Edge Function  │
│  (Clientes)     │     │  (Webhook)           │     │  zapi-webhook   │
└─────────────────┘     └──────────────────────┘     └────────┬────────┘
                                                              │
                                                              ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Admin Panel    │ ◀── │  Realtime            │ ◀── │  whatsapp_      │
│  (Conversas)    │     │  Subscription        │     │  messages       │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

---

### Etapa 1: Banco de Dados

Criar tabela `whatsapp_messages` para armazenar mensagens recebidas e enviadas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID único |
| phone | text | Número do contato |
| sender_name | text | Nome do remetente |
| sender_photo | text | URL da foto |
| message_id | text | ID da mensagem no WhatsApp |
| content | text | Conteúdo da mensagem |
| message_type | text | text, image, audio, video, document |
| media_url | text | URL da mídia (se houver) |
| direction | text | inbound (recebida) / outbound (enviada) |
| status | text | received, sent, read |
| created_at | timestamp | Data/hora |

**RLS Policies:**
- Admins podem ler/inserir mensagens
- Service role pode gerenciar todas

---

### Etapa 2: Edge Function - zapi-webhook

Criar função para receber webhooks do Z-API:

```typescript
// Endpoint: /functions/v1/zapi-webhook
// Validar token secreto: Ff94d05bcd8b546afb957fc52d8e33ebaS

POST body do Z-API:
{
  "phone": "5511999999999",
  "senderName": "João",
  "senderPhoto": "https://...",
  "messageId": "ABC123",
  "text": { "message": "Olá!" },
  "type": "ReceivedCallback",
  "fromMe": false
}

Ação:
1. Validar secret token
2. Inserir mensagem na tabela whatsapp_messages
3. Retornar 200 OK
```

---

### Etapa 3: Componentes de Interface

#### 3.1 Layout Principal (WhatsAppTab)

```text
┌─────────────────────────────────────────────────────────────┐
│  WhatsApp                                                    │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│  Conversas          │  Chat com João                        │
│  ┌───────────────┐  │  ┌─────────────────────────────────┐  │
│  │ João          │  │  │ João: Olá, tudo bem?            │  │
│  │ Última msg... │  │  │ Você: Oi! Tudo sim!             │  │
│  ├───────────────┤  │  │ João: Gostaria de saber...      │  │
│  │ Maria         │  │  └─────────────────────────────────┘  │
│  │ Última msg... │  │                                       │
│  ├───────────────┤  │  ┌─────────────────────────────────┐  │
│  │ Pedro         │  │  │ Digite sua mensagem...     [▶]  │  │
│  │ Última msg... │  │  └─────────────────────────────────┘  │
│  └───────────────┘  │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

#### 3.2 Novos Componentes

| Componente | Função |
|------------|--------|
| `ConversationList` | Lista de contatos com última mensagem |
| `ConversationView` | Histórico de mensagens do contato selecionado |
| `ChatMessage` | Bolha de mensagem (enviada/recebida) |
| `ChatInput` | Campo para enviar nova mensagem |

---

### Etapa 4: Atualizar MessageComposer

Modificar para enviar mensagem E salvar na tabela `whatsapp_messages` com direction = 'outbound'.

---

### Etapa 5: Realtime

Habilitar Realtime na tabela para atualizar conversas automaticamente:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
```

---

### Etapa 6: Configurar Webhook no Z-API

Após deploy, você precisará configurar no painel Z-API:

**URL do Webhook:**
```
https://rvmvoogyrafiogxdbisx.supabase.co/functions/v1/zapi-webhook
```

**Token de Segurança:** `Ff94d05bcd8b546afb957fc52d8e33ebaS`

---

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/zapi-webhook/index.ts` | Edge Function para receber mensagens |
| `src/components/admin/whatsapp/ConversationList.tsx` | Lista de conversas |
| `src/components/admin/whatsapp/ConversationView.tsx` | Chat com histórico |
| `src/components/admin/whatsapp/ChatMessage.tsx` | Componente de mensagem |
| `src/components/admin/whatsapp/ChatInput.tsx` | Input para enviar mensagem |

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/whatsapp/WhatsAppTab.tsx` | Novo layout com conversas |
| `supabase/functions/send-whatsapp/index.ts` | Salvar mensagens enviadas na tabela |

---

### Resultado Final

1. Ver lista de todas as pessoas que mandaram mensagem
2. Clicar em uma pessoa e ver o histórico completo
3. Responder diretamente na conversa
4. Novas mensagens aparecem em tempo real
5. Assinaturas automáticas por departamento mantidas

