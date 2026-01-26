import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const HotmartSettings = () => {
  const [copied, setCopied] = useState(false);

  const webhookUrl = 'https://rvmvoogyrafiogxdbisx.supabase.co/functions/v1/hotmart-webhook';

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('URL copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>URL do Webhook</CardTitle>
          <CardDescription>
            Configure esta URL no painel do Hotmart para receber notificações de vendas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para configurar o webhook no Hotmart, você também precisa adicionar o secret <code className="font-mono bg-muted px-1 rounded">HOTMART_HOTTOK</code> nas configurações do projeto.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Configurar no Hotmart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Acesse o <strong>Painel do Hotmart</strong> → <strong>Ferramentas</strong> → <strong>Webhook (Notificações via API)</strong>
            </li>
            <li>
              Clique em <strong>Configurar</strong> ou <strong>Adicionar Webhook</strong>
            </li>
            <li>
              Cole a URL do webhook acima no campo de URL
            </li>
            <li>
              Copie o <strong>Hottok</strong> (token de segurança) exibido pelo Hotmart
            </li>
            <li>
              Adicione o Hottok como secret no projeto:
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-muted-foreground">
                <li>Nome do secret: <code className="font-mono bg-muted px-1 rounded">HOTMART_HOTTOK</code></li>
                <li>Valor: o token copiado do Hotmart</li>
              </ul>
            </li>
            <li>
              Selecione os eventos que deseja receber:
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">PURCHASE_APPROVED</Badge>
                <Badge variant="outline">PURCHASE_COMPLETE</Badge>
                <Badge variant="outline">PURCHASE_CANCELED</Badge>
                <Badge variant="outline">PURCHASE_REFUNDED</Badge>
                <Badge variant="outline">PURCHASE_CHARGEBACK</Badge>
              </div>
            </li>
            <li>
              Salve as configurações
            </li>
          </ol>

          <div className="pt-4">
            <Button variant="outline" asChild>
              <a
                href="https://app-vlc.hotmart.com/tools/webhook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Painel Hotmart
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Suportados</CardTitle>
          <CardDescription>
            O webhook processa automaticamente os seguintes eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">PURCHASE_APPROVED</p>
                <p className="text-sm text-muted-foreground">
                  Compra aprovada - cria cliente, adiciona créditos, envia WhatsApp
                </p>
              </div>
              <Badge>Automático</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">PURCHASE_COMPLETE</p>
                <p className="text-sm text-muted-foreground">
                  Compra finalizada - confirma status
                </p>
              </div>
              <Badge>Automático</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">PURCHASE_CANCELED / REFUNDED</p>
                <p className="text-sm text-muted-foreground">
                  Cancelamento ou reembolso - remove créditos do cliente
                </p>
              </div>
              <Badge variant="secondary">Automático</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">PURCHASE_CHARGEBACK</p>
                <p className="text-sm text-muted-foreground">
                  Chargeback - remove créditos do cliente
                </p>
              </div>
              <Badge variant="destructive">Automático</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
