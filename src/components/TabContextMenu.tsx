import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Copy,
    Trash2,
    MoveLeft,
    MoveRight,
    Maximize2,
    Minimize2,
    X,
} from "lucide-react";

interface TabContextMenuProps {
    children: React.ReactNode;
    onClose: () => void;
    onCloseOthers: () => void;
    onCloseAll: () => void;
    onMoveLeft: () => void;
    onMoveRight: () => void;
    onDuplicate: () => void;
    canMoveLeft: boolean;
    canMoveRight: boolean;
    hasOtherTabs: boolean;
}

export function TabContextMenu({
    children,
    onClose,
    onCloseOthers,
    onCloseAll,
    onMoveLeft,
    onMoveRight,
    onDuplicate,
    canMoveLeft,
    canMoveRight,
    hasOtherTabs,
}: TabContextMenuProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem
                    onClick={onClose}
                    className="flex items-center gap-2 text-red-600"
                >
                    <X className="h-4 w-4" />
                    <span>Fechar</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={onCloseOthers}
                    className="flex items-center gap-2"
                    disabled={!hasOtherTabs}
                >
                    <Minimize2 className="h-4 w-4" />
                    <span>Fechar outras</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={onCloseAll}
                    className="flex items-center gap-2"
                    disabled={!hasOtherTabs}
                >
                    <Maximize2 className="h-4 w-4" />
                    <span>Fechar todas</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={onMoveLeft}
                    className="flex items-center gap-2"
                    disabled={!canMoveLeft}
                >
                    <MoveLeft className="h-4 w-4" />
                    <span>Mover para esquerda</span>
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={onMoveRight}
                    className="flex items-center gap-2"
                    disabled={!canMoveRight}
                >
                    <MoveRight className="h-4 w-4" />
                    <span>Mover para direita</span>
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onClick={onDuplicate}
                    className="flex items-center gap-2"
                >
                    <Copy className="h-4 w-4" />
                    <span>Duplicar</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
} 