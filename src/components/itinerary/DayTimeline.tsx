import { motion } from "framer-motion";
import { Calendar, MapPin, Star, Lock, Wand2, Compass, Loader2 } from "lucide-react";
import { useState } from "react";
import { ItineraryDay, Itinerary as ItineraryType } from "@/types/itinerary";
import ActivityCard from "./ActivityCard";
import LockedDayOverlay from "./LockedDayOverlay";
import PietraEventsPanel from "./PietraEventsPanel";
import AgencyQuoteButton from "./AgencyQuoteButton";
import { Button } from "@/components/ui/button";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DayTimelineProps {
  day: ItineraryDay;
  isSelected: boolean;
  onSelect: () => void;
  isLocked?: boolean;
  totalDays?: number;
  onUnlock?: () => void;
  onSubscribe?: () => void;
  isLoggedIn?: boolean;
  itineraryId?: string;
  itineraryTitle?: string;
  itinerary?: ItineraryType;
  onItineraryUpdated?: (it: ItineraryType) => void;
}

const DayTimeline = ({
  day,
  isSelected,
  onSelect,
  isLocked = false,
  totalDays = 1,
  onUnlock,
  onSubscribe,
  isLoggedIn = false,
  itineraryId,
  itineraryTitle,
  itinerary,
  onItineraryUpdated,
}: DayTimelineProps) => {
  const { settings: agency } = useAgencySettings();
  const { user } = useAuth();
  const hasAgency = !!(agency?.agency_phone);
  const [brunoLoading, setBrunoLoading] = useState(false);
  const [liaLoading, setLiaLoading] = useState(false);

  const handleClick = () => {
    if (isLocked && onUnlock) onUnlock();
    else onSelect();
  };

  const runBruno = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itinerary || !onItineraryUpdated || day.activities.length < 2) return;
    setBrunoLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-bruno", {
        body: { activities: day.activities, itineraryId, userId: user?.id, dayNumber: day.day },
      });
      if (error) throw error;
      const order: string[] = data?.optimized_order || [];
      if (order.length === day.activities.length) {
        const reordered = order.map(id => day.activities.find(a => a.id === id)).filter(Boolean) as any[];
        const updated: ItineraryType = {
          ...itinerary,
          days: itinerary.days.map(d => d.day !== day.day ? d : { ...d, activities: reordered }),
        };
        onItineraryUpdated(updated);
        toast.success(`🧭 Bruno reorganizou`, {
          description: data?.saved_minutes ? `Economia: ~${data.saved_minutes}min` : data?.explanation,
        });
      } else {
        toast.info("Bruno não encontrou melhor ordem.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao chamar Bruno");
    } finally {
      setBrunoLoading(false);
    }
  };

  const runLia = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itinerary || !onItineraryUpdated) return;
    setLiaLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-lia", {
        body: { activities: day.activities, city: day.city, itineraryId, userId: user?.id },
      });
      if (error) throw error;
      const rewritten = (data?.rewritten || []) as any[];
      if (rewritten.length) {
        const updated: ItineraryType = {
          ...itinerary,
          days: itinerary.days.map(d => d.day !== day.day ? d : {
            ...d,
            activities: d.activities.map(a => {
              const r = rewritten.find(x => x.id === a.id);
              return r ? { ...a, description: r.description } : a;
            }),
          }),
        };
        onItineraryUpdated(updated);
        toast.success(`🌿 Lia reescreveu ${rewritten.length} descrições`);
      } else {
        toast.info("Lia não conseguiu melhorar dessa vez.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao chamar Lia");
    } finally {
      setLiaLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("mb-4 lg:mb-6 relative", isLocked && "overflow-hidden rounded-xl")}
    >
      {isLocked && onUnlock && onSubscribe && (
        <LockedDayOverlay
          dayNumber={day.day}
          totalDays={totalDays}
          onLogin={onUnlock}
          onSubscribe={onSubscribe}
          isLoggedIn={isLoggedIn}
        />
      )}

      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl transition-all touch-active",
          isSelected ? "gradient-primary text-primary-foreground" : "glass-card hover:border-primary",
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

      {isSelected && !isLocked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 lg:mt-4 space-y-3 lg:space-y-4 pl-3 lg:pl-4 border-l-2 border-primary/30 ml-5 lg:ml-6"
        >
          {/* Botões dos agentes — Bruno e Lia agora têm UI próprio */}
          {itinerary && onItineraryUpdated && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={runBruno}
                disabled={brunoLoading || day.activities.length < 2}
                className="h-8 text-xs gap-1.5"
              >
                {brunoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                Reorganizar dia (Bruno)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={runLia}
                disabled={liaLoading || day.activities.length === 0}
                className="h-8 text-xs gap-1.5"
              >
                {liaLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Tom local (Lia)
              </Button>
            </div>
          )}

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

          {day.activities.map((activity, idx) => (
            <ActivityCard key={activity.id} activity={activity} index={idx} />
          ))}

          <PietraEventsPanel city={day.city} country={day.country} date={day.date} />

          {hasAgency && (
            <AgencyQuoteButton
              variant="primary"
              context={{
                type: "full_package",
                itineraryId,
                itineraryTitle,
                dayNumber: day.day,
                destination: day.city,
                city: day.city,
                country: day.country,
                date: day.date,
              }}
              agency={{ agencyName: agency!.agency_name, agencyPhone: agency!.agency_phone }}
              agencyUserId={agency!.user_id}
              label={`Falar com consultor sobre o Dia ${day.day}`}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DayTimeline;
