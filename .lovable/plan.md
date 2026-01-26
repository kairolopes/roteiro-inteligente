
## Plano: Corrigir Redirecionamento da Página Admin

### Problema Identificado

O `useAdminAuth` não está esperando o `useAuth` terminar de carregar antes de verificar se o usuário é admin. Isso causa uma condição de corrida:

```text
1. Usuário acessa /admin
2. useAuth começa a carregar (isLoading = true, user = null)
3. useAdminAuth executa com user = null
4. useAdminAuth define isAdmin = false, isLoading = false
5. AdminGuard redireciona para "/"
6. useAuth termina de carregar (user = "Kairo Lopes")
7. Muito tarde - já foi redirecionado
```

### Logs de Rede (Evidência)

Nos logs capturados, após o login:
- Há chamadas para `/profiles` (funcionando)
- **Não há chamadas para `/user_roles`** (nunca executou a verificação)

Isso confirma que o `useAdminAuth` está retornando antes de fazer a query de roles.

---

### Solução

Modificar o `useAdminAuth` para **aguardar o `useAuth` terminar de carregar** antes de verificar o status de admin:

#### useAdminAuth.ts (Alterações)

```typescript
export const useAdminAuth = () => {
  const { user, isLoading: authLoading } = useAuth(); // <-- Adicionar isLoading
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // AGUARDAR auth terminar de carregar
      if (authLoading) {
        return; // <-- Não fazer nada ainda
      }

      if (!user) {
        setIsAdmin(false);
        setAdminProfile(null);
        setIsLoading(false);
        return;
      }

      // ... resto do código permanece igual
    };

    checkAdminStatus();
  }, [user, authLoading]); // <-- Adicionar authLoading nas dependências

  // ... resto permanece igual
};
```

---

### Fluxo Corrigido

```text
1. Usuário acessa /admin
2. useAuth começa a carregar (isLoading = true, user = null)
3. useAdminAuth aguarda (authLoading = true)
4. useAuth termina (isLoading = false, user = "Kairo Lopes")
5. useAdminAuth executa query em user_roles
6. Encontra role admin, isAdmin = true
7. AdminGuard renderiza o painel
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useAdminAuth.ts` | Adicionar verificação de `authLoading` do `useAuth` |

---

### Código Final do Hook

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// ... interfaces permanecem iguais

export const useAdminAuth = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Aguardar auth terminar de carregar
      if (authLoading) {
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setAdminProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError) {
          console.error('Error checking admin role:', roleError);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const hasAdminRole = !!roleData;
        setIsAdmin(hasAdminRole);

        if (hasAdminRole) {
          // Fetch admin profile
          const { data: profileData, error: profileError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching admin profile:', profileError);
          }

          setAdminProfile(profileData as AdminProfile | null);
        }
      } catch (error) {
        console.error('Error in admin auth check:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  // ... resto do código permanece igual
};
```

---

### Teste de Validação

Após a correção:
1. Acesse `/admin` sem estar logado - deve redirecionar para "/"
2. Faça login com `kairolopes@gmail.com` / `123456`
3. Acesse `/admin` - deve mostrar o painel de administração
4. Verifique nos logs de rede que há uma chamada para `user_roles`
