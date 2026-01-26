

## Plano: Corrigir Campo de Input do WhatsApp Invisível

### Causa Raiz

O campo de input está sendo **cortado** porque há um problema de layout CSS:

1. O `Card` tem `overflow-hidden` que corta conteúdo que excede sua altura
2. A div do Chat View tem `h-full` mas está dentro de um `grid` que não propaga a altura corretamente para o flexbox interno
3. O `ConversationView` usa `flex flex-col h-full` mas a altura não está sendo calculada corretamente

### Correção Necessária

**Arquivo: `src/components/admin/whatsapp/WhatsAppTab.tsx`**

Adicionar `overflow-hidden` na div do Chat View para garantir que o flexbox interno funcione corretamente:

**Linha 241-246 - De:**
```tsx
<div
  className={cn(
    'h-full',
    !selectedPhone && 'hidden lg:flex lg:items-center lg:justify-center'
  )}
>
```

**Para:**
```tsx
<div
  className={cn(
    'h-full overflow-hidden',
    !selectedPhone && 'hidden lg:flex lg:items-center lg:justify-center'
  )}
>
```

### Por que isso funciona

- `overflow-hidden` força o container a respeitar seus limites de altura
- Isso permite que o `flex flex-col` do `ConversationView` calcule corretamente o espaço para:
  - Header (fixo)
  - ScrollArea (flex-1, ocupa espaço restante)
  - ChatInput (fixo no fundo)

### Resultado Esperado

O campo de input "Digite sua mensagem..." voltará a aparecer na parte inferior da área de chat.

