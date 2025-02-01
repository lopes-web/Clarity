import { useState, useEffect } from "react";
import { Folder, File, Plus, FileText, Trash2, ArrowLeft } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fileSystemService } from "@/lib/fileSystemService";

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

export function FileSystem() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"folder" | "file" | "note">("folder");

  useEffect(() => {
    // Carrega os arquivos ao montar o componente e quando mudar de pasta
    setFiles(fileSystemService.getFiles(currentFolder));
  }, [currentFolder]);

  const currentFiles = files;
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

  return (
    <DashboardCard title="Arquivos" icon={<Folder className="h-5 w-5" />}>
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-2">
          {currentFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-pastel-purple/10"
            >
              <button
                onClick={() => handleFileClick(file)}
                className="flex items-center gap-2 text-left flex-1"
              >
                {file.type === "folder" ? (
                  <Folder className="h-4 w-4 text-pastel-purple" />
                ) : file.type === "note" ? (
                  <FileText className="h-4 w-4 text-pastel-green" />
                ) : (
                  <File className="h-4 w-4 text-pastel-blue" />
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
    </DashboardCard>
  );
}