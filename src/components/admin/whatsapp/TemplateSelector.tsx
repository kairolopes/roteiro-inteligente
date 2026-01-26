import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  display_name: string;
  content: string;
  is_active: boolean;
  variables: string[] | null;
}

interface TemplateSelectorProps {
  onSelect: (name: string, content: string) => void;
  selectedTemplate?: string | null;
  showAll?: boolean;
}

export const TemplateSelector = ({ 
  onSelect, 
  selectedTemplate,
  showAll = false 
}: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        let query = supabase
          .from('whatsapp_templates')
          .select('*')
          .order('display_name');

        if (!showAll) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [showAll]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Nenhum template disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {templates.map(template => (
        <button
          key={template.id}
          onClick={() => onSelect(template.display_name, template.content)}
          className={cn(
            'w-full text-left p-3 rounded-lg border transition-colors',
            selectedTemplate === template.display_name
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">
                  {template.display_name}
                </h4>
                {!template.is_active && (
                  <span className="text-xs text-muted-foreground">(inativo)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {template.content}
              </p>
              {template.variables && template.variables.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Variáveis: {template.variables.join(', ')}
                </p>
              )}
            </div>
            {selectedTemplate === template.display_name && (
              <Check className="h-5 w-5 text-primary shrink-0" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
