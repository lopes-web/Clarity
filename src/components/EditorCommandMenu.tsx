import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Editor } from '@tiptap/react';
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
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
} from 'lucide-react';

interface EditorCommandMenuProps {
    editor: Editor;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditorCommandMenu({
    editor,
    open,
    onOpenChange,
}: EditorCommandMenuProps) {
    const [search, setSearch] = useState('');

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    const commands = [
        {
            name: 'Título 1',
            icon: <Heading1 className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            name: 'Título 2',
            icon: <Heading2 className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            name: 'Título 3',
            icon: <Heading3 className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            name: 'Negrito',
            icon: <Bold className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleBold().run(),
        },
        {
            name: 'Itálico',
            icon: <Italic className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            name: 'Sublinhado',
            icon: <UnderlineIcon className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
            name: 'Tachado',
            icon: <Strikethrough className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleStrike().run(),
        },
        {
            name: 'Marca-texto (Amarelo)',
            icon: <Highlighter className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleHighlight({ color: 'amarelo' }).run(),
        },
        {
            name: 'Código',
            icon: <Code className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleCode().run(),
        },
        {
            name: 'Lista com marcadores',
            icon: <List className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            name: 'Lista numerada',
            icon: <ListOrdered className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            name: 'Lista de tarefas',
            icon: <CheckSquare className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleTaskList().run(),
        },
        {
            name: 'Citação',
            icon: <Quote className="h-4 w-4" />,
            action: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            name: 'Alinhar à esquerda',
            icon: <AlignLeft className="h-4 w-4" />,
            action: () => editor.chain().focus().setTextAlign('left').run(),
        },
        {
            name: 'Centralizar',
            icon: <AlignCenter className="h-4 w-4" />,
            action: () => editor.chain().focus().setTextAlign('center').run(),
        },
        {
            name: 'Alinhar à direita',
            icon: <AlignRight className="h-4 w-4" />,
            action: () => editor.chain().focus().setTextAlign('right').run(),
        },
        {
            name: 'Justificar',
            icon: <AlignJustify className="h-4 w-4" />,
            action: () => editor.chain().focus().setTextAlign('justify').run(),
        },
        {
            name: 'Adicionar link',
            icon: <LinkIcon className="h-4 w-4" />,
            action: () => {
                const url = window.prompt('URL do link:');
                if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                }
            },
        },
        {
            name: 'Adicionar imagem',
            icon: <ImageIcon className="h-4 w-4" />,
            action: () => {
                const url = window.prompt('URL da imagem:');
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            },
        },
        {
            name: 'Adicionar tabela',
            icon: <TableIcon className="h-4 w-4" />,
            action: () =>
                editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run(),
        },
    ];

    return (
        <Command.Dialog
            open={open}
            onOpenChange={onOpenChange}
            label="Comandos do editor"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full rounded-lg border bg-background p-2 shadow-lg"
        >
            <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Digite um comando..."
                className="w-full border-none bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Command.List className="mt-2 max-h-[300px] overflow-y-auto">
                <Command.Empty className="p-2 text-sm text-muted-foreground">
                    Nenhum comando encontrado.
                </Command.Empty>
                {commands.map((command) => (
                    <Command.Item
                        key={command.name}
                        onSelect={() => {
                            command.action();
                            onOpenChange(false);
                        }}
                        className="flex items-center gap-2 rounded-sm p-2 text-sm hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                        {command.icon}
                        {command.name}
                    </Command.Item>
                ))}
            </Command.List>
        </Command.Dialog>
    );
} 