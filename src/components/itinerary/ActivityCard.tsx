import { useState, useEffect } from "react";
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
  MessageCircle,
  ThumbsUp
} from "lucide-react";
import { Activity } from "@/types/itinerary";
import { cn } from "@/lib/utils";
import { getPhotoUrl } from "@/lib/googlePlaces";
import { Badge } from "@/components/ui/badge";

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

const categoryConfig: Record<string, { icon: typeof Camera; bgClass: string; textClass: string; borderClass: string }> = {
  attraction: {
    icon: Camera,
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    borderClass: "border-l-blue-500",
  },
  restaurant: {
    icon: Utensils,
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-500",
    borderClass: "border-l-orange-500",
  },
  transport: {
    icon: Train,
    bgClass: "bg-green-500/10",
    textClass: "text-green-500",
    borderClass: "border-l-green-500",
  },
  accommodation: {
    icon: Building,
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-500",
    borderClass: "border-l-purple-500",
  },
  activity: {
    icon: Sparkles,
    bgClass: "bg-pink-500/10",
    textClass: "text-pink-500",
    borderClass: "border-l-pink-500",
  },
};

const defaultConfig = {
  icon: Sparkles,
  bgClass: "bg-gray-500/10",
  textClass: "text-gray-500",
  borderClass: "border-l-gray-500",
};

const ActivityCard = ({ activity, index }: ActivityCardProps) => {
  const config = categoryConfig[activity.category] || defaultConfig;
  const CategoryIcon = config.icon;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const loadPhoto = async () => {
      if (activity.photoReference) {
        try {
          const url = await getPhotoUrl(activity.photoReference, 300);
          setPhotoUrl(url);
        } catch (error) {
          console.error("Error loading photo:", error);
          setPhotoError(true);
        }
      }
    };
    loadPhoto();
  }, [activity.photoReference]);

  const hasFoursquareData = activity.foursquareTips?.length || activity.foursquareTastes?.length;

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
      {/* Photo Section */}
      {activity.photoReference && !photoError && (
        <div className="relative w-full h-24 lg:h-32 bg-muted">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={activity.title}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Ratings Badge */}
          <div className="absolute top-2 right-2 flex gap-1">
            {activity.rating && (
              <div className="bg-black/70 text-white px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs flex items-center gap-0.5 lg:gap-1">
                <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 fill-yellow-400 text-yellow-400" />
                <span>{activity.rating.toFixed(1)}</span>
                {activity.userRatingsTotal && (
                  <span className="text-white/70 hidden lg:inline">({activity.userRatingsTotal})</span>
                )}
              </div>
            )}
            {activity.foursquareRating && (
              <div className="bg-purple-600/90 text-white px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs flex items-center gap-0.5 lg:gap-1">
                <span className="font-semibold">{activity.foursquareRating.toFixed(1)}</span>
                <span className="text-white/70">/10</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-3 lg:p-4">
        <div className="flex gap-3 lg:gap-4">
          {/* Time */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={cn("w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center", config.bgClass)}>
              <CategoryIcon className={cn("w-4 h-4 lg:w-5 lg:h-5", config.textClass)} />
            </div>
            <span className="text-xs lg:text-sm font-semibold mt-1">{activity.time}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm lg:text-base leading-tight">{activity.title}</h4>
              {activity.googleMapsUrl && (
                <a 
                  href={activity.googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 touch-target p-1"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1 line-clamp-2">
              {activity.description}
            </p>

            {/* Foursquare Categories - hidden on mobile */}
            {activity.foursquareCategories && activity.foursquareCategories.length > 0 && (
              <div className="hidden lg:flex flex-wrap gap-1 mt-2">
                {activity.foursquareCategories.slice(0, 3).map((cat, i) => (
                  <Badge key={i} variant="secondary" className="text-xs py-0 px-2">
                    {cat.shortName || cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Foursquare Tastes - hidden on mobile */}
            {activity.foursquareTastes && activity.foursquareTastes.length > 0 && (
              <div className="hidden lg:flex flex-wrap gap-1 mt-2">
                {activity.foursquareTastes.slice(0, 4).map((taste, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-0 px-2 capitalize">
                    {taste}
                  </Badge>
                ))}
              </div>
            )}

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
              {/* Rating without photo */}
              {activity.rating && !activity.photoReference && (
                <div className="flex items-center gap-1 text-[10px] lg:text-xs">
                  <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 fill-yellow-400 text-yellow-400" />
                  <span>{activity.rating.toFixed(1)}</span>
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

            {/* Foursquare Tips from Visitors - hidden on mobile */}
            {activity.foursquareTips && activity.foursquareTips.length > 0 && (
              <div className="hidden lg:block mt-3 space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3 h-3" />
                  <span>Dicas de visitantes</span>
                </div>
                {activity.foursquareTips.slice(0, 2).map((tip) => (
                  <div 
                    key={tip.id} 
                    className="p-2 rounded-lg bg-purple-500/10 text-xs"
                  >
                    <p className="text-foreground/80 italic">"{tip.text}"</p>
                    {tip.agreeCount > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-purple-600 dark:text-purple-400">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{tip.agreeCount}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
