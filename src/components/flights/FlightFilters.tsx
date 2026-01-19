import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlightPrice } from "@/hooks/useFlightPrices";

export interface FilterState {
  stops: number[];
  airlines: string[];
  minDepartureTime: number;
  maxDepartureTime: number;
  maxDuration: number | null;
}

interface FlightFiltersProps {
  flights: FlightPrice[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const getDefaultFilters = (): FilterState => ({
  stops: [0, 1, 2],
  airlines: [],
  minDepartureTime: 0,
  maxDepartureTime: 1440,
  maxDuration: null,
});

export function FlightFilters({ flights, filters, onFiltersChange }: FlightFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    stops: true,
    airlines: true,
    times: false,
  });

  // Calculate stats from flights
  const stats = useMemo(() => {
    const directFlights = flights.filter(f => f.transfers === 0);
    const oneStopFlights = flights.filter(f => f.transfers === 1);
    const multiStopFlights = flights.filter(f => f.transfers >= 2);
    
    const airlines = [...new Set(flights.map(f => f.airline))].sort();
    
    const minPriceByStops: Record<number, number> = {};
    if (directFlights.length) minPriceByStops[0] = Math.min(...directFlights.map(f => f.price));
    if (oneStopFlights.length) minPriceByStops[1] = Math.min(...oneStopFlights.map(f => f.price));
    if (multiStopFlights.length) minPriceByStops[2] = Math.min(...multiStopFlights.map(f => f.price));

    const minPriceByAirline: Record<string, number> = {};
    airlines.forEach(airline => {
      const airlineFlights = flights.filter(f => f.airline === airline);
      if (airlineFlights.length) {
        minPriceByAirline[airline] = Math.min(...airlineFlights.map(f => f.price));
      }
    });

    return {
      directCount: directFlights.length,
      oneStopCount: oneStopFlights.length,
      multiStopCount: multiStopFlights.length,
      airlines,
      minPriceByStops,
      minPriceByAirline,
    };
  }, [flights]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleStopsChange = (stops: number, checked: boolean) => {
    const newStops = checked 
      ? [...filters.stops, stops]
      : filters.stops.filter(s => s !== stops);
    onFiltersChange({ ...filters, stops: newStops });
  };

  const handleAirlineChange = (airline: string, checked: boolean) => {
    const newAirlines = checked
      ? [...filters.airlines, airline]
      : filters.airlines.filter(a => a !== airline);
    onFiltersChange({ ...filters, airlines: newAirlines });
  };

  const handleTimeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minDepartureTime: values[0],
      maxDepartureTime: values[1],
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const clearFilters = () => {
    onFiltersChange({
      ...getDefaultFilters(),
      airlines: [], // Clear airlines but keep all stops selected
    });
  };

  const hasActiveFilters = 
    filters.stops.length < 3 || 
    filters.airlines.length > 0 ||
    filters.minDepartureTime > 0 ||
    filters.maxDepartureTime < 1440;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-4 sticky top-24"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Stops Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('stops')}
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
        >
          <span>Conexões</span>
          {expandedSections.stops ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.stops && (
          <div className="space-y-2 mt-2">
            {stats.directCount > 0 && (
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.stops.includes(0)}
                    onCheckedChange={(checked) => handleStopsChange(0, !!checked)}
                  />
                  <span className="text-sm">Direto</span>
                  <Badge variant="outline" className="text-xs">{stats.directCount}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  R$ {stats.minPriceByStops[0]?.toLocaleString('pt-BR') || '-'}
                </span>
              </label>
            )}
            {stats.oneStopCount > 0 && (
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.stops.includes(1)}
                    onCheckedChange={(checked) => handleStopsChange(1, !!checked)}
                  />
                  <span className="text-sm">1 parada</span>
                  <Badge variant="outline" className="text-xs">{stats.oneStopCount}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  R$ {stats.minPriceByStops[1]?.toLocaleString('pt-BR') || '-'}
                </span>
              </label>
            )}
            {stats.multiStopCount > 0 && (
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.stops.includes(2)}
                    onCheckedChange={(checked) => handleStopsChange(2, !!checked)}
                  />
                  <span className="text-sm">2+ paradas</span>
                  <Badge variant="outline" className="text-xs">{stats.multiStopCount}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  R$ {stats.minPriceByStops[2]?.toLocaleString('pt-BR') || '-'}
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      <Separator className="my-3" />

      {/* Airlines Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('airlines')}
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
        >
          <span>Companhias aéreas</span>
          {expandedSections.airlines ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.airlines && (
          <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
            {stats.airlines.map((airline) => (
              <label key={airline} className="flex items-center justify-between cursor-pointer py-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.airlines.length === 0 || filters.airlines.includes(airline)}
                    onCheckedChange={(checked) => handleAirlineChange(airline, !!checked)}
                  />
                  <span className="text-sm truncate max-w-[120px]">{airline}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  R$ {stats.minPriceByAirline[airline]?.toLocaleString('pt-BR') || '-'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-3" />

      {/* Departure Time Filter */}
      <div>
        <button
          onClick={() => toggleSection('times')}
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
        >
          <span>Horário de partida</span>
          {expandedSections.times ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedSections.times && (
          <div className="mt-4 px-2">
            <Slider
              value={[filters.minDepartureTime, filters.maxDepartureTime]}
              onValueChange={handleTimeChange}
              min={0}
              max={1440}
              step={30}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(filters.minDepartureTime)}</span>
              <span>{formatTime(filters.maxDepartureTime)}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
