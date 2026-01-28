
# Correção: Erro ao Gerar Roteiro Sem Login

## Problema Identificado

Quando você tenta criar o roteiro completo **sem fazer login**, a tela mostra "Ops! Algo deu errado" em vez de apenas o modal de login.

### Causa Raiz

O fluxo atual tem uma falha de lógica:

1. Página carrega → `isLoading = true`, `itinerary = null`
2. Função `generateItineraryWithStreaming()` é chamada
3. Detecta `!user` (não logado)
4. Define `setIsLoading(false)` e `setShowAuthModal(true)`
5. **Retorna sem definir itinerary**

**Problema:** A condição de erro no render é:
```tsx
if (error || !itinerary) {
  // Mostra tela de erro "Ops! Algo deu errado"
}
```

Como `itinerary` ainda é `null` e `isLoading` é `false`, a tela de erro é exibida por baixo do modal de login.

Quando logado:
- `canGenerateItinerary` é `true`
- A função continua e eventualmente define `itinerary`
- Não há erro

---

## Solução

Criar um novo estado para distinguir "esperando login" de "erro real".

### Mudanças Técnicas

**Arquivo:** `src/pages/Itinerary.tsx`

**1. Adicionar novo estado (linha ~38):**
```tsx
const [waitingForAuth, setWaitingForAuth] = useState(false);
```

**2. Modificar `generateItineraryWithStreaming` (linhas 44-50):**
```tsx
// Check if user needs to login
if (!user) {
  setWaitingForAuth(true);  // NOVO: Marcar que está esperando auth
  setShowAuthModal(true);
  setIsLoading(false);
  return;
}
```

**3. Resetar estado quando AuthModal fecha (após linha 399):**
```tsx
<AuthModal
  isOpen={showAuthModal}
  onClose={() => {
    setShowAuthModal(false);
    // Se usuário fechou sem logar, redirecionar para quiz
    if (!user) {
      navigate("/quiz");
    }
  }}
/>
```

**4. Modificar condição de erro (linhas 283-284):**
```tsx
// Error state - mas NÃO se estamos esperando login
if (!waitingForAuth && (error || !itinerary)) {
  // Mostra tela de erro
}
```

**5. Adicionar estado de "esperando login":**
Mostrar uma tela mais amigável enquanto espera o login:
```tsx
// Waiting for auth state
if (waitingForAuth && !user) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div className="text-center max-w-md px-4">
        <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Login Necessário</h2>
        <p className="text-muted-foreground mb-6">
          Faça login para criar seu roteiro personalizado.
        </p>
        <Button onClick={() => navigate("/quiz")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Quiz
        </Button>
      </motion.div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
```

**6. Re-chamar geração após login bem-sucedido:**
Adicionar effect para detectar quando o usuário loga:
```tsx
useEffect(() => {
  // Se estava esperando auth e agora tem usuário, tentar gerar novamente
  if (waitingForAuth && user) {
    setWaitingForAuth(false);
    generateItineraryWithStreaming();
  }
}, [user, waitingForAuth]);
```

---

## Fluxo Corrigido

| Antes | Depois |
|-------|--------|
| Sem login → Modal aparece sobre tela de erro | Sem login → Tela amigável de "Login Necessário" com modal |
| Fechar modal → Vê "Algo deu errado" | Fechar modal → Volta para o quiz |
| Fazer login → Precisa navegar manualmente | Fazer login → Roteiro começa a gerar automaticamente |

---

## Resumo das Alterações

1. Novo estado `waitingForAuth` para distinguir "esperando login" de "erro"
2. Tela amigável quando aguardando autenticação
3. Redirecionamento automático ao quiz se fechar modal sem logar
4. Geração automática do roteiro após login bem-sucedido
5. Condição de erro não é mais acionada durante espera por auth
