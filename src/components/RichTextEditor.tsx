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

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    autofocus?: boolean;
    readOnly?: boolean;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Comece a escrever...',
    autofocus = false,
    readOnly = false,
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

    if (!editor) {
        return null;
    }

    return (
        <div className={cn(
            'relative w-full rounded-lg border bg-background p-4 h-[calc(100vh-8rem)]',
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={cn(editor.isActive('highlight') && 'bg-muted')}
                    >
                        <Highlighter className="h-4 w-4" />
                    </Button>

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
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={cn(editor.isActive({ textAlign: 'justify' }) && 'bg-muted')}
                    >
                        <AlignJustify className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addLink}
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

            <EditorContextMenu editor={editor}>
                <EditorContent
                    editor={editor}
                    className={cn(
                        'prose max-w-none dark:prose-invert',
                        isFocusMode && 'prose-lg',
                        readOnly && 'pointer-events-none',
                        '[&_*]:outline-none',
                        'px-6',
                        'h-[calc(100%-4rem)] overflow-y-auto',
                        'prose-headings:font-normal',
                        'prose-h1:[font-size:2em] prose-h1:mb-4',
                        'prose-h2:[font-size:1.5em] prose-h2:mb-3',
                        'prose-h3:[font-size:1.25em] prose-h3:mb-2',
                        'prose-p:my-3',
                        'prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic',
                        'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm',
                        'prose-img:rounded-lg',
                        'prose-table:border prose-table:border-border',
                        'prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted',
                        'prose-td:border prose-td:border-border prose-td:p-2',
                        'prose-ul:my-2 prose-ul:list-disc prose-ul:pl-6',
                        'prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-6',
                        '[&_input[type=checkbox]]:h-4 [&_input[type=checkbox]]:w-4 [&_input[type=checkbox]]:mt-1.5 [&_input[type=checkbox]]:cursor-pointer',
                        '[&_label]:flex [&_label]:items-start [&_label]:gap-2 [&_label]:flex-1',
                        '[&_label>div]:flex-1',
                        '[&_.is-checked>label>div]:text-muted-foreground [&_.is-checked>label>div]:line-through'
                    )}
                    style={{
                        fontSize: `${fontSize}px`,
                        fontFamily,
                    }}
                />
            </EditorContextMenu>

            {editor && !readOnly && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
                >
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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={cn(editor.isActive('highlight') && 'bg-muted')}
                    >
                        <Highlighter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addLink}
                        className={cn(editor.isActive('link') && 'bg-muted')}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </BubbleMenu>
            )}

            {editor && !readOnly && (
                <FloatingMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
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
                </FloatingMenu>
            )}

            {editor && !readOnly && (
                <EditorCommandMenu
                    editor={editor}
                    open={showCommandMenu}
                    onOpenChange={setShowCommandMenu}
                />
            )}
        </div>
    );
} 