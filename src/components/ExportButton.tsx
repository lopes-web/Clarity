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

    const exportAsPDF = async () => {
        if (!editor) return;

        try {
            // Importação dinâmica do jsPDF
            const { default: jsPDF } = await import('jspdf');

            // Obter o conteúdo HTML do editor
            const content = editor.getHTML();

            // Criar um elemento temporário para renderizar o conteúdo
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            document.body.appendChild(tempDiv);

            // Aplicar estilos ABNT ao elemento temporário
            tempDiv.style.fontFamily = fontFamily;
            tempDiv.style.fontSize = '12pt';
            tempDiv.style.lineHeight = '1.5';
            tempDiv.style.textAlign = 'justify';
            tempDiv.style.color = '#000';
            tempDiv.style.padding = '2cm 2cm 2cm 3cm';
            tempDiv.style.width = '210mm'; // Largura A4
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';

            // Inicializa o documento PDF
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // Configurar margens ABNT (3cm esquerda, 2cm demais lados)
            const margin = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 30
            };

            // Usar html2canvas para renderizar o HTML em uma imagem
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(tempDiv, {
                scale: 2, // Melhor qualidade
                useCORS: true,
                logging: false
            });

            // Converter canvas para imagem
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Calcular dimensões para manter a proporção
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const imgWidth = pageWidth - margin.left - margin.right;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Adicionar a imagem ao PDF
            let position = margin.top;

            // Se a imagem for maior que a altura da página, dividir em várias páginas
            if (imgHeight > pageHeight - margin.top - margin.bottom) {
                let remainingHeight = canvas.height;
                let currentPosition = 0;

                while (remainingHeight > 0) {
                    // Calcular altura para esta página
                    const pageImgHeight = Math.min(
                        (pageHeight - margin.top - margin.bottom) * (canvas.width / imgWidth),
                        remainingHeight
                    );

                    // Criar um canvas temporário para esta parte da imagem
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = pageImgHeight;
                    const ctx = tempCanvas.getContext('2d');

                    // Desenhar parte da imagem original
                    ctx.drawImage(
                        canvas,
                        0, currentPosition, canvas.width, pageImgHeight,
                        0, 0, canvas.width, pageImgHeight
                    );

                    // Adicionar ao PDF
                    const pageImgData = tempCanvas.toDataURL('image/jpeg', 1.0);

                    if (currentPosition > 0) {
                        doc.addPage();
                    }

                    doc.addImage(
                        pageImgData,
                        'JPEG',
                        margin.left,
                        margin.top,
                        imgWidth,
                        (pageImgHeight * imgWidth) / canvas.width
                    );

                    // Atualizar posição e altura restante
                    currentPosition += pageImgHeight;
                    remainingHeight -= pageImgHeight;
                }
            } else {
                // Se couber em uma página, adicionar diretamente
                doc.addImage(
                    imgData,
                    'JPEG',
                    margin.left,
                    margin.top,
                    imgWidth,
                    imgHeight
                );
            }

            // Remover o elemento temporário
            document.body.removeChild(tempDiv);

            // Salvar o PDF
            doc.save('documento-abnt.pdf');
            toast.success('Documento exportado como PDF com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            toast.error('Erro ao exportar PDF. Tente novamente.');
        }
    };

    const exportAsWord = async () => {
        if (!editor) return;

        try {
            // Importação dinâmica do html-to-docx
            const htmlToDocx = await import('html-to-docx');
            const HTMLtoDOCX = htmlToDocx.default || htmlToDocx;

            // Obter o conteúdo HTML do editor
            const content = editor.getHTML();

            // Criar um HTML completo com estilos ABNT
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Documento ABNT</title>
                    <style>
                        body {
                            font-family: ${fontFamily};
                            font-size: 12pt;
                            line-height: 1.5;
                            text-align: justify;
                        }
                        h1 {
                            font-size: 20pt;
                            text-align: center;
                        }
                        h2 { font-size: 16pt; }
                        h3 { font-size: 14pt; }
                        h4 { font-size: 12pt; }
                        p { text-indent: 1.25cm; }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `;

            // Configurações do documento Word
            const options = {
                orientation: 'portrait',
                margins: {
                    top: 567, // 2cm em twips (567 = 2cm)
                    right: 567, // 2cm em twips
                    bottom: 567, // 2cm em twips
                    left: 850, // 3cm em twips (850 = 3cm)
                },
                title: 'Documento ABNT',
                font: fontFamily.split(',')[0].trim().replace(/['"]+/g, ''),
                fontSize: 12,
                styleMap: [
                    "h1 => h1:fresh",
                    "h2 => h2:fresh",
                    "h3 => h3:fresh",
                    "p => p:fresh",
                    "ul => ul:fresh",
                    "ol => ol:fresh",
                    "blockquote => blockquote:fresh"
                ],
                table: { row: { cantSplit: true } },
                footer: false,
                pageNumber: false
            };

            // Gerar o arquivo .docx
            const buffer = await HTMLtoDOCX(htmlContent, null, options);

            // Criar um blob e fazer o download
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'documento-abnt.docx';
            link.click();
            window.URL.revokeObjectURL(url);

            toast.success('Documento exportado como Word com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar Word:', error);
            toast.error('Erro ao exportar Word. Tente novamente.');
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