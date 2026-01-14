import { motion } from "framer-motion";
import { Calendar, MapPin, Star } from "lucide-react";
import { ItineraryDay } from "@/types/itinerary";
import ActivityCard from "./ActivityCard";
import { cn } from "@/lib/utils";

interface DayTimelineProps {
  day: ItineraryDay;
  isSelected: boolean;
  onSelect: () => void;
}

const DayTimeline = ({ day, isSelected, onSelect }: DayTimelineProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Day Header */}
      <button
        onClick={onSelect}
        className={cn(
          "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
          isSelected
            ? "gradient-primary text-primary-foreground"
            : "glass-card hover:border-primary"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold",
          isSelected ? "bg-white/20" : "bg-primary/10 text-primary"
        )}>
          {day.day}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-lg">{day.date}</h3>
          <div className="flex items-center gap-1 text-sm opacity-90">
            <MapPin className="w-4 h-4" />
            <span>{day.city}, {day.country}</span>
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full text-xs",
          isSelected ? "bg-white/20" : "bg-secondary"
        )}>
          <Calendar className="w-3 h-3" />
          <span>{day.activities.length} atividades</span>
        </div>
      </button>

      {/* Activities */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4 pl-4 border-l-2 border-primary/30 ml-6"
        >
          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mb-4">
            {day.highlights.map((highlight, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                <Star className="w-3 h-3" />
                {highlight}
              </span>
            ))}
          </div>

          {/* Activity Cards */}
          {day.activities.map((activity, idx) => (
            <ActivityCard key={activity.id} activity={activity} index={idx} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DayTimeline;
