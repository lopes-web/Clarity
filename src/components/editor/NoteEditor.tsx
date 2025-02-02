import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  className?: string;
}

export function NoteEditor({ initialContent = '', onSave, className }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (onSave && content !== initialContent) {
        setIsSaving(true);
        onSave(content);
        setTimeout(() => setIsSaving(false), 1000);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [content, initialContent, onSave]);

  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
        <div className="text-sm text-muted-foreground">
          {isSaving ? 'Salvando...' : 'Salvo'}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div
          className="prose prose-sm dark:prose-invert max-w-none outline-none min-h-[calc(100vh-10rem)]"
          contentEditable
          onInput={(e) => setContent(e.currentTarget.textContent || '')}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
} 