
## Painel Admin CRM - Viage com Sofía

### Visão Geral

Criação de uma página administrativa separada (`/admin`) com sistema completo de CRM para gestão de clientes, integração WhatsApp via Z-API, e controle de assinaturas personalizadas por departamento.

---

### Estrutura de Departamentos

| Departamento | Assinatura Padrão |
|--------------|-------------------|
| Suporte | - Equipe Suporte Sofia 💜 |
| Vendas | - Equipe Vendas Sofia 🎯 |
| Administração | - Administração Sofia ⚙️ |
| Financeiro | - Equipe Financeiro Sofia 💰 |
| Marketing | - Equipe Marketing Sofia 📢 |

Cada atendente poderá escolher entre:
- Assinatura do departamento
- Assinatura pessoal (Ex: "- Kairo Lopes (Suporte)")

---

### Arquitetura da Página Admin

```text
/admin
├── Dashboard (visão geral)
│   ├── Métricas: clientes ativos, vendas, leads
│   └── Atividade recente
│
├── Clientes (CRM)
│   ├── Lista com busca e filtros
│   ├── Tags (VIP, Novo, Suporte, Potencial)
│   ├── Notas internas
│   └── Histórico de notificações
│
├── WhatsApp (Z-API)
│   ├── Envio de mensagens manuais
│   ├── Templates configuráveis
│   ├── Seleção de assinatura
│   └── Histórico de mensagens
│
├── Leads (Landing Pages)
│   ├── Lista de leads capturados
│   ├── Status de conversão
│   └── UTM tracking
│
├── Integrações
│   ├── Z-API (configuração)
│   ├── Hotmart webhook
│   └── Status de conexões
│
└── Configurações
    ├── Perfil do atendente
    ├── Assinatura personalizada
    └── Departamento
```

---

### Novas Tabelas do Banco de Dados

#### 1. `admin_users` - Perfil de administradores
```sql
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN ('suporte', 'vendas', 'administracao', 'financeiro', 'marketing')),
  signature_type TEXT NOT NULL DEFAULT 'department' CHECK (signature_type IN ('department', 'personal')),
  custom_signature TEXT,
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

#### 2. `admin_activity_logs` - Log de atividades
```sql
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Componentes React

| Componente | Descrição |
|------------|-----------|
| `AdminLayout.tsx` | Layout principal com sidebar e header |
| `AdminGuard.tsx` | Proteção de rota - verifica role admin |
| `AdminSidebar.tsx` | Menu lateral com navegação entre seções |
| `DashboardTab.tsx` | Métricas e atividade recente |
| `CustomersTab.tsx` | Lista de clientes com CRM |
| `CustomerCard.tsx` | Card expandível com detalhes do cliente |
| `WhatsAppTab.tsx` | Interface de envio de mensagens |
| `MessageComposer.tsx` | Composição de mensagem com assinatura |
| `LeadsTab.tsx` | Gestão de leads |
| `IntegrationsTab.tsx` | Configuração de integrações |
| `SettingsTab.tsx` | Configurações do atendente |

---

### Fluxo de Assinatura WhatsApp

```text
1. Atendente acessa /admin/whatsapp
2. Seleciona cliente ou digita número
3. Escolhe template ou escreve mensagem
4. Sistema adiciona assinatura automaticamente:
   
   Se signature_type = 'department':
   └── "- Equipe {Departamento} Sofia {emoji}"
   
   Se signature_type = 'personal':
   └── "- {Nome} ({Departamento})"
   
5. Preview da mensagem completa
6. Envio via Z-API
7. Log em notification_logs
```

---

### Edge Functions

#### 1. `send-whatsapp` (nova)
```typescript
// Envia mensagem via Z-API com assinatura
POST /functions/v1/send-whatsapp
{
  phone: string,
  message: string,
  template_name?: string,
  variables?: object,
  admin_user_id: string
}

// Busca configuração do admin
// Adiciona assinatura baseada em department/signature_type
// Envia via Z-API
// Registra em notification_logs
```

#### 2. `admin-dashboard` (nova)
```typescript
// Retorna métricas para o dashboard
GET /functions/v1/admin-dashboard

Response:
{
  total_customers: number,
  active_subscriptions: number,
  total_revenue: number,
  leads_this_week: number,
  recent_activity: Activity[]
}
```

---

### Estrutura de Arquivos

```text
src/
├── pages/
│   └── Admin.tsx                    # Página principal /admin
│
├── components/admin/
│   ├── AdminLayout.tsx              # Layout com sidebar
│   ├── AdminGuard.tsx               # Proteção de acesso
│   ├── AdminSidebar.tsx             # Menu lateral
│   │
│   ├── dashboard/
│   │   ├── DashboardTab.tsx         # Tab principal
│   │   ├── MetricCard.tsx           # Card de métrica
│   │   └── ActivityFeed.tsx         # Feed de atividades
│   │
│   ├── customers/
│   │   ├── CustomersTab.tsx         # Lista de clientes
│   │   ├── CustomerCard.tsx         # Card expandível
│   │   ├── CustomerNotes.tsx        # Notas do cliente
│   │   └── CustomerTags.tsx         # Tags do cliente
│   │
│   ├── whatsapp/
│   │   ├── WhatsAppTab.tsx          # Interface principal
│   │   ├── MessageComposer.tsx      # Composição de msg
│   │   ├── TemplateSelector.tsx     # Seleção de template
│   │   └── SignaturePreview.tsx     # Preview de assinatura
│   │
│   ├── leads/
│   │   └── LeadsTab.tsx             # Lista de leads
│   │
│   ├── integrations/
│   │   ├── IntegrationsTab.tsx      # Config de integrações
│   │   └── ZAPIConfig.tsx           # Config Z-API
│   │
│   └── settings/
│       ├── SettingsTab.tsx          # Configurações
│       └── SignatureSettings.tsx    # Config de assinatura
│
├── hooks/
│   ├── useAdminAuth.ts              # Hook de auth admin
│   ├── useAdminDashboard.ts         # Hook de métricas
│   └── useWhatsApp.ts               # Hook de envio
│
└── supabase/functions/
    ├── send-whatsapp/
    │   └── index.ts                 # Envio WhatsApp
    └── admin-dashboard/
        └── index.ts                 # Métricas dashboard
```

---

### Políticas RLS

#### `admin_users`
```sql
-- Admins podem ver e editar apenas seu próprio perfil
CREATE POLICY "Admins can view own profile"
ON admin_users FOR SELECT
USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own profile"
ON admin_users FOR UPDATE
USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

-- Service role pode gerenciar tudo
CREATE POLICY "Service can manage all"
ON admin_users FOR ALL
USING (true) WITH CHECK (true);
```

#### Política adicional para `profiles`
```sql
-- Admins podem visualizar todos os perfis (para CRM)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

---

### UI/UX da Página Admin

#### Design
- **Tema**: Dark mode com acentos em roxo (#8B5CF6)
- **Sidebar**: Fixa à esquerda, 250px de largura
- **Header**: Nome do atendente, departamento, botão de logout
- **Cards**: Bordas arredondadas, sombras suaves
- **Responsivo**: Sidebar colapsável em mobile

#### Tabs Principais
| Tab | Ícone | Descrição |
|-----|-------|-----------|
| Dashboard | LayoutDashboard | Métricas e atividade |
| Clientes | Users | CRM completo |
| WhatsApp | MessageCircle | Envio de mensagens |
| Leads | UserPlus | Gestão de leads |
| Integrações | Plug | Configurações externas |
| Config | Settings | Perfil do atendente |

---

### Secrets Necessários

Os seguintes secrets já estão mencionados na memória do projeto mas precisam ser configurados:
- `ZAPI_INSTANCE_ID` - ID da instância Z-API
- `ZAPI_TOKEN` - Token de autenticação Z-API

---

### Etapas de Implementação

1. **Banco de Dados**
   - Criar tabela `admin_users` com departamentos
   - Criar tabela `admin_activity_logs`
   - Adicionar RLS para admins visualizarem profiles
   - Atualizar RLS de `user_credits` para admins

2. **Componentes Base**
   - `AdminGuard.tsx` - proteção de rota
   - `AdminLayout.tsx` - estrutura com sidebar
   - `AdminSidebar.tsx` - navegação

3. **Página Principal**
   - `Admin.tsx` - página com tabs
   - Rota `/admin` no App.tsx

4. **Tabs do CRM**
   - Dashboard com métricas
   - Clientes com busca/filtros/tags
   - WhatsApp com composer
   - Leads
   - Integrações
   - Configurações

5. **Edge Functions**
   - `send-whatsapp` - envio com assinatura
   - `admin-dashboard` - métricas agregadas

6. **Hooks de Dados**
   - `useAdminAuth` - verificação de acesso
   - `useAdminDashboard` - métricas
   - `useCustomers` - lista de clientes
   - `useWhatsApp` - envio de mensagens

---

### Segurança

- Acesso restrito via URL oculta `/admin`
- Verificação de role `admin` via `has_role()` do Supabase
- RLS em todas as tabelas administrativas
- Logs de atividade para auditoria
- Service role key apenas em edge functions
