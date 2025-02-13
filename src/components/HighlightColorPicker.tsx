import { Editor } from '@tiptap/react';
import { Button } from './ui/button';
import { Highlighter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from './ui/dropdown-menu';

const HIGHLIGHT_COLORS = [
    { name: 'Roxo', color: '#9b87f5', value: 'roxo' },
    { name: 'Rosa', color: '#f472b6', value: 'rosa' },
    { name: 'Verde', color: '#22c55e', value: 'verde' },
    { name: 'Amarelo', color: '#f59e0b', value: 'amarelo' },
    { name: 'Vermelho', color: '#ef4444', value: 'vermelho' },
    { name: 'Azul', color: '#3b82f6', value: 'azul' },
];

interface HighlightColorPickerProps {
    editor: Editor;
}

export function HighlightColorPicker({ editor }: HighlightColorPickerProps) {
    const setHighlight = (color: string) => {
        editor.chain().focus().toggleHighlight({ color }).run();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={editor.isActive('highlight') ? 'bg-muted' : ''}
                >
                    <Highlighter className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {HIGHLIGHT_COLORS.map((color) => (
                    <DropdownMenuItem
                        key={color.value}
                        onClick={() => setHighlight(color.value)}
                        className="flex items-center gap-2"
                    >
                        <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: color.color }}
                        />
                        <span>{color.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 