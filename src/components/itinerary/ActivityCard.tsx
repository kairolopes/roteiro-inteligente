import { motion } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  Utensils, 
  Train, 
  Building, 
  Camera, 
  Sparkles,
  Lightbulb,
  Coins,
  Star,
  ExternalLink,
  Navigation
} from "lucide-react";
import { Activity } from "@/types/itinerary";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

const categoryConfig: Record<string, { icon: typeof Camera; bgClass: string; textClass: string; borderClass: string; imageQuery: string }> = {
  attraction: {
    icon: Camera,
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    borderClass: "border-l-blue-500",
    imageQuery: "landmark monument"
  },
  restaurant: {
    icon: Utensils,
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-500",
    borderClass: "border-l-orange-500",
    imageQuery: "restaurant food"
  },
  transport: {
    icon: Train,
    bgClass: "bg-green-500/10",
    textClass: "text-green-500",
    borderClass: "border-l-green-500",
    imageQuery: "train travel"
  },
  accommodation: {
    icon: Building,
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-500",
    borderClass: "border-l-purple-500",
    imageQuery: "hotel room"
  },
  activity: {
    icon: Sparkles,
    bgClass: "bg-pink-500/10",
    textClass: "text-pink-500",
    borderClass: "border-l-pink-500",
    imageQuery: "adventure activity"
  },
};

const defaultConfig = {
  icon: Sparkles,
  bgClass: "bg-gray-500/10",
  textClass: "text-gray-500",
  borderClass: "border-l-gray-500",
  imageQuery: "travel"
};

// Generate Google Maps URL from coordinates
function getGoogleMapsUrl(activity: Activity): string | null {
  if (activity.coordinates && activity.coordinates.length === 2) {
    const [lat, lng] = activity.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  // Fallback: search by location name
  if (activity.location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
  }
  return null;
}

const ActivityCard = ({ activity, index }: ActivityCardProps) => {
  const config = categoryConfig[activity.category] || defaultConfig;
  const CategoryIcon = config.icon;
  const googleMapsUrl = getGoogleMapsUrl(activity);
  
  // Use estimated rating from AI or default
  const rating = activity.estimatedRating || activity.rating;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass-card rounded-lg lg:rounded-xl overflow-hidden border-l-4",
        config.borderClass
      )}
    >
      {/* Category Header with Icon */}
      <div className={cn("px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2", config.bgClass)}>
        <CategoryIcon className={cn("w-4 h-4 lg:w-5 lg:h-5", config.textClass)} />
        <span className={cn("text-xs lg:text-sm font-medium capitalize", config.textClass)}>
          {activity.category === "attraction" ? "Atração" : 
           activity.category === "restaurant" ? "Restaurante" :
           activity.category === "transport" ? "Transporte" :
           activity.category === "accommodation" ? "Hospedagem" : "Atividade"}
        </span>
        {rating && (
          <div className="ml-auto flex items-center gap-1">
            <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs lg:text-sm font-medium">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          </div>
        )}
      </div>

      <div className="p-3 lg:p-4">
        <div className="flex gap-3 lg:gap-4">
          {/* Time */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={cn("w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center bg-primary/10")}>
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
            <span className="text-xs lg:text-sm font-semibold mt-1">{activity.time}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm lg:text-base leading-tight">{activity.title}</h4>
              {googleMapsUrl && (
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 touch-target p-1"
                  title="Abrir no Google Maps"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1 line-clamp-2 lg:line-clamp-3">
              {activity.description}
            </p>

            {/* Location */}
            <div className="flex items-center gap-1 mt-2 text-[10px] lg:text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{activity.location}</span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-2 lg:gap-3 mt-2 lg:mt-3">
              <div className="flex items-center gap-1 text-[10px] lg:text-xs">
                <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-muted-foreground" />
                <span>{activity.duration}</span>
              </div>
              {activity.cost && (
                <div className="flex items-center gap-1 text-[10px] lg:text-xs">
                  <Coins className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-muted-foreground" />
                  <span>{activity.cost}</span>
                </div>
              )}
            </div>

            {/* Tips */}
            {activity.tips && (
              <div className="flex items-start gap-2 mt-2 lg:mt-3 p-2 rounded-lg bg-yellow-500/10 text-[10px] lg:text-xs">
                <Lightbulb className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-700 dark:text-yellow-300 line-clamp-2 lg:line-clamp-none">{activity.tips}</span>
              </div>
            )}

            {/* Google Maps Button for Mobile */}
            {googleMapsUrl && (
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-xs lg:text-sm font-medium text-primary"
              >
                <ExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>Ver no Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
