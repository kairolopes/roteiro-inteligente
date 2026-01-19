import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarPrice } from "@/hooks/useFlightCalendar";

interface FlightCalendarProps {
  calendar: Record<string, CalendarPrice>;
  month: string; // YYYY-MM
  cheapestDay: CalendarPrice | null;
  isLoading: boolean;
  onDayClick: (date: string, price: CalendarPrice) => void;
  onMonthChange: (month: string) => void;
  selectedDate?: string;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function FlightCalendar({
  calendar,
  month,
  cheapestDay,
  isLoading,
  onDayClick,
  onMonthChange,
  selectedDate,
}: FlightCalendarProps) {
  const [year, monthNum] = month.split('-').map(Number);

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();
    
    const days: Array<{ date: string; day: number } | null> = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, day });
    }
    
    return days;
  }, [year, monthNum]);

  // Get price stats for color coding
  const priceStats = useMemo(() => {
    const prices = Object.values(calendar).map(p => p.price);
    if (prices.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return { min, max, avg };
  }, [calendar]);

  const getPriceColor = (price: number) => {
    if (price <= priceStats.min * 1.1) return 'bg-green-500/20 text-green-700 border-green-500/30';
    if (price <= priceStats.avg) return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
    return 'bg-red-500/20 text-red-700 border-red-500/30';
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(year, monthNum - 2, 1);
    onMonthChange(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, monthNum, 1);
    onMonthChange(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k`;
    }
    return price.toString();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold">
          {MONTHS_PT[monthNum - 1]} {year}
        </h3>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Cheapest Day Highlight */}
      {cheapestDay && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2"
        >
          <TrendingDown className="h-4 w-4 text-green-600" />
          <span className="text-sm">
            <span className="font-medium">Dia mais barato:</span>{' '}
            {new Date(cheapestDay.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} -{' '}
            <span className="font-bold text-green-600">
              R$ {cheapestDay.price.toLocaleString('pt-BR')}
            </span>{' '}
            ({cheapestDay.airline})
          </span>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, idx) => {
              if (!dayData) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const price = calendar[dayData.date];
              const isCheapest = cheapestDay?.date === dayData.date;
              const isSelected = selectedDate === dayData.date;
              const isPast = new Date(dayData.date) < new Date(new Date().toDateString());

              return (
                <motion.button
                  key={dayData.date}
                  whileHover={price && !isPast ? { scale: 1.05 } : undefined}
                  whileTap={price && !isPast ? { scale: 0.95 } : undefined}
                  onClick={() => price && !isPast && onDayClick(dayData.date, price)}
                  disabled={!price || isPast}
                  className={cn(
                    "aspect-square rounded-lg border transition-all flex flex-col items-center justify-center p-1",
                    isPast && "opacity-40 cursor-not-allowed",
                    !price && !isPast && "border-transparent",
                    price && !isPast && "cursor-pointer hover:shadow-md",
                    price && getPriceColor(price.price),
                    isCheapest && "ring-2 ring-green-500",
                    isSelected && "ring-2 ring-primary"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isPast && "text-muted-foreground"
                  )}>
                    {dayData.day}
                  </span>
                  {price && (
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">
                      {formatPrice(price.price)}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500/30" />
              <span>Barato</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-500/30" />
              <span>Médio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500/30" />
              <span>Caro</span>
            </div>
          </div>
        </>
      )}

      {/* No Data State */}
      {!isLoading && Object.keys(calendar).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum preço encontrado para este mês.</p>
          <p className="text-sm mt-1">Tente outro destino ou período.</p>
        </div>
      )}
    </div>
  );
}
