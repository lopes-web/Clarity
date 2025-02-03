import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Code,
  Quote,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Save,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFileSystem } from '@/hooks/useFileSystem';

interface NotionEditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  className?: string;
  currentPath?: string;
  onSave?: (path: string) => void;
}

export function NotionEditor({ content = '', onUpdate, className, currentPath, onSave }: NotionEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const { getFolders } = useFileSystem();
  const folders = getFolders();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Digite "/" para comandos ou comece a escrever...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
      
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      
      setWordCount(words);
      setCharCount(chars);
    },
  });

  if (!editor) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent default save shortcut which might trigger page reload
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  return (
    <div onKeyDownCapture={handleKeyDown} className={cn("flex flex-col w-full h-full bg-background", className)}>
      <div className="flex items-center justify-between gap-1 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('bold') && "bg-muted")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('italic') && "bg-muted")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn("p-2 h-8 w-8", editor.isActive('heading', { level: 1 }) && "bg-muted")}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn("p-2 h-8 w-8", editor.isActive('heading', { level: 2 }) && "bg-muted")}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn("p-2 h-8 w-8", editor.isActive('heading', { level: 3 }) && "bg-muted")}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('bulletList') && "bg-muted")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('orderedList') && "bg-muted")}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('taskList') && "bg-muted")}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('codeBlock') && "bg-muted")}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('blockquote') && "bg-muted")}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn("p-2 h-8 w-8", editor.isActive('highlight') && "bg-muted")}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                {currentPath || 'Selecionar pasta'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {folders.map((folder) => (
                <DropdownMenuItem 
                  key={folder.id} 
                  onClick={() => onSave?.(folder.path)}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onSave?.(currentPath || '')}
            disabled={!currentPath}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <EditorContent 
            editor={editor} 
            className="min-h-[calc(100%-4rem)] px-4 py-6"
          />
        </div>
      </div>
      <div className="flex items-center justify-end px-4 py-2 text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-4">
          <span>{wordCount} palavras</span>
          <span>{charCount} caracteres</span>
        </div>
      </div>
    </div>
  );
} 