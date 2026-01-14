import { useState } from "react";
import { jsPDF } from "jspdf";
import { Itinerary } from "@/types/itinerary";

export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (itinerary: Itinerary) => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper function to add new page if needed
      const checkNewPage = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFillColor(59, 130, 246); // Primary color
      pdf.rect(0, 0, pageWidth, 50, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(itinerary.title, margin, 25);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${itinerary.duration} • ${itinerary.destinations.join(" → ")}`, margin, 38);

      y = 65;
      pdf.setTextColor(50, 50, 50);

      // Summary
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "italic");
      const summaryLines = pdf.splitTextToSize(itinerary.summary, contentWidth);
      pdf.text(summaryLines, margin, y);
      y += summaryLines.length * 6 + 10;

      // Budget
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Orçamento Estimado: ${itinerary.totalBudget}`, margin, y);
      y += 15;

      // Days
      for (const day of itinerary.days) {
        checkNewPage(40);

        // Day header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y - 5, contentWidth, 18, "F");
        
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(59, 130, 246);
        pdf.text(`Dia ${day.day}: ${day.city}, ${day.country}`, margin + 5, y + 5);
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(day.date, margin + 5, y + 11);
        
        y += 20;
        pdf.setTextColor(50, 50, 50);

        // Highlights
        if (day.highlights.length > 0) {
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "italic");
          pdf.text(`✨ Destaques: ${day.highlights.join(" • ")}`, margin + 5, y);
          y += 8;
        }

        // Activities
        for (const activity of day.activities) {
          checkNewPage(25);

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${activity.time} - ${activity.title}`, margin + 5, y);
          y += 5;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          const descLines = pdf.splitTextToSize(activity.description, contentWidth - 10);
          pdf.text(descLines, margin + 5, y);
          y += descLines.length * 4 + 2;

          pdf.setTextColor(100, 100, 100);
          pdf.text(`📍 ${activity.location}`, margin + 5, y);
          y += 4;

          let metaText = `⏱ ${activity.duration}`;
          if (activity.cost) metaText += ` • 💰 ${activity.cost}`;
          pdf.text(metaText, margin + 5, y);
          y += 6;

          pdf.setTextColor(50, 50, 50);

          if (activity.tips) {
            checkNewPage(10);
            pdf.setFillColor(255, 250, 230);
            pdf.rect(margin + 5, y - 3, contentWidth - 10, 8, "F");
            pdf.setFontSize(8);
            pdf.setTextColor(150, 120, 50);
            pdf.text(`💡 ${activity.tips}`, margin + 8, y + 2);
            y += 10;
            pdf.setTextColor(50, 50, 50);
          }

          y += 3;
        }

        y += 10;
      }

      // Footer
      checkNewPage(20);
      y = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Roteiro gerado por TravelPlan AI • ${new Date().toLocaleDateString("pt-BR")}`,
        pageWidth / 2,
        y,
        { align: "center" }
      );

      // Save
      const fileName = `roteiro-${itinerary.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPDF, isExporting };
};
