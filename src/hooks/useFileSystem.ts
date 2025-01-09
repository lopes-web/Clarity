import { useState, useEffect } from 'react';

interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId?: string;
  path: string;
}

export function useFileSystem() {
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>(() => {
    const saved = localStorage.getItem('fileSystem');
    return saved ? JSON.parse(saved) : [
      { id: 'root', name: 'Root', type: 'folder', path: '/' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
  }, [fileSystem]);

  const createFile = (name: string, content: string = '', parentId: string = 'root') => {
    const parent = fileSystem.find(node => node.id === parentId);
    if (!parent || parent.type !== 'folder') return null;

    const newFile: FileSystemNode = {
      id: crypto.randomUUID(),
      name,
      type: 'file',
      content,
      parentId,
      path: `${parent.path}${name}`
    };

    setFileSystem(prev => [...prev, newFile]);
    return newFile;
  };

  const updateFile = (fileId: string, content: string) => {
    setFileSystem(prev => prev.map(node => 
      node.id === fileId ? { ...node, content } : node
    ));
  };

  const createFolder = (name: string, parentId: string = 'root') => {
    const parent = fileSystem.find(node => node.id === parentId);
    if (!parent || parent.type !== 'folder') return null;

    const newFolder: FileSystemNode = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      parentId,
      path: `${parent.path}${name}/`
    };

    setFileSystem(prev => [...prev, newFolder]);
    return newFolder;
  };

  const deleteNode = (nodeId: string) => {
    setFileSystem(prev => {
      const nodesToDelete = new Set<string>();
      
      const addNodeAndChildren = (id: string) => {
        nodesToDelete.add(id);
        prev.forEach(node => {
          if (node.parentId === id) {
            addNodeAndChildren(node.id);
          }
        });
      };

      addNodeAndChildren(nodeId);
      return prev.filter(node => !nodesToDelete.has(node.id));
    });
  };

  const getFolders = () => {
    return fileSystem.filter(node => node.type === 'folder');
  };

  return {
    fileSystem,
    createFile,
    updateFile,
    createFolder,
    deleteNode,
    getFolders
  };
} 