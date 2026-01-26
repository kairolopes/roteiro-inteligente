import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { ActivityFeed } from './ActivityFeed';
import { Users, CreditCard, UserPlus, TrendingUp } from 'lucide-react';

interface DashboardMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  leadsThisWeek: number;
}

export const DashboardTab = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    leadsThisWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch total customers (users with profiles)
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch active subscriptions
        const { count: subscriptionsCount } = await supabase
          .from('user_credits')
          .select('*', { count: 'exact', head: true })
          .not('subscription_type', 'is', null);

        // Fetch total revenue from completed transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'approved');

        const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        // Fetch leads from this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { count: leadsCount } = await supabase
          .from('landing_leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString());

        setMetrics({
          totalCustomers: customersCount || 0,
          activeSubscriptions: subscriptionsCount || 0,
          totalRevenue,
          leadsThisWeek: leadsCount || 0,
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

      {/* Metrics Grid */}
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

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
};
