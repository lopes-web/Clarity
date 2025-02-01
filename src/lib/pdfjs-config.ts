import { GlobalWorkerOptions } from 'pdfjs-dist';

export function configurePdfWorker() {
  try {
    if (typeof window !== 'undefined') {
      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString();
      
      console.log('Configurando PDF.js worker:', workerUrl);
      GlobalWorkerOptions.workerSrc = workerUrl;
    }
  } catch (error) {
    console.error('Erro ao configurar PDF.js worker:', error);
  }
} 