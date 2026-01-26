import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HotmartPurchase {
  id: string;
  hotmart_transaction_id: string;
  hotmart_product_id: string;
  buyer_email: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  user_id: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  event_type: string;
  raw_data: Record<string, unknown>;
  created_at: string;
}

export const PurchasesList = () => {
  const [search, setSearch] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<HotmartPurchase | null>(null);

  const { data: purchases, isLoading, refetch } = useQuery({
    queryKey: ['hotmart-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotmart_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as HotmartPurchase[];
    },
  });

  const filteredPurchases = purchases?.filter(p =>
    p.buyer_email.toLowerCase().includes(search.toLowerCase()) ||
    p.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.hotmart_transaction_id.includes(search)
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      refunded: 'destructive',
    };

    const labels: Record<string, string> = {
      approved: 'Aprovado',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Compras</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email, nome ou transação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPurchases?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma compra encontrada
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Transação</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases?.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(purchase.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.buyer_name || '-'}</div>
                        <div className="text-sm text-muted-foreground">{purchase.buyer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {purchase.hotmart_transaction_id.slice(0, 12)}...
                    </TableCell>
                    <TableCell>
                      {formatCurrency(purchase.amount, purchase.currency)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(purchase.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {purchase.event_type}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Compra</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transação</label>
                  <p className="font-mono text-sm">{selectedPurchase.hotmart_transaction_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>{getStatusBadge(selectedPurchase.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p>{selectedPurchase.buyer_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedPurchase.buyer_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p>{selectedPurchase.buyer_phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor</label>
                  <p>{formatCurrency(selectedPurchase.amount, selectedPurchase.currency)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dados Completos</label>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-60">
                  {JSON.stringify(selectedPurchase.raw_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
