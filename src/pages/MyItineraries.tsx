import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Map, 
  Calendar, 
  Trash2, 
  Loader2,
  MapPin,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";

interface SavedItinerary {
  id: string;
  title: string;
  summary: string | null;
  duration: string | null;
  total_budget: string | null;
  destinations: string[] | null;
  created_at: string;
}

const MyItineraries = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
      setIsLoading(false);
    } else if (user) {
      fetchItineraries();
    }
  }, [user, authLoading]);

  const fetchItineraries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_itineraries")
        .select("id, title, summary, duration, total_budget, destinations, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar seus roteiros.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("saved_itineraries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItineraries((prev) => prev.filter((i) => i.id !== id));
      toast({
        title: "Roteiro excluído",
        description: "O roteiro foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o roteiro.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("saved_itineraries")
        .select("itinerary_data")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Store in session and navigate
      sessionStorage.setItem("generatedItinerary", JSON.stringify(data.itinerary_data));
      navigate("/itinerary");
    } catch (error) {
      console.error("Error loading itinerary:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o roteiro.",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Faça login para ver seus roteiros</h2>
          <p className="text-muted-foreground mb-6">
            Entre na sua conta para acessar roteiros salvos
          </p>
          <Button onClick={() => setShowAuthModal(true)} className="gradient-primary text-primary-foreground">
            Entrar
          </Button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Meus Roteiros</h1>
              <p className="text-sm text-muted-foreground">
                {itineraries.length} roteiro{itineraries.length !== 1 ? "s" : ""} salvo{itineraries.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {itineraries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <Map className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nenhum roteiro salvo</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie seu primeiro roteiro personalizado e ele aparecerá aqui
            </p>
            <Button onClick={() => navigate("/quiz")} className="gradient-primary text-primary-foreground">
              Criar Roteiro
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {itineraries.map((itinerary, index) => (
              <motion.div
                key={itinerary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-5 hover:border-primary/50 transition-colors"
              >
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{itinerary.title}</h3>
                
                {itinerary.summary && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {itinerary.summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {itinerary.duration && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {itinerary.duration}
                    </span>
                  )}
                  {itinerary.destinations?.slice(0, 2).map((dest, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3" />
                      {dest}
                    </span>
                  ))}
                  {itinerary.destinations && itinerary.destinations.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{itinerary.destinations.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {new Date(itinerary.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(itinerary.id)}
                      disabled={deletingId === itinerary.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === itinerary.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleView(itinerary.id)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyItineraries;
