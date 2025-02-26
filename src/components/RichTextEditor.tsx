import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import { useNotesStore } from '@/lib/stores/useNotesStore';
import { cn } from '@/lib/utils';
import { extensions } from '@/lib/tiptap';
import { EditorContextMenu } from './EditorContextMenu';
import { EditorCommandMenu } from './EditorCommandMenu';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    CheckSquare,
    Type,
    Underline as UnderlineIcon,
    Superscript as SuperscriptIcon,
    Subscript as SubscriptIcon,
    Palette,
    Command,
    Highlighter,
    FileText,
    Download,
    FileDown,
} from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { HighlightColorPicker } from './HighlightColorPicker';

// Importar os estilos ABNT
import '@/styles/abnt.css';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    autofocus?: boolean;
    readOnly?: boolean;
    onEditorReady?: (editor: any) => void;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Comece a escrever...',
    autofocus = false,
    readOnly = false,
    onEditorReady,
}: RichTextEditorProps) {
    const { isDarkMode, isFocusMode, fontSize, fontFamily } = useNotesStore();
    const [showCommandMenu, setShowCommandMenu] = useState(false);

    const editor = useEditor({
        extensions,
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        autofocus: autofocus ? 'end' : false,
        editable: !readOnly,
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // Aplicar estilos ABNT por padrão
    useEffect(() => {
        if (editor) {
            // Aplicar configurações ABNT
            editor.chain().focus().setFontFamily(fontFamily).run();
            editor.chain().focus().setTextAlign('justify').run();
        }
    }, [editor, fontFamily]);

    const addImage = useCallback(() => {
        const url = window.prompt('URL da imagem:');

        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addLink = useCallback(() => {
        const url = window.prompt('URL do link:');

        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    const addTable = useCallback(() => {
        if (editor) {
            editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run();
        }
    }, [editor]);

    // Função para exportar o conteúdo para PDF/Word
    const exportDocument = useCallback((format: 'pdf' | 'docx') => {
        if (!editor) return;

        // Obter o conteúdo HTML do editor
        const content = editor.getHTML();

        // Criar um elemento temporário para o conteúdo
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;

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
            // Para PDF, ainda usamos HTML que pode ser convertido para PDF pelo usuário
            a.download = `documento-abnt.html`;
            toast.success(`Documento exportado como HTML. Abra no navegador e use a função de impressão para salvar como PDF.`);
        } else {
            // Para Word, usamos HTML que pode ser aberto no Word
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

    if (!editor) {
        return null;
    }

    return (
        <div className={cn(
            'relative w-full bg-background h-[calc(100vh-8rem)] overflow-auto',
            isDarkMode && 'dark',
            isFocusMode && 'prose-lg'
        )}>
            {!readOnly && (
                <div className="sticky top-0 z-10 mb-4 flex flex-wrap gap-2 rounded-lg border bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCommandMenu(true)}
                        className="gap-2"
                    >
                        <Command className="h-4 w-4" />
                        <span className="hidden sm:inline">Comandos</span>
                        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>

                    <Separator orientation="vertical" className="h-8" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                            >
                                <Type className="h-4 w-4" />
                                Título
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                                <Heading1 className="mr-2 h-4 w-4" />
                                Título 1
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                                <Heading2 className="mr-2 h-4 w-4" />
                                Título 2
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                                <Heading3 className="mr-2 h-4 w-4" />
                                Título 3
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(editor.isActive('bold') && 'bg-muted')}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn(editor.isActive('italic') && 'bg-muted')}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={cn(editor.isActive('underline') && 'bg-muted')}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={cn(editor.isActive('strike') && 'bg-muted')}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <HighlightColorPicker editor={editor} />

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(editor.isActive('bulletList') && 'bg-muted')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(editor.isActive('orderedList') && 'bg-muted')}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={cn(editor.isActive('taskList') && 'bg-muted')}
                    >
                        <CheckSquare className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={cn(editor.isActive('blockquote') && 'bg-muted')}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={cn(editor.isActive('code') && 'bg-muted')}
                    >
                        <Code className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addLink}
                        className={cn(editor.isActive('link') && 'bg-muted')}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addImage}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addTable}
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-8" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    editor.isActive({ textAlign: 'left' }) && 'bg-muted',
                                    editor.isActive({ textAlign: 'center' }) && 'bg-muted',
                                    editor.isActive({ textAlign: 'right' }) && 'bg-muted',
                                    editor.isActive({ textAlign: 'justify' }) && 'bg-muted',
                                )}
                            >
                                {editor.isActive({ textAlign: 'left' }) && <AlignLeft className="h-4 w-4" />}
                                {editor.isActive({ textAlign: 'center' }) && <AlignCenter className="h-4 w-4" />}
                                {editor.isActive({ textAlign: 'right' }) && <AlignRight className="h-4 w-4" />}
                                {editor.isActive({ textAlign: 'justify' }) && <AlignJustify className="h-4 w-4" />}
                                {!editor.isActive({ textAlign: 'left' }) &&
                                    !editor.isActive({ textAlign: 'center' }) &&
                                    !editor.isActive({ textAlign: 'right' }) &&
                                    !editor.isActive({ textAlign: 'justify' }) &&
                                    <AlignLeft className="h-4 w-4" />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                                <AlignLeft className="mr-2 h-4 w-4" />
                                Alinhar à esquerda
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                                <AlignCenter className="mr-2 h-4 w-4" />
                                Centralizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                                <AlignRight className="mr-2 h-4 w-4" />
                                Alinhar à direita
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                                <AlignJustify className="mr-2 h-4 w-4" />
                                Justificar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-8" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                            >
                                <FileDown className="h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => exportDocument('pdf')}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar como PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportDocument('docx')}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar como Word
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {showCommandMenu && (
                <EditorCommandMenu
                    editor={editor}
                    open={showCommandMenu}
                    onOpenChange={setShowCommandMenu}
                />
            )}

            <EditorContextMenu editor={editor}>
                <EditorContent
                    editor={editor}
                    className={cn(
                        'prose dark:prose-invert focus:outline-none w-full'
                    )}
                    style={{
                        fontFamily: fontFamily,
                        fontSize: '12pt',
                    }}
                />
            </EditorContextMenu>
        </div>
    );
} 