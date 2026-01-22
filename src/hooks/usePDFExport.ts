import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import {
  fetchItineraryImages,
} from "@/services/pdfImageService";
import {
  generateItineraryQRCodes,
  generateQRCode,
} from "@/services/qrCodeService";
import {
  generateSvgRouteMap,
  generateRealMapImage,
} from "@/services/staticMapService";

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

// Convert [lng, lat] tuple to Coordinate object
function toCoordinate(tuple: [number, number]): Coordinate {
  return { lng: tuple[0], lat: tuple[1] };
}

// PDF Layout Constants (in mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

// Colors
const COLORS = {
  primary: "#4f46e5",
  primaryDark: "#1e1b4b",
  text: "#1f2937",
  textLight: "#6b7280",
  white: "#ffffff",
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

// Helper: Draw text with ellipsis if too long
function drawTextEllipsis(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const truncated = pdf.splitTextToSize(text, maxWidth)[0] || "";
  pdf.text(truncated, x, y);
}

// Helper: Convert SVG to image data for PDF
async function svgToImageData(svgString: string, width: number, height: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(null);
      }
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    
    img.src = url;
  });
}

// Render Cover Page
function renderCoverPage(
  pdf: jsPDF,
  itinerary: ItineraryData,
  coverImage: string | null,
  webQR: string | null
) {
  // Background gradient (simulated with rectangles)
  pdf.setFillColor("#1e1b4b");
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
  
  // Cover image
  if (coverImage) {
    try {
      pdf.addImage(coverImage, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.6);
      // Gradient overlay - use semi-transparent rectangle
      pdf.setFillColor(30, 27, 75); // #1e1b4b in RGB
      pdf.rect(0, PAGE_HEIGHT * 0.4, PAGE_WIDTH, PAGE_HEIGHT * 0.2, "F");
    } catch (e) {
      console.error("Failed to add cover image:", e);
    }
  }
  
  // Title section
  const titleY = coverImage ? PAGE_HEIGHT * 0.55 : PAGE_HEIGHT * 0.35;
  
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  
  const titleLines = pdf.splitTextToSize(itinerary.title, CONTENT_WIDTH);
  titleLines.forEach((line: string, i: number) => {
    pdf.text(line, PAGE_WIDTH / 2, titleY + i * 12, { align: "center" });
  });
  
  // Summary
  if (itinerary.summary) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor("#e0e7ff");
    const summaryLines = pdf.splitTextToSize(itinerary.summary, CONTENT_WIDTH - 20);
    const summaryY = titleY + titleLines.length * 12 + 15;
    summaryLines.slice(0, 3).forEach((line: string, i: number) => {
      pdf.text(line, PAGE_WIDTH / 2, summaryY + i * 6, { align: "center" });
    });
  }
  
  // Info badges
  const badgeY = PAGE_HEIGHT * 0.75;
  const badges = [
    itinerary.duration && `Duracao: ${itinerary.duration}`,
    itinerary.totalBudget && `Orcamento: ${itinerary.totalBudget}`,
    itinerary.destinations?.length > 0 && itinerary.destinations.slice(0, 3).join(" - "),
  ].filter(Boolean);
  
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.white);
  
  const badgeWidth = (CONTENT_WIDTH - 10) / badges.length;
  badges.forEach((badge, i) => {
    drawRoundedRect(
      pdf,
      MARGIN + i * (badgeWidth + 5),
      badgeY,
      badgeWidth - 5,
      10,
      3,
      "#3d3a6b" // Semi-transparent white simulation on dark background
    );
    pdf.text(
      badge as string,
      MARGIN + i * (badgeWidth + 5) + (badgeWidth - 5) / 2,
      badgeY + 6.5,
      { align: "center" }
    );
  });
  
  // QR Code for web version
  if (webQR) {
    try {
      const qrSize = 25;
      pdf.addImage(
        webQR,
        "PNG",
        PAGE_WIDTH / 2 - qrSize / 2,
        PAGE_HEIGHT - MARGIN - qrSize - 10,
        qrSize,
        qrSize
      );
      pdf.setFontSize(8);
      pdf.setTextColor("#a5b4fc");
      pdf.text("Escaneie para ver online", PAGE_WIDTH / 2, PAGE_HEIGHT - MARGIN - 5, {
        align: "center",
      });
    } catch (e) {
      console.error("Failed to add QR code:", e);
    }
  }
  
  // Footer branding
  pdf.setFontSize(9);
  pdf.setTextColor("#6366f1");
  pdf.text("Viaje com Sofía", PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: "center" });
}

// Render Map Page
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
  
  // Generate route map
  const coordinates = itinerary.days
    .filter((d) => d.coordinates)
    .map((d) => toCoordinate(d.coordinates));
  
  const cities = itinerary.days.map((d) => d.city);
  
  if (coordinates.length >= 1) {
    const mapWidth = CONTENT_WIDTH;
    const mapHeight = 120;
    
    // Try to generate real OSM map first
    let mapImage: string | null = null;
    
    try {
      mapImage = await generateRealMapImage(coordinates, cities, mapWidth * 2, mapHeight * 2);
    } catch (e) {
      console.warn("Failed to generate real map, falling back to SVG:", e);
    }
    
    // Fallback to SVG if real map fails
    if (!mapImage) {
      const svgMap = generateSvgRouteMap(coordinates, cities, mapWidth * 3, mapHeight * 3);
      mapImage = await svgToImageData(svgMap, mapWidth * 3, mapHeight * 3);
    }
    
    if (mapImage) {
      try {
        // Map container
        drawRoundedRect(pdf, MARGIN, 50, CONTENT_WIDTH, mapHeight + 10, 5, "#f3f4f6");
        pdf.addImage(mapImage, "PNG", MARGIN + 5, 55, mapWidth - 10, mapHeight);
      } catch (e) {
        console.error("Failed to add map image:", e);
      }
    }
  }
  
  // Days summary
  const summaryY = 180;
  pdf.setTextColor(COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Resumo dos Dias", MARGIN, summaryY);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  
  itinerary.days.forEach((day, i) => {
    const y = summaryY + 10 + i * 18;
    if (y < PAGE_HEIGHT - MARGIN) {
      // Day number badge
      const color = COLORS.categories.attraction;
      pdf.setFillColor(color);
      pdf.circle(MARGIN + 4, y - 2, 4, "F");
      pdf.setTextColor(COLORS.white);
      pdf.setFontSize(8);
      pdf.text(String(day.day), MARGIN + 4, y - 0.5, { align: "center" });
      
      // City name (left)
      pdf.setTextColor(COLORS.text);
      pdf.setFontSize(10);
      pdf.text(`${day.city}, ${day.country}`, MARGIN + 12, y);
      
      // Date (right aligned)
      if (day.date) {
        pdf.setTextColor(COLORS.textLight);
        pdf.setFontSize(9);
        pdf.text(day.date, CONTENT_WIDTH + MARGIN, y, { align: "right" });
      }
      
      // Activities count (below city, smaller font)
      pdf.setTextColor(COLORS.textLight);
      pdf.setFontSize(8);
      pdf.text(`${day.activities.length} atividades`, MARGIN + 12, y + 5);
    }
  });
}

// Render Day Page
function renderDayPage(
  pdf: jsPDF,
  day: DayData,
  dayImage: string | null,
  activityQRs: Record<string, string>,
  startY: number = 0
): number {
  let y = startY;
  
  // If starting new page, add header
  if (y === 0) {
    pdf.addPage();
    
    // Day header with image
    const headerHeight = dayImage ? 70 : 45;
    
    if (dayImage) {
      try {
        pdf.addImage(dayImage, "JPEG", 0, 0, PAGE_WIDTH, headerHeight);
        // Overlay - darker gradient effect
        pdf.setFillColor(30, 27, 75); // #1e1b4b in RGB
        pdf.rect(0, headerHeight - 30, PAGE_WIDTH, 30, "F");
      } catch (e) {
        pdf.setFillColor(30, 27, 75);
        pdf.rect(0, 0, PAGE_WIDTH, headerHeight, "F");
      }
    } else {
      pdf.setFillColor(30, 27, 75);
      pdf.rect(0, 0, PAGE_WIDTH, headerHeight, "F");
    }
    
    // Day title
    pdf.setTextColor(COLORS.white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(`Dia ${day.day}`, MARGIN, headerHeight - 20);
    
    pdf.setFontSize(14);
    pdf.text(`${day.city}, ${day.country}`, MARGIN, headerHeight - 10);
    
    if (day.date) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(day.date, PAGE_WIDTH - MARGIN, headerHeight - 12, { align: "right" });
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
    const highlightsText = day.highlights.slice(0, 4).join(" • ");
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
      pdf.setFillColor("#f3f4f6");
      pdf.rect(0, 0, PAGE_WIDTH, 25, "F");
      pdf.setTextColor(COLORS.text);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`Dia ${day.day} - ${day.city} (continuacao)`, MARGIN, 16);
      
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
      pdf.text(activity.duration, MARGIN + 10, cardY + 16);
    }
    
    // Main content
    const contentX = MARGIN + 35;
    const contentWidth = CONTENT_WIDTH - 70;
    
    // Category badge - use lighter version of category color
    drawRoundedRect(pdf, contentX, cardY + 4, 22, 6, 2, "#f3f4f6");
    
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
      pdf.text(activity.cost, infoX, cardY + 8.5);
      infoX += pdf.getTextWidth(activity.cost) + 5;
    }
    
    const rating = activity.estimatedRating || activity.rating;
    if (rating) {
      pdf.setTextColor("#fbbf24");
      pdf.text(`★ ${rating.toFixed(1)}`, infoX, cardY + 8.5);
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
      drawTextEllipsis(pdf, `📍 ${activity.location}`, contentX, cardY + 25, contentWidth);
    }
    
    // Description
    if (activity.description) {
      pdf.setTextColor(COLORS.text);
      pdf.setFontSize(8);
      const descLines = pdf.splitTextToSize(activity.description, contentWidth);
      descLines.slice(0, 2).forEach((line: string, i: number) => {
        pdf.text(line, contentX, cardY + 32 + i * 4);
      });
    }
    
    // Tips
    if (activity.tips) {
      const tipY = cardY + activityHeight - 10;
      pdf.setFillColor("#fef3c7");
      drawRoundedRect(pdf, contentX, tipY, contentWidth - 30, 7, 2, "#fef3c7");
      pdf.setTextColor("#92400e");
      pdf.setFontSize(7);
      drawTextEllipsis(pdf, `💡 ${activity.tips}`, contentX + 2, tipY + 4.5, contentWidth - 35);
    }
    
    // QR Code
    const qrCode = activityQRs[activity.id];
    if (qrCode) {
      try {
        const qrSize = 18;
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
    { label: "Duracao", value: itinerary.duration || "-" },
    { label: "Orcamento", value: itinerary.totalBudget || "-" },
    { label: "Destinos", value: itinerary.destinations?.length?.toString() || "0" },
    { label: "Atividades", value: itinerary.days.reduce((a, d) => a + d.activities.length, 0).toString() },
  ];
  
  const cardWidth = (CONTENT_WIDTH - 15) / 2;
  stats.forEach((stat, i) => {
    const x = MARGIN + (i % 2) * (cardWidth + 5);
    const cardY = y + Math.floor(i / 2) * 30;
    
    drawRoundedRect(pdf, x, cardY, cardWidth, 25, 4, "#f3f4f6");
    
    pdf.setTextColor(COLORS.textLight);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(stat.label, x + 10, cardY + 10);
    
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(stat.value, x + 10, cardY + 20);
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
  pdf.setFillColor("#f3f4f6");
  pdf.rect(0, PAGE_HEIGHT - 35, PAGE_WIDTH, 35, "F");
  
  pdf.setTextColor(COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Viaje com Sofía", PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: "center" });
  
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
        // Step 1: Fetch images
        updateProgress("fetching-images", 5);
        
        const images = await fetchItineraryImages(itinerary, (p) => {
          updateProgress("fetching-images", p);
        });
        
        // Step 2: Generate map
        updateProgress("generating-map", 30);
        
        const activityQRs = await generateItineraryQRCodes(itinerary.days, (p) => {
          updateProgress("generating-map", p);
        });
        
        // Generate web QR
        const webQR = await generateQRCode(
          `${window.location.origin}/itinerary`,
          { width: 150 }
        );
        
        updateProgress("creating-pdf", 50);
        
        // Step 3: Create PDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        
        // Cover page
        renderCoverPage(pdf, itinerary, images.cover?.base64 || null, webQR);
        updateProgress("creating-pdf", 55);
        
        // Map page
        await renderMapPage(pdf, itinerary);
        updateProgress("creating-pdf", 60);
        
        // Day pages
        const totalDays = itinerary.days.length;
        for (let i = 0; i < totalDays; i++) {
          const day = itinerary.days[i];
          const dayImage = images.days[day.day]?.base64 || null;
          renderDayPage(pdf, day, dayImage, activityQRs);
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
