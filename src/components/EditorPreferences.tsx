import { Moon, Sun, Maximize2, Minimize2, Type } from 'lucide-react';
import { useNotesStore } from '@/lib/stores/useNotesStore';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

export function EditorPreferences() {
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
        { label: 'Sistema', value: 'system-ui' },
        { label: 'Serif', value: 'serif' },
        { label: 'Mono', value: 'monospace' },
    ];

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
                {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                ) : (
                    <Moon className="h-4 w-4" />
                )}
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFocusMode(!isFocusMode)}
                title={isFocusMode ? 'Modo normal' : 'Modo foco'}
            >
                {isFocusMode ? (
                    <Minimize2 className="h-4 w-4" />
                ) : (
                    <Maximize2 className="h-4 w-4" />
                )}
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
                <Label htmlFor="font-size" className="text-sm">
                    Tamanho
                </Label>
                <Slider
                    id="font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    className="w-24"
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Type className="h-4 w-4" />
                        Fonte
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {fontFamilies.map((font) => (
                        <DropdownMenuItem
                            key={font.value}
                            onClick={() => setFontFamily(font.value)}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={`text-sm ${fontFamily === font.value ? 'font-bold' : ''
                                    }`}
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
} 