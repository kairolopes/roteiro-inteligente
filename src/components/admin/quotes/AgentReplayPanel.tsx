import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AGENTS, AgentName } from "@/lib/agents";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentReplayPanelProps {
  itineraryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AgentMsg {
  id: string;
  agent_name: string;
  role: string;
  content: string;
  created_at: string;
  notify_admin: boolean;
}

export default function AgentReplayPanel({ itineraryId, open, onOpenChange }: AgentReplayPanelProps) {
  const [messages, setMessages] = useState<AgentMsg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itineraryId) return;
    setLoading(true);
    (supabase as any)
      .from("agent_messages")
      .select("*")
      .eq("itinerary_id", itineraryId)
      .order("created_at", { ascending: true })
      .then(({ data, error }: any) => {
        if (!error) setMessages(data || []);
        setLoading(false);
      });
  }, [open, itineraryId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Replay dos agentes</SheetTitle>
          <SheetDescription>Como o time da Sofia pensou nesse roteiro.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma mensagem dos agentes ainda para esse roteiro.
            </p>
          ) : (
            messages.map((m) => {
              const agent = AGENTS[m.agent_name as AgentName];
              return (
                <div key={m.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-full ${agent?.avatarBg || "bg-muted"} flex items-center justify-center text-sm`}>
                      {agent?.emoji || "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${agent?.accent || ""}`}>
                        {agent?.displayName || m.agent_name}
                        <span className="text-muted-foreground font-normal"> · {m.role}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: ptBR })}
                      </div>
                    </div>
                    {m.notify_admin && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">🔔</span>}
                  </div>
                  <p className="text-sm whitespace-pre-line text-foreground/90">{m.content}</p>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
