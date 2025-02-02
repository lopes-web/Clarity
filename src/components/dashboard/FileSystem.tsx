import { useState, useEffect } from "react";
import { Folder, File, Plus, FileText, Trash2, ArrowLeft, Search, Grid2X2, List } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fileSystemService } from "@/lib/fileSystemService";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file" | "note";
  parentId: string | null;
  content?: string;
  createdAt: string;
  updatedAt: string;
  subjectId?: string;
}

interface FileSystemProps {
  isWidget?: boolean;
}

export function FileSystem({ isWidget = false }: FileSystemProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"folder" | "file" | "note">("folder");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    // Carrega os arquivos ao montar o componente e quando mudar de pasta
    setFiles(fileSystemService.getFiles(currentFolder));
  }, [currentFolder]);

  const currentFiles = files.filter(file => 
    searchQuery ? file.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );
  
  const breadcrumbs = getBreadcrumbs(currentFolder);

  function getBreadcrumbs(folderId: string | null): string[] {
    if (!folderId) return ["Root"];
    
    const path: string[] = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = fileSystemService.getFile(currentId);
      if (!folder) break;
      path.unshift(folder.name);
      currentId = folder.parentId;
    }
    
    return ["Root", ...path];
  }

  const handleAddItem = () => {
    if (!newItemName) return;
    
    try {
      const file = fileSystemService.createFile(
        newItemName + (newItemType === "note" ? ".txt" : ""),
        newItemType,
        currentFolder
      );
      
      setFiles(fileSystemService.getFiles(currentFolder));
      setNewItemName("");
      setIsDialogOpen(false);
      
      toast.success(`${newItemType === "folder" ? "Pasta" : "Arquivo"} criado com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar item. Tente novamente.');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    try {
      if (fileSystemService.deleteFile(fileId)) {
        setFiles(fileSystemService.getFiles(currentFolder));
        toast.success("Item excluído com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item. Tente novamente.');
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      setCurrentFolder(file.id);
    } else if (file.type === "note") {
      const event = new CustomEvent('openNote', {
        detail: { id: file.id, name: file.name, content: file.content }
      });
      window.dispatchEvent(event);
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            <button
              onClick={() => setCurrentFolder(index === 0 ? null : files[index - 1]?.id)}
              className="hover:text-pastel-purple"
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className={cn(
        "flex gap-2",
        isWidget ? "flex-col" : "flex-row items-center justify-between"
      )}>
        <div className="flex gap-2">
          {currentFolder && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const currentFile = fileSystemService.getFile(currentFolder);
                setCurrentFolder(currentFile?.parentId || null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do item"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant={newItemType === "folder" ? "default" : "outline"}
                    onClick={() => setNewItemType("folder")}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Pasta
                  </Button>
                  <Button
                    variant={newItemType === "file" ? "default" : "outline"}
                    onClick={() => setNewItemType("file")}
                  >
                    <File className="h-4 w-4 mr-2" />
                    Arquivo
                  </Button>
                  <Button
                    variant={newItemType === "note" ? "default" : "outline"}
                    onClick={() => setNewItemType("note")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Nota
                  </Button>
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Criar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!isWidget && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsGridView(!isGridView)}
            >
              {isGridView ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid2X2 className="h-4 w-4" />
              )}
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        )}
      </div>

      {/* Files Grid/List */}
      <div className={cn(
        "gap-2",
        isWidget ? "grid grid-cols-2" : isGridView 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "space-y-2"
      )}>
        {currentFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group relative rounded-lg border p-3 hover:bg-accent",
              isWidget || isGridView ? "flex flex-col items-center space-y-2" : "flex items-center justify-between"
            )}
          >
            <button
              onClick={() => handleFileClick(file)}
              className="flex items-center gap-2"
            >
              {file.type === "folder" ? (
                <Folder className="h-6 w-6 text-blue-500" />
              ) : file.type === "note" ? (
                <FileText className="h-6 w-6 text-green-500" />
              ) : (
                <File className="h-6 w-6 text-gray-500" />
              )}
              <span className="truncate">{file.name}</span>
            </button>
            
            {!file.subjectId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => handleDeleteFile(file.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isWidget) {
    return (
      <DashboardCard title="Arquivos" icon={<Folder className="h-5 w-5" />}>
        {content}
      </DashboardCard>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciador de Arquivos</h1>
      {content}
    </div>
  );
}