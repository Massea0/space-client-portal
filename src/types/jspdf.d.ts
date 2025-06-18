// src/types/jspdf.d.ts
import 'jspdf';

declare module 'jspdf' {
    interface jsPDF {
        getFontSize(): number;
    }
}