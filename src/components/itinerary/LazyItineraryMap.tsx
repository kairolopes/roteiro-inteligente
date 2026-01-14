import React, { Suspense, useEffect, useState } from "react";
import { ItineraryDay } from "@/types/itinerary";

const ItineraryMapLazy = React.lazy(() => import("./ItineraryMap"));

interface LazyMapProps {
  days: ItineraryDay[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const LazyItineraryMap = ({ days, selectedDay, onSelectDay }: LazyMapProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  if (!isMounted || days.length === 0) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full rounded-xl overflow-hidden border border-border flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Carregando mapa...</p>
        </div>
      }
    >
      <ItineraryMapLazy
        days={days}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
      />
    </Suspense>
  );
};

export default LazyItineraryMap;
