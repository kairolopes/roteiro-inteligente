import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Chat from "./pages/Chat";
import Itinerary from "./pages/Itinerary";
import MyItineraries from "./pages/MyItineraries";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Passagens from "./pages/Passagens";
import FlightDetails from "./pages/FlightDetails";
import Vendas from "./pages/Vendas";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => {
  useVersionCheck();
  
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/passagens" element={<Passagens />} />
            <Route path="/passagens/:origem/:destino/:data" element={<FlightDetails />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/my-itineraries" element={<MyItineraries />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/vendas" element={<Vendas />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
