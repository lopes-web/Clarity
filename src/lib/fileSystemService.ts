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

interface Subject {
  id: string;
  name: string;
  color: string;
  folderId: string;
}

const STORAGE_KEYS = {
  FILES: 'clarity_files',
  SUBJECTS: 'clarity_subjects'
};

class FileSystemService {
  private files: FileItem[] = [];
  private subjects: Subject[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const filesData = localStorage.getItem(STORAGE_KEYS.FILES);
      const subjectsData = localStorage.getItem(STORAGE_KEYS.SUBJECTS);

      if (filesData) {
        this.files = JSON.parse(filesData);
      }

      if (subjectsData) {
        this.subjects = JSON.parse(subjectsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do armazenamento:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(this.files));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(this.subjects));
    } catch (error) {
      console.error('Erro ao salvar dados no armazenamento:', error);
    }
  }

  // Métodos para gerenciar matérias
  createSubject(name: string, color: string): Subject {
    const id = Date.now().toString();
    const folderId = `subject_${id}`;
    
    // Cria a pasta da matéria
    this.files.push({
      id: folderId,
      name,
      type: "folder",
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subjectId: id
    });

    // Cria subpastas padrão
    const subfolders = ['Anotações', 'Materiais', 'Trabalhos', 'Provas'];
    subfolders.forEach(subfolder => {
      this.files.push({
        id: `${folderId}_${subfolder.toLowerCase()}`,
        name: subfolder,
        type: "folder",
        parentId: folderId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subjectId: id
      });
    });

    // Cria a matéria
    const subject: Subject = { id, name, color, folderId };
    this.subjects.push(subject);
    
    this.saveToStorage();
    return subject;
  }

  getSubjects(): Subject[] {
    return this.subjects;
  }

  // Métodos para gerenciar arquivos
  createFile(name: string, type: "folder" | "file" | "note", parentId: string | null, content?: string): FileItem {
    const file: FileItem = {
      id: Date.now().toString(),
      name,
      type,
      parentId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.files.push(file);
    this.saveToStorage();
    return file;
  }

  updateFile(id: string, updates: Partial<FileItem>): FileItem | null {
    const index = this.files.findIndex(f => f.id === id);
    if (index === -1) return null;

    this.files[index] = {
      ...this.files[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage();
    return this.files[index];
  }

  deleteFile(id: string): boolean {
    const index = this.files.findIndex(f => f.id === id);
    if (index === -1) return false;

    // Remove o arquivo e todos os seus filhos recursivamente
    const idsToDelete = this.getFileAndChildrenIds(id);
    this.files = this.files.filter(f => !idsToDelete.includes(f.id));

    this.saveToStorage();
    return true;
  }

  private getFileAndChildrenIds(fileId: string): string[] {
    const ids = [fileId];
    const children = this.files.filter(f => f.parentId === fileId);
    children.forEach(child => {
      ids.push(...this.getFileAndChildrenIds(child.id));
    });
    return ids;
  }

  getFiles(parentId: string | null = null): FileItem[] {
    return this.files.filter(f => f.parentId === parentId);
  }

  getFile(id: string): FileItem | null {
    return this.files.find(f => f.id === id) || null;
  }

  getSubjectFiles(subjectId: string): FileItem[] {
    return this.files.filter(f => f.subjectId === subjectId);
  }

  moveFile(fileId: string, newParentId: string | null): boolean {
    const file = this.getFile(fileId);
    if (!file) return false;

    file.parentId = newParentId;
    file.updatedAt = new Date().toISOString();

    this.saveToStorage();
    return true;
  }
}

export const fileSystemService = new FileSystemService(); 