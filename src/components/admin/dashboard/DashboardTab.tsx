import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { ActivityFeed } from './ActivityFeed';
import { Users, CreditCard, UserPlus, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  leadsThisWeek: number;
  closedQuotesRevenue: number;
  closedQuotesCount: number;
}

interface DailyPoint {
  date: string;
  itinerarios: number;
  leads: number;
}

export const DashboardTab = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    leadsThisWeek: 0,
    closedQuotesRevenue: 0,
    closedQuotesCount: 0,
  });
  const [trend, setTrend] = useState<DailyPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: subscriptionsCount } = await supabase
          .from('user_credits')
          .select('*', { count: 'exact', head: true })
          .not('subscription_type', 'is', null);

        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'approved');

        const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { count: leadsCount } = await supabase
          .from('landing_leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString());

        // Receita fechada via cotações de agência (canal BR)
        const { data: closedQuotes } = await (supabase as any)
          .from('quote_requests')
          .select('closed_value')
          .eq('status', 'closed_won');
        const closedQuotesRevenue =
          closedQuotes?.reduce((sum: number, q: any) => sum + Number(q.closed_value || 0), 0) || 0;

        // 7-day trend: itineraries vs leads per day
        const since = new Date();
        since.setDate(since.getDate() - 6);
        since.setHours(0, 0, 0, 0);

        const [{ data: recentItineraries }, { data: recentLeads }] = await Promise.all([
          supabase
            .from('saved_itineraries')
            .select('created_at')
            .gte('created_at', since.toISOString()),
          supabase
            .from('landing_leads')
            .select('created_at')
            .gte('created_at', since.toISOString()),
        ]);

        const buckets: Record<string, DailyPoint> = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(since);
          d.setDate(since.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          buckets[key] = {
            date: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
            itinerarios: 0,
            leads: 0,
          };
        }
        recentItineraries?.forEach((row) => {
          const k = (row.created_at as string).slice(0, 10);
          if (buckets[k]) buckets[k].itinerarios += 1;
        });
        recentLeads?.forEach((row) => {
          const k = (row.created_at as string).slice(0, 10);
          if (buckets[k]) buckets[k].leads += 1;
        });

        setTrend(Object.values(buckets));
        setMetrics({
          totalCustomers: customersCount || 0,
          activeSubscriptions: subscriptionsCount || 0,
          totalRevenue,
          leadsThisWeek: leadsCount || 0,
          closedQuotesRevenue,
          closedQuotesCount: closedQuotes?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Clientes"
          value={metrics.totalCustomers}
          icon={Users}
          description="Usuários cadastrados"
          isLoading={isLoading}
        />
        <MetricCard
          title="Assinaturas Ativas"
          value={metrics.activeSubscriptions}
          icon={TrendingUp}
          description="Clientes pagantes"
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="Receita Total"
          value={`R$ ${metrics.totalRevenue.toFixed(2)}`}
          icon={CreditCard}
          description="Vendas aprovadas"
          isLoading={isLoading}
          variant="primary"
        />
        <MetricCard
          title="Leads Semana"
          value={metrics.leadsThisWeek}
          icon={UserPlus}
          description="Novos leads capturados"
          isLoading={isLoading}
          variant="warning"
        />
      </div>

      {/* Receita do canal BR (cotações fechadas) */}
      <div className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-xl p-4 lg:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wide text-success font-semibold mb-1">
              Canal BR — Vendas via consultor
            </p>
            <h3 className="text-3xl font-bold text-foreground">
              R$ {metrics.closedQuotesRevenue.toFixed(2)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.closedQuotesCount} {metrics.closedQuotesCount === 1 ? 'venda fechada' : 'vendas fechadas'} via WhatsApp
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-success" />
        </div>
      </div>

      {/* 7-day trend chart */}
      <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
        <h3 className="text-base font-semibold mb-1">Últimos 7 dias</h3>
        <p className="text-xs text-muted-foreground mb-4">Roteiros gerados e novos leads por dia</p>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="itinerarios" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Roteiros" />
              <Line type="monotone" dataKey="leads" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} name="Leads" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
};
