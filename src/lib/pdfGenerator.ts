// src/lib/pdfGenerator.ts (Version améliorée et corrigée)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Devis, Invoice, Ticket } from '@/types';
import { toast } from 'sonner';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'; // Garde formatCurrency pour d'autres usages si nécessaire

// --- Configuration du Logo ---
const ARCADIS_LOGO_URL = '/logo/logo-png.png';
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

// --- Constantes de style améliorées ---
const PRIMARY_COLOR = '#3b82f6'; // Bleu principal
const SECONDARY_COLOR = '#1e3a8a'; // Bleu foncé pour en-têtes de tableau
const ACCENT_COLOR = '#93c5fd'; // Un bleu plus clair pour des accents subtils
const TEXT_COLOR = '#333333';
const LIGHT_TEXT_COLOR = '#666666'; // Plus contrasté que le 555555
const BORDER_COLOR = '#DDDDDD';
const TABLE_HEADER_TEXT_COLOR = '#FFFFFF';
const SUCCESS_COLOR = '#22c55e'; // Vert pour les statuts payés
const ERROR_COLOR = '#DC2626';

const MARGIN = 20; // Marges légèrement augmentées pour plus d'aération
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_SMALL = 8;
const FONT_SIZE_TITLE = 28; // Plus grand pour les titres principaux
const FONT_SIZE_SUBTITLE = 16; // Pour les numéros de facture/devis
const FONT_SIZE_SECTION_HEADER = 12; // Pour les titres de section (Facturé à, Client, etc.)
const LINE_SPACING_SMALL = 4; // Espacement réduit pour les petites infos
const LINE_SPACING_NORMAL = 8; // Espacement normal

// --- Fonctions d'aide pour le dessin ---

/**
 * Ajoute l'en-tête de la page (logo et infos Arcadis).
 * @returns La nouvelle position Y après l'en-tête.
 */
const addPageHeader = (doc: jsPDF, cursorY: number): number => {
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const rightMarginPos = pageWidth - MARGIN;
    let currentY = cursorY;
    const logoMarginTop = cursorY; // Début du logo

    // Logo
    if (logoBase64 && logoDimensions.width > 0) {
        const desiredLogoWidth = 50; // Logo légèrement plus grand
        const logoAspectRatio = logoDimensions.height / logoDimensions.width;
        const calculatedLogoHeight = desiredLogoWidth * logoAspectRatio;
        doc.addImage(logoBase64, 'PNG', MARGIN, logoMarginTop, desiredLogoWidth, calculatedLogoHeight);
        currentY = Math.max(currentY, logoMarginTop + calculatedLogoHeight + LINE_SPACING_NORMAL); // Position après le logo
    } else {
        doc.setFontSize(FONT_SIZE_SUBTITLE);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(PRIMARY_COLOR);
        doc.text('Arcadis Technologies', MARGIN, currentY + 10);
        currentY += 20;
    }

    // Informations Arcadis (en haut à droite)
    doc.setFontSize(FONT_SIZE_SMALL);
    doc.setTextColor(LIGHT_TEXT_COLOR);
    doc.setFont('helvetica', 'normal');
    let arcadisInfoY = logoMarginTop + 2; // Aligner avec le haut du logo si possible
    doc.text('Arcadis Technologies', rightMarginPos, arcadisInfoY, { align: 'right' });
    arcadisInfoY += LINE_SPACING_SMALL;
    doc.text('1210 HLM - GY', rightMarginPos, arcadisInfoY, { align: 'right' });
    arcadisInfoY += LINE_SPACING_SMALL;
    doc.text('Dakar, Sénégal', rightMarginPos, arcadisInfoY, { align: 'right' });
    arcadisInfoY += LINE_SPACING_SMALL;
    doc.text('contact@arcadis.tech', rightMarginPos, arcadisInfoY, { align: 'right' });
    arcadisInfoY += LINE_SPACING_SMALL;
    doc.text('+221 77 465 08 00', rightMarginPos, arcadisInfoY, { align: 'right' });
    arcadisInfoY += LINE_SPACING_SMALL;
    doc.text('+221 77 198 02 24', rightMarginPos, arcadisInfoY, { align: 'right' });

    // Ligne de séparation sous l'en-tête
    const headerBottomY = Math.max(currentY, arcadisInfoY + LINE_SPACING_NORMAL * 2);
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.5); // Ligne plus épaisse
    doc.line(MARGIN, headerBottomY, pageWidth - MARGIN, headerBottomY);

    return headerBottomY + LINE_SPACING_NORMAL * 2; // Espacement après la ligne
};

/**
 * Ajoute le pied de page avec numérotation et informations légales.
 */
const addPageFooter = (doc: jsPDF, pageNumber: number, pageCountValue: number) => {
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Ligne de séparation au-dessus du pied de page
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, pageHeight - 25, pageWidth - MARGIN, pageHeight - 25); // Ligne fine

    doc.setFontSize(FONT_SIZE_SMALL);
    doc.setTextColor(LIGHT_TEXT_COLOR);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNumber} / ${pageCountValue}`, pageWidth - MARGIN, pageHeight - 10, { align: 'right' });
    // MISE À JOUR NINEA et RC
    doc.text('Arcadis Technologies - NINEA: 012203098 - RC: SN.DKR.2025.B.22973', MARGIN, pageHeight - 10);
};

/**
 * Formate un montant en devise pour le PDF, en utilisant un point comme séparateur de milliers,
 * une virgule comme séparateur décimal et 'F' comme symbole. Assure 2 décimales.
 * @param amount Le montant numérique.
 * @param includeCurrencySymbol Indique si le symbole 'F' doit être inclus.
 * @returns Le montant formaté en chaîne de caractères.
 */
const formatCurrencyForPdf = (amount: number, includeCurrencySymbol: boolean = true): string => {
    // Utilise 'fr-FR' pour le formatage:
    // - Séparateur de milliers: espace insécable (qui sera remplacé par un point)
    // - Séparateur décimal: virgule
    // - Minimum et maximum 2 décimales pour un standard monétaire
    const formatted = amount.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true // Assure les séparateurs de milliers
    });

    // Remplace l'espace (séparateur de milliers) par un point
    let result = formatted.replace(/\s/g, '.'); // Ex: "800 000,00" -> "800.000,00"

    // Ajoute le symbole monétaire 'F' si demandé
    if (includeCurrencySymbol) {
        return `${result}F`;
    }
    return result;
};


const generatePdfDocument = async (
    type: 'invoice' | 'devis' | 'ticket-summary',
    data: Invoice | Devis | Ticket
): Promise<void> => {
    if (!logoBase64 || logoDimensions.width === 0) {
        try {
            await preloadArcadisLogo();
        } catch (error) {
            console.error('[PDFGenerator] Failed to load logo during PDF generation:', error);
        }
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - MARGIN * 2;
    let cursorY = MARGIN;

    cursorY = addPageHeader(doc, cursorY);

    // --- Section Titre et Numéro ---
    doc.setFontSize(FONT_SIZE_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PRIMARY_COLOR);
    const titleText = type === 'invoice' ? 'FACTURE' : type === 'devis' ? 'DEVIS' : 'RÉSUMÉ TICKET';
    doc.text(titleText, MARGIN, cursorY);

    doc.setFontSize(FONT_SIZE_SUBTITLE);
    doc.setTextColor(SECONDARY_COLOR);
    const numberText = `N° : ${(data as { number: string }).number}`; // Type assertion for 'number' property
    doc.text(numberText, pageWidth - MARGIN, cursorY, { align: 'right' });
    cursorY += FONT_SIZE_TITLE + LINE_SPACING_NORMAL * 2;

    // --- Contenu spécifique (Facture, Devis, Ticket) ---
    if (type === 'invoice' && 'dueDate' in data) {
        const invoice = data as Invoice;

        // Bloc "Facturé à"
        doc.setFontSize(FONT_SIZE_SECTION_HEADER);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text('Facturé à :', MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        const clientNameLines = doc.splitTextToSize(invoice.companyName, contentWidth * 0.5);
        doc.text(clientNameLines, MARGIN, cursorY + LINE_SPACING_NORMAL);
        const clientBlockHeight = clientNameLines.length * LINE_SPACING_NORMAL + LINE_SPACING_NORMAL * 2;

        // Bloc Dates (à droite du client)
        let dateBlockY = cursorY;
        const dateInfoBoxX = pageWidth / 2 + 10; // Décaler légèrement à droite du centre
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);

        doc.text("Date d'émission :", dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(formatDate(new Date(invoice.createdAt)), dateInfoBoxX + 40, dateBlockY);
        dateBlockY += LINE_SPACING_NORMAL;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text("Date d'échéance :", dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(formatDate(new Date(invoice.dueDate)), dateInfoBoxX + 40, dateBlockY);
        dateBlockY += LINE_SPACING_NORMAL;

        if (invoice.paidAt) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(TEXT_COLOR);
            doc.text('Payée le :', dateInfoBoxX, dateBlockY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(SUCCESS_COLOR); // Vert pour "Payée le"
            doc.text(formatDate(new Date(invoice.paidAt)), dateInfoBoxX + 40, dateBlockY);
            dateBlockY += LINE_SPACING_NORMAL;
        }
        doc.setTextColor(TEXT_COLOR); // Reset color

        cursorY = Math.max(cursorY + clientBlockHeight, dateBlockY + LINE_SPACING_NORMAL) + LINE_SPACING_NORMAL * 2;

        // Tableau des articles
        const tableBody = invoice.items.map(item => [
            item.description,
            item.quantity.toString(),
            formatCurrencyForPdf(item.unitPrice, false), // Utilisation de la nouvelle fonction
            formatCurrencyForPdf(item.total, false),     // Utilisation de la nouvelle fonction
        ]);

        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'P.U. (FCFA)', 'Total (FCFA)']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: SECONDARY_COLOR,
                textColor: TABLE_HEADER_TEXT_COLOR,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: FONT_SIZE_NORMAL
            },
            styles: { fontSize: FONT_SIZE_NORMAL, cellPadding: 3, valign: 'middle', textColor: TEXT_COLOR },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.45, halign: 'left' },
                1: { cellWidth: contentWidth * 0.1, halign: 'right' },
                2: { cellWidth: contentWidth * 0.2, halign: 'right' },
                3: { cellWidth: contentWidth * 0.25, halign: 'right', fontStyle: 'bold' }, // Total en gras
            },
            alternateRowStyles: { fillColor: '#f9f9f9' }, // Pour un thème rayé plus prononcé
            didDrawPage: (hookData) => { cursorY = hookData.cursor?.y || MARGIN; }
        });
        cursorY = doc.lastAutoTable.finalY + LINE_SPACING_NORMAL * 2;

        // Total à payer
        doc.setFontSize(FONT_SIZE_SECTION_HEADER);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        const totalLabel = 'TOTAL À PAYER :';
        const totalAmount = formatCurrencyForPdf(invoice.amount); // Utilisation de la nouvelle fonction
        const totalLabelWidth = doc.getStringUnitWidth(totalLabel) * doc.getFontSize() / doc.internal.scaleFactor;
        const totalAmountWidth = doc.getStringUnitWidth(totalAmount) * FONT_SIZE_TITLE / doc.internal.scaleFactor; // Utiliser FONT_SIZE_TITLE pour le calcul de la largeur du montant

        doc.text(totalLabel, pageWidth - MARGIN - totalLabelWidth - totalAmountWidth - 5, cursorY);

        doc.setFontSize(FONT_SIZE_TITLE); // Montant total plus grand
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(totalAmount, pageWidth - MARGIN, cursorY, { align: 'right' });
        cursorY += FONT_SIZE_TITLE + LINE_SPACING_NORMAL * 2;

        // Notes et conditions de paiement
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setTextColor(LIGHT_TEXT_COLOR);
        if (invoice.notes) {
            doc.setFont('helvetica', 'italic');
            doc.text("Notes :", MARGIN, cursorY);
            cursorY += LINE_SPACING_SMALL;
            const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
            doc.text(notesLines, MARGIN, cursorY);
            cursorY += (notesLines.length * LINE_SPACING_SMALL) + LINE_SPACING_NORMAL;
        }

        doc.setFont('helvetica', 'normal');
        const paymentTerms = "Conditions de paiement : Paiement à réception de la facture. Aucun escompte pour paiement anticipé.";
        const paymentTermsLines = doc.splitTextToSize(paymentTerms, contentWidth);
        doc.text(paymentTermsLines, MARGIN, cursorY);
        cursorY += (paymentTermsLines.length * LINE_SPACING_SMALL) + LINE_SPACING_NORMAL;

        doc.text("Pour toute question concernant cette facture, veuillez nous contacter.", MARGIN, cursorY);

    } else if (type === 'devis' && 'validUntil' in data) {
        const devis = data as Devis;

        // Bloc "Client"
        doc.setFontSize(FONT_SIZE_SECTION_HEADER);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text('Client :', MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        const clientNameLines = doc.splitTextToSize(devis.companyName, contentWidth * 0.5);
        doc.text(clientNameLines, MARGIN, cursorY + LINE_SPACING_NORMAL);
        const clientBlockHeight = clientNameLines.length * LINE_SPACING_NORMAL + LINE_SPACING_NORMAL * 2;

        // Bloc "Objet"
        const currentInfoY = cursorY + clientBlockHeight;
        doc.setFontSize(FONT_SIZE_SECTION_HEADER);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text('Objet :', MARGIN, currentInfoY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        const objectLines = doc.splitTextToSize(devis.object, contentWidth * 0.5);
        doc.text(objectLines, MARGIN, currentInfoY + LINE_SPACING_NORMAL);

        // Bloc Dates (à droite du client)
        let dateBlockY = cursorY;
        const dateInfoBoxX = pageWidth / 2 + 10;
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);

        doc.text("Date d'émission :", dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(formatDate(new Date(devis.createdAt)), dateInfoBoxX + 40, dateBlockY);
        dateBlockY += LINE_SPACING_NORMAL;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text('Valide jusqu\'au :', dateInfoBoxX, dateBlockY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(formatDate(new Date(devis.validUntil)), dateInfoBoxX + 40, dateBlockY);
        dateBlockY += LINE_SPACING_NORMAL;

        cursorY = Math.max(cursorY + clientBlockHeight, dateBlockY + LINE_SPACING_NORMAL) + LINE_SPACING_NORMAL * 2;

        // Tableau des articles
        autoTable(doc, {
            startY: cursorY,
            head: [['Description', 'Qté', 'P.U. (FCFA)', 'Total (FCFA)']],
            body: devis.items.map(item => [
                item.description,
                item.quantity.toString(),
                formatCurrencyForPdf(item.unitPrice, false), // Utilisation de la nouvelle fonction
                formatCurrencyForPdf(item.total, false),     // Utilisation de la nouvelle fonction
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: SECONDARY_COLOR,
                textColor: TABLE_HEADER_TEXT_COLOR,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: FONT_SIZE_NORMAL
            },
            styles: { fontSize: FONT_SIZE_NORMAL, cellPadding: 3, valign: 'middle', textColor: TEXT_COLOR },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.45, halign: 'left' },
                1: { cellWidth: contentWidth * 0.1, halign: 'right' },
                2: { cellWidth: contentWidth * 0.2, halign: 'right' },
                3: { cellWidth: contentWidth * 0.25, halign: 'right', fontStyle: 'bold' },
            },
            alternateRowStyles: { fillColor: '#f9f9f9' },
            didDrawPage: (hookData) => { cursorY = hookData.cursor?.y || MARGIN; }
        });
        cursorY = doc.lastAutoTable.finalY + LINE_SPACING_NORMAL * 2;

        // Total devis
        doc.setFontSize(FONT_SIZE_SECTION_HEADER);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        const totalDevisLabel = 'MONTANT TOTAL :';
        const totalDevisAmount = formatCurrencyForPdf(devis.amount); // Utilisation de la nouvelle fonction
        const totalDevisLabelWidth = doc.getStringUnitWidth(totalDevisLabel) * doc.getFontSize() / doc.internal.scaleFactor;
        const totalDevisAmountWidth = doc.getStringUnitWidth(totalDevisAmount) * FONT_SIZE_TITLE / doc.internal.scaleFactor;

        doc.text(totalDevisLabel, pageWidth - MARGIN - totalDevisLabelWidth - totalDevisAmountWidth - 5, cursorY);

        doc.setFontSize(FONT_SIZE_TITLE);
        doc.setTextColor(PRIMARY_COLOR);
        doc.text(totalDevisAmount, pageWidth - MARGIN, cursorY, { align: 'right' });
        cursorY += FONT_SIZE_TITLE + LINE_SPACING_NORMAL * 2;

        // Notes et raison de rejet
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setTextColor(LIGHT_TEXT_COLOR);
        if (devis.notes) {
            doc.setFont('helvetica', 'italic');
            doc.text("Notes :", MARGIN, cursorY);
            cursorY += LINE_SPACING_SMALL;
            const notesLines = doc.splitTextToSize(devis.notes, contentWidth);
            doc.text(notesLines, MARGIN, cursorY);
            cursorY += (notesLines.length * LINE_SPACING_SMALL) + LINE_SPACING_NORMAL;
        }

        if (devis.status === 'rejected' && devis.rejectionReason) {
            doc.setFontSize(FONT_SIZE_NORMAL);
            doc.setTextColor(ERROR_COLOR);
            doc.setFont('helvetica', 'bold');
            doc.text("Raison du rejet :", MARGIN, cursorY);
            cursorY += LINE_SPACING_SMALL;
            doc.setFont('helvetica', 'normal');
            const rejectionLines = doc.splitTextToSize(devis.rejectionReason, contentWidth);
            doc.text(rejectionLines, MARGIN, cursorY);
            cursorY += (rejectionLines.length * LINE_SPACING_SMALL) + LINE_SPACING_NORMAL;
        }
        doc.setTextColor(TEXT_COLOR); // Reset color

    } else if (type === 'ticket-summary' && 'subject' in data) {
        const ticket = data as Ticket;

        // Ticket Details
        doc.setFontSize(FONT_SIZE_SECTION_HEADER);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`Sujet: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(ticket.subject, MARGIN + 25, cursorY);
        cursorY += LINE_SPACING_NORMAL;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`Client: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(ticket.companyName, MARGIN + 25, cursorY);
        cursorY += LINE_SPACING_NORMAL;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`Statut: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(ticket.status.replace(/_/g, ' '), MARGIN + 25, cursorY);
        cursorY += LINE_SPACING_NORMAL;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`Priorité: `, MARGIN, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        doc.text(ticket.priority, MARGIN + 25, cursorY);
        cursorY += LINE_SPACING_NORMAL * 2;

        // Description
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(TEXT_COLOR);
        doc.text(`Description:`, MARGIN, cursorY);
        cursorY += LINE_SPACING_SMALL;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(LIGHT_TEXT_COLOR);
        const descriptionLines = doc.splitTextToSize(ticket.description, contentWidth);
        doc.text(descriptionLines, MARGIN, cursorY);
        cursorY += (descriptionLines.length * LINE_SPACING_SMALL) + LINE_SPACING_NORMAL * 2;

        // Messages (si présents)
        if (ticket.messages && ticket.messages.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(TEXT_COLOR);
            doc.text(`Historique des messages:`, MARGIN, cursorY);
            cursorY += LINE_SPACING_NORMAL;

            ticket.messages.forEach(msg => {
                const messageHeader = `${formatDateTime(new Date(msg.createdAt))} - ${msg.authorName} (${msg.authorRole}):`;
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(ACCENT_COLOR); // Une couleur d'accent pour les headers de message
                doc.text(messageHeader, MARGIN, cursorY);
                cursorY += LINE_SPACING_SMALL;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(TEXT_COLOR);
                const contentLines = doc.splitTextToSize(msg.content, contentWidth - 10); // Légèrement en retrait
                doc.text(contentLines, MARGIN + 5, cursorY);
                cursorY += (contentLines.length * LINE_SPACING_SMALL) + LINE_SPACING_NORMAL;

                // Gérer les sauts de page pour les messages longs
                if (cursorY > (doc.internal.pageSize.height || doc.internal.pageSize.getHeight()) - MARGIN * 2) {
                    const pageCountTicket = doc.getNumberOfPages();
                    addPageFooter(doc, pageCountTicket, pageCountTicket);
                    doc.addPage();
                    cursorY = MARGIN; // Réinitialiser le curseur Y après un saut de page
                    cursorY = addPageHeader(doc, cursorY); // Réafficher l'en-tête sur la nouvelle page
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(TEXT_COLOR);
                    doc.text(`Suite historique des messages:`, MARGIN, cursorY);
                    cursorY += LINE_SPACING_NORMAL;
                }
            });
        }
    }

    // Appliquer le pied de page à toutes les pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addPageFooter(doc, i, pageCount);
    }

    const filename = type === 'invoice' ? `Facture-${(data as Invoice).number}.pdf`
        : type === 'devis' ? `Devis-${(data as Devis).number}.pdf`
            : `Ticket-${(data as Ticket).number}.pdf`;

    doc.save(filename);
    toast.success('Téléchargement PDF Réussi', {
        description: `Le PDF pour ${type} ${(data as { number: string }).number} a été généré avec un nouveau design.`,
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