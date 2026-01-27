import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a QR code as a data URL
 */
export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string | null> {
  try {
    const qrOptions = {
      width: options.width || 100,
      margin: options.margin || 1,
      color: {
        dark: options.color?.dark || "#1f2937",
        light: options.color?.light || "#ffffff",
      },
    };
    
    return await QRCode.toDataURL(text, qrOptions);
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    return null;
  }
}

/**
 * Generates a Google Maps URL for an activity
 */
export function getGoogleMapsUrl(
  coordinates?: [number, number],
  location?: string
): string {
  if (coordinates && coordinates.length === 2) {
    const [lat, lng] = coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
  
  return "";
}

/**
 * Generates QR codes for all activities in an itinerary
 */
export async function generateItineraryQRCodes(
  days: Array<{
    day: number;
    city: string;
    activities: Array<{
      id: string;
      title: string;
      location?: string;
      coordinates?: [number, number];
    }>;
  }>,
  onProgress?: (percent: number) => void
): Promise<Record<string, string>> {
  const qrCodes: Record<string, string> = {};
  
  const allActivities = days.flatMap((day) => day.activities);
  const totalActivities = allActivities.length;
  
  for (let i = 0; i < totalActivities; i++) {
    const activity = allActivities[i];
    const mapsUrl = getGoogleMapsUrl(activity.coordinates, activity.location);
    
    if (mapsUrl) {
      const qr = await generateQRCode(mapsUrl, { width: 80 });
      if (qr) {
        qrCodes[activity.id] = qr;
      }
    }
    
    onProgress?.(30 + ((i + 1) / totalActivities) * 20);
  }
  
  return qrCodes;
}

/**
 * Generates a QR code for the web version of the itinerary
 */
export async function generateWebLinkQR(
  itineraryId: string,
  baseUrl: string = window.location.origin
): Promise<string | null> {
  const url = `${baseUrl}/itinerary/${itineraryId}`;
  return generateQRCode(url, { width: 120 });
}
