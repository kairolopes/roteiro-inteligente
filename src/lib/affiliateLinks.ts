// Multi-Company Affiliate Links Generator
// Travelpayouts Marker ID: 489165

const TRAVELPAYOUTS_MARKER = "489165";

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
  available: boolean; // Whether the affiliate is approved/active
}

// ============================================
// HOTEL AFFILIATE LINKS
// ============================================

/**
 * Hotellook (Travelpayouts) - Commission: ~5%
 */
export function getHotellookLink(context: BookingContext): string {
  const params = new URLSearchParams({
    marker: TRAVELPAYOUTS_MARKER,
    destination: context.city,
  });
  if (context.checkIn) params.set("checkIn", context.checkIn);
  if (context.checkOut) params.set("checkOut", context.checkOut);
  return `https://search.hotellook.com/?${params.toString()}`;
}

/**
 * Booking.com (via Travelpayouts) - Pending approval
 */
export function getBookingLink(context: BookingContext): string {
  const params = new URLSearchParams({
    aid: TRAVELPAYOUTS_MARKER,
    ss: context.city,
  });
  if (context.checkIn) params.set("checkin", context.checkIn);
  if (context.checkOut) params.set("checkout", context.checkOut);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

/**
 * Airbnb - Commission: varies (requires separate affiliate program)
 * Note: Airbnb Associates program - sign up at airbnb.com/associates
 */
export function getAirbnbLink(context: BookingContext): string {
  const params = new URLSearchParams({
    query: context.city,
  });
  if (context.checkIn) params.set("checkin", context.checkIn);
  if (context.checkOut) params.set("checkout", context.checkOut);
  // Add affiliate tag when approved - replace YOUR_AIRBNB_ID
  return `https://www.airbnb.com/s/${encodeURIComponent(context.city)}/homes?${params.toString()}`;
}

// ============================================
// FLIGHT AFFILIATE LINKS
// ============================================

/**
 * Aviasales (Travelpayouts) - Commission: varies by route
 */
export function getAviasalesLink(context: BookingContext): string {
  const params = new URLSearchParams({
    marker: TRAVELPAYOUTS_MARKER,
  });
  if (context.city) params.set("destination", context.city);
  if (context.activityDate) params.set("depart_date", context.activityDate);
  return `https://www.aviasales.com/?${params.toString()}`;
}

/**
 * Skyscanner - Commission: ~50% revenue share
 * Note: Skyscanner Travel APIs - sign up at partners.skyscanner.net
 */
export function getSkyscannerLink(context: BookingContext): string {
  const params = new URLSearchParams({
    locale: "pt-BR",
    market: "BR",
    currency: "EUR",
  });
  if (context.city) params.set("destination", context.city);
  if (context.activityDate) params.set("outboundDate", context.activityDate);
  // Add affiliate tag when approved - replace with your associate ID
  return `https://www.skyscanner.com.br/transport/flights/bra/${encodeURIComponent(context.city.toLowerCase().substring(0, 3))}/?${params.toString()}`;
}

/**
 * KAYAK - Commission: CPC model
 * Note: KAYAK Partner Program
 */
export function getKayakLink(context: BookingContext): string {
  const params = new URLSearchParams({
    sort: "bestflight_a",
  });
  if (context.activityDate) params.set("depart", context.activityDate);
  return `https://www.kayak.com.br/flights/-${encodeURIComponent(context.city)}?${params.toString()}`;
}

// ============================================
// TOUR/ACTIVITY AFFILIATE LINKS
// ============================================

/**
 * GetYourGuide (Travelpayouts) - Commission: ~8%
 */
export function getGetYourGuideLink(context: BookingContext): string {
  const query = context.activityName 
    ? `${context.activityName} ${context.city}` 
    : context.city;
  const params = new URLSearchParams({
    q: query,
    partner_id: TRAVELPAYOUTS_MARKER,
  });
  if (context.activityDate) params.set("date", context.activityDate);
  return `https://www.getyourguide.com/s/?${params.toString()}`;
}

/**
 * Viator (Alternative) - Commission: ~8%
 */
export function getViatorLink(context: BookingContext): string {
  const query = context.activityName 
    ? `${context.activityName} ${context.city}` 
    : context.city;
  const params = new URLSearchParams({
    text: query,
    pid: TRAVELPAYOUTS_MARKER,
  });
  return `https://www.viator.com/searchResults/all?${params.toString()}`;
}

// ============================================
// CAR RENTAL AFFILIATE LINKS
// ============================================

/**
 * RentalCars (Travelpayouts) - Commission: ~4-6%
 */
export function getRentalCarsLink(context: BookingContext): string {
  const params = new URLSearchParams({
    affiliateCode: TRAVELPAYOUTS_MARKER,
    preflang: "pt",
    prefcurrency: "EUR",
    searchLocation: context.city,
  });
  if (context.checkIn) params.set("driversAge", "30");
  if (context.checkIn) params.set("pickupDate", context.checkIn);
  if (context.checkOut) params.set("dropoffDate", context.checkOut);
  return `https://www.rentalcars.com/?${params.toString()}`;
}

// ============================================
// TRAVEL INSURANCE AFFILIATE LINKS
// ============================================

/**
 * TravelInsurance (Travelpayouts) - Commission: varies
 */
export function getTravelInsuranceLink(context: BookingContext): string {
  const params = new URLSearchParams({
    marker: TRAVELPAYOUTS_MARKER,
    destination: context.country || context.city,
  });
  if (context.checkIn) params.set("startDate", context.checkIn);
  if (context.checkOut) params.set("endDate", context.checkOut);
  return `https://www.travelinsurance.com/?${params.toString()}`;
}

// ============================================
// AFFILIATE CONFIGURATION BY CATEGORY
// ============================================

export const AFFILIATE_CONFIG = {
  hotels: [
    {
      id: "hotellook",
      name: "Hotellook",
      icon: "hotel",
      color: "purple",
      getLink: getHotellookLink,
      available: true,
    },
    {
      id: "booking",
      name: "Booking.com",
      icon: "building",
      color: "blue",
      getLink: getBookingLink,
      available: true,
    },
    {
      id: "airbnb",
      name: "Airbnb",
      icon: "home",
      color: "rose",
      getLink: getAirbnbLink,
      available: false, // Enable when Airbnb Associates approved
    },
  ] as AffiliateCompany[],
  
  flights: [
    {
      id: "aviasales",
      name: "Aviasales",
      icon: "plane",
      color: "green",
      getLink: getAviasalesLink,
      available: true,
    },
    {
      id: "skyscanner",
      name: "Skyscanner",
      icon: "search",
      color: "cyan",
      getLink: getSkyscannerLink,
      available: false, // Enable when Skyscanner Partners approved
    },
    {
      id: "kayak",
      name: "KAYAK",
      icon: "compass",
      color: "orange",
      getLink: getKayakLink,
      available: false, // Enable when KAYAK Partners approved
    },
  ] as AffiliateCompany[],
  
  tours: [
    {
      id: "getyourguide",
      name: "GetYourGuide",
      icon: "ticket",
      color: "blue",
      getLink: getGetYourGuideLink,
      available: true,
    },
    {
      id: "viator",
      name: "Viator",
      icon: "map",
      color: "orange",
      getLink: getViatorLink,
      available: true,
    },
  ] as AffiliateCompany[],
  
  carRental: [
    {
      id: "rentalcars",
      name: "RentalCars",
      icon: "car",
      color: "emerald",
      getLink: getRentalCarsLink,
      available: true,
    },
  ] as AffiliateCompany[],
  
  insurance: [
    {
      id: "travelinsurance",
      name: "Seguro Viagem",
      icon: "shield",
      color: "sky",
      getLink: getTravelInsuranceLink,
      available: true,
    },
  ] as AffiliateCompany[],
};

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
