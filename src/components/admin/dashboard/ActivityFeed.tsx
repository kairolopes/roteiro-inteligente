import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, UserPlus, MessageCircle, FileText } from 'lucide-react';

interface Activity {
  id: string;
  type: 'transaction' | 'lead' | 'notification' | 'itinerary';
  description: string;
  timestamp: string;
  details?: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const allActivities: Activity[] = [];

        // Recent transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('id, type, amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        transactions?.forEach(t => {
          allActivities.push({
            id: `txn-${t.id}`,
            type: 'transaction',
            description: `Nova transação: R$ ${Number(t.amount).toFixed(2)}`,
            timestamp: t.created_at,
            details: `Status: ${t.status}`,
          });
        });

        // Recent leads
        const { data: leads } = await supabase
          .from('landing_leads')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        leads?.forEach(l => {
          allActivities.push({
            id: `lead-${l.id}`,
            type: 'lead',
            description: `Novo lead capturado`,
            timestamp: l.created_at || new Date().toISOString(),
            details: l.email,
          });
        });

        // Recent notifications
        const { data: notifications } = await supabase
          .from('notification_logs')
          .select('id, type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        notifications?.forEach(n => {
          allActivities.push({
            id: `notif-${n.id}`,
            type: 'notification',
            description: `Notificação enviada: ${n.type}`,
            timestamp: n.created_at,
            details: `Status: ${n.status}`,
          });
        });

        // Sort by timestamp
        allActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(allActivities.slice(0, 10));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'transaction': return CreditCard;
      case 'lead': return UserPlus;
      case 'notification': return MessageCircle;
      case 'itinerary': return FileText;
      default: return FileText;
    }
  };

  const getActivityBadge = (type: Activity['type']) => {
    switch (type) {
      case 'transaction': return { label: 'Venda', variant: 'default' as const };
      case 'lead': return { label: 'Lead', variant: 'secondary' as const };
      case 'notification': return { label: 'Mensagem', variant: 'outline' as const };
      case 'itinerary': return { label: 'Roteiro', variant: 'secondary' as const };
      default: return { label: 'Outro', variant: 'outline' as const };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma atividade recente
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => {
              const Icon = getActivityIcon(activity.type);
              const badge = getActivityBadge(activity.type);
              
              return (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.details} • {format(new Date(activity.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
