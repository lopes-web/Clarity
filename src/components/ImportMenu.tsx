import { Upload, FileUp } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useRef } from 'react';

interface ImportMenuProps {
    onImport: (title: string, content: string) => void;
}

export function ImportMenu({ onImport }: ImportMenuProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        try {
            const content = await file.text();
            const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            onImport(title, content);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };

    const importFile = (accept: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = accept;
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleFileSelect(file);
                    }
                    e.target.value = ''; // Reset input
                }}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        title="Importar"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Importar</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => importFile('.md')}
                        className="flex items-center gap-2"
                    >
                        <FileUp className="h-4 w-4" />
                        <span>Markdown (.md)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => importFile('.html')}
                        className="flex items-center gap-2"
                    >
                        <FileUp className="h-4 w-4" />
                        <span>HTML (.html)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => importFile('.txt')}
                        className="flex items-center gap-2"
                    >
                        <FileUp className="h-4 w-4" />
                        <span>Texto (.txt)</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
} 