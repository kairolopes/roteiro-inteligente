import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Icon, LatLngExpression, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ItineraryDay } from "@/types/itinerary";

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ItineraryMapProps {
  days: ItineraryDay[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const MapController = ({ days, selectedDay }: { days: ItineraryDay[]; selectedDay: number | null }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDay !== null) {
      const day = days.find((d) => d.day === selectedDay);
      if (day) {
        map.flyTo(day.coordinates, 12, { duration: 1 });
      }
    } else if (days.length > 0) {
      const bounds: LatLngBoundsExpression = days.map((d) => d.coordinates as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [days, selectedDay, map]);

  return null;
};

const ItineraryMap = ({ days, selectedDay, onSelectDay }: ItineraryMapProps) => {
  const center: LatLngExpression = days.length > 0 ? days[0].coordinates : [43.0, 12.0];

  const routeCoordinates = days.map((day) => day.coordinates as LatLngExpression);

  if (days.length === 0) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-border flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border">
      <MapContainer
        key={`map-${days.length}-${days[0]?.day || 0}`}
        center={center}
        zoom={6}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController days={days} selectedDay={selectedDay} />
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "hsl(var(--primary))",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }}
        />
        {days.map((day) => (
          <Marker
            key={day.day}
            position={day.coordinates}
            icon={selectedDay === day.day ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelectDay(day.day),
            }}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-base">Dia {day.day}</strong>
                <p className="text-sm mt-1">{day.city}, {day.country}</p>
                <p className="text-xs text-muted-foreground mt-1">{day.date}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ItineraryMap;
