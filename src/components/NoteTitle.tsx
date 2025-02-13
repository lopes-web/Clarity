import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NoteTitleProps {
    title: string;
    onChange: (title: string) => void;
    className?: string;
}

export function NoteTitle({ title, onChange, className }: NoteTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTitle, setEditableTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        setEditableTitle(title);
    }, [title]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editableTitle.trim() !== '') {
            onChange(editableTitle);
        } else {
            setEditableTitle(title);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditableTitle(title);
        }
    };

    return (
        <div
            className={cn(
                'flex items-center min-w-[120px] max-w-[200px] px-2',
                className
            )}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 p-0"
                />
            ) : (
                <span
                    onDoubleClick={handleDoubleClick}
                    className="truncate cursor-pointer"
                    title={title}
                >
                    {title}
                </span>
            )}
        </div>
    );
} 