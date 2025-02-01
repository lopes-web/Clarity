import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DashboardCard } from './DashboardCard';
import { Button } from '../ui/button';
import { Bold, Italic, List, ListOrdered, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Note {
  id: string;
  name: string;
  content: string;
}

export function TextEditor() {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Selecione ou crie uma nota para começar...</p>',
  });

  useEffect(() => {
    const handleOpenNote = (event: CustomEvent<Note>) => {
      setCurrentNote(event.detail);
      editor?.commands.setContent(event.detail.content || '<p></p>');
    };

    window.addEventListener('openNote', handleOpenNote as EventListener);
    return () => {
      window.removeEventListener('openNote', handleOpenNote as EventListener);
    };
  }, [editor]);

  const handleSave = () => {
    if (!currentNote) {
      toast.error("Nenhuma nota selecionada!");
      return;
    }

    const content = editor?.getHTML() || '';
    const event = new CustomEvent('saveNote', {
      detail: { id: currentNote.id, content }
    });
    window.dispatchEvent(event);
  };

  if (!editor) {
    return null;
  }

  return (
    <DashboardCard title={currentNote ? `Editor - ${currentNote.name}` : "Editor de Texto"} className="flex flex-col">
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-pastel-purple/20' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-pastel-purple/20' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-pastel-purple/20' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-pastel-purple/20' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!currentNote}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="flex-1 overflow-auto prose prose-sm max-w-none" />
    </DashboardCard>
  );
}