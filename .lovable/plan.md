

# Integração Completa Hotmart + Sofia Admin

## Visão Geral

Vamos conectar sua plataforma admin ao **Hotmart** para que toda compra realizada lá:
1. **Cadastre automaticamente** o cliente na base de dados
2. **Adicione créditos/assinatura** conforme o produto comprado
3. **Envie mensagem de boas-vindas** via WhatsApp automaticamente
4. Permita que você **gerencie tudo** pelo painel administrativo

---

## O que será criado

| Componente | Função |
|------------|--------|
| **Edge Function `hotmart-webhook`** | Recebe eventos do Hotmart (compras, reembolsos, assinaturas) |
| **Tabela `hotmart_purchases`** | Registra todas as compras do Hotmart |
| **Tabela `hotmart_products`** | Mapeia produtos Hotmart → créditos/assinaturas |
| **Aba "Hotmart" no Admin** | Visualizar compras, produtos e configurações |
| **Automação WhatsApp** | Mensagem automática para novos clientes |

---

## Fluxo de Funcionamento

```text
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│    HOTMART      │      │   EDGE FUNCTION      │      │   DATABASE      │
│                 │      │   hotmart-webhook    │      │                 │
│  Compra         │─────▶│  1. Valida hottok    │─────▶│ profiles        │
│  Aprovada       │      │  2. Cria/atualiza    │      │ user_credits    │
│                 │      │     cliente          │      │ hotmart_purchases│
└─────────────────┘      │  3. Adiciona créditos│      └─────────────────┘
                         │  4. Envia WhatsApp   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   WHATSAPP (Z-API)   │
                         │  "Bem-vindo, Nome!"  │
                         └──────────────────────┘
```

---

## Detalhes Técnicos

### 1. Novas Tabelas no Banco de Dados

**Tabela `hotmart_products`** - Mapeia produtos para ações:
```sql
- id (uuid, PK)
- hotmart_product_id (text) -- ID do produto no Hotmart
- product_ucode (text) -- ucode do produto
- name (text) -- Nome do produto
- credits_to_add (integer) -- Créditos a adicionar
- subscription_type (text) -- 'monthly', 'annual', ou null
- subscription_days (integer) -- Duração em dias
- welcome_message (text) -- Mensagem WhatsApp personalizada
- is_active (boolean)
- created_at, updated_at
```

**Tabela `hotmart_purchases`** - Histórico de compras:
```sql
- id (uuid, PK)
- hotmart_transaction_id (text, unique)
- hotmart_product_id (text)
- buyer_email (text)
- buyer_name (text)
- buyer_phone (text)
- user_id (uuid, nullable) -- Vinculado ao profile
- amount (decimal)
- currency (text)
- status (text) -- approved, cancelled, refunded
- event_type (text) -- PURCHASE_APPROVED, etc
- raw_data (jsonb) -- Dados completos do webhook
- created_at
```

### 2. Edge Function `hotmart-webhook`

Processa eventos do Hotmart:
- **PURCHASE_APPROVED**: Cria cliente + adiciona créditos + WhatsApp
- **PURCHASE_COMPLETE**: Confirma compra finalizada
- **PURCHASE_CANCELLED/REFUNDED**: Remove créditos
- **SUBSCRIPTION_CANCELLATION**: Cancela assinatura

Segurança:
- Valida `X-HOTMART-HOTTOK` no header
- Usa secret `HOTMART_HOTTOK` para verificação

### 3. Nova Aba "Hotmart" no Admin

Três seções:
1. **Compras** - Lista de todas as transações
2. **Produtos** - Configurar mapeamento produto → créditos
3. **Configuração** - URL do webhook e status

### 4. Automação de Cadastro

Quando uma compra é aprovada:
1. Verifica se email já existe em `profiles`
2. Se não existe, cria profile usando dados do Hotmart
3. Cria/atualiza `user_credits` com os créditos do produto
4. Envia WhatsApp de boas-vindas (se telefone disponível)
5. Adiciona tag "Hotmart" ao cliente

---

## Configuração Necessária

### Secret Novo
- **`HOTMART_HOTTOK`** - Token de segurança do Hotmart (encontrado no painel Hotmart → Webhooks)

### URL do Webhook no Hotmart
```
https://rvmvoogyrafiogxdbisx.supabase.co/functions/v1/hotmart-webhook
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/hotmart-webhook/index.ts` | CRIAR - Edge function |
| `src/components/admin/hotmart/HotmartTab.tsx` | CRIAR - Aba principal |
| `src/components/admin/hotmart/PurchasesList.tsx` | CRIAR - Lista de compras |
| `src/components/admin/hotmart/ProductsConfig.tsx` | CRIAR - Configuração de produtos |
| `src/components/admin/hotmart/HotmartSettings.tsx` | CRIAR - Configurações |
| `src/pages/Admin.tsx` | MODIFICAR - Adicionar aba Hotmart |
| `src/components/admin/AdminSidebar.tsx` | MODIFICAR - Menu Hotmart |
| Migração SQL | CRIAR - Novas tabelas |

---

## Benefícios

- **Zero trabalho manual**: Clientes cadastrados automaticamente
- **Conversão imediata**: WhatsApp de boas-vindas engaja o cliente
- **Controle total**: Veja todas as vendas no mesmo painel
- **Flexibilidade**: Configure diferentes produtos com diferentes créditos
- **Rastreabilidade**: Histórico completo de transações

