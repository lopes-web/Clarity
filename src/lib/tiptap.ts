import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import FontFamily from '@tiptap/extension-font-family';

export const KeyboardShortcuts = Extension.create({
    name: 'keyboard-shortcuts',

    addKeyboardShortcuts() {
        return {
            'Mod-b': () => this.editor.commands.toggleBold(),
            'Mod-i': () => this.editor.commands.toggleItalic(),
            'Mod-u': () => this.editor.commands.toggleUnderline(),
            'Mod-`': () => this.editor.commands.toggleCode(),
            'Mod-Alt-0': () => this.editor.commands.setParagraph(),
            'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
            'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
            'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
            'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
            'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
            'Mod-Shift-9': () => this.editor.commands.toggleTaskList(),
            'Mod-k': () => {
                const url = window.prompt('URL do link:');
                if (url) {
                    this.editor.commands.setLink({ href: url });
                }
                return true;
            },
        };
    },
});

export const extensions = [
    StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        },
    }),
    Placeholder.configure({
        placeholder: 'Digite sua anotação aqui...',
    }),
    Link.configure({
        openOnClick: true,
        HTMLAttributes: {
            class: 'text-primary underline',
        },
    }),
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
    Table.configure({
        resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    Image.configure({
        HTMLAttributes: {
            class: 'rounded-lg max-w-full',
        },
    }),
    TextStyle,
    Color,
    Underline,
    Subscript,
    Superscript,
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Typography,
    FontFamily,
    KeyboardShortcuts,
]; 