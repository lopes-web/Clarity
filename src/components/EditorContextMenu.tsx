import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    CheckSquare,
    Type,
    Underline as UnderlineIcon,
    Copy,
    Scissors,
    Clipboard,
    Trash2,
} from "lucide-react";

interface EditorContextMenuProps {
    editor: Editor;
    children: React.ReactNode;
}

export function EditorContextMenu({ editor, children }: EditorContextMenuProps) {
    const handleCopy = () => {
        const selection = editor.state.selection;
        const text = editor.state.doc.textBetween(
            selection.from,
            selection.to,
            "\n"
        );
        navigator.clipboard.writeText(text);
    };

    const handleCut = () => {
        handleCopy();
        editor.commands.deleteSelection();
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            editor.commands.insertContent(text);
        } catch (error) {
            console.error("Failed to read clipboard contents:", error);
        }
    };

    const handleDelete = () => {
        editor.commands.deleteSelection();
    };

    const addImage = () => {
        const url = window.prompt("URL da imagem:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const url = window.prompt("URL do link:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addTable = () => {
        editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                >
                    <Copy className="h-4 w-4" />
                    <span>Copiar</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={handleCut}
                    className="flex items-center gap-2"
                >
                    <Scissors className="h-4 w-4" />
                    <span>Recortar</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={handlePaste}
                    className="flex items-center gap-2"
                >
                    <Clipboard className="h-4 w-4" />
                    <span>Colar</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="flex items-center gap-2"
                >
                    <Bold className="h-4 w-4" />
                    <span>Negrito</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="flex items-center gap-2"
                >
                    <Italic className="h-4 w-4" />
                    <span>Itálico</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className="flex items-center gap-2"
                >
                    <UnderlineIcon className="h-4 w-4" />
                    <span>Sublinhado</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className="flex items-center gap-2"
                >
                    <Strikethrough className="h-4 w-4" />
                    <span>Tachado</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className="flex items-center gap-2"
                >
                    <Code className="h-4 w-4" />
                    <span>Código</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className="flex items-center gap-2"
                >
                    <Heading1 className="h-4 w-4" />
                    <span>Título 1</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className="flex items-center gap-2"
                >
                    <Heading2 className="h-4 w-4" />
                    <span>Título 2</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className="flex items-center gap-2"
                >
                    <Heading3 className="h-4 w-4" />
                    <span>Título 3</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className="flex items-center gap-2"
                >
                    <List className="h-4 w-4" />
                    <span>Lista com marcadores</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className="flex items-center gap-2"
                >
                    <ListOrdered className="h-4 w-4" />
                    <span>Lista numerada</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className="flex items-center gap-2"
                >
                    <CheckSquare className="h-4 w-4" />
                    <span>Lista de tarefas</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className="flex items-center gap-2"
                >
                    <Quote className="h-4 w-4" />
                    <span>Citação</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={addLink}
                    className="flex items-center gap-2"
                >
                    <LinkIcon className="h-4 w-4" />
                    <span>Adicionar link</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={addImage}
                    className="flex items-center gap-2"
                >
                    <ImageIcon className="h-4 w-4" />
                    <span>Adicionar imagem</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={addTable}
                    className="flex items-center gap-2"
                >
                    <TableIcon className="h-4 w-4" />
                    <span>Adicionar tabela</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
} 