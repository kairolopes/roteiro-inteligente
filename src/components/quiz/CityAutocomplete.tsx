import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Lista curada de cidades populares mundiais (nome, país, emoji)
const CITIES = [
  // Brasil
  { name: "Rio de Janeiro", country: "Brasil", flag: "🇧🇷" },
  { name: "São Paulo", country: "Brasil", flag: "🇧🇷" },
  { name: "Salvador", country: "Brasil", flag: "🇧🇷" },
  { name: "Florianópolis", country: "Brasil", flag: "🇧🇷" },
  { name: "Fernando de Noronha", country: "Brasil", flag: "🇧🇷" },
  { name: "Foz do Iguaçu", country: "Brasil", flag: "🇧🇷" },
  { name: "Recife", country: "Brasil", flag: "🇧🇷" },
  { name: "Fortaleza", country: "Brasil", flag: "🇧🇷" },
  { name: "Porto de Galinhas", country: "Brasil", flag: "🇧🇷" },
  { name: "Jericoacoara", country: "Brasil", flag: "🇧🇷" },
  { name: "Gramado", country: "Brasil", flag: "🇧🇷" },
  // Argentina
  { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷" },
  { name: "Bariloche", country: "Argentina", flag: "🇦🇷" },
  { name: "Mendoza", country: "Argentina", flag: "🇦🇷" },
  { name: "El Calafate", country: "Argentina", flag: "🇦🇷" },
  { name: "Ushuaia", country: "Argentina", flag: "🇦🇷" },
  // Chile
  { name: "Santiago", country: "Chile", flag: "🇨🇱" },
  { name: "Atacama", country: "Chile", flag: "🇨🇱" },
  { name: "Valparaíso", country: "Chile", flag: "🇨🇱" },
  // Peru
  { name: "Lima", country: "Peru", flag: "🇵🇪" },
  { name: "Cusco", country: "Peru", flag: "🇵🇪" },
  { name: "Machu Picchu", country: "Peru", flag: "🇵🇪" },
  // EUA
  { name: "Nova York", country: "EUA", flag: "🇺🇸" },
  { name: "Miami", country: "EUA", flag: "🇺🇸" },
  { name: "Orlando", country: "EUA", flag: "🇺🇸" },
  { name: "Los Angeles", country: "EUA", flag: "🇺🇸" },
  { name: "San Francisco", country: "EUA", flag: "🇺🇸" },
  { name: "Las Vegas", country: "EUA", flag: "🇺🇸" },
  { name: "Chicago", country: "EUA", flag: "🇺🇸" },
  { name: "Havaí", country: "EUA", flag: "🇺🇸" },
  // México
  { name: "Cancún", country: "México", flag: "🇲🇽" },
  { name: "Cidade do México", country: "México", flag: "🇲🇽" },
  { name: "Tulum", country: "México", flag: "🇲🇽" },
  { name: "Playa del Carmen", country: "México", flag: "🇲🇽" },
  // Canadá
  { name: "Toronto", country: "Canadá", flag: "🇨🇦" },
  { name: "Vancouver", country: "Canadá", flag: "🇨🇦" },
  { name: "Montreal", country: "Canadá", flag: "🇨🇦" },
  // Itália
  { name: "Roma", country: "Itália", flag: "🇮🇹" },
  { name: "Florença", country: "Itália", flag: "🇮🇹" },
  { name: "Veneza", country: "Itália", flag: "🇮🇹" },
  { name: "Milão", country: "Itália", flag: "🇮🇹" },
  { name: "Nápoles", country: "Itália", flag: "🇮🇹" },
  { name: "Toscana", country: "Itália", flag: "🇮🇹" },
  { name: "Costa Amalfitana", country: "Itália", flag: "🇮🇹" },
  { name: "Cinque Terre", country: "Itália", flag: "🇮🇹" },
  // França
  { name: "Paris", country: "França", flag: "🇫🇷" },
  { name: "Nice", country: "França", flag: "🇫🇷" },
  { name: "Lyon", country: "França", flag: "🇫🇷" },
  { name: "Bordeaux", country: "França", flag: "🇫🇷" },
  { name: "Marselha", country: "França", flag: "🇫🇷" },
  // Espanha
  { name: "Barcelona", country: "Espanha", flag: "🇪🇸" },
  { name: "Madri", country: "Espanha", flag: "🇪🇸" },
  { name: "Sevilha", country: "Espanha", flag: "🇪🇸" },
  { name: "Ibiza", country: "Espanha", flag: "🇪🇸" },
  { name: "Valência", country: "Espanha", flag: "🇪🇸" },
  { name: "Granada", country: "Espanha", flag: "🇪🇸" },
  // Portugal
  { name: "Lisboa", country: "Portugal", flag: "🇵🇹" },
  { name: "Porto", country: "Portugal", flag: "🇵🇹" },
  { name: "Algarve", country: "Portugal", flag: "🇵🇹" },
  { name: "Madeira", country: "Portugal", flag: "🇵🇹" },
  { name: "Açores", country: "Portugal", flag: "🇵🇹" },
  // Grécia
  { name: "Atenas", country: "Grécia", flag: "🇬🇷" },
  { name: "Santorini", country: "Grécia", flag: "🇬🇷" },
  { name: "Mykonos", country: "Grécia", flag: "🇬🇷" },
  { name: "Creta", country: "Grécia", flag: "🇬🇷" },
  // Alemanha
  { name: "Berlim", country: "Alemanha", flag: "🇩🇪" },
  { name: "Munique", country: "Alemanha", flag: "🇩🇪" },
  { name: "Frankfurt", country: "Alemanha", flag: "🇩🇪" },
  { name: "Hamburgo", country: "Alemanha", flag: "🇩🇪" },
  // Reino Unido
  { name: "Londres", country: "Reino Unido", flag: "🇬🇧" },
  { name: "Edimburgo", country: "Reino Unido", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Manchester", country: "Reino Unido", flag: "🇬🇧" },
  // Holanda / Bélgica / Suíça / Áustria
  { name: "Amsterdã", country: "Holanda", flag: "🇳🇱" },
  { name: "Bruxelas", country: "Bélgica", flag: "🇧🇪" },
  { name: "Zurique", country: "Suíça", flag: "🇨🇭" },
  { name: "Genebra", country: "Suíça", flag: "🇨🇭" },
  { name: "Interlaken", country: "Suíça", flag: "🇨🇭" },
  { name: "Viena", country: "Áustria", flag: "🇦🇹" },
  // Leste europeu
  { name: "Praga", country: "República Tcheca", flag: "🇨🇿" },
  { name: "Budapeste", country: "Hungria", flag: "🇭🇺" },
  { name: "Cracóvia", country: "Polônia", flag: "🇵🇱" },
  // Escandinávia
  { name: "Estocolmo", country: "Suécia", flag: "🇸🇪" },
  { name: "Copenhague", country: "Dinamarca", flag: "🇩🇰" },
  { name: "Oslo", country: "Noruega", flag: "🇳🇴" },
  { name: "Reykjavik", country: "Islândia", flag: "🇮🇸" },
  // Japão
  { name: "Tóquio", country: "Japão", flag: "🇯🇵" },
  { name: "Kyoto", country: "Japão", flag: "🇯🇵" },
  { name: "Osaka", country: "Japão", flag: "🇯🇵" },
  { name: "Hokkaido", country: "Japão", flag: "🇯🇵" },
  // Tailândia / Sudeste asiático
  { name: "Bangkok", country: "Tailândia", flag: "🇹🇭" },
  { name: "Phuket", country: "Tailândia", flag: "🇹🇭" },
  { name: "Chiang Mai", country: "Tailândia", flag: "🇹🇭" },
  { name: "Krabi", country: "Tailândia", flag: "🇹🇭" },
  { name: "Bali", country: "Indonésia", flag: "🇮🇩" },
  { name: "Jakarta", country: "Indonésia", flag: "🇮🇩" },
  { name: "Singapura", country: "Singapura", flag: "🇸🇬" },
  { name: "Kuala Lumpur", country: "Malásia", flag: "🇲🇾" },
  { name: "Hanói", country: "Vietnã", flag: "🇻🇳" },
  { name: "Ho Chi Minh", country: "Vietnã", flag: "🇻🇳" },
  // China / Coreia / Hong Kong
  { name: "Pequim", country: "China", flag: "🇨🇳" },
  { name: "Xangai", country: "China", flag: "🇨🇳" },
  { name: "Hong Kong", country: "Hong Kong", flag: "🇭🇰" },
  { name: "Seul", country: "Coreia do Sul", flag: "🇰🇷" },
  // Índia
  { name: "Nova Delhi", country: "Índia", flag: "🇮🇳" },
  { name: "Mumbai", country: "Índia", flag: "🇮🇳" },
  { name: "Goa", country: "Índia", flag: "🇮🇳" },
  // Oriente Médio
  { name: "Dubai", country: "Emirados Árabes", flag: "🇦🇪" },
  { name: "Abu Dhabi", country: "Emirados Árabes", flag: "🇦🇪" },
  { name: "Doha", country: "Catar", flag: "🇶🇦" },
  { name: "Istambul", country: "Turquia", flag: "🇹🇷" },
  { name: "Capadócia", country: "Turquia", flag: "🇹🇷" },
  { name: "Jerusalém", country: "Israel", flag: "🇮🇱" },
  // África
  { name: "Cairo", country: "Egito", flag: "🇪🇬" },
  { name: "Luxor", country: "Egito", flag: "🇪🇬" },
  { name: "Marrakech", country: "Marrocos", flag: "🇲🇦" },
  { name: "Casablanca", country: "Marrocos", flag: "🇲🇦" },
  { name: "Cidade do Cabo", country: "África do Sul", flag: "🇿🇦" },
  { name: "Joanesburgo", country: "África do Sul", flag: "🇿🇦" },
  { name: "Zanzibar", country: "Tanzânia", flag: "🇹🇿" },
  // Oceania
  { name: "Sydney", country: "Austrália", flag: "🇦🇺" },
  { name: "Melbourne", country: "Austrália", flag: "🇦🇺" },
  { name: "Gold Coast", country: "Austrália", flag: "🇦🇺" },
  { name: "Auckland", country: "Nova Zelândia", flag: "🇳🇿" },
  { name: "Queenstown", country: "Nova Zelândia", flag: "🇳🇿" },
  // Caribe
  { name: "Punta Cana", country: "República Dominicana", flag: "🇩🇴" },
  { name: "Havana", country: "Cuba", flag: "🇨🇺" },
  { name: "Aruba", country: "Aruba", flag: "🇦🇼" },
  { name: "Cartagena", country: "Colômbia", flag: "🇨🇴" },
];

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CityAutocomplete({ value, onChange, placeholder }: CityAutocompleteProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cidades já selecionadas (separadas por vírgula no value)
  const selected = useMemo(
    () => value.split(",").map(s => s.trim()).filter(Boolean),
    [value]
  );

  const suggestions = useMemo(() => {
    const q = normalize(input.trim());
    if (!q) {
      // Mostra populares quando vazio
      return CITIES.slice(0, 8).filter(c => !selected.includes(c.name));
    }
    return CITIES.filter(c => {
      if (selected.includes(c.name)) return false;
      return (
        normalize(c.name).includes(q) ||
        normalize(c.country).includes(q)
      );
    }).slice(0, 8);
  }, [input, selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addCity = (city: string) => {
    const next = [...selected, city].join(", ");
    onChange(next);
    setInput("");
    setOpen(false);
  };

  const removeCity = (city: string) => {
    const next = selected.filter(c => c !== city).join(", ");
    onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      // Adiciona primeira sugestão ou texto livre
      const pick = suggestions[0]?.name || input.trim();
      addCity(pick);
    }
    if (e.key === "Backspace" && !input && selected.length > 0) {
      removeCity(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Chips das cidades selecionadas */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(city => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-medium border border-primary/30"
            >
              <MapPin className="w-3.5 h-3.5" />
              {city}
              <button
                type="button"
                onClick={() => removeCity(city)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                aria-label={`Remover ${city}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Digite uma cidade (ex: Roma, Paris, Tóquio...)"}
        className="bg-background border-primary/20 focus:border-primary text-base h-12"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {!input && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-b">
              ✨ Cidades populares
            </div>
          )}
          {suggestions.map((city) => (
            <button
              key={`${city.name}-${city.country}`}
              type="button"
              onClick={() => addCity(city.name)}
              className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-accent transition-colors",
                "flex items-center gap-3 border-b border-border/50 last:border-0"
              )}
            >
              <span className="text-xl">{city.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{city.name}</div>
                <div className="text-xs text-muted-foreground">{city.country}</div>
              </div>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        💡 Dica: digite e pressione Enter para adicionar várias cidades
      </p>
    </div>
  );
}
