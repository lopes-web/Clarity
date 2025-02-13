import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { jsPDF } from 'jspdf';
import HTMLtoDOCX from 'html-to-docx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportButtonProps {
    editor: Editor;
}

export function ExportButton({ editor }: ExportButtonProps) {
    const exportAsPDF = async () => {
        try {
            const doc = new jsPDF();
            const content = editor.getHTML();

            // Cria um elemento temporário para renderizar o conteúdo
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;

            // Processa o conteúdo para manter a formatação básica
            const processNode = (node: Node, level = 0): string => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node.textContent || '';
                }

                const element = node as Element;
                let text = '';

                // Adiciona espaçamento para listas
                if (element.tagName === 'LI') {
                    text += '  '.repeat(level) + '• ';
                }

                // Processa os nós filhos
                for (const child of Array.from(node.childNodes)) {
                    text += processNode(child, level + 1);
                }

                // Adiciona quebras de linha apropriadas
                if (['P', 'H1', 'H2', 'H3', 'LI'].includes(element.tagName)) {
                    text += '\n';
                }
                if (element.tagName === 'BR') {
                    text += '\n';
                }

                return text;
            };

            const processedText = processNode(tempDiv);

            // Configurações da página
            const margin = 15;
            const pageWidth = doc.internal.pageSize.getWidth();

            // Configurações do texto
            doc.setFont('helvetica');
            doc.setFontSize(12);

            // Divide o texto em linhas que cabem na página
            const lines = doc.splitTextToSize(processedText, pageWidth - 2 * margin);

            // Adiciona as linhas à página
            doc.text(lines, margin, margin);

            // Download do arquivo
            doc.save('documento.pdf');
            toast.success('PDF exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            toast.error('Erro ao exportar PDF');
        }
    };

    const exportAsWord = async () => {
        try {
            const content = editor.getHTML();

            // Configurações do documento Word
            const options = {
                orientation: 'portrait',
                margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                font: 'Arial',
                styleMap: [
                    "h1 => h1:fresh",
                    "h2 => h2:fresh",
                    "h3 => h3:fresh",
                    "p => p:fresh",
                    "ul => ul:fresh",
                    "ol => ol:fresh",
                    "code => code:fresh",
                    "blockquote => blockquote:fresh"
                ],
                table: { row: { cantSplit: true } },
                footer: false,
                pageNumber: false
            };

            // Gera o arquivo .docx
            const buffer = await HTMLtoDOCX(content, null, options);

            // Cria um blob e faz o download
            const blob = new Blob([buffer]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'documento.docx';
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Documento Word exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar Word:', error);
            toast.error('Erro ao exportar Word');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={exportAsPDF}>
                    Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsWord}>
                    Exportar como Word
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 