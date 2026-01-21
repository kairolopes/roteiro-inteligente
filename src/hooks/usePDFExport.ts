import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Itinerary } from "@/types/itinerary";
import { PDFProgressStep } from "@/components/itinerary/PDFProgressModal";

interface PDFExportState {
  isExporting: boolean;
  currentStep: PDFProgressStep;
  progress: number;
}

// Category configuration for PDF
const categoryStyles: Record<string, { label: string; color: string; bgColor: string }> = {
  attraction: { label: "Atração", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.2)" },
  restaurant: { label: "Restaurante", color: "#ea580c", bgColor: "rgba(234, 88, 12, 0.2)" },
  transport: { label: "Transporte", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.2)" },
  accommodation: { label: "Hospedagem", color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.2)" },
  activity: { label: "Atividade", color: "#ec4899", bgColor: "rgba(236, 72, 153, 0.2)" },
};

const defaultStyle = { label: "Atividade", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.2)" };

// Generate HTML content for PDF
function generatePDFHTML(itinerary: Itinerary): string {
  const today = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Generate day sections
  const daySections = itinerary.days.map(day => {
    const activities = day.activities.map(activity => {
      const style = categoryStyles[activity.category] || defaultStyle;
      const rating = activity.estimatedRating || activity.rating;
      
      return `
        <div style="background: rgba(30, 41, 59, 0.8); border-radius: 12px; border-left: 4px solid ${style.color}; margin-bottom: 16px; overflow: hidden;">
          <div style="background: ${style.bgColor}; padding: 12px 16px; display: flex; align-items: center; gap: 8px;">
            <span style="color: ${style.color}; font-size: 14px; font-weight: 500;">${style.label}</span>
            ${rating ? `<span style="margin-left: auto; color: #facc15; font-size: 14px;">★ ${typeof rating === 'number' ? rating.toFixed(1) : rating}</span>` : ''}
          </div>
          <div style="padding: 16px;">
            <div style="display: flex; gap: 16px;">
              <div style="flex-shrink: 0; text-align: center;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center;">
                  <span style="color: #60a5fa; font-size: 12px;">⏰</span>
                </div>
                <span style="font-size: 14px; font-weight: 600; color: white; margin-top: 4px; display: block;">${activity.time}</span>
              </div>
              <div style="flex: 1; min-width: 0;">
                <h4 style="font-size: 16px; font-weight: 600; color: white; margin: 0 0 8px 0;">${activity.title}</h4>
                <p style="font-size: 14px; color: #d1d5db; margin: 0 0 8px 0;">${activity.description}</p>
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
                  📍 ${activity.location}
                </div>
                <div style="display: flex; gap: 16px; font-size: 12px; color: #d1d5db;">
                  <span>⏱ ${activity.duration}</span>
                  ${activity.cost ? `<span>💰 ${activity.cost}</span>` : ''}
                </div>
                ${activity.tips ? `
                  <div style="margin-top: 12px; padding: 12px; border-radius: 8px; background: rgba(234, 179, 8, 0.2); font-size: 12px; color: #fde047;">
                    💡 ${activity.tips}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const highlights = day.highlights.slice(0, 5).map(h => 
      `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 999px; background: rgba(236, 72, 153, 0.2); color: #f472b6; font-size: 12px; font-weight: 500;">★ ${h}</span>`
    ).join('');

    return `
      <div style="margin-bottom: 32px; page-break-inside: avoid;">
        <div style="display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 12px; background: linear-gradient(90deg, #2563eb, #3b82f6); margin-bottom: 16px;">
          <div style="width: 56px; height: 56px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px; font-weight: bold; color: white;">${day.day}</span>
          </div>
          <div style="flex: 1;">
            <h3 style="font-size: 18px; font-weight: bold; color: white; margin: 0;">${day.date}</h3>
            <div style="font-size: 14px; color: #bfdbfe;">📍 ${day.city}, ${day.country}</div>
          </div>
          <div style="padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.2); font-size: 12px; color: white;">
            📅 ${day.activities.length} atividades
          </div>
        </div>
        ${day.highlights.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
            ${highlights}
          </div>
        ` : ''}
        <div style="padding-left: 16px; border-left: 2px solid rgba(59, 130, 246, 0.3); margin-left: 28px;">
          ${activities}
        </div>
      </div>
    `;
  }).join('');

  // Destinations preview for cover
  const destPreviews = itinerary.days.slice(0, 3).map(day => `
    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; text-align: center; flex: 1;">
      <div style="font-size: 28px; font-weight: bold; color: white; margin-bottom: 4px;">Dia ${day.day}</div>
      <div style="color: #bfdbfe;">${day.city}</div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; }
      </style>
    </head>
    <body>
      <div style="width: 794px; background: #0f172a; color: white;">
        <div style="min-height: 1123px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px;">
          <div style="width: 80px; height: 80px; border-radius: 16px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 32px;">
            <span style="font-size: 40px;">📍</span>
          </div>
          <h1 style="font-size: 48px; font-weight: bold; text-align: center; color: white; margin-bottom: 24px; line-height: 1.2;">
            ${itinerary.title}
          </h1>
          <p style="font-size: 20px; color: #bfdbfe; text-align: center; max-width: 500px; margin-bottom: 32px; line-height: 1.5;">
            ${itinerary.summary}
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-bottom: 48px;">
            <div style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 999px; background: rgba(255,255,255,0.2);">
              <span>📅</span>
              <span style="color: white; font-weight: 500;">${itinerary.duration}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 999px; background: rgba(255,255,255,0.2);">
              <span>📍</span>
              <span style="color: white; font-weight: 500;">${itinerary.destinations.join(' → ')}</span>
            </div>
            ${itinerary.totalBudget ? `
              <div style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 999px; background: rgba(255,255,255,0.2);">
                <span>💰</span>
                <span style="color: white; font-weight: 500;">${itinerary.totalBudget}</span>
              </div>
            ` : ''}
          </div>
          <div style="display: flex; gap: 16px; width: 100%; max-width: 600px;">
            ${destPreviews}
          </div>
          <div style="position: absolute; bottom: 32px; text-align: center; width: 100%;">
            <p style="color: #93c5fd; font-size: 14px;">Roteiro gerado por Viaje com Sofia</p>
            <p style="color: rgba(147, 197, 253, 0.6); font-size: 12px; margin-top: 4px;">${today}</p>
          </div>
        </div>
        <div style="padding: 48px 32px; background: #0f172a;">
          <h2 style="font-size: 28px; font-weight: bold; color: white; margin-bottom: 32px; display: flex; align-items: center; gap: 12px;">
            📅 Roteiro Completo
          </h2>
          ${daySections}
        </div>
        <div style="min-height: 400px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); display: flex; align-items: center; justify-content: center; text-align: center; padding: 48px;">
          <div>
            <h2 style="font-size: 36px; font-weight: bold; color: white; margin-bottom: 16px;">Boa Viagem!</h2>
            <p style="font-size: 20px; color: #bfdbfe; margin-bottom: 24px;">Aproveite cada momento da sua aventura</p>
            <p style="color: rgba(147, 197, 253, 0.6); font-size: 14px;">Roteiro criado com Viaje com Sofia</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const usePDFExport = () => {
  const [state, setState] = useState<PDFExportState>({
    isExporting: false,
    currentStep: 'fetching-images',
    progress: 0,
  });

  const updateProgress = (step: PDFProgressStep, progress: number) => {
    setState(prev => ({ ...prev, currentStep: step, progress }));
  };

  const exportToPDF = useCallback(async (itinerary: Itinerary) => {
    setState({ isExporting: true, currentStep: 'fetching-images', progress: 0 });

    try {
      updateProgress('fetching-images', 10);
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '794px';
      document.body.appendChild(container);

      updateProgress('fetching-images', 20);
      container.innerHTML = generatePDFHTML(itinerary);

      await new Promise(resolve => setTimeout(resolve, 300));

      updateProgress('generating-map', 40);
      updateProgress('creating-pdf', 50);
      
      const contentElement = container.firstElementChild as HTMLElement;
      
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        logging: false,
        windowWidth: 794,
      });

      updateProgress('creating-pdf', 70);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNumber++;

      while (heightLeft > 0) {
        position = -pageHeight * pageNumber;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageNumber++;
        
        const progressValue = 70 + Math.min(25, (pageNumber / Math.ceil(imgHeight / pageHeight)) * 25);
        updateProgress('creating-pdf', progressValue);
      }

      updateProgress('complete', 100);

      const fileName = `roteiro-${itinerary.title.toLowerCase().replace(/\s+/g, "-").substring(0, 30)}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(container);

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
