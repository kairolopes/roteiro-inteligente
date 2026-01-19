// Multi-Company Affiliate Links Generator
// Travelpayouts Marker ID: 696718
// Focus: Brazilian Market

const TRAVELPAYOUTS_MARKER = "696718";

// ============================================
// PARTNER IDs - Configure here when approved
// ============================================
const PARTNER_IDS = {
  // Travelpayouts approved
  hotellook: TRAVELPAYOUTS_MARKER,
  aviasales: TRAVELPAYOUTS_MARKER,
  wayaway: TRAVELPAYOUTS_MARKER, // Using same marker, update if you get specific trs ID
  getyourguide: TRAVELPAYOUTS_MARKER, // Update with your GYG Partner ID when received
  
  // Rejected partners
  skyscanner: "", // Skyscanner - REJECTED ❌
  
  // Pending approval - add IDs when approved
  kayak: "", // Add KAYAK partner ID when approved
  booking: "", // Add Booking.com aid when approved via Travelpayouts
};

/**
 * Booking context for generating precise affiliate links
 */
export interface BookingContext {
  city: string;
  country?: string;
  checkIn?: string;  // Format: "YYYY-MM-DD"
  checkOut?: string; // Format: "YYYY-MM-DD"
  activityName?: string;
  activityDate?: string; // Format: "YYYY-MM-DD"
  location?: string;
  origin?: string; // For flights
  originIata?: string;
  destinationIata?: string;
}

/**
 * Day context passed from the itinerary
 */
export interface DayContext {
  city: string;
  country: string;
  date: string;
  dayNumber: number;
}

/**
 * Affiliate company configuration
 */
export interface AffiliateCompany {
  id: string;
  name: string;
  icon: string;
  color: string;
  getLink: (context: BookingContext) => string;
  available: boolean;
  requiresId?: boolean;
  description?: string;
}

// ============================================
// HOTEL AFFILIATE LINKS
// ============================================

/**
 * Hotellook (Travelpayouts) - APPROVED ✅
 * Commission: ~5%
 * Popular in Brazil: Aggregates Booking.com, Hotels.com, etc.
 */
export function getHotellookLink(context: BookingContext): string {
  const params = new URLSearchParams({
    marker: PARTNER_IDS.hotellook,
    destination: context.city,
    language: "pt",
    currency: "BRL",
  });
  if (context.checkIn) params.set("checkIn", context.checkIn);
  if (context.checkOut) params.set("checkOut", context.checkOut);
  return `https://search.hotellook.com/?${params.toString()}`;
}

// ============================================
// FLIGHT AFFILIATE LINKS
// ============================================

/**
 * Aviasales (Travelpayouts) - APPROVED ✅
 * Commission: varies by route
 * Main flight aggregator
 */
export function getAviasalesLink(context: BookingContext): string {
  // Usar formato de busca direto do Aviasales
  const destination = context.destinationIata || context.city?.substring(0, 3).toUpperCase() || 'NYC';
  const origin = context.originIata || 'SAO';
  
  // Formato: /flights/ORIGEM+DATA+DESTINO+TIPO (1=só ida)
  let routeCode = `${origin}${destination}1`;
  
  if (context.activityDate) {
    // Data no formato YYYY-MM-DD -> DDMM
    const day = context.activityDate.slice(8, 10);
    const month = context.activityDate.slice(5, 7);
    routeCode = `${origin}${day}${month}${destination}1`;
  }
  
  return `https://www.aviasales.com/flights/${routeCode}?marker=${PARTNER_IDS.aviasales}`;
}

/**
 * WayAway (Travelpayouts) - APPROVED ✅
 * 50% revenue share + $10/WayAway Plus subscription
 * Best for cashback program
 */
export function getWayAwayLink(context: BookingContext): string {
  // WayAway usa mesmo formato de busca do Aviasales
  const destination = context.destinationIata || context.city?.substring(0, 3).toUpperCase() || 'NYC';
  const origin = context.originIata || 'SAO';
  
  // Formato: /flights/ORIGEM+DESTINO+TIPO
  const routeCode = `${origin}${destination}1`;
  
  return `https://www.aviasales.com/flights/${routeCode}?marker=${PARTNER_IDS.wayaway}`;
}

/**
 * Skyscanner Brasil - Interface 100% em português com R$ BRL
 * Não requer afiliado - link direto funciona perfeitamente
 */
export function getSkyscannerLink(context: BookingContext): string {
  const origin = (context.originIata || 'SAO').toLowerCase();
  const destination = (context.destinationIata || context.city?.substring(0, 3).toUpperCase() || 'anywhere').toLowerCase();
  
  // Domínio brasileiro - sempre em PT-BR com R$ BRL
  return `https://www.skyscanner.com.br/transporte/passagens-aereas/${origin}/${destination}/`;
}

/**
 * KAYAK - PENDING ⏳
 * CPC model via Travelpayouts or direct
 * Popular in Brazil
 */
export function getKayakLink(context: BookingContext): string {
  const destination = context.city || 'anywhere';
  const params = new URLSearchParams({
    sort: "bestflight_a",
  });
  if (context.activityDate) params.set("depart", context.activityDate);
  
  // Add affiliate tracking when approved
  if (PARTNER_IDS.kayak) {
    params.set("a", PARTNER_IDS.kayak);
  }
  
  return `https://www.kayak.com.br/flights/-${encodeURIComponent(destination)}?${params.toString()}`;
}

// ============================================
// TOUR/ACTIVITY AFFILIATE LINKS
// ============================================

/**
 * GetYourGuide (Travelpayouts) - APPROVED ✅
 * Commission: ~8%
 * Great for tours and activities
 */
export function getGetYourGuideLink(context: BookingContext): string {
  const query = context.activityName 
    ? `${context.activityName} ${context.city}` 
    : context.city;
  
  const params = new URLSearchParams({
    q: query,
    partner_id: PARTNER_IDS.getyourguide,
  });
  
  if (context.activityDate) params.set("date", context.activityDate);
  
  return `https://www.getyourguide.com/s/?${params.toString()}`;
}

// ============================================
// AFFILIATE CONFIGURATION BY CATEGORY
// Brazilian Market Focus
// ============================================

export const AFFILIATE_CONFIG = {
  hotels: [
    {
      id: "hotellook",
      name: "Hotellook",
      description: "Compara Booking, Hotels.com e mais",
      icon: "hotel",
      color: "primary",
      getLink: getHotellookLink,
      available: true,
    },
  ] as AffiliateCompany[],
  
  flights: [
    {
      id: "aviasales",
      name: "Aviasales",
      description: "Melhor preço garantido",
      icon: "plane",
      color: "primary",
      getLink: getAviasalesLink,
      available: true,
    },
    {
      id: "wayaway",
      name: "WayAway",
      description: "Ganhe cashback em voos",
      icon: "sparkles",
      color: "amber",
      getLink: getWayAwayLink,
      available: true,
    },
    {
      id: "skyscanner",
      name: "Skyscanner",
      description: "Compare milhares de voos",
      icon: "search",
      color: "cyan",
      getLink: getSkyscannerLink,
      available: false, // REJECTED ❌
      requiresId: true,
    },
    {
      id: "kayak",
      name: "KAYAK",
      description: "Buscador popular no Brasil",
      icon: "compass",
      color: "orange",
      getLink: getKayakLink,
      available: false, // Enable when KAYAK Partners approved
      requiresId: true,
    },
  ] as AffiliateCompany[],
  
  tours: [
    {
      id: "getyourguide",
      name: "GetYourGuide",
      description: "Tours e experiências",
      icon: "ticket",
      color: "blue",
      getLink: getGetYourGuideLink,
      available: true,
    },
  ] as AffiliateCompany[],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a partner is properly configured
 */
export function isPartnerConfigured(partnerId: keyof typeof PARTNER_IDS): boolean {
  return Boolean(PARTNER_IDS[partnerId] && PARTNER_IDS[partnerId].length > 0);
}

/**
 * Get all available partners for a category
 */
export function getAvailablePartners(category: keyof typeof AFFILIATE_CONFIG): AffiliateCompany[] {
  return AFFILIATE_CONFIG[category].filter(partner => partner.available);
}

// Legacy functions for backwards compatibility
export function getHotelLink(city: string, hotelName?: string): string {
  return getHotellookLink({ city, activityName: hotelName });
}

export function getFlightLink(destination: string): string {
  return getAviasalesLink({ city: destination });
}

export function getTourLink(city: string, activityName?: string): string {
  return getGetYourGuideLink({ city, activityName });
}
