import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Check, X, Clock } from 'lucide-react';

interface Message {
  id: string;
  phone: string | null;
  type: string;
  status: string;
  message_content: string | null;
  created_at: string;
  sent_at: string | null;
  error_message: string | null;
}

export const MessageHistory = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('notification_logs')
          .select('*')
          .eq('channel', 'whatsapp')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching message history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="default" className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Enviado
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Mensagens</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhuma mensagem enviada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {msg.phone || 'Número não registrado'}
                      </span>
                      {getStatusBadge(msg.status)}
                    </div>
                    {msg.message_content && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {msg.message_content}
                      </p>
                    )}
                    {msg.error_message && (
                      <p className="text-sm text-destructive mt-2">
                        Erro: {msg.error_message}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
