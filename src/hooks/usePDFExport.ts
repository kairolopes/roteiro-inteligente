import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import {
  generateItineraryQRCodes,
  generateQRCode,
} from "@/services/qrCodeService";

// Progress step type matching PDFProgressModal
export type PDFProgressStep =
  | "fetching-images"
  | "generating-map"
  | "creating-pdf"
  | "complete";

interface PDFExportState {
  isExporting: boolean;
  currentStep: PDFProgressStep;
  progress: number;
}

// Inline types to avoid circular dependencies
interface ActivityData {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates?: [number, number];
  duration: string;
  category: "attraction" | "restaurant" | "transport" | "accommodation" | "activity";
  tips?: string;
  cost?: string;
  estimatedRating?: number;
  rating?: number;
}

interface DayData {
  day: number;
  date: string;
  city: string;
  country: string;
  coordinates: [number, number];
  activities: ActivityData[];
  highlights: string[];
}

interface ItineraryData {
  id: string;
  title: string;
  summary: string;
  duration: string;
  totalBudget: string;
  destinations: string[];
  days: DayData[];
  createdAt: string;
}

// Coordinate type for map service
interface Coordinate {
  lat: number;
  lng: number;
}

// Convert [lat, lng] tuple to Coordinate object (system uses [lat, lng] format)
function toCoordinate(tuple: [number, number]): Coordinate {
  return { lat: tuple[0], lng: tuple[1] };
}

// Extract only the price value from budget string (e.g., "R$5.000 - R$8.000")
function truncateBudget(budget: string): string {
  if (!budget) return "-";
  const normalized = normalizeTextForPDF(budget);
  // Extract just the price range
  const match = normalized.match(/R\$[\d\.,]+ - R\$[\d\.,]+|R\$[\d\.,]+/);
  return match ? match[0] : normalized.slice(0, 20) + (normalized.length > 20 ? '...' : '');
}

// Count days spent in a specific city
function countDaysInCity(itinerary: ItineraryData, city: string): number {
  return itinerary.days.filter(d => d.city === city).length;
}

// PDF Layout Constants (in mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Colors
const COLORS = {
  primary: "#4f46e5",
  primaryDark: "#1e1b4b",
  primaryLight: "#6366f1",
  accent: "#818cf8",
  accentLight: "#a5b4fc",
  text: "#1f2937",
  textLight: "#6b7280",
  white: "#ffffff",
  bgLight: "#f0f9ff",
  bgCard: "#f3f4f6",
  border: "#e0e7ff",
  categories: {
    restaurant: "#ea580c",
    attraction: "#8b5cf6",
    transport: "#3b82f6",
    accommodation: "#10b981",
    activity: "#ec4899",
  } as Record<string, string>,
};

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurante",
  attraction: "Atracao",
  transport: "Transporte",
  accommodation: "Hospedagem",
  activity: "Atividade",
};

// Helper: Draw rounded rectangle
function drawRoundedRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke?: string
) {
  pdf.setFillColor(fill);
  if (stroke) pdf.setDrawColor(stroke);
  pdf.roundedRect(x, y, w, h, r, r, stroke ? "FD" : "F");
}

// Helper: Normalize text for PDF (remove emojis, convert accents to ASCII)
function normalizeTextForPDF(text: string): string {
  if (!text) return "";
  
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
    .replace(/[^\x00-\x7F]/g, (char) => {
      const map: Record<string, string> = {
        'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n',
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
        'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
        'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C', 'Ñ': 'N',
        '★': '*', '•': '-', '–': '-', '—': '-',
        '\u201C': '"', '\u201D': '"', '\u2018': "'", '\u2019': "'"
      };
      return map[char] || '';
    })
    .trim();
}

// Helper: Draw text with ellipsis if too long
function drawTextEllipsis(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const cleanText = normalizeTextForPDF(text);
  if (!cleanText) return;
  
  // Check if text fits
  const textWidth = pdf.getTextWidth(cleanText);
  if (textWidth <= maxWidth) {
    pdf.text(cleanText, x, y);
    return;
  }
  
  // Truncate with ellipsis
  let truncated = cleanText;
  while (pdf.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  pdf.text(truncated.trim() + '...', x, y);
}

// Draw geometric decoration for cover page
function drawCoverDecoration(pdf: jsPDF) {
  // Decorative circles (top area)
  pdf.setDrawColor(COLORS.primaryLight);
  pdf.setLineWidth(0.5);
  
  // Concentric circles at top center
  const centerX = PAGE_WIDTH / 2;
  const centerY = 55;
  pdf.circle(centerX, centerY, 45, "S");
  pdf.circle(centerX, centerY, 35, "S");
  pdf.circle(centerX, centerY, 25, "S");
  pdf.circle(centerX, centerY, 15, "S");
  
  // Diagonal lines (top left corner)
  pdf.setDrawColor(COLORS.accent);
  pdf.setLineWidth(0.3);
  for (let i = 0; i < 6; i++) {
    pdf.line(0, 15 + i * 12, 40 + i * 15, 0);
  }
  
  // Diagonal lines (top right corner)
  for (let i = 0; i < 6; i++) {
    pdf.line(PAGE_WIDTH, 15 + i * 12, PAGE_WIDTH - 40 - i * 15, 0);
  }
  
  // Small decorative dots
  pdf.setFillColor(COLORS.accentLight);
  const dotPositions = [
    { x: 30, y: 80 },
    { x: PAGE_WIDTH - 30, y: 80 },
    { x: 45, y: 100 },
    { x: PAGE_WIDTH - 45, y: 100 },
  ];
  dotPositions.forEach(pos => {
    pdf.circle(pos.x, pos.y, 2, "F");
  });
  
  // Airplane icon (simplified geometric)
  pdf.setFillColor(COLORS.accent);
  const planeX = centerX;
  const planeY = centerY;
  
  // Simple plane shape using triangles
  pdf.setFillColor(COLORS.white);
  // Body
  pdf.triangle(planeX - 8, planeY, planeX + 8, planeY, planeX, planeY - 12, "F");
  // Wings
  pdf.triangle(planeX - 15, planeY + 2, planeX + 15, planeY + 2, planeX, planeY - 4, "F");
  // Tail
  pdf.triangle(planeX - 4, planeY + 8, planeX + 4, planeY + 8, planeX, planeY, "F");
}

// Draw schematic map with cities connected by dashed lines
function drawSchematicMap(pdf: jsPDF, itinerary: ItineraryData) {
  const mapY = 50;
  const mapHeight = 110;
  const mapWidth = CONTENT_WIDTH;
  
  // Container with light background
  drawRoundedRect(pdf, MARGIN, mapY, mapWidth, mapHeight, 8, COLORS.bgLight, COLORS.border);
  
  // Get unique cities in order
  const uniqueCities: { city: string; country: string; coordinates: [number, number] }[] = [];
  itinerary.days.forEach((day, i) => {
    if (i === 0 || day.city !== itinerary.days[i - 1].city) {
      uniqueCities.push({
        city: day.city,
        country: day.country,
        coordinates: day.coordinates,
      });
    }
  });
  
  if (uniqueCities.length === 0) return;
  
  // Convert coordinates
  const coords = uniqueCities.map(c => toCoordinate(c.coordinates));
  
  // Calculate bounds
  const lats = coords.map(c => c.lat);
  const lngs = coords.map(c => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Map padding
  const padding = 30;
  const innerWidth = mapWidth - padding * 2;
  const innerHeight = mapHeight - padding * 2;
  
  // Handle single city case
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  
  // Convert to PDF positions
  const points = coords.map((c, i) => {
    let x: number, y: number;
    
    if (uniqueCities.length === 1) {
      // Single city: center it
      x = MARGIN + mapWidth / 2;
      y = mapY + mapHeight / 2;
    } else {
      // Multiple cities: distribute based on coordinates
      x = MARGIN + padding + ((c.lng - minLng) / lngRange) * innerWidth;
      y = mapY + padding + ((maxLat - c.lat) / latRange) * innerHeight;
    }
    
    return {
      x,
      y,
      city: uniqueCities[i].city,
      country: uniqueCities[i].country,
      days: countDaysInCity(itinerary, uniqueCities[i].city),
    };
  });
  
  // Draw dashed connection lines
  if (points.length > 1) {
    pdf.setDrawColor("#3b82f6");
    pdf.setLineWidth(2);
    pdf.setLineDashPattern([5, 3], 0);
    
    for (let i = 0; i < points.length - 1; i++) {
      pdf.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    
    pdf.setLineDashPattern([], 0);
  }
  
  // Draw city markers
  points.forEach((p, i) => {
    const markerRadius = 12;
    
    // Shadow
    pdf.setFillColor("#1e40af");
    pdf.circle(p.x + 1.5, p.y + 1.5, markerRadius, "F");
    
    // Main circle (blue)
    pdf.setFillColor("#3b82f6");
    pdf.circle(p.x, p.y, markerRadius, "F");
    
    // Inner white circle
    pdf.setFillColor(COLORS.white);
    pdf.circle(p.x, p.y, markerRadius - 3, "F");
    
    // Number
    pdf.setTextColor("#3b82f6");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(String(i + 1), p.x, p.y + 4, { align: "center" });
    
    // City name (below marker)
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(normalizeTextForPDF(p.city), p.x, p.y + markerRadius + 8, { align: "center" });
    
    // Days count (smaller, below city name)
    pdf.setTextColor(COLORS.textLight);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    const dayText = p.days === 1 ? "1 dia" : `${p.days} dias`;
    pdf.text(dayText, p.x, p.y + markerRadius + 14, { align: "center" });
  });
  
  // Legend (bottom left of map)
  const legendY = mapY + mapHeight - 10;
  pdf.setFillColor(COLORS.white);
  pdf.roundedRect(MARGIN + 5, legendY - 6, 55, 10, 2, 2, "F");
  
  // Legend line
  pdf.setDrawColor("#3b82f6");
  pdf.setLineWidth(1.5);
  pdf.setLineDashPattern([3, 2], 0);
  pdf.line(MARGIN + 10, legendY, MARGIN + 25, legendY);
  pdf.setLineDashPattern([], 0);
  
  // Legend text
  pdf.setTextColor(COLORS.textLight);
  pdf.setFontSize(7);
  pdf.text("Rota do roteiro", MARGIN + 28, legendY + 2);
}

// Render Cover Page - Minimalist design without external images
function renderCoverPage(
  pdf: jsPDF,
  itinerary: ItineraryData,
  webQR: string | null
) {
  // Solid dark background
  pdf.setFillColor(COLORS.primaryDark);
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  
  // Geometric decoration
  drawCoverDecoration(pdf);
  
  // Title section (centered, below decoration)
  const titleY = PAGE_HEIGHT * 0.40;
  
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  
  const normalizedTitle = normalizeTextForPDF(itinerary.title);
  const titleLines = pdf.splitTextToSize(normalizedTitle, CONTENT_WIDTH - 20);
  titleLines.slice(0, 2).forEach((line: string, i: number) => {
    pdf.text(line, PAGE_WIDTH / 2, titleY + i * 11, { align: "center" });
  });
  
  // Summary
  if (itinerary.summary) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(COLORS.accentLight);
    const cleanSummary = normalizeTextForPDF(itinerary.summary);
    const summaryLines = pdf.splitTextToSize(cleanSummary, CONTENT_WIDTH - 30);
    const summaryY = titleY + titleLines.length * 11 + 12;
    summaryLines.slice(0, 3).forEach((line: string, i: number) => {
      pdf.text(line, PAGE_WIDTH / 2, summaryY + i * 5, { align: "center" });
    });
  }
  
  // Info badges (3 columns)
  const badgeY = PAGE_HEIGHT * 0.68;
  const badgeHeight = 22;
  const badgeWidth = (CONTENT_WIDTH - 10) / 3;
  
  const badges = [
    { label: "Duracao", value: normalizeTextForPDF(itinerary.duration) || "-" },
    { label: "Orcamento", value: truncateBudget(itinerary.totalBudget) },
    { label: "Destinos", value: itinerary.destinations?.length?.toString() || "0" },
  ];
  
  badges.forEach((badge, i) => {
    const x = MARGIN + i * (badgeWidth + 5);
    
    // Badge background
    drawRoundedRect(pdf, x, badgeY, badgeWidth - 5, badgeHeight, 4, "#3d3a6b");
    
    // Label
    pdf.setTextColor(COLORS.accentLight);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(badge.label, x + (badgeWidth - 5) / 2, badgeY + 8, { align: "center" });
    
    // Value
    pdf.setTextColor(COLORS.white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    const maxBadgeValueWidth = badgeWidth - 12;
    let displayValue = badge.value;
    while (pdf.getTextWidth(displayValue) > maxBadgeValueWidth && displayValue.length > 0) {
      displayValue = displayValue.slice(0, -1);
    }
    if (displayValue.length < badge.value.length) {
      displayValue = displayValue.trim() + '...';
    }
    pdf.text(displayValue, x + (badgeWidth - 5) / 2, badgeY + 17, { align: "center" });
  });
  
  // QR Code for web version
  if (webQR) {
    try {
      const qrSize = 28;
      const qrY = PAGE_HEIGHT - MARGIN - qrSize - 18;
      pdf.addImage(
        webQR,
        "PNG",
        PAGE_WIDTH / 2 - qrSize / 2,
        qrY,
        qrSize,
        qrSize
      );
      pdf.setFontSize(8);
      pdf.setTextColor(COLORS.accentLight);
      pdf.text("Escaneie para ver online", PAGE_WIDTH / 2, qrY + qrSize + 6, {
        align: "center",
      });
    } catch (e) {
      console.error("Failed to add QR code:", e);
    }
  }
  
  // Footer branding
  pdf.setFontSize(10);
  pdf.setTextColor(COLORS.primaryLight);
  pdf.setFont("helvetica", "bold");
  pdf.text("Viaje com Sofia", PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: "center" });
}

// Render Map Page with schematic design
async function renderMapPage(
  pdf: jsPDF,
  itinerary: ItineraryData
): Promise<void> {
  pdf.addPage();
  
  // Header
  pdf.setFillColor(COLORS.primaryDark);
  pdf.rect(0, 0, PAGE_WIDTH, 40, "F");
  
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Mapa da Viagem", PAGE_WIDTH / 2, 25, { align: "center" });
  
  // Draw schematic map
  drawSchematicMap(pdf, itinerary);
  
  // Days summary section
  const summaryY = 175;
  pdf.setTextColor(COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Resumo dos Dias", MARGIN, summaryY);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  
  itinerary.days.forEach((day, i) => {
    const y = summaryY + 12 + i * 18;
    if (y < PAGE_HEIGHT - MARGIN - 10) {
      // Day number badge
      const color = COLORS.categories.attraction;
      pdf.setFillColor(color);
      pdf.circle(MARGIN + 5, y - 2, 5, "F");
      pdf.setTextColor(COLORS.white);
      pdf.setFontSize(9);
      pdf.text(String(day.day), MARGIN + 5, y, { align: "center" });
      
      // City name
      pdf.setTextColor(COLORS.text);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(normalizeTextForPDF(`${day.city}, ${day.country}`), MARGIN + 14, y);
      
      // Date (right aligned)
      if (day.date) {
        pdf.setTextColor(COLORS.textLight);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(normalizeTextForPDF(day.date), PAGE_WIDTH - MARGIN, y, { align: "right" });
      }
      
      // Activities count
      pdf.setTextColor(COLORS.textLight);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(`${day.activities.length} atividades`, MARGIN + 14, y + 6);
    }
  });
}

// Render Day Page
function renderDayPage(
  pdf: jsPDF,
  day: DayData,
  activityQRs: Record<string, string>,
  startY: number = 0
): number {
  let y = startY;
  
  // If starting new page, add header
  if (y === 0) {
    pdf.addPage();
    
    // Day header (solid color, no image)
    const headerHeight = 45;
    
    pdf.setFillColor(COLORS.primaryDark);
    pdf.rect(0, 0, PAGE_WIDTH, headerHeight, "F");
    
    // Day title
    pdf.setTextColor(COLORS.white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(`Dia ${day.day}`, MARGIN, headerHeight - 20);
    
    pdf.setFontSize(14);
    pdf.text(normalizeTextForPDF(`${day.city}, ${day.country}`), MARGIN, headerHeight - 10);
    
    if (day.date) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(normalizeTextForPDF(day.date), PAGE_WIDTH - MARGIN, headerHeight - 12, { align: "right" });
    }
    
    y = headerHeight + 10;
  }
  
  // Highlights
  if (day.highlights && day.highlights.length > 0 && startY === 0) {
    pdf.setFillColor("#fef3c7");
    drawRoundedRect(pdf, MARGIN, y, CONTENT_WIDTH, 15, 3, "#fef3c7");
    
    pdf.setTextColor("#92400e");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Destaques: ", MARGIN + 5, y + 9);
    
    pdf.setFont("helvetica", "normal");
    const highlightsText = day.highlights.slice(0, 4).join(" - ");
    drawTextEllipsis(pdf, highlightsText, MARGIN + 28, y + 9, CONTENT_WIDTH - 35);
    
    y += 22;
  }
  
  // Activities
  for (const activity of day.activities) {
    const activityHeight = activity.tips ? 50 : 40;
    
    // Check if we need a new page
    if (y + activityHeight > PAGE_HEIGHT - MARGIN) {
      pdf.addPage();
      
      // Continuation header
      pdf.setFillColor(COLORS.bgCard);
      pdf.rect(0, 0, PAGE_WIDTH, 25, "F");
      pdf.setTextColor(COLORS.text);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(normalizeTextForPDF(`Dia ${day.day} - ${day.city} (continuacao)`), MARGIN, 16);
      
      y = 35;
    }
    
    const cardY = y;
    const category = activity.category || "activity";
    const catColor = COLORS.categories[category] || COLORS.categories.activity;
    
    // Card background
    drawRoundedRect(pdf, MARGIN, cardY, CONTENT_WIDTH, activityHeight, 4, COLORS.white, "#e5e7eb");
    
    // Category indicator
    pdf.setFillColor(catColor);
    pdf.rect(MARGIN, cardY, 4, activityHeight, "F");
    
    // Time column
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(activity.time || "--:--", MARGIN + 10, cardY + 10);
    
    if (activity.duration) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(COLORS.textLight);
      pdf.text(normalizeTextForPDF(activity.duration), MARGIN + 10, cardY + 16);
    }
    
    // Main content - account for QR code space
    const contentX = MARGIN + 35;
    const qrSize = 18;
    const qrMargin = 8;
    const contentWidth = CONTENT_WIDTH - 35 - qrSize - qrMargin - 5;
    
    // Category badge
    drawRoundedRect(pdf, contentX, cardY + 4, 22, 6, 2, COLORS.bgCard);
    
    pdf.setTextColor(catColor);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6);
    pdf.text(CATEGORY_LABELS[category] || "Atividade", contentX + 11, cardY + 8.5, { align: "center" });
    
    // Cost & Rating
    let infoX = contentX + 25;
    if (activity.cost) {
      pdf.setTextColor(COLORS.textLight);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(normalizeTextForPDF(activity.cost), infoX, cardY + 8.5);
      infoX += pdf.getTextWidth(normalizeTextForPDF(activity.cost)) + 5;
    }
    
    const rating = activity.estimatedRating || activity.rating;
    if (rating) {
      pdf.setTextColor("#fbbf24");
      pdf.text(`* ${rating.toFixed(1)}`, infoX, cardY + 8.5);
    }
    
    // Title
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    drawTextEllipsis(pdf, activity.title, contentX, cardY + 18, contentWidth);
    
    // Location
    if (activity.location) {
      pdf.setTextColor(COLORS.textLight);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      drawTextEllipsis(pdf, `Local: ${activity.location}`, contentX, cardY + 25, contentWidth);
    }
    
    // Description
    if (activity.description) {
      pdf.setTextColor(COLORS.text);
      pdf.setFontSize(8);
      const cleanDesc = normalizeTextForPDF(activity.description);
      const descLines = pdf.splitTextToSize(cleanDesc, contentWidth);
      descLines.slice(0, 2).forEach((line: string, i: number) => {
        let truncatedLine = line;
        while (pdf.getTextWidth(truncatedLine) > contentWidth && truncatedLine.length > 0) {
          truncatedLine = truncatedLine.slice(0, -1);
        }
        if (truncatedLine.length < line.length) {
          truncatedLine = truncatedLine.trim() + '...';
        }
        pdf.text(truncatedLine, contentX, cardY + 32 + i * 4);
      });
    }
    
    // Tips
    if (activity.tips) {
      const tipY = cardY + activityHeight - 10;
      pdf.setFillColor("#fef3c7");
      drawRoundedRect(pdf, contentX, tipY, contentWidth - 30, 7, 2, "#fef3c7");
      pdf.setTextColor("#92400e");
      pdf.setFontSize(7);
      drawTextEllipsis(pdf, `Dica: ${activity.tips}`, contentX + 2, tipY + 4.5, contentWidth - 35);
    }
    
    // QR Code
    const qrCode = activityQRs[activity.id];
    if (qrCode) {
      try {
        pdf.addImage(
          qrCode,
          "PNG",
          PAGE_WIDTH - MARGIN - qrSize - 5,
          cardY + (activityHeight - qrSize) / 2,
          qrSize,
          qrSize
        );
      } catch (e) {
        // QR failed, skip
      }
    }
    
    y += activityHeight + 5;
  }
  
  return y;
}

// Render Final Page
function renderFinalPage(pdf: jsPDF, itinerary: ItineraryData) {
  pdf.addPage();
  
  // Header
  pdf.setFillColor(COLORS.primaryDark);
  pdf.rect(0, 0, PAGE_WIDTH, 50, "F");
  
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Resumo da Viagem", PAGE_WIDTH / 2, 30, { align: "center" });
  
  let y = 65;
  
  // Stats cards
  const stats = [
    { label: "Duracao", value: normalizeTextForPDF(itinerary.duration) || "-" },
    { label: "Orcamento", value: truncateBudget(itinerary.totalBudget) },
    { label: "Destinos", value: itinerary.destinations?.length?.toString() || "0" },
    { label: "Atividades", value: itinerary.days.reduce((a, d) => a + d.activities.length, 0).toString() },
  ];
  
  const cardWidth = (CONTENT_WIDTH - 15) / 2;
  const maxValueWidth = cardWidth - 20;
  
  stats.forEach((stat, i) => {
    const x = MARGIN + (i % 2) * (cardWidth + 5);
    const cardY = y + Math.floor(i / 2) * 30;
    
    drawRoundedRect(pdf, x, cardY, cardWidth, 25, 4, COLORS.bgCard);
    
    pdf.setTextColor(COLORS.textLight);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(stat.label, x + 10, cardY + 10);
    
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    drawTextEllipsis(pdf, stat.value, x + 10, cardY + 20, maxValueWidth);
  });
  
  y += 75;
  
  // Category breakdown
  pdf.setTextColor(COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Atividades por Categoria", MARGIN, y);
  
  y += 10;
  
  const categoryCounts: Record<string, number> = {};
  itinerary.days.forEach((day) => {
    day.activities.forEach((act) => {
      const cat = act.category || "activity";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });
  
  Object.entries(categoryCounts).forEach(([cat, count], i) => {
    const barY = y + i * 12;
    const color = COLORS.categories[cat] || COLORS.categories.activity;
    const label = CATEGORY_LABELS[cat] || cat;
    const maxCount = Math.max(...Object.values(categoryCounts));
    const barWidth = (count / maxCount) * (CONTENT_WIDTH - 80);
    
    pdf.setFillColor(color);
    drawRoundedRect(pdf, MARGIN, barY, barWidth, 8, 2, color);
    
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`${label}: ${count}`, MARGIN + barWidth + 5, barY + 6);
  });
  
  // Footer
  pdf.setFillColor(COLORS.bgCard);
  pdf.rect(0, PAGE_HEIGHT - 35, PAGE_WIDTH, 35, "F");
  
  pdf.setTextColor(COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Viaje com Sofia", PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: "center" });
  
  pdf.setTextColor(COLORS.textLight);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("viagecomsofia.com", PAGE_WIDTH / 2, PAGE_HEIGHT - 12, { align: "center" });
}

export function usePDFExport() {
  const [state, setState] = useState<PDFExportState>({
    isExporting: false,
    currentStep: "fetching-images",
    progress: 0,
  });

  const updateProgress = useCallback(
    (step: PDFProgressStep, progress: number) => {
      setState({ isExporting: true, currentStep: step, progress });
    },
    []
  );

  const exportToPDF = useCallback(
    async (itinerary: ItineraryData) => {
      setState({ isExporting: true, currentStep: "fetching-images", progress: 0 });

      try {
        // Step 1: Generate QR codes (no more external image fetching)
        updateProgress("fetching-images", 10);
        
        const activityQRs = await generateItineraryQRCodes(itinerary.days, (p) => {
          updateProgress("fetching-images", 10 + p * 0.3);
        });
        
        updateProgress("generating-map", 40);
        
        // Generate web QR
        const webQR = await generateQRCode(
          `${window.location.origin}/itinerary`,
          { width: 150 }
        );
        
        updateProgress("creating-pdf", 50);
        
        // Step 2: Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        
        // Cover page (minimalist design, no external images)
        renderCoverPage(pdf, itinerary, webQR);
        updateProgress("creating-pdf", 55);
        
        // Map page (schematic design)
        await renderMapPage(pdf, itinerary);
        updateProgress("creating-pdf", 60);
        
        // Day pages (no external images for headers)
        const totalDays = itinerary.days.length;
        for (let i = 0; i < totalDays; i++) {
          const day = itinerary.days[i];
          renderDayPage(pdf, day, activityQRs);
          updateProgress("creating-pdf", 60 + ((i + 1) / totalDays) * 30);
        }
        
        // Final page
        renderFinalPage(pdf, itinerary);
        updateProgress("creating-pdf", 95);
        
        // Save
        const filename = `roteiro-${itinerary.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")
          .substring(0, 30)}.pdf`;
        
        pdf.save(filename);
        
        updateProgress("complete", 100);
        
        setTimeout(() => {
          setState({ isExporting: false, currentStep: "fetching-images", progress: 0 });
        }, 1500);
        
      } catch (error) {
        console.error("PDF export error:", error);
        setState({ isExporting: false, currentStep: "fetching-images", progress: 0 });
        throw error;
      }
    },
    [updateProgress]
  );

  return {
    exportToPDF,
    isExporting: state.isExporting,
    currentStep: state.currentStep,
    progress: state.progress,
  };
}
