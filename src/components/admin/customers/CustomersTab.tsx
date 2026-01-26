import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, Calendar, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CustomerNotes } from './CustomerNotes';
import { CustomerTags } from './CustomerTags';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  credits?: {
    paid_credits: number;
    subscription_type: string | null;
    free_itineraries_used: number;
  };
  email?: string;
}

export const CustomersTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Fetch credits for all users
        const { data: credits } = await supabase
          .from('user_credits')
          .select('user_id, paid_credits, subscription_type, free_itineraries_used');

        const creditsMap = new Map(credits?.map(c => [c.user_id, c]));

        const enrichedCustomers = profiles?.map(p => ({
          ...p,
          credits: creditsMap.get(p.user_id),
        })) || [];

        setCustomers(enrichedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.user_id.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground">
            {customers.length} clientes cadastrados
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map(customer => (
            <Card key={customer.id}>
              <Collapsible
                open={expandedCustomer === customer.id}
                onOpenChange={() => 
                  setExpandedCustomer(
                    expandedCustomer === customer.id ? null : customer.id
                  )
                }
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {(customer.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">
                          {customer.full_name || 'Usuário sem nome'}
                        </h3>
                        {customer.credits?.subscription_type && (
                          <Badge variant="default">
                            {customer.credits.subscription_type}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            📱 {customer.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(customer.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {customer.credits && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {customer.credits.paid_credits} créditos
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="mt-2">
                        <CustomerTags userId={customer.user_id} />
                      </div>
                    </div>

                    {/* Expand Button */}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {expandedCustomer === customer.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t border-border">
                      <CustomerNotes userId={customer.user_id} />
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
