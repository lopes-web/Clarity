import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Folder, 
  File, 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  ArrowLeft,
  Search,
  Grid2X2,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Inicializa o cliente Supabase
const supabase = createClient(
  'https://izqelseltfxammgvipyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cWVsc2VsdGZ4YW1tZ3ZpcHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjQzOTMsImV4cCI6MjA1MjAwMDM5M30.up7WCOiCwoBZTkuYQnNvjOrjDA0LYjE0lN6wWHyaJ0Y'
);

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'note';
  size?: number;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  path: string;
  owner_id: string;
}

export function FilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newItemDialog, setNewItemDialog] = useState({
    isOpen: false,
    type: 'folder' as 'folder' | 'file' | 'note',
    name: ''
  });

  // Carrega os arquivos do Supabase
  useEffect(() => {
    loadFiles();
  }, [currentFolder, searchQuery]);

  async function loadFiles() {
    try {
      let query = supabase
        .from('files')
        .select('*')
        .eq('owner_id', user?.id);

      if (currentFolder) {
        query = query.eq('parent_id', currentFolder);
      } else {
        query = query.is('parent_id', null);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos');
    }
  }

  // Obtém o caminho de breadcrumbs
  async function getBreadcrumbs(folderId: string | null): Promise<string[]> {
    const path = ['Root'];
    
    if (!folderId) return path;

    try {
      let currentId = folderId;
      while (currentId) {
        const { data, error } = await supabase
          .from('files')
          .select('name, parent_id')
          .eq('id', currentId)
          .eq('owner_id', user?.id)
          .single();

        if (error) throw error;
        if (!data) break;

        path.unshift(data.name);
        currentId = data.parent_id;
      }
    } catch (error) {
      console.error('Erro ao carregar breadcrumbs:', error);
    }

    return path;
  }

  // Cria novo item (pasta/arquivo/nota)
  async function handleCreateItem() {
    if (!newItemDialog.name) return;

    try {
      const newItem = {
        name: newItemDialog.name,
        type: newItemDialog.type,
        parent_id: currentFolder,
        path: `/${newItemDialog.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: user?.id
      };

      const { error } = await supabase
        .from('files')
        .insert([newItem]);

      if (error) throw error;

      toast.success(`${newItemDialog.type === 'folder' ? 'Pasta' : 'Arquivo'} criado com sucesso!`);
      loadFiles();
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar item');
    } finally {
      setNewItemDialog({ isOpen: false, type: 'folder', name: '' });
    }
  }

  // Upload de arquivo
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload do arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(`${user?.id}/${currentFolder || 'root'}/${file.name}`, file);

      if (uploadError) throw uploadError;

      // Cria registro na tabela de arquivos
      const { error: dbError } = await supabase
        .from('files')
        .insert([{
          name: file.name,
          type: 'file',
          size: file.size,
          parent_id: currentFolder,
          path: uploadData.path,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: user?.id
        }]);

      if (dbError) throw dbError;

      toast.success('Arquivo enviado com sucesso!');
      loadFiles();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  }

  // Delete item
  async function handleDeleteItem(id: string, type: string) {
    try {
      if (type === 'file') {
        // Deleta o arquivo do storage
        const file = files.find(f => f.id === id);
        if (file) {
          const { error: storageError } = await supabase.storage
            .from('files')
            .remove([file.path]);

          if (storageError) throw storageError;
        }
      }

      // Deleta o registro do banco
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
      loadFiles();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir item');
    }
  }

  // Função para download de arquivo
  async function handleDownload(file: FileItem) {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.path);

      if (error) throw error;

      // Cria um URL temporário para download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo');
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciador de Arquivos</h1>
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
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {currentFolder && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentFolder(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
        
        <Dialog open={newItemDialog.isOpen} onOpenChange={(open) => setNewItemDialog(prev => ({ ...prev, isOpen: open }))}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Item</DialogTitle>
              <DialogDescription>
                Escolha o tipo e nome do item que deseja criar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome do item"
                value={newItemDialog.name}
                onChange={(e) => setNewItemDialog(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button
                  variant={newItemDialog.type === "folder" ? "default" : "outline"}
                  onClick={() => setNewItemDialog(prev => ({ ...prev, type: 'folder' }))}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Pasta
                </Button>
                <Button
                  variant={newItemDialog.type === "file" ? "default" : "outline"}
                  onClick={() => setNewItemDialog(prev => ({ ...prev, type: 'file' }))}
                >
                  <File className="h-4 w-4 mr-2" />
                  Arquivo
                </Button>
                <Button
                  variant={newItemDialog.type === "note" ? "default" : "outline"}
                  onClick={() => setNewItemDialog(prev => ({ ...prev, type: 'note' }))}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Nota
                </Button>
              </div>
              <Button onClick={handleCreateItem} className="w-full">
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={() => document.getElementById('fileUpload')?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
          <input
            id="fileUpload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </Button>
      </div>

      {/* Files Grid/List */}
      <div className={cn(
        "gap-4",
        isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-2"
      )}>
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group relative rounded-lg border p-3 hover:bg-accent",
              isGridView ? "flex flex-col items-center space-y-2" : "flex items-center justify-between"
            )}
          >
            <button
              onClick={() => file.type === 'folder' ? setCurrentFolder(file.id) : null}
              className="flex items-center gap-2"
            >
              {file.type === 'folder' ? (
                <Folder className="h-6 w-6 text-blue-500" />
              ) : file.type === 'note' ? (
                <FileText className="h-6 w-6 text-green-500" />
              ) : (
                <File className="h-6 w-6 text-gray-500" />
              )}
              <span className="font-medium">{file.name}</span>
            </button>

            <div className={cn(
              "flex items-center gap-2",
              isGridView ? "opacity-0 group-hover:opacity-100" : ""
            )}>
              {file.type === 'file' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteItem(file.id, file.type)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 