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
            const html2canvas = (await import('html2canvas')).default;

            // Obter o conteúdo HTML do editor
            let content = editor.getHTML();

            // Pré-processar o conteúdo para garantir que os títulos estejam centralizados
            // e que a fonte seja aplicada corretamente
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');

            // Aplicar estilos a todos os elementos
            const allElements = doc.querySelectorAll('*');
            allElements.forEach(el => {
                // Aplicar fonte a todos os elementos
                (el as HTMLElement).style.fontFamily = 'Times New Roman, Times, serif';

                // Centralizar títulos h1
                if (el.tagName === 'H1') {
                    (el as HTMLElement).style.textAlign = 'center';
                    (el as HTMLElement).style.width = '100%';
                    (el as HTMLElement).style.display = 'block';
                    (el as HTMLElement).style.fontSize = '20pt';
                    (el as HTMLElement).style.fontWeight = 'bold';
                    (el as HTMLElement).setAttribute('align', 'center');
                }

                // Aplicar estilos específicos para outros elementos
                if (el.tagName === 'P') {
                    (el as HTMLElement).style.textAlign = 'justify';
                    (el as HTMLElement).style.textIndent = '1.25cm';
                    (el as HTMLElement).style.fontSize = '12pt';
                    (el as HTMLElement).style.lineHeight = '1.5';
                }
            });

            // Atualizar o conteúdo com as modificações
            content = new XMLSerializer().serializeToString(doc);

            // Criar um elemento temporário para renderizar o conteúdo
            const tempDiv = document.createElement('div');
            tempDiv.className = 'abnt-export-container';
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            tempDiv.style.width = '210mm'; // Largura A4
            tempDiv.style.padding = '2cm 2cm 2cm 3cm';
            tempDiv.style.backgroundColor = '#ffffff';
            tempDiv.style.fontFamily = 'Times New Roman, Times, serif';
            tempDiv.style.fontSize = '12pt';
            tempDiv.style.lineHeight = '1.5';
            tempDiv.style.textAlign = 'justify';
            tempDiv.style.color = '#000000';
            tempDiv.style.boxSizing = 'border-box';
            tempDiv.innerHTML = content;

            // Aplicar estilos ABNT ao elemento temporário
            const style = document.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: 'Times New Roman';
                    src: local('Times New Roman');
                    font-weight: normal;
                    font-style: normal;
                }
                
                .abnt-export-container {
                    font-family: 'Times New Roman', Times, serif !important;
                    font-size: 12pt !important;
                    line-height: 1.5 !important;
                    text-align: justify !important;
                    color: #000 !important;
                    background-color: #fff !important;
                    padding: 2cm 2cm 2cm 3cm !important;
                    width: 210mm !important; /* Largura A4 */
                    box-sizing: border-box !important;
                    margin: 0 auto !important; /* Centralizar o container */
                }
                .abnt-export-container * {
                    font-family: 'Times New Roman', Times, serif !important;
                }
                .abnt-export-container h1 {
                    font-size: 20pt !important;
                    font-weight: bold !important;
                    margin-bottom: 0.5cm !important;
                    text-align: center !important;
                    width: 100% !important;
                    display: block !important;
                    margin-left: -0.5cm !important; /* Compensar a diferença de margem */
                }
                .abnt-export-container h2 {
                    font-size: 16pt !important;
                    font-weight: bold !important;
                    margin-top: 0.5cm !important;
                    margin-bottom: 0.5cm !important;
                }
                .abnt-export-container h3 {
                    font-size: 14pt !important;
                    font-weight: bold !important;
                    margin-top: 0.5cm !important;
                    margin-bottom: 0.5cm !important;
                }
                .abnt-export-container h4 {
                    font-size: 12pt !important;
                    font-weight: bold !important;
                    margin-top: 0.5cm !important;
                    margin-bottom: 0.3cm !important;
                }
                .abnt-export-container p {
                    text-indent: 1.25cm !important;
                    margin-bottom: 0.5cm !important;
                    text-align: justify !important;
                }
                .abnt-export-container blockquote {
                    font-size: 10pt !important;
                    line-height: 1.0 !important;
                    margin-left: 4cm !important;
                    margin-right: 0 !important;
                    padding-left: 0 !important;
                    border-left: none !important;
                    margin-top: 0.5cm !important;
                    margin-bottom: 0.5cm !important;
                }
                .abnt-export-container ul, 
                .abnt-export-container ol {
                    margin-top: 0.5cm !important;
                    margin-bottom: 0.5cm !important;
                    padding-left: 1.25cm !important;
                }
                .abnt-export-container table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                    margin-top: 0.5cm !important;
                    margin-bottom: 0.5cm !important;
                }
                .abnt-export-container th,
                .abnt-export-container td {
                    border: 1px solid #000 !important;
                    padding: 0.2cm !important;
                    font-size: 10pt !important;
                }
                .abnt-export-container img {
                    display: block !important;
                    margin: 0.5cm auto !important;
                    max-width: 100% !important;
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(tempDiv);

            // Garantir que a fonte seja carregada antes de renderizar
            await document.fonts.ready;

            // Aplicar estilos diretamente aos elementos usando setAttribute
            const headings = tempDiv.querySelectorAll('h1, h2, h3, h4');
            headings.forEach((heading) => {
                const htmlHeading = heading as HTMLElement;
                if (heading.tagName === 'H1') {
                    htmlHeading.setAttribute('style', `font-size: 20pt !important; text-align: center !important; font-family: 'Times New Roman', Times, serif !important; font-weight: bold !important; width: 100% !important; display: block !important; margin-left: -0.5cm !important;`);
                    htmlHeading.setAttribute('align', 'center');
                } else if (heading.tagName === 'H2') {
                    htmlHeading.setAttribute('style', `font-size: 16pt !important; font-family: 'Times New Roman', Times, serif !important; font-weight: bold !important;`);
                } else if (heading.tagName === 'H3') {
                    htmlHeading.setAttribute('style', `font-size: 14pt !important; font-family: 'Times New Roman', Times, serif !important; font-weight: bold !important;`);
                } else if (heading.tagName === 'H4') {
                    htmlHeading.setAttribute('style', `font-size: 12pt !important; font-family: 'Times New Roman', Times, serif !important; font-weight: bold !important;`);
                }
            });

            const paragraphs = tempDiv.querySelectorAll('p');
            paragraphs.forEach((p) => {
                const htmlP = p as HTMLElement;
                htmlP.setAttribute('style', `text-indent: 1.25cm !important; text-align: justify !important; font-family: 'Times New Roman', Times, serif !important; font-size: 12pt !important; line-height: 1.5 !important;`);
            });

            // Método alternativo para exportar PDF
            try {
                // Inicializa o documento PDF
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true,
                    putOnlyUsedFonts: true,
                    floatPrecision: 16
                });

                // Adicionar fonte Times New Roman ao PDF
                doc.setFont('times', 'normal');

                // Configurar margens ABNT (3cm esquerda, 2cm demais lados)
                // Ajustamos a margem esquerda para 25mm em vez de 30mm para compensar visualmente
                const margin = {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 25 // Reduzido de 30mm para 25mm para melhor centralização visual
                };

                // Aguardar um momento para garantir que os estilos sejam aplicados
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Usar html2canvas com configurações otimizadas
                const canvas = await html2canvas(tempDiv, {
                    scale: 2, // Melhor qualidade
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    imageTimeout: 15000,
                    foreignObjectRendering: false, // Desativado para evitar problemas de renderização
                    onclone: (clonedDoc) => {
                        // Aplicar estilos adicionais ao clone
                        const clonedElement = clonedDoc.querySelector('.abnt-export-container') as HTMLElement;
                        if (clonedElement) {
                            clonedElement.style.fontFamily = 'Times New Roman, Times, serif';
                            clonedElement.style.fontSize = '12pt';
                            clonedElement.style.lineHeight = '1.5';
                            clonedElement.style.textAlign = 'justify';

                            // Aplicar estilos a todos os elementos dentro do container
                            const allElements = clonedElement.querySelectorAll('*');
                            allElements.forEach((el) => {
                                const htmlEl = el as HTMLElement;
                                htmlEl.style.fontFamily = 'Times New Roman, Times, serif';

                                if (el.tagName === 'H1') {
                                    htmlEl.style.textAlign = 'center';
                                    htmlEl.style.fontSize = '20pt';
                                    htmlEl.style.fontWeight = 'bold';
                                    htmlEl.style.width = '100%';
                                    htmlEl.style.display = 'block';
                                    htmlEl.setAttribute('align', 'center');
                                }
                            });
                        }
                    }
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

                        if (ctx) {
                            // Desenhar parte da imagem original
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
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
                        }

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

                // Salvar o PDF
                doc.save('documento-abnt.pdf');
                toast.success('Documento exportado como PDF com sucesso!');
            } catch (pdfError) {
                console.error('Erro ao gerar PDF:', pdfError);

                // Método alternativo se o primeiro falhar
                try {
                    // Criar um link para download do HTML
                    const htmlBlob = new Blob([`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>Documento ABNT</title>
                            <style>
                                @font-face {
                                    font-family: 'Times New Roman';
                                    src: local('Times New Roman');
                                    font-weight: normal;
                                    font-style: normal;
                                }
                                
                                @page {
                                    size: A4;
                                    margin: 2cm 2cm 2cm 3cm;
                                }
                                body {
                                    font-family: 'Times New Roman', Times, serif;
                                    font-size: 12pt;
                                    line-height: 1.5;
                                    text-align: justify;
                                    color: #000;
                                    background-color: #fff;
                                    padding: 2cm 2cm 2cm 3cm;
                                    margin: 0;
                                }
                                * {
                                    font-family: 'Times New Roman', Times, serif;
                                }
                                h1 { 
                                    font-size: 20pt; 
                                    margin-bottom: 0.5cm; 
                                    text-align: center;
                                    font-weight: bold;
                                    width: 100%;
                                    display: block;
                                    margin-left: -0.5cm; /* Compensar a diferença de margem */
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
                    `], { type: 'text/html' });

                    const htmlUrl = URL.createObjectURL(htmlBlob);
                    const link = document.createElement('a');
                    link.href = htmlUrl;
                    link.download = 'documento-abnt.html';
                    link.click();

                    toast.success('Documento exportado como HTML. Por favor, abra no navegador e use a função de impressão para gerar um PDF.');
                } catch (htmlError) {
                    console.error('Erro ao gerar HTML:', htmlError);
                    toast.error('Não foi possível exportar o documento. Tente novamente.');
                }
            }

            // Remover o elemento temporário e o estilo
            document.body.removeChild(tempDiv);
            document.head.removeChild(style);
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
            let content = editor.getHTML();

            // Pré-processar o conteúdo para garantir que os títulos estejam centralizados
            // e que a fonte seja aplicada corretamente
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');

            // Aplicar estilos a todos os elementos
            const allElements = doc.querySelectorAll('*');
            allElements.forEach(el => {
                // Aplicar fonte a todos os elementos
                (el as HTMLElement).style.fontFamily = 'Times New Roman, Times, serif';

                // Centralizar títulos h1
                if (el.tagName === 'H1') {
                    (el as HTMLElement).style.textAlign = 'center';
                    (el as HTMLElement).style.width = '100%';
                    (el as HTMLElement).style.display = 'block';
                    (el as HTMLElement).style.fontSize = '20pt';
                    (el as HTMLElement).style.fontWeight = 'bold';
                    (el as HTMLElement).setAttribute('align', 'center');
                }

                // Aplicar estilos específicos para outros elementos
                if (el.tagName === 'P') {
                    (el as HTMLElement).style.textAlign = 'justify';
                    (el as HTMLElement).style.textIndent = '1.25cm';
                    (el as HTMLElement).style.fontSize = '12pt';
                    (el as HTMLElement).style.lineHeight = '1.5';
                }
            });

            // Atualizar o conteúdo com as modificações
            content = new XMLSerializer().serializeToString(doc);

            // Criar um HTML completo com estilos ABNT mais detalhados
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Documento ABNT</title>
                    <style>
                        @font-face {
                            font-family: 'Times New Roman';
                            src: local('Times New Roman');
                            font-weight: normal;
                            font-style: normal;
                        }
                        
                        @page {
                            size: A4;
                            margin: 2cm 2cm 2cm 3cm;
                        }
                        body {
                            font-family: 'Times New Roman', Times, serif;
                            font-size: 12pt;
                            line-height: 1.5;
                            text-align: justify;
                            color: #000;
                            background-color: #fff;
                            padding: 0;
                            margin: 0;
                        }
                        * {
                            font-family: 'Times New Roman', Times, serif;
                        }
                        h1 { 
                            font-size: 20pt; 
                            margin-bottom: 0.5cm; 
                            text-align: center;
                            font-weight: bold;
                            width: 100%;
                            display: block;
                            margin-left: -0.5cm; /* Compensar a diferença de margem */
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
                font: 'Times New Roman',
                fontSize: 12,
                lineHeight: 1.5,
                styleMap: [
                    "h1 => h1:fresh {text-align: center; font-size: 20pt; font-family: 'Times New Roman'; margin-left: -0.5cm;}", // Compensar a diferença de margem
                    "h2 => h2:fresh {font-size: 16pt; font-family: 'Times New Roman';}",
                    "h3 => h3:fresh {font-size: 14pt; font-family: 'Times New Roman';}",
                    "h4 => h4:fresh {font-size: 12pt; font-family: 'Times New Roman';}",
                    "p => p:fresh {text-indent: 1.25cm; text-align: justify; font-family: 'Times New Roman';}",
                    "ul => ul:fresh {font-family: 'Times New Roman';}",
                    "ol => ol:fresh {font-family: 'Times New Roman';}",
                    "blockquote => blockquote:fresh {font-family: 'Times New Roman';}",
                    "table => table:fresh {font-family: 'Times New Roman';}",
                    "tr => tr:fresh {font-family: 'Times New Roman';}",
                    "td => td:fresh {font-family: 'Times New Roman';}",
                    "th => th:fresh {font-family: 'Times New Roman';}"
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