import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bed, 
  Plane, 
  Ticket, 
  Car, 
  Shield, 
  ChevronDown,
  Building,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Activity } from "@/types/itinerary";
import { 
  AFFILIATE_CONFIG, 
  BookingContext, 
  DayContext,
  AffiliateCompany 
} from "@/lib/affiliateLinks";
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
  building: Building,
  plane: Plane,
  search: Plane, // Skyscanner
  compass: Plane, // KAYAK
  ticket: Ticket,
  map: MapPin,
  car: Car,
  shield: Shield,
};

const colorClasses: Record<string, { bg: string; hover: string; text: string }> = {
  purple: {
    bg: "bg-purple-500/10",
    hover: "hover:bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    hover: "hover:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-500/10",
    hover: "hover:bg-green-500/20",
    text: "text-green-600 dark:text-green-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    hover: "hover:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    hover: "hover:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  sky: {
    bg: "bg-sky-500/10",
    hover: "hover:bg-sky-500/20",
    text: "text-sky-600 dark:text-sky-400",
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
    const context = buildContext();
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
      
      // Also show car rental for transport
      const availableCars = AFFILIATE_CONFIG.carRental.filter(c => c.available);
      if (availableCars.length > 0) {
        categories.push({ key: "carRental", label: "Alugar Carro", companies: availableCars });
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

  const renderCompanyButton = (company: AffiliateCompany, isPrimary: boolean = false) => {
    const Icon = iconMap[company.icon] || Ticket;
    const colors = colorClasses[company.color] || colorClasses.blue;
    const link = company.getLink(context);
    
    return (
      <a
        key={company.id}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
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
          {renderCompanyButton(primaryCompany, true)}
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
              {companies.map(company => renderCompanyButton(company))}
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
