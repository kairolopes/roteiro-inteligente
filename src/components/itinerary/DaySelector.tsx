import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { ItineraryDay } from "@/types/itinerary";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DaySelectorProps {
  days: ItineraryDay[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

const DaySelector = ({ days, selectedDay, onSelectDay }: DaySelectorProps) => {
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
          {days.map((day) => (
            <motion.button
              key={day.day}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDay(day.day)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all touch-active",
                selectedDay === day.day
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <span className="font-bold">Dia {day.day}</span>
              <span className="hidden sm:flex items-center gap-1 opacity-80">
                <MapPin className="w-3 h-3" />
                {day.city}
              </span>
            </motion.button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default DaySelector;
