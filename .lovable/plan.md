
# Diagnóstico: Timeout da Netlify Function

## O Problema Identificado

A geração do roteiro está travando porque a **Netlify Function tem um limite de tempo de execução (timeout)**:

| Plano Netlify | Timeout |
|---------------|---------|
| Gratuito | 10 segundos |
| Pro | 26 segundos |

A função `generate-itinerary` faz várias operações que podem levar **60+ segundos**:

1. **Chamada Gemini** (~15-45s) - Gerar roteiro completo com 5-6 atividades por dia
2. **Google Places** (~10-30s) - Enriquecer cada atividade com coordenadas reais
3. **Cache Supabase** (~2-5s) - Salvar dados no cache

**Total potencial: 30-80 segundos** → Muito acima do limite de 10-26s do Netlify

## A Chave Está Correta

Seu print mostra que a chave está no **Google AI Studio** (não no Cloud Console), então ela **é válida** para o endpoint Gemini. O problema não é autenticação.

---

## Soluções Possíveis

### Opção 1: Aumentar Timeout (Mais Simples)
Fazer upgrade para o plano **Netlify Pro** aumenta o timeout para 26 segundos e permite usar **Background Functions** (até 15 minutos).

**Custo**: ~$19/mês

### Opção 2: Migrar para Supabase Edge Functions (Recomendado)
As Edge Functions do Lovable Cloud não têm o mesmo limite de timeout rígido e já estão configuradas no projeto.

**Mudança necessária**: Fazer a geração usar sempre a Edge Function em vez da Netlify Function.

### Opção 3: Otimizar a Função Atual
Remover ou limitar o enriquecimento do Google Places para acelerar a resposta:
- Limitar a 2-3 atividades por dia (em vez de 5)
- Fazer enriquecimento em segundo plano (async)
- Usar apenas coordenadas do Gemini (sem validação)

---

## Plano de Implementação (Opção 2 - Recomendada)

### Fase 1: Usar Edge Function do Supabase
1. Atualizar `src/lib/apiRouting.ts` para **sempre** usar a Edge Function do Supabase para geração de roteiros
2. A Edge Function já existe em `supabase/functions/generate-itinerary/`

### Fase 2: Adicionar Chave Gemini no Lovable Cloud
1. Adicionar `GOOGLE_GEMINI_API_KEY` como secret no Lovable Cloud
2. Isso permitirá que a Edge Function use a mesma chave

### Resultado
- Sem limite de timeout rígido
- Mesmo código funcionando
- Não precisa pagar Netlify Pro

---

## Resumo

| Item | Status |
|------|--------|
| Chave Gemini | ✅ Correta (AI Studio) |
| Chave no Netlify | ✅ Configurada |
| Código | ✅ Correto |
| **Problema** | ❌ Timeout da Netlify Function (10s) |

---

## Próximos Passos

Escolha uma das opções:

1. **Migrar para Edge Functions** - Eu atualizo o código para usar sempre a Edge Function do Supabase (sem custo extra)

2. **Otimizar a função** - Eu removo/limito o enriquecimento do Google Places para acelerar a resposta

3. **Upgrade Netlify** - Você faz upgrade do plano Netlify e habilita Background Functions
