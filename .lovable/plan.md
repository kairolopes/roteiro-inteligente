

## Plano: Corrigir Credenciais Z-API

### Problema Identificado

A credencial `CC91F1EC21501AFE9182A3BC` é o **Token da instância** (usado na URL da API), não o **Client-Token** (header de segurança). São credenciais diferentes!

| Credencial | Onde Encontrar | Uso |
|------------|----------------|-----|
| Instance ID | Visível na screenshot: `3EDCE29A3EB0A1453F66FAF4F663B13A` | URL da API |
| Token | Visível na screenshot: `CC91F1EC21501AFE9182A3BC` | URL da API |
| **Client-Token** | Seção "Segurança" ou "Client Token" no painel Z-API | Header HTTP |

---

### O que você precisa fazer

1. No painel Z-API, procure por uma seção chamada:
   - "Segurança" 
   - "Client Token"
   - "Security"
   - Ou um ícone de cadeado/chave

2. Copie o **Client-Token** real dessa seção

3. Compartilhe comigo para atualizar o secret `ZAPI_CLIENT_TOKEN`

---

### Verificação adicional

Também preciso confirmar se os outros secrets estão corretos. Baseado na sua screenshot:

| Secret | Valor Esperado |
|--------|----------------|
| `ZAPI_INSTANCE_ID` | `3EDCE29A3EB0A1453F66FAF4F663B13A` |
| `ZAPI_TOKEN` | `CC91F1EC21501AFE9182A3BC` |

Se estes valores estiverem diferentes, também precisarei atualizá-los.

---

### Após obter o Client-Token correto

1. Atualizar o secret `ZAPI_CLIENT_TOKEN` com o valor correto
2. Testar envio de mensagem WhatsApp
3. Configurar seu perfil de admin para assinatura "Tecnologia"

