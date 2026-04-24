import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Plane,
  Hotel,
  Map,
  Sparkles,
  Package,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuoteRequest {
  id: string;
  user_id: string | null;
  agency_id: string | null;
  itinerary_id: string | null;
  itinerary_title: string | null;
  day_number: number | null;
  destination: string | null;
  type: string;
  message_sent: string | null;
  status: string;
  closed_value: number | null;
  notes: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  closed_at: string | null;
}

const TYPE_META: Record<string, { label: string; icon: typeof Plane }> = {
  flight: { label: 'Voo', icon: Plane },
  hotel: { label: 'Hospedagem', icon: Hotel },
  tour: { label: 'Passeio', icon: Map },
  activity: { label: 'Atividade', icon: Sparkles },
  full_package: { label: 'Pacote', icon: Package },
  other: { label: 'Outro', icon: MessageCircle },
};

const STATUS_META: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'Novo', variant: 'default' },
  in_progress: { label: 'Em contato', variant: 'secondary' },
  closed_won: { label: 'Fechado', variant: 'default' },
  closed_lost: { label: 'Perdido', variant: 'destructive' },
};

export const QuotesTab = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');

  const [dialogQuote, setDialogQuote] = useState<QuoteRequest | null>(null);
  const [closeValue, setCloseValue] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchQuotes = async () => {
      const { data, error } = await (supabase as any)
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (!mounted) return;
      if (error) {
        console.error('Error fetching quote_requests:', error);
        toast({ title: 'Erro ao carregar cotações', variant: 'destructive' });
      } else {
        setQuotes(data || []);
      }
      setIsLoading(false);
    };

    fetchQuotes();

    // Realtime feed
    const channel = supabase
      .channel('quote_requests_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quote_requests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQuotes((prev) => [payload.new as QuoteRequest, ...prev]);
            toast({
              title: '🔥 Nova cotação',
              description: `${(payload.new as QuoteRequest).destination ?? 'Destino'} — ${
                TYPE_META[(payload.new as QuoteRequest).type]?.label ?? 'cotação'
              }`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setQuotes((prev) =>
              prev.map((q) => (q.id === (payload.new as QuoteRequest).id ? (payload.new as QuoteRequest) : q)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const filtered = useMemo(() => {
    if (filter === 'open') return quotes.filter((q) => q.status === 'new' || q.status === 'in_progress');
    if (filter === 'closed') return quotes.filter((q) => q.status === 'closed_won' || q.status === 'closed_lost');
    return quotes;
  }, [quotes, filter]);

  const totalRevenue = useMemo(
    () =>
      quotes
        .filter((q) => q.status === 'closed_won')
        .reduce((sum, q) => sum + Number(q.closed_value || 0), 0),
    [quotes],
  );

  const openCount = useMemo(
    () => quotes.filter((q) => q.status === 'new' || q.status === 'in_progress').length,
    [quotes],
  );

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any)
      .from('quote_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado' });
    }
  };

  const handleCloseWon = async () => {
    if (!dialogQuote) return;
    const value = parseFloat(closeValue.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      toast({ title: 'Informe um valor válido', variant: 'destructive' });
      return;
    }
    const { error } = await (supabase as any)
      .from('quote_requests')
      .update({
        status: 'closed_won',
        closed_value: value,
        closed_at: new Date().toISOString(),
        notes: closeNotes || null,
      })
      .eq('id', dialogQuote.id);

    if (error) {
      toast({ title: 'Erro ao fechar venda', variant: 'destructive' });
    } else {
      toast({ title: '🎉 Venda registrada!', description: `R$ ${value.toFixed(2)}` });
      setDialogQuote(null);
      setCloseValue('');
      setCloseNotes('');
    }
  };

  const openWhatsApp = (quote: QuoteRequest) => {
    if (!quote.contact_phone) {
      toast({ title: 'Sem telefone do contato', variant: 'destructive' });
      return;
    }
    const phone = quote.contact_phone.replace(/\D/g, '');
    const msg = quote.message_sent || `Olá! Sobre sua cotação de ${quote.destination ?? 'viagem'}...`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Cotações</h2>
        <p className="text-muted-foreground">Feed em tempo real dos leads gerados pelo app</p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Em aberto</p>
              <p className="text-2xl font-bold">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendas fechadas</p>
              <p className="text-2xl font-bold">
                {quotes.filter((q) => q.status === 'closed_won').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receita fechada</p>
              <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(['open', 'closed', 'all'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'open' ? 'Em aberto' : f === 'closed' ? 'Fechadas' : 'Todas'}
          </Button>
        ))}
      </div>

      {/* Feed Bloomberg-like */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feed em tempo real</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground text-center">
              Nenhuma cotação {filter === 'open' ? 'em aberto' : filter === 'closed' ? 'fechada' : ''} ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((q) => {
                const TypeIcon = TYPE_META[q.type]?.icon ?? MessageCircle;
                const status = STATUS_META[q.status] ?? STATUS_META.new;
                return (
                  <li key={q.id} className="p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <TypeIcon className="h-4 w-4 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {TYPE_META[q.type]?.label ?? q.type}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground truncate">
                            {q.destination ?? 'destino n/d'}
                            {q.day_number ? ` (Dia ${q.day_number})` : ''}
                          </span>
                          <Badge variant={status.variant} className="ml-auto">
                            {status.label}
                          </Badge>
                        </div>

                        {q.itinerary_title && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Roteiro: <span className="font-medium">{q.itinerary_title}</span>
                          </p>
                        )}

                        {q.message_sent && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            "{q.message_sent}"
                          </p>
                        )}

                        {q.closed_value && (
                          <p className="text-xs text-success font-semibold mb-2">
                            Fechado: R$ {Number(q.closed_value).toFixed(2)}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(q.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>

                          {q.status !== 'closed_won' && q.status !== 'closed_lost' && (
                            <>
                              {q.contact_phone && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => openWhatsApp(q)}
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                                </Button>
                              )}
                              {q.status === 'new' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => updateStatus(q.id, 'in_progress')}
                                >
                                  Em contato
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 px-2 text-xs"
                                onClick={() => setDialogQuote(q)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Fechar venda
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-destructive"
                                onClick={() => updateStatus(q.id, 'closed_lost')}
                              >
                                <XCircle className="h-3 w-3 mr-1" /> Perdido
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog fechar venda */}
      <Dialog open={!!dialogQuote} onOpenChange={(open) => !open && setDialogQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar venda fechada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={closeValue}
                onChange={(e) => setCloseValue(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Anotações (opcional)</label>
              <Textarea
                placeholder="Detalhes da venda..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogQuote(null)}>
              Cancelar
            </Button>
            <Button onClick={handleCloseWon}>Confirmar venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
