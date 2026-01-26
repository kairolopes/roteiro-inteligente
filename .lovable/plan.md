
# Remoção do Acento de "Sofía"

## Objetivo
Padronizar a marca removendo o acento da palavra "Sofía", alterando para "Sofia" em todo o projeto.

## Arquivos a Alterar

### 1. index.html
- Linha 9: `Viage com Sofía` → `Viage com Sofia`
- Linha 11: `Viage com Sofía` → `Viage com Sofia`
- Linha 13: `Viage com Sofía` → `Viage com Sofia`

### 2. src/components/layout/Navbar.tsx
- Linha 35: `Viage com Sofía` → `Viage com Sofia`

### 3. src/components/layout/Footer.tsx
- Linha 44: `Viage com Sofía` → `Viage com Sofia`
- Linha 109: `Viage com Sofía` → `Viage com Sofia`

### 4. src/components/landing/HeroSection.tsx
- Linha 56: `Sofía` → `Sofia`
- Linha 68: `Sofía` → `Sofia`

### 5. src/pages/Chat.tsx
- Linha 325: `Sou a Sofía` → `Sou a Sofia`
- Linha 339: `Conectando com a Sofía` → `Conectando com a Sofia`
- Linha 518: `Sofía pode cometer erros` → `Sofia pode cometer erros`

### 6. src/hooks/usePDFExport.ts
- Linha 268: `Viaje com Sofía` → `Viaje com Sofia`
- Linha 643: `Viaje com Sofía` → `Viaje com Sofia`

## Resumo

| Arquivo | Alterações |
|---------|------------|
| index.html | 3 ocorrências |
| Navbar.tsx | 1 ocorrência |
| Footer.tsx | 2 ocorrências |
| HeroSection.tsx | 2 ocorrências |
| Chat.tsx | 3 ocorrências |
| usePDFExport.ts | 2 ocorrências |
| **Total** | **13 ocorrências** |

## Observação
A alteração é puramente textual e não afeta funcionalidade. Após a implementação, a marca "Sofia" (sem acento) será consistente em toda a aplicação.
