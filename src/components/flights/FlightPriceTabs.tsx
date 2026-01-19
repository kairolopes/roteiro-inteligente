import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingDown, Sparkles, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlightPrice } from "@/hooks/useFlightPrices";

export type SortOption = 'price' | 'duration' | 'departure';
export type TabOption = 'cheapest' | 'fastest' | 'best';

interface FlightPriceTabsProps {
  flights: FlightPrice[];
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function FlightPriceTabs({
  flights,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
}: FlightPriceTabsProps) {
  const stats = useMemo(() => {
    if (flights.length === 0) {
      return {
        cheapest: { price: 0, duration: '' },
        fastest: { price: 0, duration: '' },
        best: { price: 0, duration: '' },
      };
    }

    // Sort by price for cheapest
    const sortedByPrice = [...flights].sort((a, b) => a.price - b.price);
    const cheapestFlight = sortedByPrice[0];

    // Sort by duration (transfers as proxy since we don't have exact duration)
    const sortedByDuration = [...flights].sort((a, b) => a.transfers - b.transfers);
    const fastestFlight = sortedByDuration[0];

    // Best value: balance of price and transfers
    const sortedByValue = [...flights].sort((a, b) => {
      const scoreA = a.price + (a.transfers * 500); // Weight for stops
      const scoreB = b.price + (b.transfers * 500);
      return scoreA - scoreB;
    });
    const bestFlight = sortedByValue[0];

    const getDurationLabel = (transfers: number) => {
      if (transfers === 0) return 'Direto';
      if (transfers === 1) return '1 parada';
      return `${transfers} paradas`;
    };

    return {
      cheapest: {
        price: cheapestFlight?.price || 0,
        duration: getDurationLabel(cheapestFlight?.transfers || 0),
      },
      fastest: {
        price: fastestFlight?.price || 0,
        duration: getDurationLabel(fastestFlight?.transfers || 0),
      },
      best: {
        price: bestFlight?.price || 0,
        duration: getDurationLabel(bestFlight?.transfers || 0),
      },
    };
  }, [flights]);

  const tabs = [
    {
      id: 'cheapest' as TabOption,
      label: 'Mais Barato',
      icon: TrendingDown,
      price: stats.cheapest.price,
      subtitle: stats.cheapest.duration,
    },
    {
      id: 'fastest' as TabOption,
      label: 'Mais Rápido',
      icon: Clock,
      price: stats.fastest.price,
      subtitle: stats.fastest.duration,
    },
    {
      id: 'best' as TabOption,
      label: 'Melhor Custo',
      icon: Sparkles,
      price: stats.best.price,
      subtitle: stats.best.duration,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Price Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex flex-col items-center px-4 py-3 rounded-xl border transition-all
                ${isActive 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                  : 'bg-card border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
              <div className="text-lg font-bold">
                R$ {tab.price.toLocaleString('pt-BR')}
              </div>
              <div className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {tab.subtitle}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Menor preço</SelectItem>
            <SelectItem value="duration">Menos paradas</SelectItem>
            <SelectItem value="departure">Hora de partida</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
