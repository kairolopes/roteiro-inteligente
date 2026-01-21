import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Itinerary, ItineraryDay, Activity } from "@/types/itinerary";
import { generateSvgRouteMap, svgToDataUrl } from "@/services/staticMapService";
import { supabase } from "@/integrations/supabase/client";
import { PDFProgressStep } from "@/components/itinerary/PDFProgressModal";

interface ImageData {
  url: string;
  credit: string;
}

interface PDFExportState {
  isExporting: boolean;
  currentStep: PDFProgressStep;
  progress: number;
}

// Category configuration for visual styling
const categoryConfig: Record<string, { emoji: string; color: [number, number, number] }> = {
  attraction: { emoji: "🏛️", color: [59, 130, 246] },
  restaurant: { emoji: "🍽️", color: [234, 88, 12] },
  transport: { emoji: "🚌", color: [34, 197, 94] },
  accommodation: { emoji: "🏨", color: [168, 85, 247] },
  activity: { emoji: "🎭", color: [236, 72, 153] },
};

export const usePDFExport = () => {
  const [state, setState] = useState<PDFExportState>({
    isExporting: false,
    currentStep: 'fetching-images',
    progress: 0,
  });

  const updateProgress = (step: PDFProgressStep, progress: number) => {
    setState(prev => ({ ...prev, currentStep: step, progress }));
  };

  // Fetch images from Unsplash via edge function
  const fetchImages = async (queries: string[]): Promise<Record<string, ImageData>> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-travel-images', {
        body: { queries, width: 800, height: 500 },
      });

      if (error) throw error;
      return data?.images || {};
    } catch (error) {
      console.error('Error fetching images:', error);
      // Return empty object - we'll use fallbacks
      return {};
    }
  };

  // Convert image URL to base64 for PDF embedding
  const imageUrlToBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  const exportToPDF = useCallback(async (itinerary: Itinerary) => {
    setState({ isExporting: true, currentStep: 'fetching-images', progress: 0 });

    try {
      // Step 1: Fetch images
      updateProgress('fetching-images', 10);
      
      const imageQueries = [
        itinerary.destinations[0] || itinerary.title, // Cover image
        ...itinerary.days.map(d => `${d.city} ${d.country} travel`),
      ];
      
      const images = await fetchImages(imageQueries.slice(0, 8)); // Limit to avoid rate limits
      updateProgress('fetching-images', 40);

      // Step 2: Generate route map
      updateProgress('generating-map', 50);
      
      const coordinates = itinerary.days.map(d => ({
        lat: d.coordinates[0],
        lng: d.coordinates[1],
      }));
      const cities = itinerary.days.map(d => d.city);
      const routeMapSvg = generateSvgRouteMap(coordinates, cities, 500, 280);
      
      updateProgress('generating-map', 60);

      // Step 3: Create PDF
      updateProgress('creating-pdf', 70);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const primaryColor: [number, number, number] = [59, 130, 246];
      const textColor: [number, number, number] = [31, 41, 55];
      const mutedColor: [number, number, number] = [107, 114, 128];

      // ========== COVER PAGE ==========
      // Background gradient simulation
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Gradient overlay
      for (let i = 0; i < 50; i++) {
        const alpha = i / 50;
        pdf.setFillColor(30 + alpha * 29, 64 + alpha * 66, 175 + alpha * 71);
        pdf.rect(0, pageHeight * (i / 50), pageWidth, pageHeight / 50, "F");
      }

      // Cover image (if available)
      const coverQuery = itinerary.destinations[0] || itinerary.title;
      const coverImageData = images[coverQuery];
      
      if (coverImageData) {
        try {
          const coverBase64 = await imageUrlToBase64(coverImageData.url);
          if (coverBase64) {
            // Add image with overlay
            pdf.addImage(coverBase64, 'JPEG', 0, 0, pageWidth, pageHeight * 0.6);
            // Dark overlay gradient
            pdf.setFillColor(0, 0, 0);
            pdf.setGState(new (pdf as any).GState({ opacity: 0.4 }));
            pdf.rect(0, 0, pageWidth, pageHeight * 0.6, "F");
            pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
          }
        } catch (e) {
          console.log('Could not add cover image');
        }
      }

      // Title area
      const titleY = pageHeight * 0.65;
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      
      // Word wrap title
      const titleLines = pdf.splitTextToSize(itinerary.title, contentWidth);
      pdf.text(titleLines, margin, titleY);
      
      // Subtitle
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      const subtitleY = titleY + titleLines.length * 12 + 8;
      pdf.text(`${itinerary.duration} • ${itinerary.destinations.join(" → ")}`, margin, subtitleY);

      // Budget badge
      if (itinerary.totalBudget) {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(margin, subtitleY + 10, 60, 10, 2, 2, "F");
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(10);
        pdf.text(`💰 ${itinerary.totalBudget}`, margin + 5, subtitleY + 17);
      }

      // Footer
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(8);
      pdf.text("Roteiro gerado por TravelPlan AI", margin, pageHeight - 15);
      pdf.text(new Date().toLocaleDateString("pt-BR"), pageWidth - margin, pageHeight - 15, { align: "right" });

      updateProgress('creating-pdf', 80);

      // ========== SUMMARY PAGE ==========
      pdf.addPage();
      let y = margin;

      // Page header
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("📋 Resumo do Roteiro", margin, 16);
      
      y = 35;
      pdf.setTextColor(...textColor);

      // Summary text
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const summaryLines = pdf.splitTextToSize(itinerary.summary, contentWidth);
      pdf.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 10;

      // Route Map
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("🗺️ Rota da Viagem", margin, y);
      y += 8;

      if (routeMapSvg) {
        try {
          const mapDataUrl = svgToDataUrl(routeMapSvg);
          pdf.addImage(mapDataUrl, 'PNG', margin, y, contentWidth, 70);
          y += 75;
        } catch (e) {
          console.log('Could not add route map');
          y += 5;
        }
      }

      // Highlights per day
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("✨ Destaques por Dia", margin, y);
      y += 8;

      for (const day of itinerary.days) {
        if (y > pageHeight - 30) {
          pdf.addPage();
          y = margin;
        }

        pdf.setFillColor(240, 249, 255);
        pdf.roundedRect(margin, y - 4, contentWidth, 16, 2, 2, "F");
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primaryColor);
        pdf.text(`Dia ${day.day}: ${day.city}`, margin + 4, y + 3);
        
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...mutedColor);
        pdf.setFontSize(9);
        const highlights = day.highlights.slice(0, 3).join(" • ");
        pdf.text(highlights, margin + 4, y + 9);
        
        y += 20;
      }

      updateProgress('creating-pdf', 90);

      // ========== DAY PAGES ==========
      for (let dayIndex = 0; dayIndex < itinerary.days.length; dayIndex++) {
        const day = itinerary.days[dayIndex];
        pdf.addPage();
        y = 0;

        // Day header with image
        const dayImageKey = `${day.city} ${day.country} travel`;
        const dayImageData = images[dayImageKey];

        pdf.setFillColor(...primaryColor);
        pdf.rect(0, 0, pageWidth, 50, "F");

        // Try to add city image
        if (dayImageData) {
          try {
            const dayBase64 = await imageUrlToBase64(dayImageData.url);
            if (dayBase64) {
              pdf.addImage(dayBase64, 'JPEG', 0, 0, pageWidth, 50);
              // Dark overlay
              pdf.setFillColor(0, 0, 0);
              pdf.setGState(new (pdf as any).GState({ opacity: 0.5 }));
              pdf.rect(0, 0, pageWidth, 50, "F");
              pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
            }
          } catch (e) {
            // Keep solid color background
          }
        }

        // Day title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Dia ${day.day}`, margin, 22);
        
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${day.city}, ${day.country}`, margin, 32);
        
        pdf.setFontSize(10);
        pdf.text(day.date, margin, 42);

        y = 60;
        pdf.setTextColor(...textColor);

        // Highlights
        if (day.highlights.length > 0) {
          pdf.setFillColor(254, 249, 195);
          pdf.roundedRect(margin, y - 4, contentWidth, 12, 2, 2, "F");
          pdf.setFontSize(9);
          pdf.setTextColor(161, 98, 7);
          pdf.text(`✨ ${day.highlights.join(" • ")}`, margin + 4, y + 3);
          y += 16;
        }

        // Activities
        for (const activity of day.activities) {
          if (y > pageHeight - 40) {
            pdf.addPage();
            y = margin;
          }

          const config = categoryConfig[activity.category] || categoryConfig.activity;

          // Activity card
          pdf.setDrawColor(...config.color);
          pdf.setLineWidth(0.5);
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(margin, y - 2, contentWidth, 32, 3, 3, "FD");

          // Category indicator
          pdf.setFillColor(...config.color);
          pdf.rect(margin, y - 2, 4, 32, "F");

          // Time badge
          pdf.setFillColor(240, 240, 240);
          pdf.roundedRect(margin + 8, y + 1, 18, 7, 1, 1, "F");
          pdf.setFontSize(7);
          pdf.setTextColor(...mutedColor);
          pdf.text(activity.time, margin + 10, y + 6);

          // Title
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...textColor);
          const titleText = `${config.emoji} ${activity.title}`;
          pdf.text(titleText.substring(0, 50), margin + 30, y + 6);

          // Description (truncated)
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...mutedColor);
          const descText = activity.description.substring(0, 90) + (activity.description.length > 90 ? "..." : "");
          pdf.text(descText, margin + 8, y + 14);

          // Location & Duration
          pdf.setFontSize(7);
          pdf.text(`📍 ${activity.location.substring(0, 40)}`, margin + 8, y + 21);
          
          let metaX = margin + 8;
          pdf.text(`⏱ ${activity.duration}`, metaX, y + 27);
          metaX += 25;
          
          if (activity.cost) {
            pdf.text(`💰 ${activity.cost}`, metaX, y + 27);
          }

          y += 38;

          // Tips box
          if (activity.tips) {
            if (y > pageHeight - 20) {
              pdf.addPage();
              y = margin;
            }

            pdf.setFillColor(254, 249, 195);
            pdf.roundedRect(margin + 4, y - 4, contentWidth - 8, 10, 2, 2, "F");
            pdf.setFontSize(7);
            pdf.setTextColor(161, 98, 7);
            pdf.text(`💡 ${activity.tips.substring(0, 80)}`, margin + 8, y + 2);
            y += 14;
          }
        }
      }

      // ========== FINAL PAGE ==========
      pdf.addPage();
      y = margin;

      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Thank you message
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Boa Viagem! ✈️", pageWidth / 2, pageHeight / 2 - 20, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Roteiro criado com TravelPlan AI", pageWidth / 2, pageHeight / 2, { align: "center" });

      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleDateString("pt-BR", { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), pageWidth / 2, pageHeight / 2 + 15, { align: "center" });

      // Photo credits
      const credits = Object.values(images).map(img => img.credit).filter(Boolean);
      if (credits.length > 0) {
        pdf.setFontSize(6);
        pdf.setTextColor(200, 200, 200);
        pdf.text("Fotos: " + credits.slice(0, 3).join(" | "), pageWidth / 2, pageHeight - 15, { align: "center" });
      }

      updateProgress('complete', 100);

      // Save
      const fileName = `roteiro-${itinerary.title.toLowerCase().replace(/\s+/g, "-").substring(0, 30)}.pdf`;
      pdf.save(fileName);

      // Reset state after a short delay
      setTimeout(() => {
        setState({ isExporting: false, currentStep: 'fetching-images', progress: 0 });
      }, 1500);

    } catch (error) {
      console.error("Error generating PDF:", error);
      setState({ isExporting: false, currentStep: 'fetching-images', progress: 0 });
      throw error;
    }
  }, []);

  return { 
    exportToPDF, 
    isExporting: state.isExporting,
    currentStep: state.currentStep,
    progress: state.progress,
  };
};
