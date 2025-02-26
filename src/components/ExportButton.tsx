import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Editor } from '@tiptap/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { useNotesStore } from '@/lib/stores/useNotesStore';
import { useCallback } from 'react';

interface ExportButtonProps {
    editor: Editor;
}

export function ExportButton({ editor }: ExportButtonProps) {
    const { fontFamily } = useNotesStore();

    const exportDocument = useCallback((format: 'pdf' | 'docx') => {
        if (!editor) return;

        // Obter o conteúdo HTML do editor
        const content = editor.getHTML();

        // Criar um novo documento HTML com os estilos ABNT incorporados
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Documento ABNT</title>
                <style>
                    @page {
                        size: A4;
                        margin: 2cm 2cm 2cm 3cm;
                    }
                    body {
                        font-family: ${fontFamily};
                        font-size: 12pt;
                        line-height: 1.5;
                        text-align: justify;
                        color: #000;
                        background-color: #fff;
                        padding: 0;
                        margin: 0;
                    }
                    h1 {
                        font-size: 20pt;
                        margin-bottom: 0.5cm;
                        text-align: center;
                    }
                    h2 {
                        font-size: 16pt;
                        margin-top: 0.5cm;
                        margin-bottom: 0.5cm;
                    }
                    h3 {
                        font-size: 14pt;
                        margin-top: 0.5cm;
                        margin-bottom: 0.5cm;
                    }
                    h4 {
                        font-size: 12pt;
                        margin-top: 0.5cm;
                        margin-bottom: 0.3cm;
                    }
                    p {
                        text-indent: 1.25cm;
                        margin-bottom: 0.5cm;
                        text-align: justify;
                    }
                    blockquote {
                        font-size: 10pt;
                        line-height: 1.0;
                        margin-left: 4cm;
                        margin-right: 0;
                        padding-left: 0;
                        border-left: none;
                        margin-top: 0.5cm;
                        margin-bottom: 0.5cm;
                    }
                    ul, ol {
                        margin-top: 0.5cm;
                        margin-bottom: 0.5cm;
                        padding-left: 1.25cm;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin-top: 0.5cm;
                        margin-bottom: 0.5cm;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 0.2cm;
                        font-size: 10pt;
                    }
                    img {
                        display: block;
                        margin: 0.5cm auto;
                        max-width: 100%;
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;

        // Criar um Blob com o conteúdo HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });

        // Criar um URL para o Blob
        const url = URL.createObjectURL(blob);

        // Criar um link para download
        const a = document.createElement('a');
        a.href = url;

        // Definir o nome do arquivo com a extensão correta
        if (format === 'pdf') {
            a.download = `documento-abnt.html`;
            toast.success(`Documento exportado como HTML. Abra no navegador e use a função de impressão para salvar como PDF.`);
        } else {
            a.download = `documento-abnt.html`;
            toast.success(`Documento exportado como HTML. Abra no Microsoft Word para editar.`);
        }

        // Adicionar o link ao documento e clicar nele
        document.body.appendChild(a);
        a.click();

        // Remover o link do documento
        document.body.removeChild(a);

        // Liberar o URL
        URL.revokeObjectURL(url);
    }, [editor, fontFamily]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportDocument('pdf')}>
                    Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportDocument('docx')}>
                    Exportar como Word
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
