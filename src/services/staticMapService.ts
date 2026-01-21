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
 * Convert latitude to tile Y coordinate
 */
function latToTileY(lat: number, zoom: number): number {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

/**
 * Convert longitude to tile X coordinate
 */
function lngToTileX(lng: number, zoom: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
}

/**
 * Convert tile X coordinate back to longitude
 */
function tileXToLng(x: number, zoom: number): number {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

/**
 * Convert tile Y coordinate back to latitude
 */
function tileYToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/**
 * Calculate appropriate zoom level based on coordinate bounds
 */
function calculateZoom(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number,
  width: number,
  height: number
): number {
  const TILE_SIZE = 256;
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;

  // Add padding
  const paddedLatDiff = latDiff * 1.3;
  const paddedLngDiff = lngDiff * 1.3;

  // Calculate zoom for longitude
  const zoomLng = Math.log2((360 / paddedLngDiff) * (width / TILE_SIZE));
  // Calculate zoom for latitude (approximate)
  const zoomLat = Math.log2((180 / paddedLatDiff) * (height / TILE_SIZE));

  const zoom = Math.min(zoomLng, zoomLat);
  return Math.max(2, Math.min(12, Math.floor(zoom)));
}

/**
 * Load an image from URL and return as HTMLImageElement
 */
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
    img.src = url;
  });
}

/**
 * Generates a real map image using OpenStreetMap tiles
 * Returns a PNG data URL that can be embedded in PDF
 */
export async function generateRealMapImage(
  coordinates: Coordinate[],
  cities: string[],
  width: number = 600,
  height: number = 400
): Promise<string | null> {
  if (coordinates.length === 0) {
    return null;
  }

  const TILE_SIZE = 256;

  // Calculate bounds
  const minLat = Math.min(...coordinates.map((c) => c.lat));
  const maxLat = Math.max(...coordinates.map((c) => c.lat));
  const minLng = Math.min(...coordinates.map((c) => c.lng));
  const maxLng = Math.max(...coordinates.map((c) => c.lng));

  // Calculate center
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculate zoom
  const zoom = calculateZoom(minLat, maxLat, minLng, maxLng, width, height);

  // Calculate center tile
  const centerTileX = lngToTileX(centerLng, zoom);
  const centerTileY = latToTileY(centerLat, zoom);

  // Calculate how many tiles we need in each direction
  const tilesX = Math.ceil(width / TILE_SIZE) + 1;
  const tilesY = Math.ceil(height / TILE_SIZE) + 1;

  // Calculate the starting tile
  const startTileX = centerTileX - Math.floor(tilesX / 2);
  const startTileY = centerTileY - Math.floor(tilesY / 2);

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Fill with light blue background (water color)
  ctx.fillStyle = "#aadaff";
  ctx.fillRect(0, 0, width, height);

  // Load and draw tiles
  const tilePromises: Promise<{ img: HTMLImageElement; x: number; y: number } | null>[] = [];

  for (let x = 0; x < tilesX; x++) {
    for (let y = 0; y < tilesY; y++) {
      const tileX = startTileX + x;
      const tileY = startTileY + y;

      // Check tile bounds
      if (tileX < 0 || tileY < 0 || tileX >= Math.pow(2, zoom) || tileY >= Math.pow(2, zoom)) {
        continue;
      }

      // Use OSM tile proxy to avoid CORS issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rvmvoogyrafiogxdbisx.supabase.co';
      const url = `${supabaseUrl}/functions/v1/osm-tile-proxy?z=${zoom}&x=${tileX}&y=${tileY}`;

      const promise = loadImage(url)
        .then((img) => ({
          img,
          x: x * TILE_SIZE - ((centerTileX - startTileX) * TILE_SIZE - width / 2),
          y: y * TILE_SIZE - ((centerTileY - startTileY) * TILE_SIZE - height / 2),
        }))
        .catch(() => null);

      tilePromises.push(promise);
    }
  }

  // Wait for all tiles to load
  const tiles = await Promise.all(tilePromises);

  // Draw tiles
  for (const tile of tiles) {
    if (tile) {
      ctx.drawImage(tile.img, tile.x, tile.y, TILE_SIZE, TILE_SIZE);
    }
  }

  // Helper function to convert lat/lng to pixel position
  const latLngToPixel = (lat: number, lng: number): { x: number; y: number } => {
    const tileX = ((lng + 180) / 360) * Math.pow(2, zoom);
    const tileY =
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom);

    const x = (tileX - startTileX) * TILE_SIZE - ((centerTileX - startTileX) * TILE_SIZE - width / 2);
    const y = (tileY - startTileY) * TILE_SIZE - ((centerTileY - startTileY) * TILE_SIZE - height / 2);

    return { x, y };
  };

  // Draw route line (dashed)
  ctx.beginPath();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  coordinates.forEach((coord, i) => {
    const pos = latLngToPixel(coord.lat, coord.lng);
    if (i === 0) {
      ctx.moveTo(pos.x, pos.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
    }
  });
  ctx.stroke();

  // Draw route line shadow
  ctx.beginPath();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "rgba(30, 64, 175, 0.3)";
  ctx.lineWidth = 6;
  coordinates.forEach((coord, i) => {
    const pos = latLngToPixel(coord.lat, coord.lng);
    if (i === 0) {
      ctx.moveTo(pos.x + 2, pos.y + 2);
    } else {
      ctx.lineTo(pos.x + 2, pos.y + 2);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw markers
  coordinates.forEach((coord, i) => {
    const pos = latLngToPixel(coord.lat, coord.lng);
    const cityName = cities[i] || `${i + 1}`;

    // Marker shadow
    ctx.beginPath();
    ctx.arc(pos.x + 2, pos.y + 2, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(30, 64, 175, 0.3)";
    ctx.fill();

    // Marker background
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    // Marker inner
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Number
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), pos.x, pos.y);

    // City label with background
    const label = cityName.length > 15 ? cityName.substring(0, 15) + "..." : cityName;
    const labelWidth = ctx.measureText(label).width + 10;
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.roundRect(pos.x - labelWidth / 2, pos.y + 18, labelWidth, 16, 4);
    ctx.fill();

    ctx.fillStyle = "#1f2937";
    ctx.font = "600 10px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, pos.x, pos.y + 21);
  });

  // Attribution
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(width - 130, height - 18, 130, 18);
  ctx.fillStyle = "#666666";
  ctx.font = "9px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("© OpenStreetMap", width - 5, height - 5);

  return canvas.toDataURL("image/png");
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
