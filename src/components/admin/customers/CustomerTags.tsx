import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface CustomerTagsProps {
  userId: string;
}

export const CustomerTags = ({ userId }: CustomerTagsProps) => {
  const { toast } = useToast();
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Fetch all available tags
        const { data: tags } = await supabase
          .from('customer_tags')
          .select('*')
          .order('name');

        setAllTags(tags || []);

        // Fetch assigned tags for this user
        const { data: assignments } = await supabase
          .from('customer_tag_assignments')
          .select('tag_id')
          .eq('user_id', userId);

        const assignedTagIds = new Set(assignments?.map(a => a.tag_id) || []);
        const assigned = (tags || []).filter(t => assignedTagIds.has(t.id));
        setAssignedTags(assigned);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [userId]);

  const handleAddTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('customer_tag_assignments')
        .insert({
          user_id: userId,
          tag_id: tagId,
        });

      if (error) throw error;

      const tag = allTags.find(t => t.id === tagId);
      if (tag) {
        setAssignedTags([...assignedTags, tag]);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Erro ao adicionar tag',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('customer_tag_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('tag_id', tagId);

      if (error) throw error;

      setAssignedTags(assignedTags.filter(t => t.id !== tagId));
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: 'Erro ao remover tag',
        variant: 'destructive',
      });
    }
  };

  const availableTags = allTags.filter(
    t => !assignedTags.some(at => at.id === t.id)
  );

  if (isLoading) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {assignedTags.map(tag => (
        <Badge 
          key={tag.id}
          variant="outline"
          style={{ 
            borderColor: tag.color, 
            backgroundColor: `${tag.color}20`,
            color: tag.color 
          }}
          className="text-xs pr-1"
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="ml-1 hover:opacity-70"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {availableTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm text-left"
                >
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
