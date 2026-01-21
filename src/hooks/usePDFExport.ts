import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Use same type as PDFProgressModal
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

// Types matching src/types/itinerary.ts
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

const categoryLabels: Record<string, string> = {
  restaurant: "Restaurante",
  attraction: "Atracao",
  transport: "Transporte",
  accommodation: "Hospedagem",
  activity: "Atividade",
};

const categoryColors: Record<string, string> = {
  restaurant: "#ea580c",
  attraction: "#8b5cf6",
  transport: "#3b82f6",
  accommodation: "#10b981",
  activity: "#ec4899",
};

function generatePDFHTML(itinerary: ItineraryData): string {
  const daysHTML = itinerary.days
    .map((day) => {
      const activitiesHTML = day.activities
        .map((activity) => {
          const category = activity.category || "activity";
          const color = categoryColors[category] || "#6b7280";
          const label = categoryLabels[category] || "Atividade";
          const rating = activity.estimatedRating || activity.rating;

          const tipsHTML = activity.tips
            ? `<div style="margin-top: 8px; padding: 8px; background: #fef3c7; border-radius: 6px; font-size: 11px; color: #92400e;">
              <strong>Dica:</strong> ${activity.tips}
            </div>`
            : "";

          return `
          <div style="display: flex; gap: 16px; margin-bottom: 16px; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="flex-shrink: 0; width: 60px; text-align: center;">
              <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${activity.time}</div>
              ${activity.duration ? `<div style="font-size: 11px; color: #6b7280;">${activity.duration}</div>` : ""}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="padding: 2px 8px; background: ${color}20; color: ${color}; border-radius: 4px; font-size: 10px; font-weight: 600;">${label}</span>
                ${activity.cost ? `<span style="font-size: 11px; color: #6b7280;">${activity.cost}</span>` : ""}
                ${rating ? `<span style="font-size: 11px; color: #facc15;">* ${typeof rating === "number" ? rating.toFixed(1) : rating}</span>` : ""}
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${activity.title}</h4>
              ${activity.location ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Local: ${activity.location}</div>` : ""}
              ${activity.description ? `<p style="margin: 0; font-size: 12px; color: #4b5563; line-height: 1.5;">${activity.description}</p>` : ""}
              ${tipsHTML}
            </div>
          </div>
        `;
        })
        .join("");

      const highlightsHTML =
        day.highlights && day.highlights.length > 0
          ? `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            ${day.highlights.slice(0, 5).map((h) => `<span style="padding: 4px 10px; background: #fce7f3; color: #db2777; border-radius: 999px; font-size: 11px;">* ${h}</span>`).join("")}
          </div>`
          : "";

      return `
        <div style="margin-bottom: 32px; page-break-inside: avoid;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 20px; border-radius: 12px 12px 0 0;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Dia ${day.day} - ${day.city}, ${day.country}</h3>
            ${day.date ? `<div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">${day.date}</div>` : ""}
          </div>
          <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px;">
            ${highlightsHTML}
            ${activitiesHTML}
          </div>
        </div>
      `;
    })
    .join("");

  const destinationsText =
    itinerary.destinations && itinerary.destinations.length > 0
      ? itinerary.destinations.join(" - ")
      : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; }
      </style>
    </head>
    <body>
      <div style="width: 794px; padding: 40px; background: white;">
        <div style="text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; border-radius: 16px; margin-bottom: 40px;">
          <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px;">${itinerary.title}</h1>
          ${itinerary.summary ? `<p style="font-size: 14px; opacity: 0.9; max-width: 500px; margin: 0 auto 24px;">${itinerary.summary}</p>` : ""}
          <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
            ${itinerary.duration ? `<span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; font-size: 13px;">Duracao: ${itinerary.duration}</span>` : ""}
            ${itinerary.totalBudget ? `<span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; font-size: 13px;">Orcamento: ${itinerary.totalBudget}</span>` : ""}
            ${destinationsText ? `<span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; font-size: 13px;">${destinationsText}</span>` : ""}
          </div>
        </div>
        
        ${daysHTML}
        
        <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; margin-top: 40px;">
          Roteiro criado com Viaje com Sofia - viagecomsofia.com
        </div>
      </div>
    </body>
    </html>
  `;
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
        updateProgress("fetching-images", 10);

        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.innerHTML = generatePDFHTML(itinerary);
        document.body.appendChild(container);

        await new Promise((resolve) => setTimeout(resolve, 300));

        updateProgress("generating-map", 30);

        const contentElement = container.querySelector("div") as HTMLElement;
        if (!contentElement) {
          throw new Error("Failed to find content element");
        }

        updateProgress("creating-pdf", 50);

        const canvas = await html2canvas(contentElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        updateProgress("creating-pdf", 70);

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;
        let page = 1;

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = -pageHeight * page;
          pdf.addPage();
          pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.95),
            "JPEG",
            0,
            position,
            imgWidth,
            imgHeight
          );
          heightLeft -= pageHeight;
          page++;
        }

        updateProgress("complete", 100);

        const filename = `roteiro-${itinerary.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .substring(0, 30)}.pdf`;
        pdf.save(filename);

        document.body.removeChild(container);

        setTimeout(() => {
          setState({ isExporting: false, currentStep: "fetching-images", progress: 0 });
        }, 1000);
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
