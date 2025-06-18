// src/lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Devis, Invoice, Ticket } from '@/types'; // DevisItem, InvoiceItem ne sont plus explicitement utilisés ici car inclus dans Devis/Invoice
import { toast } from '@/hooks/use-toast';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'; // formatDateTime ajouté pour les tickets

// --- Configuration du Logo ---
const ARCADIS_LOGO_URL = '/logo/logo-png.png'; // Assurez-vous que ce chemin est correct depuis la racine publique
let logoBase64: string | null = null;
let logoDimensions = { width: 0, height: 0 };

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

// --- Constantes de style ---
const PRIMARY_COLOR = '#3b82f6'; // Arcadis Blue
const SECONDARY_COLOR = '#1e3a8a'; // Arcadis Navy
const TEXT_COLOR = '#333333'; // Dark Gray
const LIGHT_TEXT_COLOR = '#555555'; // Medium Gray
const BORDER_COLOR = '#DDDDDD'; // Light Gray
const ERROR_COLOR = '#DC2626'; // Red

const MARGIN = 15;
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_SMALL = 8;
const FONT_SIZE_LARGE_TITLE = 20;
const FONT_SIZE_MEDIUM_TITLE = 14;
const LINE_HEIGHT = 6;

const addHeader = (doc: jsPDF, cursorY: number): number => {
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const rightMarginPos = pageWidth - MARGIN;
    let currentY = cursorY;

    if (logoBase64 && logoDimensions.width > 0) {
        const desiredLogoWidth = 45; // Ajusté pour une taille un peu plus petite
        const logoAspectRatio = logoDimensions.height / logoDimensions.width;
        const calculatedLogoHeight = desiredLogoWidth * logoAspectRatio;
        doc.addImage(logoBase64, 'PNG', MARGIN, currentY, desiredLogoWidth, calculatedLogoHeight);
        currentY += calculatedLogoHeight + 5;
    } else {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(PRIMARY_COLOR);
        doc.text('Arcadis Technologies', MARGIN, currentY + 5);
        currentY += 10;
    }

    // Informations Arcadis
    doc.setFontSize(FONT_SIZE_SMALL);
    doc.setTextColor(TEXT_COLOR);
    doc.setFont('helvetica', 'normal');
    const arcadisInfoYStart = cursorY; // Aligner avec le haut du logo ou le titre si pas de logo
    doc.text('Arcadis Technologies', rightMarginPos, arcadisInfoYStart, { align: 'right' });
    doc.text('1210 HLM - GY', rightMarginPos, arcadisInfoYStart + LINE_HEIGHT * 0.8, { align: 'right' });
    doc.text('Dakar, Sénégal', rightMarginPos, arcadisInfoYStart + LINE_HEIGHT * 1.6, { align: 'right' });
    doc.text('contact@arcadis.tech', rightMarginPos, arcadisInfoYStart + LINE_HEIGHT * 2.4, { align: 'right' });
    doc.text('+221 77 465 08 00', rightMarginPos, arcadisInfoYStart + LINE_HEIGHT * 3.2, { align: 'right' });
    doc.text('+221 77 198 02 24', rightMarginPos, arcadisInfoYStart + LINE_HEIGHT * 4.0, { align: 'right' });


    return Math.max(currentY, arcadisInfoYStart + LINE_HEIGHT * 4.0 + 5);
};

const addFooter = (doc: jsPDF, pageNumber: number, pageCountValue: number) => {
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.setFontSize(FONT_SIZE_SMALL);
    doc.setTextColor(LIGHT_TEXT_COLOR);
    doc.text(`Page ${pageNumber} / ${pageCountValue}`, pageWidth - MARGIN, pageHeight - 10, { align: 'right' });
    // PILOTE: Veuillez mettre à jour NINEA et RC avec vos informations réelles
    doc.text('Arcadis Technologies - NINEA: [VOTRE_NINEA] - RC: [VOTRE_RC]', MARGIN, pageHeight - 10);
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
            // Continuer sans logo si le chargement échoue
        }
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - MARGIN * 2;
    let cursorY = MARGIN;

    cursorY = addHeader(doc, cursorY);

    // Ligne de séparation sous le header
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, cursorY, pageWidth - MARGIN, cursorY);
    cursorY += 10;

    if (type === 'invoice' && 'dueDate' in data) {
        const invoice = data as Invoice;

        // Titre du document et numéro
        doc.setFontSize(FONT_SIZE_LARGE_TITLE);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(SECONDARY_COLOR);
        doc.text('FACTURE', MARGIN, cursorY);

        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`N° : ${invoice.number}`, pageWidth - MARGIN, cursorY, { align: 'right' });
        cursorY += LINE_HEIGHT * 2;

        // Informations Client et Dates
        const clientInfoBoxWidth = contentWidth * 0.55;
        const dateInfoBoxX = MARGIN + clientInfoBoxWidth + 10;
        const dateInfoBoxWidth = contentWidth - clientInfoBoxWidth - 10;

        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'bold');
        doc.text('Facturé à :', MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        const clientNameLines = doc.splitTextToSize(invoice.companyName, clientInfoBoxWidth);
        doc.text(clientNameLines, MARGIN, cursorY + LINE_HEIGHT);
        const clientBlockHeight = clientNameLines.length * LINE_HEIGHT;

        let dateBlockY = cursorY;
        doc.setFont('helvetica', 'bold');
        doc.text("Date d'émission :", dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(new Date(invoice.createdAt)), dateInfoBoxX + 35, dateBlockY);
        dateBlockY += LINE_HEIGHT;

        doc.setFont('helvetica', 'bold');
        doc.text("Date d'échéance :", dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(new Date(invoice.dueDate)), dateInfoBoxX + 35, dateBlockY);
        dateBlockY += LINE_HEIGHT;

        if (invoice.paidAt) {
            doc.setFont('helvetica', 'bold');
            doc.text('Payée le :', dateInfoBoxX, dateBlockY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(34, 139, 34); // Vert
            doc.text(formatDate(new Date(invoice.paidAt)), dateInfoBoxX + 35, dateBlockY);
            doc.setTextColor(TEXT_COLOR);
            dateBlockY += LINE_HEIGHT;
        }
        cursorY = Math.max(cursorY + clientBlockHeight, dateBlockY) + LINE_HEIGHT * 2;


        // Tableau des articles
        const tableBody = invoice.items.map(item => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.unitPrice).replace(/\sFCFA/g, ''), // Retirer FCFA et espace insécable
            formatCurrency(item.total).replace(/\sFCFA/g, ''),
        ]);

        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'P.U. (FCFA)', 'Total (FCFA)']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: SECONDARY_COLOR,
                textColor: '#FFFFFF',
                fontStyle: 'bold',
                halign: 'center',
                fontSize: FONT_SIZE_SMALL,
            },
            styles: {
                fontSize: FONT_SIZE_SMALL,
                cellPadding: 2.5,
                valign: 'middle',
            },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.45 },
                1: { cellWidth: contentWidth * 0.1, halign: 'right' },
                2: { cellWidth: contentWidth * 0.2, halign: 'right' },
                3: { cellWidth: contentWidth * 0.25, halign: 'right' },
            },
            didDrawPage: (hookData) => { // Renommé pour éviter conflit
                cursorY = hookData.cursor?.y || MARGIN; // Mettre à jour cursorY après chaque page
            }
        });
        cursorY = doc.lastAutoTable.finalY + 10;

        // Section des totaux
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        const totalLabel = 'TOTAL À PAYER :';
        const totalAmount = formatCurrency(invoice.amount);
        const totalLabelWidth = doc.getStringUnitWidth(totalLabel) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(totalLabel, pageWidth - MARGIN - totalLabelWidth - doc.getStringUnitWidth(totalAmount) * doc.getFontSize() / doc.internal.scaleFactor - 5, cursorY);

        doc.setFontSize(FONT_SIZE_MEDIUM_TITLE); // Taille plus grande pour le montant
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(totalAmount, pageWidth - MARGIN, cursorY, { align: 'right' });
        cursorY += LINE_HEIGHT * 2.5;

        // Notes et conditions
        if (invoice.notes) {
            doc.setFontSize(FONT_SIZE_SMALL);
            doc.setTextColor(LIGHT_TEXT_COLOR);
            doc.setFont('helvetica', 'italic');
            doc.text("Notes :", MARGIN, cursorY);
            cursorY += LINE_HEIGHT * 0.8;
            const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
            doc.text(notesLines, MARGIN, cursorY);
            cursorY += (notesLines.length * LINE_HEIGHT * 0.8) + LINE_HEIGHT;
        }

        doc.setFontSize(FONT_SIZE_SMALL);
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.setFont('helvetica', 'normal');
        const paymentTerms = "Conditions de paiement : Paiement à réception de la facture. Aucun escompte pour paiement anticipé.";
        const paymentTermsLines = doc.splitTextToSize(paymentTerms, contentWidth);
        doc.text(paymentTermsLines, MARGIN, cursorY);
        cursorY += (paymentTermsLines.length * LINE_HEIGHT * 0.8) + LINE_HEIGHT;

        doc.text("Pour toute question concernant cette facture, veuillez nous contacter.", MARGIN, cursorY);

    } else if (type === 'devis' && 'validUntil' in data) {
        const devis = data as Devis;

        doc.setFontSize(FONT_SIZE_LARGE_TITLE);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(SECONDARY_COLOR);
        doc.text('DEVIS', MARGIN, cursorY);

        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`N° : ${devis.number}`, pageWidth - MARGIN, cursorY, { align: 'right' });
        cursorY += LINE_HEIGHT * 2;

        // Informations Client et Dates
        const clientInfoBoxWidth = contentWidth * 0.55;
        const dateInfoBoxX = MARGIN + clientInfoBoxWidth + 10;

        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'bold');
        doc.text('Client :', MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        const clientNameLines = doc.splitTextToSize(devis.companyName, clientInfoBoxWidth);
        doc.text(clientNameLines, MARGIN, cursorY + LINE_HEIGHT);
        let clientBlockHeight = clientNameLines.length * LINE_HEIGHT;
        let currentInfoY = cursorY + clientBlockHeight + LINE_HEIGHT * 0.5;

        doc.setFont('helvetica', 'bold');
        doc.text('Objet :', MARGIN, currentInfoY);
        doc.setFont('helvetica', 'normal');
        const objectLines = doc.splitTextToSize(devis.object, clientInfoBoxWidth);
        doc.text(objectLines, MARGIN, currentInfoY + LINE_HEIGHT);
        clientBlockHeight += objectLines.length * LINE_HEIGHT + LINE_HEIGHT * 0.5;


        let dateBlockY = cursorY;
        doc.setFont('helvetica', 'bold');
        doc.text("Date d'émission :", dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(new Date(devis.createdAt)), dateInfoBoxX + 35, dateBlockY);
        dateBlockY += LINE_HEIGHT;

        doc.setFont('helvetica', 'bold');
        doc.text('Valide jusqu\'au :', dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(new Date(devis.validUntil)), dateInfoBoxX + 35, dateBlockY);
        dateBlockY += LINE_HEIGHT;

        cursorY = Math.max(cursorY + clientBlockHeight, dateBlockY) + LINE_HEIGHT * 2;

        // Tableau des articles
        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'P.U. (FCFA)', 'Total (FCFA)']],
            body: devis.items.map(item => [
                item.description,
                item.quantity.toString(),
                formatCurrency(item.unitPrice).replace(/\sFCFA/g, ''),
                formatCurrency(item.total).replace(/\sFCFA/g, ''),
            ]),
            theme: 'striped',
            headStyles: { fillColor: SECONDARY_COLOR, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center', fontSize: FONT_SIZE_SMALL },
            styles: { fontSize: FONT_SIZE_SMALL, cellPadding: 2.5, valign: 'middle' },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.45 },
                1: { cellWidth: contentWidth * 0.1, halign: 'right' },
                2: { cellWidth: contentWidth * 0.2, halign: 'right' },
                3: { cellWidth: contentWidth * 0.25, halign: 'right' },
            },
            didDrawPage: (hookData) => {
                cursorY = hookData.cursor?.y || MARGIN;
            }
        });
        cursorY = doc.lastAutoTable.finalY + 10;

        // Section des totaux
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        const totalDevisLabel = 'MONTANT TOTAL :';
        const totalDevisAmount = formatCurrency(devis.amount);
        const totalDevisLabelWidth = doc.getStringUnitWidth(totalDevisLabel) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(totalDevisLabel, pageWidth - MARGIN - totalDevisLabelWidth - doc.getStringUnitWidth(totalDevisAmount) * doc.getFontSize() / doc.internal.scaleFactor - 5, cursorY);

        doc.setFontSize(FONT_SIZE_MEDIUM_TITLE);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(totalDevisAmount, pageWidth - MARGIN, cursorY, { align: 'right' });
        cursorY += LINE_HEIGHT * 2.5;

        // Notes et Raison du rejet
        if (devis.notes) {
            doc.setFontSize(FONT_SIZE_SMALL);
            doc.setTextColor(LIGHT_TEXT_COLOR);
            doc.setFont('helvetica', 'italic');
            doc.text("Notes :", MARGIN, cursorY);
            cursorY += LINE_HEIGHT * 0.8;
            const notesLines = doc.splitTextToSize(devis.notes, contentWidth);
            doc.text(notesLines, MARGIN, cursorY);
            cursorY += (notesLines.length * LINE_HEIGHT * 0.8) + LINE_HEIGHT;
        }

        if (devis.status === 'rejected' && devis.rejectionReason) {
            doc.setFontSize(FONT_SIZE_SMALL);
            doc.setTextColor(ERROR_COLOR);
            doc.setFont('helvetica', 'bold');
            doc.text("Raison du rejet :", MARGIN, cursorY);
            cursorY += LINE_HEIGHT * 0.8;
            doc.setFont('helvetica', 'normal');
            const rejectionLines = doc.splitTextToSize(devis.rejectionReason, contentWidth);
            doc.text(rejectionLines, MARGIN, cursorY);
            // cursorY += (rejectionLines.length * LINE_HEIGHT * 0.8) + LINE_HEIGHT; // Pas besoin d'incrémenter si c'est la dernière chose
        }
        doc.setTextColor(TEXT_COLOR); // Revenir à la couleur de texte normale

    } else if (type === 'ticket-summary' && 'subject' in data) {
        const ticket = data as Ticket;
        doc.setFontSize(FONT_SIZE_LARGE_TITLE);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(SECONDARY_COLOR);
        doc.text(`Résumé Ticket N°: ${ticket.number}`, MARGIN, cursorY);
        cursorY += LINE_HEIGHT * 1.5;

        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setTextColor(TEXT_COLOR);
        doc.setFont('helvetica', 'bold');
        doc.text(`Sujet: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(ticket.subject, MARGIN + 20, cursorY);
        cursorY += LINE_HEIGHT;

        doc.setFont('helvetica', 'bold');
        doc.text(`Client: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(ticket.companyName, MARGIN + 20, cursorY);
        cursorY += LINE_HEIGHT;

        doc.setFont('helvetica', 'bold');
        doc.text(`Statut: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(ticket.status.replace(/_/g, ' '), MARGIN + 20, cursorY); // Formatter le statut
        cursorY += LINE_HEIGHT;

        doc.setFont('helvetica', 'bold');
        doc.text(`Priorité: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(ticket.priority, MARGIN + 20, cursorY);
        cursorY += LINE_HEIGHT * 1.5;

        doc.setFont('helvetica', 'bold');
        doc.text(`Description:`, MARGIN, cursorY);
        cursorY += LINE_HEIGHT * 0.8;
        doc.setFont('helvetica', 'normal');
        const descriptionLines = doc.splitTextToSize(ticket.description, contentWidth);
        doc.text(descriptionLines, MARGIN, cursorY);
        cursorY += (descriptionLines.length * LINE_HEIGHT * 0.8) + LINE_HEIGHT;

        if (ticket.messages && ticket.messages.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text(`Messages:`, MARGIN, cursorY);
            cursorY += LINE_HEIGHT;
            doc.setFont('helvetica', 'normal');
            ticket.messages.forEach(msg => {
                const messageHeader = `${formatDateTime(new Date(msg.createdAt))} - ${msg.authorName} (${msg.authorRole}):`;
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(LIGHT_TEXT_COLOR);
                doc.text(messageHeader, MARGIN, cursorY);
                cursorY += LINE_HEIGHT * 0.8;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(TEXT_COLOR);
                const contentLines = doc.splitTextToSize(msg.content, contentWidth - 5); // Petit retrait pour le contenu
                doc.text(contentLines, MARGIN + 5, cursorY);
                cursorY += (contentLines.length * LINE_HEIGHT * 0.8) + LINE_HEIGHT * 0.5;

                if (cursorY > (doc.internal.pageSize.height || doc.internal.pageSize.getHeight()) - 30) {
                    const pageCountTicket = doc.getNumberOfPages();
                    addFooter(doc, pageCountTicket, pageCountTicket); // Le nombre total de pages est le même que la page actuelle ici
                    doc.addPage();
                    cursorY = MARGIN;
                }
            });
        }
    }

    // Ajouter le pied de page à toutes les pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addFooter(doc, i, pageCount);
    }

    const filename = type === 'invoice' ? `Facture-${(data as Invoice).number}.pdf`
        : type === 'devis' ? `Devis-${(data as Devis).number}.pdf`
            : `Ticket-${(data as Ticket).number}.pdf`;

    doc.save(filename);
    toast({
        title: 'Téléchargement PDF Réussi',
        description: `Le PDF pour ${type} ${(data as any).number} a été généré.`,
        variant: 'default',
    });
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