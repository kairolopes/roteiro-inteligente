import { useState, useEffect } from "react";
import { Map, Marker, Overlay, ZoomControl } from "pigeon-maps";
import { ItineraryDay } from "@/types/itinerary";

interface ItineraryMapProps {
  days: ItineraryDay[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const ItineraryMap = ({ days, selectedDay, onSelectDay }: ItineraryMapProps) => {
  const [center, setCenter] = useState<[number, number]>([43.0, 12.0]);
  const [zoom, setZoom] = useState(6);
  const [popupDay, setPopupDay] = useState<ItineraryDay | null>(null);

  useEffect(() => {
    if (selectedDay !== null) {
      const day = days.find((d) => d.day === selectedDay);
      if (day) {
        setCenter(day.coordinates as [number, number]);
        setZoom(12);
      }
    } else if (days.length > 0) {
      const avgLat = days.reduce((sum, d) => sum + d.coordinates[0], 0) / days.length;
      const avgLng = days.reduce((sum, d) => sum + d.coordinates[1], 0) / days.length;
      setCenter([avgLat, avgLng]);
      setZoom(6);
    }
  }, [days, selectedDay]);

  if (days.length === 0) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border">
      <Map
        center={center}
        zoom={zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center);
          setZoom(zoom);
        }}
      >
        <ZoomControl />
        
        {days.map((day) => (
          <Marker
            key={day.day}
            anchor={day.coordinates as [number, number]}
            color={selectedDay === day.day ? "#f97316" : "#3b82f6"}
            onClick={() => {
              onSelectDay(day.day);
              setPopupDay(popupDay?.day === day.day ? null : day);
            }}
          />
        ))}

        {popupDay && (
          <Overlay anchor={popupDay.coordinates as [number, number]} offset={[0, -30]}>
            <div className="bg-background p-3 rounded-lg shadow-lg border border-border text-center min-w-[120px]">
              <strong className="text-base text-foreground">Dia {popupDay.day}</strong>
              <p className="text-sm mt-1 text-foreground">{popupDay.city}, {popupDay.country}</p>
              <p className="text-xs text-muted-foreground mt-1">{popupDay.date}</p>
            </div>
          </Overlay>
        )}
      </Map>
    </div>
  );
};

export default ItineraryMap;
