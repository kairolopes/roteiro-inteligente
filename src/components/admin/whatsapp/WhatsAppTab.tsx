import { useState } from 'react';
import { MessageComposer } from './MessageComposer';
import { TemplateSelector } from './TemplateSelector';
import { MessageHistory } from './MessageHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, FileText, History } from 'lucide-react';

export const WhatsAppTab = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState('');

  const handleSelectTemplate = (templateName: string, content: string) => {
    setSelectedTemplate(templateName);
    setTemplateContent(content);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setTemplateContent('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">WhatsApp</h2>
        <p className="text-muted-foreground">Envie mensagens via Z-API</p>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <div className="grid lg:grid-cols-2 gap-6">
            <MessageComposer 
              initialMessage={templateContent}
              templateName={selectedTemplate}
              onClearTemplate={handleClearTemplate}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates Rápidos</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateSelector 
                  onSelect={handleSelectTemplate}
                  selectedTemplate={selectedTemplate}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector 
                onSelect={handleSelectTemplate}
                selectedTemplate={selectedTemplate}
                showAll
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <MessageHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};
