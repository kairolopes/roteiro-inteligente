
## Plano: Corrigir Layout do Modal de Login

### Problema Identificado

Olhando o screenshot, o modal de login está aparecendo sem o container visual adequado:
- O título "Entrar" e descrição estão cortados/invisíveis
- Os campos aparecem "flutuando" sem o fundo do card
- A estrutura atual com scroll aninhado está causando problemas de posicionamento

### Causa Raiz

A estrutura atual do `AuthModal` usa:
```tsx
<motion.div className="fixed inset-0 overflow-y-auto">
  <div className="min-h-full flex items-center justify-center">
    <motion.div className="glass-card">  // Modal content
```

Esta estrutura aninhada com scroll está conflitando com o posicionamento centralizado.

### Solução

Reestruturar o modal seguindo o padrão do `PaywallModal` que funciona corretamente:

1. **Backdrop e Modal separados** (não aninhados)
2. **Posicionamento direto** com `fixed inset-x-4 top-1/2 -translate-y-1/2`
3. **Background sólido** com `bg-card border border-border` ao invés de `glass-card`
4. **Estrutura simplificada** sem containers de scroll desnecessários

---

### Alterações no AuthModal.tsx

**Nova estrutura:**

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop - SEPARADO do modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal - posicionamento DIRETO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
          {/* Conteúdo do modal */}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

### Comparação: Antes vs Depois

| Aspecto | Antes (Problema) | Depois (Solução) |
|---------|------------------|------------------|
| Backdrop | Engloba o modal | Separado do modal |
| Posicionamento | `flex items-center justify-center` + scroll | `fixed top-1/2 -translate-y-1/2` |
| Background | `glass-card` (transparente) | `bg-card border border-border` (sólido) |
| Estrutura | 3 divs aninhadas | 2 elementos irmãos |

---

### Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/auth/AuthModal.tsx` | Reestruturar layout seguindo padrão do PaywallModal |

---

### Resultado Esperado

- Modal aparece centralizado corretamente
- Título e descrição visíveis
- Container do card com fundo sólido visível
- Funciona em todas as resoluções de tela
- Animações suaves de entrada/saída
