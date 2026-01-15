// Travelpayouts Affiliate Links Generator
// Marker ID: 489165

const MARKER_ID = "489165";

/**
 * Generate Hotellook hotel search link
 * Commission: ~5% on bookings
 */
export function getHotelLink(city: string, hotelName?: string): string {
  const query = hotelName ? `${hotelName} ${city}` : city;
  return `https://search.hotellook.com/?marker=${MARKER_ID}&destination=${encodeURIComponent(query)}`;
}

/**
 * Generate Aviasales flight search link
 * Commission: varies by route
 */
export function getFlightLink(destination: string): string {
  return `https://www.aviasales.com/?marker=${MARKER_ID}&destination=${encodeURIComponent(destination)}`;
}

/**
 * Generate GetYourGuide tour/activity search link
 * Commission: ~8% on bookings
 */
export function getTourLink(city: string, activityName?: string): string {
  const query = activityName ? `${activityName} ${city}` : city;
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${MARKER_ID}`;
}

/**
 * Generate Viator tour/activity search link (alternative)
 * Commission: ~8% on bookings
 */
export function getViatorLink(city: string, activityName?: string): string {
  const query = activityName ? `${activityName} ${city}` : city;
  return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(query)}&pid=${MARKER_ID}`;
}
