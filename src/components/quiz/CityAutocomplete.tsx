import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, X, Search, Globe2 } from "lucide-react";
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
  { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷" },
  { name: "Bariloche", country: "Argentina", flag: "🇦🇷" },
  { name: "Mendoza", country: "Argentina", flag: "🇦🇷" },
  { name: "El Calafate", country: "Argentina", flag: "🇦🇷" },
  { name: "Ushuaia", country: "Argentina", flag: "🇦🇷" },
  { name: "Santiago", country: "Chile", flag: "🇨🇱" },
  { name: "Atacama", country: "Chile", flag: "🇨🇱" },
  { name: "Valparaíso", country: "Chile", flag: "🇨🇱" },
  { name: "Lima", country: "Peru", flag: "🇵🇪" },
  { name: "Cusco", country: "Peru", flag: "🇵🇪" },
  { name: "Machu Picchu", country: "Peru", flag: "🇵🇪" },
  { name: "Nova York", country: "EUA", flag: "🇺🇸" },
  { name: "Miami", country: "EUA", flag: "🇺🇸" },
  { name: "Orlando", country: "EUA", flag: "🇺🇸" },
  { name: "Los Angeles", country: "EUA", flag: "🇺🇸" },
  { name: "San Francisco", country: "EUA", flag: "🇺🇸" },
  { name: "Las Vegas", country: "EUA", flag: "🇺🇸" },
  { name: "Chicago", country: "EUA", flag: "🇺🇸" },
  { name: "Havaí", country: "EUA", flag: "🇺🇸" },
  { name: "Cancún", country: "México", flag: "🇲🇽" },
  { name: "Cidade do México", country: "México", flag: "🇲🇽" },
  { name: "Tulum", country: "México", flag: "🇲🇽" },
  { name: "Playa del Carmen", country: "México", flag: "🇲🇽" },
  { name: "Toronto", country: "Canadá", flag: "🇨🇦" },
  { name: "Vancouver", country: "Canadá", flag: "🇨🇦" },
  { name: "Montreal", country: "Canadá", flag: "🇨🇦" },
  { name: "Roma", country: "Itália", flag: "🇮🇹" },
  { name: "Florença", country: "Itália", flag: "🇮🇹" },
  { name: "Veneza", country: "Itália", flag: "🇮🇹" },
  { name: "Milão", country: "Itália", flag: "🇮🇹" },
  { name: "Nápoles", country: "Itália", flag: "🇮🇹" },
  { name: "Toscana", country: "Itália", flag: "🇮🇹" },
  { name: "Costa Amalfitana", country: "Itália", flag: "🇮🇹" },
  { name: "Cinque Terre", country: "Itália", flag: "🇮🇹" },
  { name: "Paris", country: "França", flag: "🇫🇷" },
  { name: "Nice", country: "França", flag: "🇫🇷" },
  { name: "Lyon", country: "França", flag: "🇫🇷" },
  { name: "Bordeaux", country: "França", flag: "🇫🇷" },
  { name: "Marselha", country: "França", flag: "🇫🇷" },
  { name: "Barcelona", country: "Espanha", flag: "🇪🇸" },
  { name: "Madri", country: "Espanha", flag: "🇪🇸" },
  { name: "Sevilha", country: "Espanha", flag: "🇪🇸" },
  { name: "Ibiza", country: "Espanha", flag: "🇪🇸" },
  { name: "Valência", country: "Espanha", flag: "🇪🇸" },
  { name: "Granada", country: "Espanha", flag: "🇪🇸" },
  { name: "Lisboa", country: "Portugal", flag: "🇵🇹" },
  { name: "Porto", country: "Portugal", flag: "🇵🇹" },
  { name: "Algarve", country: "Portugal", flag: "🇵🇹" },
  { name: "Madeira", country: "Portugal", flag: "🇵🇹" },
  { name: "Açores", country: "Portugal", flag: "🇵🇹" },
  { name: "Atenas", country: "Grécia", flag: "🇬🇷" },
  { name: "Santorini", country: "Grécia", flag: "🇬🇷" },
  { name: "Mykonos", country: "Grécia", flag: "🇬🇷" },
  { name: "Creta", country: "Grécia", flag: "🇬🇷" },
  { name: "Berlim", country: "Alemanha", flag: "🇩🇪" },
  { name: "Munique", country: "Alemanha", flag: "🇩🇪" },
  { name: "Frankfurt", country: "Alemanha", flag: "🇩🇪" },
  { name: "Hamburgo", country: "Alemanha", flag: "🇩🇪" },
  { name: "Londres", country: "Reino Unido", flag: "🇬🇧" },
  { name: "Edimburgo", country: "Reino Unido", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Manchester", country: "Reino Unido", flag: "🇬🇧" },
  { name: "Amsterdã", country: "Holanda", flag: "🇳🇱" },
  { name: "Bruxelas", country: "Bélgica", flag: "🇧🇪" },
  { name: "Zurique", country: "Suíça", flag: "🇨🇭" },
  { name: "Genebra", country: "Suíça", flag: "🇨🇭" },
  { name: "Interlaken", country: "Suíça", flag: "🇨🇭" },
  { name: "Viena", country: "Áustria", flag: "🇦🇹" },
  { name: "Praga", country: "República Tcheca", flag: "🇨🇿" },
  { name: "Budapeste", country: "Hungria", flag: "🇭🇺" },
  { name: "Cracóvia", country: "Polônia", flag: "🇵🇱" },
  { name: "Estocolmo", country: "Suécia", flag: "🇸🇪" },
  { name: "Copenhague", country: "Dinamarca", flag: "🇩🇰" },
  { name: "Oslo", country: "Noruega", flag: "🇳🇴" },
  { name: "Reykjavik", country: "Islândia", flag: "🇮🇸" },
  { name: "Tóquio", country: "Japão", flag: "🇯🇵" },
  { name: "Kyoto", country: "Japão", flag: "🇯🇵" },
  { name: "Osaka", country: "Japão", flag: "🇯🇵" },
  { name: "Hokkaido", country: "Japão", flag: "🇯🇵" },
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
  { name: "Pequim", country: "China", flag: "🇨🇳" },
  { name: "Xangai", country: "China", flag: "🇨🇳" },
  { name: "Hong Kong", country: "Hong Kong", flag: "🇭🇰" },
  { name: "Seul", country: "Coreia do Sul", flag: "🇰🇷" },
  { name: "Nova Delhi", country: "Índia", flag: "🇮🇳" },
  { name: "Mumbai", country: "Índia", flag: "🇮🇳" },
  { name: "Goa", country: "Índia", flag: "🇮🇳" },
  { name: "Dubai", country: "Emirados Árabes", flag: "🇦🇪" },
  { name: "Abu Dhabi", country: "Emirados Árabes", flag: "🇦🇪" },
  { name: "Doha", country: "Catar", flag: "🇶🇦" },
  { name: "Istambul", country: "Turquia", flag: "🇹🇷" },
  { name: "Capadócia", country: "Turquia", flag: "🇹🇷" },
  { name: "Jerusalém", country: "Israel", flag: "🇮🇱" },
  { name: "Cairo", country: "Egito", flag: "🇪🇬" },
  { name: "Luxor", country: "Egito", flag: "🇪🇬" },
  { name: "Marrakech", country: "Marrocos", flag: "🇲🇦" },
  { name: "Casablanca", country: "Marrocos", flag: "🇲🇦" },
  { name: "Cidade do Cabo", country: "África do Sul", flag: "🇿🇦" },
  { name: "Joanesburgo", country: "África do Sul", flag: "🇿🇦" },
  { name: "Zanzibar", country: "Tanzânia", flag: "🇹🇿" },
  { name: "Sydney", country: "Austrália", flag: "🇦🇺" },
  { name: "Melbourne", country: "Austrália", flag: "🇦🇺" },
  { name: "Gold Coast", country: "Austrália", flag: "🇦🇺" },
  { name: "Auckland", country: "Nova Zelândia", flag: "🇳🇿" },
  { name: "Queenstown", country: "Nova Zelândia", flag: "🇳🇿" },
  { name: "Punta Cana", country: "República Dominicana", flag: "🇩🇴" },
  { name: "Havana", country: "Cuba", flag: "🇨🇺" },
  { name: "Aruba", country: "Aruba", flag: "🇦🇼" },
  { name: "Cartagena", country: "Colômbia", flag: "🇨🇴" },
];

// Lista única de países (auto-gerada das cidades) para sugestões "país inteiro"
const COUNTRIES = Array.from(
  new Map(CITIES.map(c => [c.country, c.flag])).entries()
).map(([country, flag]) => ({ name: country, country: "País inteiro", flag, isCountry: true }));

type Suggestion = { name: string; country: string; flag: string; isCountry?: boolean };

const POPULAR_QUICK = ["Paris", "Tóquio", "Roma", "Nova York", "Lisboa", "Bali", "Cancún", "Buenos Aires"];

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

  const selected = useMemo(
    () => value.split(",").map(s => s.trim()).filter(Boolean),
    [value]
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = normalize(input.trim());
    if (!q) return [];

    const all: Suggestion[] = [...COUNTRIES, ...CITIES];
    return all
      .filter(item => {
        if (selected.includes(item.name)) return false;
        return (
          normalize(item.name).includes(q) ||
          normalize(item.country).includes(q)
        );
      })
      .slice(0, 8);
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

  const addEntry = (entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    const next = [...selected, trimmed].join(", ");
    onChange(next);
    setInput("");
    setOpen(false);
  };

  const removeEntry = (entry: string) => {
    const next = selected.filter(c => c !== entry).join(", ");
    onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      // Sempre aceita o que foi digitado, mesmo sem match na lista
      addEntry(input.trim());
    }
    if (e.key === "Backspace" && !input && selected.length > 0) {
      removeEntry(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Chips das seleções */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map(entry => (
            <span
              key={entry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-medium border border-primary/30"
            >
              <MapPin className="w-3.5 h-3.5" />
              {entry}
              <button
                type="button"
                onClick={() => removeEntry(entry)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                aria-label={`Remover ${entry}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input principal grande e destacado */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Digite cidade, país ou região..."}
          className="bg-background border-2 border-primary/30 focus:border-primary text-base h-14 pl-12 pr-4 rounded-xl shadow-sm"
        />
      </div>

      {/* Dropdown de sugestões */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl">
          {suggestions.map((item) => (
            <button
              key={`${item.name}-${item.country}`}
              type="button"
              onClick={() => addEntry(item.name)}
              className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-accent transition-colors",
                "flex items-center gap-3 border-b border-border/50 last:border-0"
              )}
            >
              <span className="text-xl">{item.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2">
                  {item.name}
                  {item.isCountry && (
                    <span className="text-[10px] uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      País
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{item.country}</div>
              </div>
              {item.isCountry ? (
                <Globe2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <MapPin className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Sugestões rápidas (chips clicáveis) — só quando vazio */}
      {!input && selected.length < 5 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2">✨ Populares — clique para adicionar:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_QUICK.filter(p => !selected.includes(p)).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => addEntry(p)}
                className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm transition-colors border border-border"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        💡 Pode digitar qualquer lugar — cidade, país ou região. Pressione Enter para adicionar vários.
      </p>
    </div>
  );
}
