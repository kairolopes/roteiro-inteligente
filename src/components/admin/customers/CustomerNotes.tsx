import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Loader2 } from 'lucide-react';

interface Note {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
}

interface CustomerNotesProps {
  userId: string;
}

export const CustomerNotes = ({ userId }: CustomerNotesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('customer_notes')
        .insert({
          user_id: userId,
          note: newNote.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote('');
      toast({
        title: 'Nota adicionada',
        description: 'A nota foi salva com sucesso.',
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Erro ao adicionar nota',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground">Notas Internas</h4>

      {/* Add Note Form */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Adicionar uma nota sobre este cliente..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={2}
          className="resize-none"
        />
        <Button 
          onClick={handleAddNote} 
          disabled={!newNote.trim() || isSaving}
          size="icon"
          className="shrink-0"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando notas...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {notes.map(note => (
            <div 
              key={note.id} 
              className="bg-muted/50 rounded-lg p-3 text-sm"
            >
              <p className="text-foreground whitespace-pre-wrap">{note.note}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
