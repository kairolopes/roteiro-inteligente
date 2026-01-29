

# Correção: Stream Controller Fechando Prematuramente

## Problema Identificado

A Tatiana não consegue gerar roteiros porque a Edge Function `generate-itinerary` está falhando com o erro:

```
TypeError: The stream controller cannot close or enqueue
```

### Causa Raiz

O código tenta enviar eventos via `controller.enqueue()` **DEPOIS** que o stream já foi fechado. Isso acontece porque:

1. O roteiro é gerado com sucesso
2. A função `enrichItineraryWithPlaces` é chamada com o `sendEvent`
3. Durante a validação de lugares, o `sendEvent` tenta fazer `controller.enqueue()`
4. Mas se houve um erro ou timeout anterior, o controller já foi fechado
5. Resultado: `TypeError: cannot close or enqueue`

---

## Solução

### Arquivo: `supabase/functions/generate-itinerary/index.ts`

#### 1. Adicionar Flag de Controle para o Stream

```typescript
const readable = new ReadableStream({
  async start(controller) {
    let streamClosed = false; // Flag para controlar estado
    
    const sendEvent = (event: { type: string; data: any }) => {
      if (streamClosed) {
        console.log("Stream já fechado, ignorando evento:", event.type);
        return;
      }
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      } catch (e) {
        console.error("Erro ao enviar evento:", e);
        streamClosed = true;
      }
    };
    
    const closeStream = () => {
      if (!streamClosed) {
        streamClosed = true;
        try {
          controller.close();
        } catch (e) {
          // Stream já fechado, ignorar
        }
      }
    };
    
    // Usar closeStream() em vez de controller.close()
    // ...
  }
});
```

#### 2. Proteger a Função `validatePlace`

```typescript
async function validatePlace(
  title: string, 
  city: string,
  sendEvent?: (event: { type: string; data: any }) => void
): Promise<...> {
  try {
    const response = await fetch(...);
    
    if (!response.ok) {
      console.log(`Google Places validation failed for: ${title}`);
      return null;
    }

    const data = await response.json();
    
    if (data.error || !data.coordinates) {
      console.log(`Place not found: ${title}`);
      return null;
    }

    // Proteger o sendEvent com try/catch
    if (sendEvent) {
      try {
        sendEvent({
          type: "progress",
          data: {
            step: "place_validated",
            message: `${title} validado ✓`,
            cached: data.cached,
          },
        });
      } catch (e) {
        // Stream pode ter sido fechado, ignorar
        console.log("Não foi possível enviar evento de progresso");
      }
    }

    return { ... };
  } catch (error) {
    console.error(`Error validating place ${title}:`, error);
    return null;
  }
}
```

#### 3. Usar `closeStream()` em Todos os Pontos de Saída

Substituir todas as ocorrências de `controller.close()` pela função `closeStream()` que verifica a flag antes de fechar.

---

## Mudanças Específicas

| Linha Atual | Problema | Solução |
|-------------|----------|---------|
| ~588 | `sendEvent` não verifica se stream está aberto | Adicionar flag `streamClosed` |
| ~628, 633, 702, 739, 743 | `controller.close()` chamado diretamente | Usar `closeStream()` que é idempotente |
| ~45-54 | `validatePlace` assume que `sendEvent` sempre funciona | Envolver em try/catch |

---

## Código Completo da Correção (linhas 586-745)

```typescript
const readable = new ReadableStream({
  async start(controller) {
    let streamClosed = false;
    
    const sendEvent = (event: { type: string; data: any }) => {
      if (streamClosed) {
        console.log("Stream closed, skipping event:", event.type);
        return;
      }
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      } catch (e) {
        console.warn("Failed to enqueue event:", e);
        streamClosed = true;
      }
    };
    
    const closeStream = () => {
      if (!streamClosed) {
        streamClosed = true;
        try {
          controller.close();
        } catch (e) {
          // Already closed, ignore
        }
      }
    };

    try {
      // ... todo o código existente ...
      
      // Substituir todas as ocorrências de:
      // controller.close();
      // Por:
      // closeStream();
      
    } catch (error) {
      console.error("Streaming error:", error);
      sendEvent({ type: "error", data: { error: error instanceof Error ? error.message : "Erro desconhecido" } });
      closeStream();
    }
  }
});
```

---

## Impacto Esperado

Após a correção:
- O stream não tentará enviar eventos depois de fechado
- Erros durante a validação de lugares não quebrarão o fluxo
- A Tatiana conseguirá gerar roteiros normalmente
- Logs ficarão mais limpos (sem stack traces de erros de stream)

---

## Testes Recomendados

1. Gerar um roteiro completo para Itália (Roma + Florença)
2. Verificar se todos os lugares são validados corretamente
3. Confirmar que não há mais erros `The stream controller cannot close or enqueue` nos logs

