

## Configuração do Z-API para WhatsApp

### Credenciais Recebidas

| Secret | Valor |
|--------|-------|
| `ZAPI_INSTANCE_ID` | `3EDCE29A3EB0A1453F66FAF4F663B13A` |
| `ZAPI_TOKEN` | `CC91F1EC21501AFE9182A3BC` |

O token secreto (`Ff94d05bcd8b946afb957fc52d8e33ebaS`) é usado para webhooks - guardaremos para uso futuro se necessário.

---

### Etapas de Implementação

1. **Adicionar Secrets ao Projeto**
   - Configurar `ZAPI_INSTANCE_ID` como secret
   - Configurar `ZAPI_TOKEN` como secret

2. **Testar Integração**
   - Acessar `/admin` > WhatsApp
   - Enviar mensagem de teste

---

### Como Funciona

A Edge Function `send-whatsapp` já está configurada para:

```text
1. Receber telefone + mensagem
2. Buscar credenciais dos secrets
3. Enviar via Z-API: api.z-api.io/instances/{ID}/token/{TOKEN}/send-text
4. Registrar log em notification_logs
```

---

### Após Configuração

O painel admin terá:
- Envio de mensagens WhatsApp funcionando
- Histórico de mensagens enviadas
- Templates com assinatura automática por departamento

