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
            tempDiv.className = 'abnt-export-container';
            tempDiv.innerHTML = content;

            // Aplicar estilos ABNT ao elemento temporário
            const style = document.createElement('style');
            style.textContent = `
                .abnt-export-container {
                    font-family: ${fontFamily};
                    font-size: 12pt;
                    line-height: 1.5;
                    text-align: justify;
                    color: #000;
                    background-color: #fff;
                    padding: 2cm 2cm 2cm 3cm;
                    width: 210mm; /* Largura A4 */
                    box-sizing: border-box;
                }
                .abnt-export-container h1 {
                    font-size: 20pt;
                    font-weight: bold;
                    margin-bottom: 0.5cm;
                    text-align: center;
                }
                .abnt-export-container h2 {
                    font-size: 16pt;
                    font-weight: bold;
                    margin-top: 0.5cm;
                    margin-bottom: 0.5cm;
                }
                .abnt-export-container h3 {
                    font-size: 14pt;
                    font-weight: bold;
                    margin-top: 0.5cm;
                    margin-bottom: 0.5cm;
                }
                .abnt-export-container h4 {
                    font-size: 12pt;
                    font-weight: bold;
                    margin-top: 0.5cm;
                    margin-bottom: 0.3cm;
                }
                .abnt-export-container p {
                    text-indent: 1.25cm;
                    margin-bottom: 0.5cm;
                    text-align: justify;
                }
                .abnt-export-container blockquote {
                    font-size: 10pt;
                    line-height: 1.0;
                    margin-left: 4cm;
                    margin-right: 0;
                    padding-left: 0;
                    border-left: none;
                    margin-top: 0.5cm;
                    margin-bottom: 0.5cm;
                }
                .abnt-export-container ul, 
                .abnt-export-container ol {
                    margin-top: 0.5cm;
                    margin-bottom: 0.5cm;
                    padding-left: 1.25cm;
                }
                .abnt-export-container table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 0.5cm;
                    margin-bottom: 0.5cm;
                }
                .abnt-export-container th,
                .abnt-export-container td {
                    border: 1px solid #000;
                    padding: 0.2cm;
                    font-size: 10pt;
                }
                .abnt-export-container img {
                    display: block;
                    margin: 0.5cm auto;
                    max-width: 100%;
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(tempDiv);

            // Aplicar estilos diretamente aos elementos
            const headings = tempDiv.querySelectorAll('h1, h2, h3, h4');
            headings.forEach(heading => {
                if (heading.tagName === 'H1') {
                    heading.style.fontSize = '20pt';
                    heading.style.textAlign = 'center';
                } else if (heading.tagName === 'H2') {
                    heading.style.fontSize = '16pt';
                } else if (heading.tagName === 'H3') {
                    heading.style.fontSize = '14pt';
                } else if (heading.tagName === 'H4') {
                    heading.style.fontSize = '12pt';
                }
                heading.style.fontFamily = fontFamily;
                heading.style.fontWeight = 'bold';
            });

            const paragraphs = tempDiv.querySelectorAll('p');
            paragraphs.forEach(p => {
                p.style.textIndent = '1.25cm';
                p.style.textAlign = 'justify';
                p.style.fontFamily = fontFamily;
                p.style.fontSize = '12pt';
                p.style.lineHeight = '1.5';
            });

            // Inicializa o documento PDF
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
                putOnlyUsedFonts: true,
                floatPrecision: 16
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
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                imageTimeout: 15000,
                letterRendering: true,
                foreignObjectRendering: true
            });

            // Converter canvas para imagem
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Calcular dimensões para manter a proporção
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const imgWidth = pageWidth - margin.left - margin.right;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

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

            // Remover o elemento temporário e o estilo
            document.body.removeChild(tempDiv);
            document.head.removeChild(style);

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

            // Criar um HTML completo com estilos ABNT mais detalhados
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
                            font-weight: bold;
                        }
                        h2 { 
                            font-size: 16pt; 
                            margin-top: 0.5cm; 
                            margin-bottom: 0.5cm; 
                            font-weight: bold;
                        }
                        h3 { 
                            font-size: 14pt; 
                            margin-top: 0.5cm; 
                            margin-bottom: 0.5cm; 
                            font-weight: bold;
                        }
                        h4 { 
                            font-size: 12pt; 
                            margin-top: 0.5cm; 
                            margin-bottom: 0.3cm; 
                            font-weight: bold;
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
                lineHeight: 1.5,
                styleMap: [
                    "h1 => h1:fresh",
                    "h2 => h2:fresh",
                    "h3 => h3:fresh",
                    "h4 => h4:fresh",
                    "p => p:fresh",
                    "ul => ul:fresh",
                    "ol => ol:fresh",
                    "blockquote => blockquote:fresh",
                    "table => table:fresh",
                    "tr => tr:fresh",
                    "td => td:fresh",
                    "th => th:fresh"
                ],
                table: { row: { cantSplit: true } },
                footer: false,
                pageNumber: false,
                indent: {
                    firstLine: 1.25 // 1.25cm de recuo na primeira linha
                },
                defaultTabStop: 1.25 // 1.25cm para tabulações
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