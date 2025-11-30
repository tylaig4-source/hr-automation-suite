// ==========================================
// HR AUTOMATION SUITE - Export Services
// ==========================================
// Exportação para PDF e DOCX

import { jsPDF } from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";

// ==========================================
// TIPOS
// ==========================================

export interface ExportOptions {
  title: string;
  subtitle?: string;
  content: string;
  agentName: string;
  generatedAt: Date;
  companyName?: string;
}

export interface ExportResult {
  buffer: Buffer | Uint8Array;
  filename: string;
  mimeType: string;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Remove markdown e retorna texto limpo
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/^\s*[-*]\s/gm, "• ") // Convert list items
    .replace(/^\s*\d+\.\s/gm, "") // Remove numbered lists
    .replace(/\n{3,}/g, "\n\n") // Remove extra newlines
    .trim();
}

/**
 * Extrai seções do markdown
 */
function extractSections(content: string): Array<{ heading: string; content: string; level: number }> {
  const sections: Array<{ heading: string; content: string; level: number }> = [];
  const lines = content.split("\n");
  
  let currentHeading = "";
  let currentContent: string[] = [];
  let currentLevel = 0;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // Salva seção anterior
      if (currentHeading || currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
          level: currentLevel,
        });
      }
      
      currentHeading = headerMatch[2];
      currentLevel = headerMatch[1].length;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Adiciona última seção
  if (currentHeading || currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
      level: currentLevel,
    });
  }

  return sections;
}

/**
 * Gera nome do arquivo
 */
function generateFilename(title: string, extension: string): string {
  const sanitized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  const date = new Date().toISOString().split("T")[0];
  return `${sanitized}-${date}.${extension}`;
}

// ==========================================
// PDF EXPORT
// ==========================================

export async function exportToPDF(options: ExportOptions): Promise<ExportResult> {
  const { title, subtitle, content, agentName, generatedAt, companyName } = options;
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Configurações de fonte
  const titleSize = 18;
  const subtitleSize = 12;
  const headingSize = 14;
  const bodySize = 11;
  const smallSize = 9;

  // Header
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(titleSize);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, 15);
  
  if (subtitle) {
    doc.setFontSize(subtitleSize);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, margin, 23);
  }
  
  doc.setFontSize(smallSize);
  doc.text(`Gerado por: ${agentName}`, margin, 30);
  doc.text(
    `Data: ${generatedAt.toLocaleDateString("pt-BR")}`,
    pageWidth - margin - 40,
    30
  );

  y = 45;

  // Resetar cor do texto
  doc.setTextColor(31, 41, 55); // Gray-800

  // Processar conteúdo
  const sections = extractSections(content);

  for (const section of sections) {
    // Verifica se precisa de nova página
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    // Heading
    if (section.heading) {
      doc.setFontSize(section.level <= 2 ? headingSize : bodySize);
      doc.setFont("helvetica", "bold");
      
      // Linha decorativa para headers principais
      if (section.level <= 2) {
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 2, margin + 30, y + 2);
        y += 5;
      }
      
      doc.text(section.heading, margin, y);
      y += 8;
    }

    // Content
    if (section.content) {
      doc.setFontSize(bodySize);
      doc.setFont("helvetica", "normal");
      
      const cleanContent = stripMarkdown(section.content);
      const lines = doc.splitTextToSize(cleanContent, contentWidth);
      
      for (const line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }
        
        // Detecta bullet points
        if (line.startsWith("•")) {
          doc.text(line, margin + 5, y);
        } else {
          doc.text(line, margin, y);
        }
        y += 5;
      }
      
      y += 5;
    }
  }

  // Footer em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(smallSize);
    doc.setTextColor(156, 163, 175); // Gray-400
    
    const footerText = companyName 
      ? `${companyName} | HR Automation Suite`
      : "HR Automation Suite";
    
    doc.text(footerText, margin, pageHeight - 10);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
  }

  const buffer = doc.output("arraybuffer");
  
  return {
    buffer: new Uint8Array(buffer),
    filename: generateFilename(title, "pdf"),
    mimeType: "application/pdf",
  };
}

// ==========================================
// DOCX EXPORT
// ==========================================

export async function exportToDocx(options: ExportOptions): Promise<ExportResult> {
  const { title, subtitle, content, agentName, generatedAt, companyName } = options;
  
  const sections = extractSections(content);
  const children: Paragraph[] = [];

  // Título
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 36,
          color: "4F46E5", // Indigo
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  // Subtítulo
  if (subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: subtitle,
            size: 24,
            color: "6B7280", // Gray-500
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Metadados
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Gerado por: ${agentName} | Data: ${generatedAt.toLocaleDateString("pt-BR")}`,
          size: 20,
          color: "9CA3AF", // Gray-400
          italics: true,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Linha separadora
  children.push(
    new Paragraph({
      border: {
        bottom: {
          color: "E5E7EB",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 400 },
    })
  );

  // Conteúdo
  for (const section of sections) {
    // Heading
    if (section.heading) {
      const headingLevel = section.level === 1 
        ? HeadingLevel.HEADING_1 
        : section.level === 2 
          ? HeadingLevel.HEADING_2 
          : HeadingLevel.HEADING_3;

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              bold: true,
              size: section.level <= 2 ? 28 : 24,
              color: "1F2937", // Gray-800
            }),
          ],
          heading: headingLevel,
          spacing: { before: 300, after: 200 },
        })
      );
    }

    // Content
    if (section.content) {
      const cleanContent = stripMarkdown(section.content);
      const paragraphs = cleanContent.split("\n\n");

      for (const para of paragraphs) {
        if (para.trim()) {
          // Detecta lista
          if (para.startsWith("•")) {
            const items = para.split("\n").filter(line => line.trim());
            for (const item of items) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item.replace(/^[•]\s*/, ""),
                      size: 22,
                    }),
                  ],
                  bullet: { level: 0 },
                  spacing: { after: 100 },
                })
              );
            }
          } else {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 22,
                  }),
                ],
                spacing: { after: 200 },
              })
            );
          }
        }
      }
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "---",
          color: "E5E7EB",
        }),
      ],
      spacing: { before: 400 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: companyName 
            ? `Documento gerado pelo HR Automation Suite para ${companyName}`
            : "Documento gerado pelo HR Automation Suite",
          size: 18,
          color: "9CA3AF",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
    creator: "HR Automation Suite",
    title: title,
    description: subtitle || `Gerado por ${agentName}`,
  });

  const buffer = await Packer.toBuffer(doc);
  
  return {
    buffer: Buffer.from(buffer),
    filename: generateFilename(title, "docx"),
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}

