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
import Highlight from '@tiptap/extension-highlight';

export const KeyboardShortcuts = Extension.create({
    name: 'keyboard-shortcuts',

    addKeyboardShortcuts() {
        return {
            'Mod-b': () => this.editor.commands.toggleBold(),
            'Mod-i': () => this.editor.commands.toggleItalic(),
            'Mod-u': () => this.editor.commands.toggleUnderline(),
            'Mod-`': () => this.editor.commands.toggleCode(),
            'Mod-1': () => this.editor.commands.toggleHeading({ level: 1 }),
            'Mod-2': () => this.editor.commands.toggleHeading({ level: 2 }),
            'Mod-3': () => this.editor.commands.toggleHeading({ level: 3 }),
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
            'Mod-h': () => this.editor.commands.toggleHighlight(),
        };
    },
});

export const extensions = [
    StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
            HTMLAttributes: {
                1: {
                    class: 'text-4xl mb-4'
                },
                2: {
                    class: 'text-3xl mb-3'
                },
                3: {
                    class: 'text-2xl mb-2'
                }
            }
        },
        bulletList: {
            HTMLAttributes: {
                class: 'list-disc pl-6',
            },
        },
        orderedList: {
            HTMLAttributes: {
                class: 'list-decimal pl-6',
            },
        },
        blockquote: {
            HTMLAttributes: {
                class: 'border-l-2 border-primary pl-4 italic',
            },
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
    TaskList.configure({
        HTMLAttributes: {
            class: 'not-prose pl-2',
        },
    }),
    TaskItem.configure({
        nested: true,
        HTMLAttributes: {
            class: 'flex items-start gap-2 my-1',
        },
    }),
    Table.configure({
        resizable: true,
        HTMLAttributes: {
            class: 'border-collapse border border-border',
        },
    }),
    TableRow.configure({
        HTMLAttributes: {
            class: 'border border-border',
        },
    }),
    TableCell.configure({
        HTMLAttributes: {
            class: 'border border-border p-2',
        },
    }),
    TableHeader.configure({
        HTMLAttributes: {
            class: 'border border-border p-2 bg-muted',
        },
    }),
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
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
    }),
    Typography,
    FontFamily,
    Highlight.configure({
        multicolor: true,
    }),
    KeyboardShortcuts,
]; 