

# Plano: Atualizar migration_completa.sql

## Objetivo
Atualizar o arquivo `migration_completa.sql` para incluir **todas** as tabelas, funções, triggers, enums e políticas RLS que o projeto utiliza atualmente.

---

## Resumo Executivo

O arquivo `migration_completa.sql` atual contém apenas **7 tabelas** e está desatualizado. O banco de dados completo do projeto possui **18 tabelas**, além de enums, funções de verificação de roles e políticas RLS para administradores.

**Impacto**: Sem esta atualização, o login e outras funcionalidades críticas não funcionarão no projeto Supabase independente.

---

## O que será adicionado

### Novas Tabelas (11 tabelas)
1. **user_roles** - Sistema de roles (admin, moderator, user)
2. **admin_users** - Perfis de administradores com departamentos
3. **admin_activity_logs** - Auditoria de ações administrativas
4. **affiliate_clicks** - Rastreamento de cliques em links afiliados
5. **flight_price_cache** - Cache de preços de voos
6. **landing_leads** - Leads capturados na página de vendas
7. **notification_logs** - Histórico de notificações enviadas
8. **integration_settings** - Configurações das integrações (Z-API, Hotmart)
9. **whatsapp_templates** - Templates de mensagens WhatsApp
10. **whatsapp_messages** - Histórico de conversas WhatsApp
11. **customer_tags** e **customer_tag_assignments** - Sistema de tags para CRM
12. **customer_notes** - Notas sobre clientes
13. **hotmart_products** - Produtos mapeados do Hotmart
14. **hotmart_purchases** - Histórico de compras Hotmart

### Enums (3 tipos)
- `app_role` - Tipos de role (admin, moderator, user)
- `admin_department` - Departamentos (suporte, vendas, etc.)
- `signature_type` - Tipo de assinatura (departamento ou pessoal)

### Funções Críticas
- `has_role(_user_id, _role)` - Função SECURITY DEFINER para verificar roles sem recursão RLS

### Alterações em Tabelas Existentes
- Adicionar coluna `phone` na tabela `profiles`

### Políticas RLS de Admin
- Permitir admins visualizar/editar profiles, user_credits e transactions

---

## Estrutura do Arquivo Atualizado

```text
PARTE 1:  Funções Auxiliares (update_updated_at_column)
PARTE 2:  Enums (app_role, admin_department, signature_type)
PARTE 3:  Tabela profiles (com coluna phone)
PARTE 4:  Tabela user_roles + função has_role()
PARTE 5:  Tabela user_credits
PARTE 6:  Tabela saved_itineraries
PARTE 7:  Tabela saved_preferences
PARTE 8:  Tabela transactions
PARTE 9:  Tabela places_cache (com Foursquare)
PARTE 10: Tabela affiliate_clicks
PARTE 11: Tabela flight_price_cache
PARTE 12: Tabela landing_leads
PARTE 13: Tabelas de notificação (notification_logs, integration_settings, whatsapp_templates)
PARTE 14: Tabela whatsapp_messages (com realtime)
PARTE 15: Tabelas de CRM (customer_tags, customer_tag_assignments, customer_notes)
PARTE 16: Tabelas Admin (admin_users, admin_activity_logs)
PARTE 17: Tabelas Hotmart (hotmart_products, hotmart_purchases)
PARTE 18: Triggers para novos usuários
PARTE 19: Storage bucket de avatares
PARTE 20: Dados iniciais (tags, templates, configurações)
```

---

## Detalhes Relevantes

### Por que o login não funciona?
O fluxo de autenticação cria automaticamente um registro em `profiles` e `user_credits` via triggers. Se as tabelas não existirem, o trigger falha e o usuário não consegue completar o cadastro.

### Segurança
Todas as políticas RLS serão configuradas corretamente:
- Usuários só acessam seus próprios dados
- Admins podem acessar dados de todos (para CRM)
- Service role para webhooks e edge functions

### Dados Iniciais
O arquivo incluirá dados iniciais para:
- Templates de WhatsApp padrão
- Configurações de integrações (desativadas por padrão)
- Tags de cliente padrão (VIP, Novo, Suporte, Potencial)

---

## Passos da Implementação

1. Criar seção de enums no início do arquivo
2. Adicionar função `has_role()` antes das políticas que a utilizam
3. Adicionar todas as 11 tabelas novas com suas estruturas completas
4. Adicionar coluna `phone` na tabela `profiles`
5. Incluir todas as políticas RLS (incluindo as de admin)
6. Habilitar realtime para `whatsapp_messages`
7. Incluir INSERTs para dados iniciais
8. Atualizar seção de próximos passos

---

## Resultado Esperado

Após executar o novo `migration_completa.sql` no SQL Editor do Supabase independente:
- Login funcionará corretamente
- Painel admin estará funcional
- Integrações (WhatsApp, Hotmart) estarão prontas para configuração
- Sistema de créditos e assinaturas funcionará
- CRM com tags e notas estará disponível

