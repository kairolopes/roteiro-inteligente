
## Plano: Corrigir Tela Preta no Quiz

### Problema Identificado
O script do **Travelpayouts** (`tpembars.com`) está causando erro `"config is not valid"` que interfere com os cliques nos botões do quiz, resultando em tela preta.

### Solução em 3 Partes

---

### PARTE 1: Isolar o Script Travelpayouts

**Mover o script para o final do body** com carregamento atrasado para evitar conflito com o React:

```html
<!-- No final do body, APÓS o React -->
<script>
  // Carregar Travelpayouts apenas após a página estar pronta
  window.addEventListener('load', function() {
    setTimeout(function() {
      var script = document.createElement("script");
      script.async = true;
      script.src = 'https://tpembars.com/Njk2NzE4.js?t=696718';
      document.body.appendChild(script);
    }, 2000); // Atraso de 2 segundos
  });
</script>
```

---

### PARTE 2: Adicionar ErrorBoundary Global

Criar componente para capturar erros e evitar tela preta:

**Arquivo:** `src/components/ErrorBoundary.tsx`

| Funcionalidade | Descrição |
|----------------|-----------|
| Captura erros React | Previne crash da árvore inteira |
| Fallback visual | Mostra mensagem amigável ao invés de tela preta |
| Botão de retry | Permite recarregar a página |
| Log de erros | Console.error para debug |

---

### PARTE 3: Proteção no Quiz

Adicionar try-catch nos handlers de click para maior segurança:

```typescript
const toggleInterest = (id: string) => {
  try {
    const current = answers.interests;
    // ... lógica existente
  } catch (error) {
    console.error('Erro ao selecionar interesse:', error);
  }
};
```

---

### Resumo das Alterações

| Arquivo | Mudança |
|---------|---------|
| `index.html` | Mover script Travelpayouts para final do body com delay |
| `src/components/ErrorBoundary.tsx` | **Novo** - Componente de captura de erros |
| `src/App.tsx` | Envolver rotas com ErrorBoundary |
| `src/components/quiz/steps/InterestsStep.tsx` | Adicionar try-catch no handler |

---

### Resultado Esperado

- Quiz funciona mesmo se Travelpayouts falhar
- Usuários nunca veem tela preta
- Erros são logados para debug
- Travelpayouts ainda funciona para afiliados (carrega após o React)
