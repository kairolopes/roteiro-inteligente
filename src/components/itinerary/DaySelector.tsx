import { motion } from "framer-motion";
import { MapPin, Calendar, Lock } from "lucide-react";
import { ItineraryDay } from "@/types/itinerary";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useMemo } from "react";

interface DaySelectorProps {
  days: ItineraryDay[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
  startDate?: Date | string | null;
  freeDaysCount?: number;
  onLockedDayClick?: (dayNumber: number) => void;
}

const DaySelector = ({ 
  days, 
  selectedDay, 
  onSelectDay, 
  startDate,
  freeDaysCount = Infinity,
  onLockedDayClick
}: DaySelectorProps) => {
  // Calculate real dates for each day
  const daysWithDates = useMemo(() => {
    if (!startDate) return days.map(day => ({ ...day, realDate: null }));
    
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    if (isNaN(start.getTime())) return days.map(day => ({ ...day, realDate: null }));
    
    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return days.map(day => {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + (day.day - 1));
      
      const weekDay = weekDaysShort[dayDate.getDay()];
      const dayNum = dayDate.getDate().toString().padStart(2, '0');
      const month = (dayDate.getMonth() + 1).toString().padStart(2, '0');
      
      return {
        ...day,
        realDate: `${weekDay}, ${dayNum}/${month}`
      };
    });
  }, [days, startDate]);

  const handleDayClick = (day: typeof daysWithDates[0]) => {
    const isLocked = day.day > freeDaysCount;
    
    if (isLocked && onLockedDayClick) {
      onLockedDayClick(day.day);
    } else {
      onSelectDay(day.day);
    }
  };

  return (
    <div className="glass border-b border-border sticky top-[56px] lg:top-[89px] z-40">
      <ScrollArea className="w-full scroll-fade-x">
        <div className="flex items-center gap-2 p-3 lg:p-4 container mx-auto">
          {/* All days button */}
          <button
            onClick={() => onSelectDay(null)}
            className={cn(
              "flex-shrink-0 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all touch-active",
              selectedDay === null
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            Todos
          </button>

          {/* Individual day buttons */}
          {daysWithDates.map((day) => {
            const isLocked = day.day > freeDaysCount;
            
            return (
              <motion.button
                key={day.day}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-0.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-all touch-active min-w-[70px] lg:min-w-[90px]",
                  selectedDay === day.day
                    ? "gradient-primary text-primary-foreground"
                    : isLocked
                    ? "bg-secondary/50 text-muted-foreground border border-dashed border-border"
                    : "bg-secondary hover:bg-secondary/80"
                )}
              >
                <span className="font-bold flex items-center gap-1">
                  {isLocked && <Lock className="w-3 h-3" />}
                  Dia {day.day}
                </span>
                {day.realDate ? (
                  <span className="text-[10px] lg:text-xs opacity-80 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                    {day.realDate}
                  </span>
                ) : (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] lg:text-xs opacity-80">
                    <MapPin className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                    {day.city}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default DaySelector;
