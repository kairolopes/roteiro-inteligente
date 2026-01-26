import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Mail, Phone, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  converted: boolean | null;
  created_at: string | null;
}

export const LeadsTab = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('landing_leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleMarkConverted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('landing_leads')
        .update({ converted: true })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(l => 
        l.id === leadId ? { ...l, converted: true } : l
      ));

      toast({
        title: 'Lead convertido!',
        description: 'O lead foi marcado como convertido.',
      });
    } catch (error) {
      console.error('Error marking lead as converted:', error);
      toast({
        title: 'Erro ao atualizar lead',
        variant: 'destructive',
      });
    }
  };

  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    return (
      lead.email.toLowerCase().includes(query) ||
      lead.name?.toLowerCase().includes(query) ||
      lead.phone?.includes(query)
    );
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads</h2>
          <p className="text-muted-foreground">
            {leads.length} leads capturados
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredLeads.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhum lead encontrado' : 'Nenhum lead capturado ainda'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>UTM</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{lead.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{lead.name || '-'}</TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {lead.phone}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.source || 'landing'}</Badge>
                      </TableCell>
                      <TableCell>
                        {lead.utm_source ? (
                          <div className="text-xs">
                            <span className="text-muted-foreground">src:</span> {lead.utm_source}
                            {lead.utm_medium && (
                              <><br /><span className="text-muted-foreground">med:</span> {lead.utm_medium}</>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {lead.created_at && format(new Date(lead.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {lead.converted ? (
                          <Badge variant="default" className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Convertido
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Novo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!lead.converted && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkConverted(lead.id)}
                          >
                            Converter
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
