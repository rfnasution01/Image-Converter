import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.vfs = (pdfFonts as unknown as { vfs: Record<string, string> }).vfs;

export function openPdf(docDefinition: TDocumentDefinitions) {
  pdfMake.createPdf(docDefinition).open();
}

export function downloadPdf(docDefinition: TDocumentDefinitions, fileName = 'document.pdf') {
  pdfMake.createPdf(docDefinition).download(fileName);
}
