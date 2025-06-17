// src/lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Devis, Invoice, Ticket, DevisItem, InvoiceItem } from '@/types';
import { toast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';

// --- Configuration du Logo ---
const ARCADIS_LOGO_URL = '/lovable-uploads/e0e877a6-eb04-4d93-9a02-fd6d917c0df8.png';
let logoBase64: string | null = null;
let logoDimensions = { width: 0, height: 0 };

// Interface pour étendre jsPDF avec les propriétés de autoTable
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

export const preloadArcadisLogo = async (): Promise<void> => {
    if (logoBase64 && logoDimensions.width > 0) {
        return;
    }
    try {
        const response = await fetch(ARCADIS_LOGO_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch logo: ${response.statusText}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const img = new Image();
                img.onload = () => {
                    logoDimensions.width = img.width;
                    logoDimensions.height = img.height;
                    logoBase64 = base64;
                    console.log('[PDFGenerator] Arcadis logo preloaded and dimensions set.');
                    resolve();
                };
                img.onerror = () => {
                    console.error("[PDFGenerator] Error loading image object from base64 string for dimensions.");
                    reject(new Error("Error loading image object from base64 for dimensions."));
                };
                img.src = base64;
            };
            reader.onerror = (error) => {
                console.error("[PDFGenerator] FileReader error on logo:", error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("[PDFGenerator] Failed to load Arcadis logo for PDF:", error);
        logoBase64 = null;
        logoDimensions = { width: 0, height: 0 };
    }
};

const generatePdfDocument = async (
    type: 'invoice' | 'devis' | 'ticket-summary',
    data: Invoice | Devis | Ticket
): Promise<void> => {
    if (!logoBase64 || logoDimensions.width === 0) {
        console.log('[PDFGenerator] Logo not preloaded or dimensions unknown, attempting to load now...');
        try {
            await preloadArcadisLogo();
        } catch (error) {
            console.error('[PDFGenerator] Failed to load logo during PDF generation:', error);
        }
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let cursorY = 15;
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;
    const contentWidth = pageWidth - leftMargin * 2;

    const primaryColor = '#3b82f6';
    const secondaryColor = '#1e3a8a';
    const textColor = '#333333';
    const lightTextColor = '#555555';
    const borderColor = '#DDDDDD';

    if (logoBase64 && logoDimensions.width > 0) {
        const desiredLogoWidth = 40;
        const logoAspectRatio = logoDimensions.height / logoDimensions.width;
        const calculatedLogoHeight = desiredLogoWidth * logoAspectRatio;
        doc.addImage(logoBase64, 'PNG', leftMargin, cursorY, desiredLogoWidth, calculatedLogoHeight);
        cursorY += calculatedLogoHeight + 5;
    } else {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('Arcadis Technologies', leftMargin, cursorY + 5);
        cursorY += 10;
    }

    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    const arcadisInfoYStart = 15;
    doc.text('Arcadis Technologies', rightMargin, arcadisInfoYStart, { align: 'right' });
    doc.text('Sacré Coeur 3, Pyrotechnie', rightMargin, arcadisInfoYStart + 5, { align: 'right' });
    doc.text('Dakar, Sénégal', rightMargin, arcadisInfoYStart + 10, { align: 'right' });
    doc.text('contact@arcadis.tech', rightMargin, arcadisInfoYStart + 15, { align: 'right' });
    doc.text('+221 33 827 00 00', rightMargin, arcadisInfoYStart + 20, { align: 'right' });

    cursorY = Math.max(cursorY, arcadisInfoYStart + 25);

    doc.setDrawColor(borderColor);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, cursorY, rightMargin, cursorY);
    cursorY += 10;

    const addStandardFooter = (pageNumber: number, pageCountValue: number) => {
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.text(`Page ${pageNumber} sur ${pageCountValue}`, rightMargin, pageHeight - 10, { align: 'right' });
        doc.text('Arcadis Technologies - NINEA XXXXXXX - RC XXXXXXX', leftMargin, pageHeight - 10);
    };

    if (type === 'invoice' && 'dueDate' in data) {
        const invoice = data as Invoice;

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor);
        doc.text('FACTURE', leftMargin, cursorY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.text(`N° : ${invoice.number}`, rightMargin, cursorY, { align: 'right' });
        cursorY += 10;

        const col1X = leftMargin;
        const col2X = pageWidth / 2 + 5;
        const infoLineHeight = 6;
        let currentInfoY = cursorY;

        doc.setFont('helvetica', 'bold');
        doc.text('Facturé à :', col1X, currentInfoY);
        doc.setFont('helvetica', 'normal');
        const clientNameLines = doc.splitTextToSize(invoice.companyName, (pageWidth / 2) - 20);
        doc.text(clientNameLines, col1X, currentInfoY + infoLineHeight);
        currentInfoY += infoLineHeight * (clientNameLines.length + 0.5);

        let detailsY = cursorY;
        doc.setFont('helvetica', 'bold');
        doc.text("Date d'émission :", col2X, detailsY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(new Date(invoice.createdAt)), col2X + 35, detailsY);
        detailsY += infoLineHeight;

        doc.setFont('helvetica', 'bold');
        doc.text("Date d'échéance :", col2X, detailsY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(new Date(invoice.dueDate)), col2X + 35, detailsY);
        detailsY += infoLineHeight;

        if (invoice.paidAt) {
            doc.setFont('helvetica', 'bold');
            doc.text('Payée le :', col2X, detailsY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(34, 139, 34);
            doc.text(formatDate(new Date(invoice.paidAt)), col2X + 35, detailsY);
            doc.setTextColor(textColor);
            detailsY += infoLineHeight;
        }

        cursorY = Math.max(currentInfoY, detailsY) + 10;

        const tableBody = invoice.items.map(item => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.unitPrice).replace('FCFA', '').trim(),
            formatCurrency(item.total).replace('FCFA', '').trim(),
        ]);

        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'P.U.', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: secondaryColor,
                textColor: '#FFFFFF',
                fontStyle: 'bold',
                halign: 'center',
            },
            styles: {
                fontSize: 9,
                cellPadding: 2.5,
                valign: 'middle',
            },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.45 },
                1: { cellWidth: contentWidth * 0.1, halign: 'right' },
                2: { cellWidth: contentWidth * 0.2, halign: 'right' },
                3: { cellWidth: contentWidth * 0.25, halign: 'right' },
            },
            didDrawPage: (hookData) => {
                cursorY = hookData.cursor?.y || 20;
                // Vous pouvez redessiner l'en-tête de page ici si nécessaire pour les pages suivantes
            }
        });

        cursorY = doc.lastAutoTable.finalY + 10;

        const totalLabelText = 'TOTAL À PAYER :';
        const amountStringForPdf = invoice.amount.toLocaleString('fr-FR').replace(/\s/g, '\u00A0') + ' FCFA';
        const labelXPosition = leftMargin + contentWidth * 0.6;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor);
        doc.text(totalLabelText, labelXPosition, cursorY, { align: 'left' });

        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text(amountStringForPdf, rightMargin, cursorY, { align: 'right' });
        cursorY += 15;

        doc.setFontSize(9);
        doc.setTextColor(lightTextColor);
        doc.setFont('helvetica', 'normal');
        const paymentTerms = "Conditions de paiement : Paiement à réception de la facture. Aucun escompte pour paiement anticipé.";
        const paymentTermsLines = doc.splitTextToSize(paymentTerms, contentWidth);
        doc.text(paymentTermsLines, leftMargin, cursorY);
        cursorY += (paymentTermsLines.length * 4) + 5;

        doc.text("Pour toute question concernant cette facture, veuillez nous contacter.", leftMargin, cursorY);
        cursorY += 10;

        const pageCount = doc.internal.getNumberOfPages(); // CORRECTION ICI
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            addStandardFooter(i, pageCount);
        }

        doc.save(`Facture-${invoice.number}.pdf`);
        toast({
            title: 'Téléchargement PDF Réussi',
            description: `Le PDF pour la facture ${invoice.number} a été généré.`,
            variant: 'default',
        });

    } else if (type === 'devis' && 'validUntil' in data) {
        const devis = data as Devis;
        doc.setFontSize(20);
        doc.text(`DEVIS N°: ${devis.number}`, 15, cursorY);
        cursorY += 10;
        doc.setFontSize(12);
        doc.text(`Client: ${devis.companyName}`, 15, cursorY);
        cursorY += 7;
        doc.text(`Objet: ${devis.object}`, 15, cursorY);
        cursorY += 7;
        doc.text(`Montant: ${formatCurrency(devis.amount)}`, 15, cursorY);
        cursorY += 7;
        doc.text(`Valide jusqu'au: ${formatDate(new Date(devis.validUntil))}`, 15, cursorY);
        cursorY += 10;

        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'P.U.', 'Total']],
            body: devis.items.map(item => [
                item.description,
                item.quantity.toString(),
                formatCurrency(item.unitPrice).replace('FCFA', '').trim(),
                formatCurrency(item.total).replace('FCFA', '').trim(),
            ]),
            theme: 'striped',
            headStyles: { fillColor: secondaryColor, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center' },
            styles: { fontSize: 9, cellPadding: 2.5 },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.45 },
                1: { cellWidth: contentWidth * 0.1, halign: 'right' },
                2: { cellWidth: contentWidth * 0.2, halign: 'right' },
                3: { cellWidth: contentWidth * 0.25, halign: 'right' },
            },
            didDrawPage: (hookData) => { // Ajout pour gérer le curseur sur plusieurs pages
                cursorY = hookData.cursor?.y || 20;
            }
        });
        cursorY = doc.lastAutoTable.finalY + 10;

        if (devis.notes) {
            doc.setFontSize(10);
            doc.text("Notes:", 15, cursorY);
            cursorY += 5;
            const notesLines = doc.splitTextToSize(devis.notes, contentWidth);
            doc.text(notesLines, 15, cursorY);
        }

        const pageCountDevis = doc.internal.getNumberOfPages(); // CORRECTION ICI
        for (let i = 1; i <= pageCountDevis; i++) {
            doc.setPage(i);
            addStandardFooter(i, pageCountDevis);
        }

        doc.save(`Devis-${devis.number}.pdf`);
        toast({
            title: 'Téléchargement PDF Réussi',
            description: `Le PDF pour le devis ${devis.number} a été généré.`,
            variant: 'default',
        });

    } else if (type === 'ticket-summary' && 'subject' in data) {
        const ticket = data as Ticket;
        doc.setFontSize(20);
        doc.text(`Résumé Ticket N°: ${ticket.number}`, 15, cursorY);
        cursorY += 10;
        doc.setFontSize(12);
        doc.text(`Sujet: ${ticket.subject}`, 15, cursorY);
        cursorY += 7;
        doc.text(`Client: ${ticket.companyName}`, 15, cursorY);
        cursorY += 7;
        doc.text(`Statut: ${ticket.status}`, 15, cursorY);
        cursorY += 7;
        doc.text(`Priorité: ${ticket.priority}`, 15, cursorY);
        cursorY += 10;
        doc.text(`Description:`, 15, cursorY);
        cursorY += 5;
        const descriptionLines = doc.splitTextToSize(ticket.description, contentWidth);
        doc.text(descriptionLines, 15, cursorY);
        cursorY += (descriptionLines.length * 5) + 5;

        if (ticket.messages && ticket.messages.length > 0) {
            doc.text(`Messages:`, 15, cursorY);
            cursorY += 5;
            ticket.messages.forEach(msg => {
                const messageLine = `${formatDate(new Date(msg.createdAt))} - ${msg.authorName}: ${msg.content}`;
                const messageLines = doc.splitTextToSize(messageLine, contentWidth);
                doc.text(messageLines, 15, cursorY);
                cursorY += (messageLines.length * 5);
                if (cursorY > pageHeight - 30) { // Check for page overflow before drawing footer
                    const pageCountTicket = doc.internal.getNumberOfPages(); // CORRECTION ICI
                    addStandardFooter(pageCountTicket, pageCountTicket); // Add footer to current page
                    doc.addPage();
                    cursorY = 20; // Reset cursor for new page
                    // Redraw header if necessary on new page
                }
            });
        }

        const pageCountTicket = doc.internal.getNumberOfPages(); // CORRECTION ICI
        for (let i = 1; i <= pageCountTicket; i++) {
            doc.setPage(i);
            // Ensure footer is not drawn over content if already drawn by overflow logic
            if (!(cursorY < pageHeight - 15 && i === pageCountTicket)) { // Simple check
                addStandardFooter(i, pageCountTicket);
            }
        }


        doc.save(`Ticket-${ticket.number}.pdf`);
        toast({
            title: 'Téléchargement PDF Réussi',
            description: `Le PDF pour le ticket ${ticket.number} a été généré.`,
            variant: 'default',
        });
    }
};

export const downloadDevisPdf = async (devis: Devis) => {
    await generatePdfDocument('devis', devis);
};

export const downloadInvoicePdf = async (invoice: Invoice) => {
    await generatePdfDocument('invoice', invoice);
};

export const downloadTicketSummaryPdf = async (ticket: Ticket) => {
    await generatePdfDocument('ticket-summary', ticket);
};