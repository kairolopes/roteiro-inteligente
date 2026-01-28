import { motion } from "framer-motion";
import { Calendar, MapPin, Star, Lock } from "lucide-react";
import { ItineraryDay } from "@/types/itinerary";
import ActivityCard from "./ActivityCard";
import LockedDayOverlay from "./LockedDayOverlay";
import { cn } from "@/lib/utils";

interface DayTimelineProps {
  day: ItineraryDay;
  isSelected: boolean;
  onSelect: () => void;
  tripDates?: {
    startDate: string;
    endDate: string;
  };
  isLocked?: boolean;
  totalDays?: number;
  onUnlock?: () => void;
  onSubscribe?: () => void;
  isLoggedIn?: boolean;
}

const DayTimeline = ({ 
  day, 
  isSelected, 
  onSelect, 
  tripDates,
  isLocked = false,
  totalDays = 1,
  onUnlock,
  onSubscribe,
  isLoggedIn = false
}: DayTimelineProps) => {
  // Create day context for affiliate links
  const dayContext = {
    city: day.city,
    country: day.country,
    date: day.date,
    dayNumber: day.day,
  };

  // Handle click on locked day
  const handleClick = () => {
    if (isLocked && onUnlock) {
      onUnlock();
    } else {
      onSelect();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-4 lg:mb-6 relative", isLocked && "overflow-hidden rounded-xl")}
    >
      {/* Locked Overlay */}
      {isLocked && onUnlock && onSubscribe && (
        <LockedDayOverlay
          dayNumber={day.day}
          totalDays={totalDays}
          onLogin={onUnlock}
          onSubscribe={onSubscribe}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Day Header */}
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl transition-all touch-active",
          isSelected
            ? "gradient-primary text-primary-foreground"
            : "glass-card hover:border-primary",
          isLocked && "filter blur-[6px] pointer-events-none select-none"
        )}
      >
        <div className={cn(
          "w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center text-lg lg:text-xl font-bold flex-shrink-0",
          isSelected ? "bg-white/20" : "bg-primary/10 text-primary"
        )}>
          {isLocked ? <Lock className="w-5 h-5 lg:w-6 lg:h-6" /> : day.day}
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-bold text-base lg:text-lg">{day.date}</h3>
          <div className="flex items-center gap-1 text-xs lg:text-sm opacity-90">
            <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
            <span className="truncate">{day.city}, {day.country}</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs flex-shrink-0",
          isSelected ? "bg-white/20" : "bg-secondary"
        )}>
          <Calendar className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
          <span>{day.activities.length}</span>
        </div>
      </button>

      {/* Activities */}
      {isSelected && !isLocked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 lg:mt-4 space-y-3 lg:space-y-4 pl-3 lg:pl-4 border-l-2 border-primary/30 ml-5 lg:ml-6"
        >
          {/* Highlights - horizontal scroll on mobile */}
          <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-2 -mx-3 px-3 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-x-visible">
            {day.highlights.slice(0, 5).map((highlight, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] lg:text-xs font-medium flex-shrink-0 whitespace-nowrap"
              >
                <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                {highlight}
              </span>
            ))}
          </div>

          {/* Activity Cards */}
          {day.activities.map((activity, idx) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              index={idx}
              dayContext={dayContext}
              tripDates={tripDates}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DayTimeline;
