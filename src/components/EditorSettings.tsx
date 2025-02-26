import { Settings } from 'lucide-react';
import { useNotesStore } from '@/lib/stores/useNotesStore';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export function EditorSettings() {
    const {
        isDarkMode,
        isFocusMode,
        fontSize,
        fontFamily,
        setIsDarkMode,
        setIsFocusMode,
        setFontSize,
        setFontFamily,
    } = useNotesStore();

    const fontFamilies = [
        { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
        { label: 'Arial', value: 'Arial, sans-serif' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    title="Configurações"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
                <DropdownMenuLabel>Configurações do Editor</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode">Modo escuro</Label>
                        <Switch
                            id="dark-mode"
                            checked={isDarkMode}
                            onCheckedChange={setIsDarkMode}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="focus-mode">Modo foco</Label>
                        <Switch
                            id="focus-mode"
                            checked={isFocusMode}
                            onCheckedChange={setIsFocusMode}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fonte</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {fontFamilies.map((font) => (
                                <Button
                                    key={font.value}
                                    variant={fontFamily === font.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFontFamily(font.value)}
                                    className="w-full"
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 