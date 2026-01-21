interface Coordinate {
  lat: number;
  lng: number;
}

interface MapOptions {
  width: number;
  height: number;
  zoom?: number;
}

/**
 * Generates a static map URL using OpenStreetMap tiles via staticmaps.xyz
 * This is a free service that doesn't require API keys
 */
export const generateStaticMapUrl = (
  coordinates: Coordinate[],
  options: MapOptions = { width: 600, height: 400 }
): string => {
  if (coordinates.length === 0) {
    // Return a default world map
    return `https://staticmapmaker.com/img/google.png`;
  }

  const { width, height } = options;

  // Calculate center point
  const centerLat = coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
  const centerLng = coordinates.reduce((sum, c) => sum + c.lng, 0) / coordinates.length;

  // Calculate appropriate zoom based on coordinate spread
  const latSpread = Math.max(...coordinates.map(c => c.lat)) - Math.min(...coordinates.map(c => c.lat));
  const lngSpread = Math.max(...coordinates.map(c => c.lng)) - Math.min(...coordinates.map(c => c.lng));
  const maxSpread = Math.max(latSpread, lngSpread);
  
  let zoom = 5;
  if (maxSpread < 1) zoom = 10;
  else if (maxSpread < 3) zoom = 7;
  else if (maxSpread < 10) zoom = 5;
  else if (maxSpread < 30) zoom = 4;
  else zoom = 3;

  // Build markers string for OpenStreetMap static API
  const markers = coordinates
    .map((c, i) => `${c.lng},${c.lat}`)
    .join('|');

  // Use geoapify static maps (free tier available)
  // This creates a simple map with markers
  const baseUrl = 'https://maps.geoapify.com/v1/staticmap';
  const markerStyle = 'lonlat:';
  const markerCoords = coordinates
    .map((c, i) => `${c.lng},${c.lat}`)
    .join(';');

  // Alternative: Use a simple OSM-based static map service
  // We'll use the mapbox-style URL format that works with free tiles
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - maxSpread},${centerLat - maxSpread},${centerLng + maxSpread},${centerLat + maxSpread}&layer=mapnik`;

  // For PDF embedding, we'll generate a canvas-based map
  // Return coordinates data that can be rendered client-side
  return JSON.stringify({
    center: { lat: centerLat, lng: centerLng },
    zoom,
    markers: coordinates.map((c, i) => ({
      ...c,
      label: (i + 1).toString()
    })),
    bounds: {
      minLat: Math.min(...coordinates.map(c => c.lat)),
      maxLat: Math.max(...coordinates.map(c => c.lat)),
      minLng: Math.min(...coordinates.map(c => c.lng)),
      maxLng: Math.max(...coordinates.map(c => c.lng)),
    }
  });
};

/**
 * Generates a simple SVG map representation for PDF embedding
 * This creates a stylized route map without external dependencies
 */
export const generateSvgRouteMap = (
  coordinates: Coordinate[],
  cities: string[],
  width: number = 500,
  height: number = 300
): string => {
  if (coordinates.length === 0) {
    return '';
  }

  const padding = 40;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Calculate bounds
  const minLat = Math.min(...coordinates.map(c => c.lat));
  const maxLat = Math.max(...coordinates.map(c => c.lat));
  const minLng = Math.min(...coordinates.map(c => c.lng));
  const maxLng = Math.max(...coordinates.map(c => c.lng));

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  // Convert coordinates to SVG positions
  const points = coordinates.map((c, i) => {
    const x = padding + ((c.lng - minLng) / lngRange) * innerWidth;
    // Invert Y because SVG Y grows downward
    const y = padding + ((maxLat - c.lat) / latRange) * innerHeight;
    return { x, y, city: cities[i] || `Ponto ${i + 1}` };
  });

  // Generate path for the route line
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#f0f9ff" rx="8"/>
      
      <!-- Grid lines for visual effect -->
      ${Array.from({ length: 5 }).map((_, i) => `
        <line x1="${padding}" y1="${padding + (innerHeight / 4) * i}" x2="${width - padding}" y2="${padding + (innerHeight / 4) * i}" stroke="#e0e7ff" stroke-width="1" stroke-dasharray="4,4"/>
      `).join('')}
      
      <!-- Route line -->
      <path d="${pathD}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8,4"/>
      
      <!-- Route line shadow -->
      <path d="${pathD}" fill="none" stroke="#1e40af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8,4" opacity="0.2" transform="translate(2,2)"/>
      
      <!-- City markers -->
      ${points.map((p, i) => `
        <g transform="translate(${p.x}, ${p.y})">
          <!-- Marker shadow -->
          <circle cx="2" cy="2" r="12" fill="#1e40af" opacity="0.2"/>
          <!-- Marker background -->
          <circle cx="0" cy="0" r="12" fill="#3b82f6"/>
          <!-- Marker inner -->
          <circle cx="0" cy="0" r="8" fill="white"/>
          <!-- Number -->
          <text x="0" y="4" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#3b82f6">${i + 1}</text>
        </g>
        <!-- City label -->
        <text x="${p.x}" y="${p.y + 24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#1f2937" font-weight="500">${p.city.length > 12 ? p.city.substring(0, 12) + '...' : p.city}</text>
      `).join('')}
      
      <!-- Legend -->
      <g transform="translate(${width - 80}, ${height - 25})">
        <rect x="-5" y="-12" width="75" height="20" fill="white" opacity="0.9" rx="4"/>
        <line x1="0" y1="0" x2="20" y2="0" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,2"/>
        <text x="25" y="4" font-family="Arial, sans-serif" font-size="8" fill="#64748b">Rota</text>
      </g>
    </svg>
  `;

  return svg;
};

/**
 * Converts SVG to base64 data URL for PDF embedding
 */
export const svgToDataUrl = (svg: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
};
