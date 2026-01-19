import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bed, 
  Plane, 
  Ticket, 
  ChevronDown,
  MapPin,
  ExternalLink,
  Sparkles,
  Search,
  Compass
} from "lucide-react";
import { Activity } from "@/types/itinerary";
import { 
  AFFILIATE_CONFIG, 
  BookingContext, 
  DayContext,
  AffiliateCompany 
} from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";
import { cn } from "@/lib/utils";

interface AffiliateButtonsProps {
  activity: Activity;
  dayContext: DayContext;
  tripDates?: {
    startDate: string;
    endDate: string;
  };
}

const iconMap: Record<string, typeof Bed> = {
  hotel: Bed,
  plane: Plane,
  sparkles: Sparkles,
  search: Search,
  compass: Compass,
  ticket: Ticket,
  map: MapPin,
};

const colorClasses: Record<string, { bg: string; hover: string; text: string }> = {
  primary: {
    bg: "bg-primary/10",
    hover: "hover:bg-primary/20",
    text: "text-primary",
  },
  blue: {
    bg: "bg-blue-500/10",
    hover: "hover:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    hover: "hover:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    hover: "hover:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    hover: "hover:bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
};

// Calculate checkout date (next day in the same city or trip end)
function calculateCheckOut(dayContext: DayContext, tripDates?: { endDate: string }): string | undefined {
  if (!dayContext.date) return undefined;
  
  // Simple: add 1 day to check-in
  try {
    const checkIn = new Date(dayContext.date);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  } catch {
    return tripDates?.endDate;
  }
}

// Parse date string to YYYY-MM-DD format
function parseDateToISO(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  
  // If already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try to parse common formats
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Fall through
  }
  
  return undefined;
}

const AffiliateButtons = ({ activity, dayContext, tripDates }: AffiliateButtonsProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Build booking context from activity and day
  const buildContext = (): BookingContext => {
    const dateISO = parseDateToISO(dayContext.date);
    const checkOut = calculateCheckOut(dayContext, tripDates);
    
    return {
      city: dayContext.city,
      country: dayContext.country,
      checkIn: dateISO,
      checkOut: checkOut,
      activityName: activity.title,
      activityDate: dateISO,
      location: activity.location,
    };
  };

  // Determine which affiliate categories apply to this activity
  const getRelevantCategories = (): { key: string; label: string; companies: AffiliateCompany[] }[] => {
    const categories: { key: string; label: string; companies: AffiliateCompany[] }[] = [];
    
    if (activity.category === "accommodation") {
      const availableHotels = AFFILIATE_CONFIG.hotels.filter(c => c.available);
      if (availableHotels.length > 0) {
        categories.push({ key: "hotels", label: "Reservar Hotel", companies: availableHotels });
      }
    }
    
    if (activity.category === "transport") {
      const availableFlights = AFFILIATE_CONFIG.flights.filter(c => c.available);
      if (availableFlights.length > 0) {
        categories.push({ key: "flights", label: "Buscar Voos", companies: availableFlights });
      }
    }
    
    if (activity.category === "attraction" || activity.category === "activity") {
      const availableTours = AFFILIATE_CONFIG.tours.filter(c => c.available);
      if (availableTours.length > 0) {
        categories.push({ key: "tours", label: "Ver Tours", companies: availableTours });
      }
    }
    
    return categories;
  };

  const relevantCategories = getRelevantCategories();
  
  if (relevantCategories.length === 0) return null;

  const context = buildContext();

  const handleCompanyClick = (company: AffiliateCompany, categoryKey: string) => {
    // Determine category type
    const categoryType = categoryKey === "hotels" ? "hotels" : categoryKey === "flights" ? "flights" : "tours";
    
    trackAffiliateClick({
      partnerId: company.id,
      partnerName: company.name,
      category: categoryType,
      component: "AffiliateButtons-Itinerary",
      destination: context.city,
    });
  };

  const renderCompanyButton = (company: AffiliateCompany, categoryKey: string, isPrimary: boolean = false) => {
    const Icon = iconMap[company.icon] || Ticket;
    const colors = colorClasses[company.color] || colorClasses.blue;
    const link = company.getLink(context);
    
    return (
      <a
        key={company.id}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleCompanyClick(company, categoryKey)}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg transition-colors text-xs lg:text-sm font-medium",
          colors.bg,
          colors.hover,
          colors.text
        )}
      >
        <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        <span>{company.name}</span>
        <ExternalLink className="w-3 h-3 opacity-50" />
      </a>
    );
  };

  const renderCategory = (category: { key: string; label: string; companies: AffiliateCompany[] }) => {
    const { key, label, companies } = category;
    const isExpanded = expandedCategory === key;
    const primaryCompany = companies[0];
    const hasMultiple = companies.length > 1;
    
    if (!hasMultiple) {
      // Single company - show direct button
      return (
        <div key={key}>
          {renderCompanyButton(primaryCompany, key)}
        </div>
      );
    }
    
    // Multiple companies - show expandable
    return (
      <div key={key} className="space-y-1">
        <button
          onClick={() => setExpandedCategory(isExpanded ? null : key)}
          className={cn(
            "flex items-center justify-between w-full py-2 px-3 rounded-lg transition-colors text-xs lg:text-sm font-medium",
            "bg-secondary/50 hover:bg-secondary"
          )}
        >
          <span>{label}</span>
          <ChevronDown 
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )} 
          />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 pl-2"
            >
              {companies.map(company => renderCompanyButton(company, key))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="mt-3 space-y-2">
      {relevantCategories.map(renderCategory)}
    </div>
  );
};

export default AffiliateButtons;
