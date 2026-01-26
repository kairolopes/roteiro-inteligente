import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, CreditCard, RefreshCw, ExternalLink, Check, X } from 'lucide-react';

interface Integration {
  id: string;
  integration_name: string;
  is_active: boolean;
  settings: unknown;
  updated_at: string;
}

export const IntegrationsTab = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .order('integration_name');

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(integrations.map(i => 
        i.id === id ? { ...i, is_active: !currentStatus } : i
      ));

      toast({
        title: 'Integração atualizada',
        description: `A integração foi ${!currentStatus ? 'ativada' : 'desativada'}.`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: 'Erro ao atualizar',
        variant: 'destructive',
      });
    }
  };

  const getIntegrationIcon = (name: string) => {
    if (name.toLowerCase().includes('zapi') || name.toLowerCase().includes('whatsapp')) {
      return MessageCircle;
    }
    if (name.toLowerCase().includes('hotmart') || name.toLowerCase().includes('payment')) {
      return CreditCard;
    }
    return RefreshCw;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Integrações</h2>
        <p className="text-muted-foreground">Gerencie suas integrações externas</p>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma integração configurada</p>
            <p className="text-sm text-muted-foreground mt-2">
              As integrações são configuradas automaticamente quando você adiciona secrets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {integrations.map(integration => {
            const Icon = getIntegrationIcon(integration.integration_name);
            
            return (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {integration.integration_name}
                        </CardTitle>
                        <CardDescription>
                          {integration.is_active ? 'Ativa' : 'Inativa'}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={integration.is_active}
                      onCheckedChange={() => handleToggle(integration.id, integration.is_active)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {integration.is_active ? (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Conectado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" />
                        Desconectado
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Z-API Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Z-API (WhatsApp)
          </CardTitle>
          <CardDescription>
            Configuração da integração com Z-API para envio de mensagens WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Para configurar o Z-API, você precisa adicionar os seguintes secrets:
            </p>
            <ul className="mt-2 text-sm space-y-1">
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">ZAPI_INSTANCE_ID</code> - ID da sua instância Z-API</li>
              <li><code className="text-xs bg-muted px-1 py-0.5 rounded">ZAPI_TOKEN</code> - Token de autenticação</li>
            </ul>
          </div>
          <Button variant="outline" asChild>
            <a href="https://z-api.io" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar Z-API
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
