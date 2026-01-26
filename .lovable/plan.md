
## Plano: Melhorias no Calendário de Volta e UX do Modal de Login

### Problema 1: Calendário de volta não inicia na data de ida

**Situação atual:**
- Quando o usuário seleciona "Personalizado" e escolhe uma data de ida
- O calendário de volta abre no mês atual, não no mês da data de ida
- Usuário precisa navegar manualmente até o mês correto

**Solução:**
Usar a prop `defaultMonth` no calendário de volta para iniciar na data de ida selecionada:

```typescript
<Calendar
  mode="single"
  selected={answers.endDate || undefined}
  onSelect={(date) => onUpdate("endDate", date)}
  defaultMonth={answers.startDate || undefined} // Iniciar no mês da data de ida
  disabled={(date) => {
    const startDate = answers.startDate;
    if (startDate) {
      return date <= startDate; // Data de volta deve ser DEPOIS da ida
    }
    return date < new Date();
  }}
  fixedWeeks
  className="pointer-events-auto"
/>
```

---

### Problema 2: Modal de Login com UX ruim - "estoura a página superior"

**Situação atual:**
- O modal usa `fixed inset-0` com `flex items-center justify-center`
- Em telas menores ou com teclado aberto (mobile), o modal pode ficar cortado no topo
- Não há scroll quando o conteúdo é maior que a tela
- Falta padding superior adequado para header fixo

**Solução:**
Redesenhar o modal com UX aprimorada:

1. **Container com scroll**: Adicionar `overflow-y-auto` no overlay
2. **Padding seguro**: Usar `py-8 sm:py-12` para garantir espaço no topo e fundo
3. **Max-height responsivo**: Limitar altura do modal com `max-h-[90vh]`
4. **Alinhamento flexível**: Usar `items-start` em mobile e `items-center` em desktop
5. **Safe area para iOS**: Adicionar padding para notch

**Alterações no AuthModal.tsx:**

```typescript
// Container overlay - adicionar scroll e padding
<motion.div
  className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
  onClick={onClose}
>
  {/* Container de centralização com padding */}
  <div className="min-h-full flex items-center justify-center p-4 py-8 sm:py-12">
    {/* Card do modal */}
    <motion.div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md glass-card rounded-2xl p-6 relative my-auto"
    >
      {/* Conteúdo */}
    </motion.div>
  </div>
</motion.div>
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/quiz/steps/DatesStep.tsx` | Adicionar `defaultMonth={answers.startDate}` no calendário de volta |
| `src/components/auth/AuthModal.tsx` | Reestruturar layout para scroll e melhor posicionamento |

---

### Detalhes Técnicos

**1. DatesStep.tsx - Calendário de volta iniciando na data de ida:**

Linha ~144: Adicionar prop `defaultMonth`
```typescript
<Calendar
  mode="single"
  selected={answers.endDate || undefined}
  onSelect={(date) => onUpdate("endDate", date)}
  defaultMonth={answers.startDate || undefined}
  disabled={(date) => {
    const startDate = answers.startDate;
    if (startDate) {
      return date <= startDate;
    }
    return date < new Date();
  }}
  initialFocus
  fixedWeeks
  className="pointer-events-auto"
/>
```

**2. AuthModal.tsx - Layout melhorado:**

Estrutura atualizada:
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center p-4 py-8 sm:py-12">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-2xl p-6 relative"
        >
          {/* Conteúdo existente */}
        </motion.div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

**Melhorias visuais adicionais:**
- Animação de entrada com `y: 20` para efeito slide-up suave
- Botão de fechar com tamanho maior para mobile: `p-2` ao invés do atual
- Focus trap implícito pelo backdrop click

---

### Resultado Esperado

1. **Calendário de volta**: Abre automaticamente no mês da data de ida selecionada
2. **Modal de login**: 
   - Nunca fica cortado no topo
   - Pode rolar se necessário em telas pequenas
   - Animação mais suave
   - Funciona corretamente com teclado virtual no mobile
