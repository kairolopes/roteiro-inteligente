import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuoteForPdf {
  id: string;
  type: string;
  status: string;
  destination: string | null;
  day_number: number | null;
  itinerary_id: string | null;
  itinerary_title: string | null;
  message_sent: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  closed_value: number | null;
  notes: string | null;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  flight: "Voo",
  hotel: "Hospedagem",
  tour: "Passeio",
  activity: "Atividade",
  full_package: "Pacote completo",
  other: "Outro",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Novo",
  in_progress: "Em contato",
  closed_won: "Fechado",
  closed_lost: "Perdido",
};

const AGENT_LABEL: Record<string, string> = {
  sofia: "Sofia (Concierge)",
  pietra: "Pietra (Eventos)",
  lia: "Lia (Tom local)",
  bruno: "Bruno (Logística)",
};

export async function generateQuotePdf(quote: QuoteForPdf) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Cotacao - Relatorio", margin, 30);
  doc.setFontSize(10);
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
    margin,
    50,
  );
  y = 100;

  // Resumo da cotação
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text("Resumo da cotacao", margin, y);
  y += 10;

  const rows: [string, string][] = [
    ["Tipo", TYPE_LABEL[quote.type] ?? quote.type],
    ["Status", STATUS_LABEL[quote.status] ?? quote.status],
    ["Destino", quote.destination ?? "-"],
    ["Dia do roteiro", quote.day_number ? `Dia ${quote.day_number}` : "-"],
    ["Roteiro", quote.itinerary_title ?? "-"],
    ["Contato", quote.contact_name ?? "-"],
    ["Telefone", quote.contact_phone ?? "-"],
    [
      "Criada em",
      format(new Date(quote.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    ],
    [
      "Valor fechado",
      quote.closed_value ? `R$ ${Number(quote.closed_value).toFixed(2)}` : "-",
    ],
  ];

  autoTable(doc, {
    startY: y + 4,
    head: [["Campo", "Valor"]],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // Mensagem enviada
  if (quote.message_sent) {
    doc.setFontSize(13);
    doc.text("Mensagem enviada ao cliente", margin, y);
    y += 14;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(
      quote.message_sent,
      pageWidth - margin * 2,
    );
    doc.text(lines, margin, y);
    y += lines.length * 12 + 16;
  }

  // Notas internas
  if (quote.notes) {
    doc.setFontSize(13);
    doc.text("Notas internas", margin, y);
    y += 14;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(quote.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 16;
  }

  // Replay dos agentes
  if (quote.itinerary_id) {
    const { data: messages } = await (supabase as any)
      .from("agent_messages")
      .select("agent_name, role, content, created_at, notify_admin")
      .eq("itinerary_id", quote.itinerary_id)
      .order("created_at", { ascending: true });

    if (y > 700) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(14);
    doc.text("Replay dos agentes IA", margin, y);
    y += 6;

    if (!messages || messages.length === 0) {
      y += 18;
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Nenhuma mensagem dos agentes registrada para este roteiro.",
        margin,
        y,
      );
      doc.setTextColor(15, 23, 42);
    } else {
      const body = messages.map((m: any) => [
        format(new Date(m.created_at), "dd/MM HH:mm", { locale: ptBR }),
        AGENT_LABEL[m.agent_name] ?? m.agent_name,
        m.role,
        (m.notify_admin ? "[!] " : "") + (m.content || ""),
      ]);

      autoTable(doc, {
        startY: y + 8,
        head: [["Quando", "Agente", "Papel", "Mensagem"]],
        body,
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5, valign: "top" },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 110 },
          2: { cellWidth: 60 },
          3: { cellWidth: "auto" },
        },
        margin: { left: margin, right: margin },
      });
    }
  }

  // Footer em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Pagina ${i} de ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
  }

  const safeName = (quote.destination ?? "cotacao")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
  doc.save(`cotacao-${safeName}-${quote.id.slice(0, 8)}.pdf`);
}
