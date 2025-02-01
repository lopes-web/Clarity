import { getDocument } from 'pdfjs-dist';
import { configurePdfWorker } from './pdfjs-config';

// Configurando o worker
configurePdfWorker();

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convertendo o arquivo para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Carregando o documento PDF
    const loadingTask = getDocument({
      data: arrayBuffer,
      useWorkerFetch: true,
      isEvalSupported: true,
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    console.log('PDF carregado com sucesso. Número de páginas:', pdf.numPages);
    let fullText = '';

    // Extraindo texto de cada página
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processando página ${i}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n--- Página ${i} ---\n${pageText}\n`;
    }

    console.log('Extração de texto concluída com sucesso');
    return fullText;
  } catch (error) {
    console.error('Erro detalhado ao processar PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Erro ao ler PDF: ${error.message}`);
    }
    throw new Error('Não foi possível ler o PDF. Verifique se o arquivo é válido.');
  }
} 