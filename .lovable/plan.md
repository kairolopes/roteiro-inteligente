

## Problema

Os toasts (mensagens de erro/aviso) desaparecem rápido demais para o usuário conseguir ler. O projeto usa dois sistemas de toast:

1. **shadcn `use-toast`** — configurado com `TOAST_REMOVE_DELAY = 5000` (5s), usado pela maioria dos componentes
2. **Sonner** — sem `duration` configurado (padrão da lib é ~4s), usado em Profile e admin/hotmart

Além disso, o `ToastCleaner` em `App.tsx` remove todos os toasts ao navegar entre páginas, o que pode causar toasts desaparecerem instantaneamente se houver redirecionamento logo após o erro.

## Solução

### 1. Aumentar duração do shadcn toast
**Arquivo**: `src/hooks/use-toast.ts`
- Alterar `TOAST_REMOVE_DELAY` de `5000` para `8000` (8 segundos)

### 2. Configurar duração do Sonner
**Arquivo**: `src/components/ui/sonner.tsx`
- Adicionar `duration={8000}` no componente `<Sonner>` para que os toasts do Sonner também durem 8 segundos

### 3. Ajustar ToastCleaner (opcional)
**Arquivo**: `src/App.tsx`
- Adicionar um pequeno delay (ex: 500ms) antes de limpar os toasts na mudança de rota, para que o usuário tenha tempo de ler mensagens que apareceram logo antes de uma navegação

## Resultado
Todas as mensagens de erro/aviso ficarão visíveis por 8 segundos, tempo suficiente para leitura.

