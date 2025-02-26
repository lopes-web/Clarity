import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Folder, Tag } from '@/lib/notes';
import * as NotesAPI from '@/lib/notes';

interface NotesState {
    notes: Note[];
    folders: Folder[];
    tags: Tag[];
    selectedNoteId: string | null;
    selectedFolderId: string | null;
    selectedTagId: string | null;
    searchQuery: string;
    isLoading: boolean;
    error: string | null;
    showArchived: boolean;
    isDarkMode: boolean;
    isFocusMode: boolean;
    autoSaveInterval: number;
    fontSize: number;
    fontFamily: string;

    // Ações
    setNotes: (notes: Note[]) => void;
    setFolders: (folders: Folder[]) => void;
    setTags: (tags: Tag[]) => void;
    setSelectedNoteId: (id: string | null) => void;
    setSelectedFolderId: (id: string | null) => void;
    setSelectedTagId: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setShowArchived: (show: boolean) => void;
    setIsDarkMode: (isDark: boolean) => void;
    setIsFocusMode: (isFocus: boolean) => void;
    setAutoSaveInterval: (interval: number) => void;
    setFontSize: (size: number) => void;
    setFontFamily: (family: string) => void;

    // Ações assíncronas
    loadNotes: (userId: string) => Promise<void>;
    loadFolders: (userId: string) => Promise<void>;
    loadTags: (userId: string) => Promise<void>;
    createNote: (userId: string, note: Pick<Note, 'title' | 'content' | 'type' | 'folder_id'>) => Promise<void>;
    updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    createFolder: (userId: string, folder: Pick<Folder, 'name' | 'description' | 'parent_id'>) => Promise<void>;
    updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
    deleteFolder: (folderId: string) => Promise<void>;
    createTag: (userId: string, tag: Pick<Tag, 'name' | 'color'>) => Promise<void>;
    updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
    deleteTag: (tagId: string) => Promise<void>;
    addTagToNote: (noteId: string, tagId: string) => Promise<void>;
    removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>()(
    persist(
        (set, get) => ({
            notes: [],
            folders: [],
            tags: [],
            selectedNoteId: null,
            selectedFolderId: null,
            selectedTagId: null,
            searchQuery: '',
            isLoading: false,
            error: null,
            showArchived: false,
            isDarkMode: false,
            isFocusMode: false,
            autoSaveInterval: 5000, // 5 segundos
            fontSize: 16,
            fontFamily: 'Times New Roman, Times, serif',

            // Ações síncronas
            setNotes: (notes) => set({ notes }),
            setFolders: (folders) => set({ folders }),
            setTags: (tags) => set({ tags }),
            setSelectedNoteId: (id) => set({ selectedNoteId: id }),
            setSelectedFolderId: (id) => set({ selectedFolderId: id }),
            setSelectedTagId: (id) => set({ selectedTagId: id }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            setShowArchived: (show) => set({ showArchived: show }),
            setIsDarkMode: (isDark) => set({ isDarkMode: isDark }),
            setIsFocusMode: (isFocus) => set({ isFocusMode: isFocus }),
            setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
            setFontSize: (size) => set({ fontSize: size }),
            setFontFamily: (family) => set({ fontFamily: family }),

            // Ações assíncronas
            loadNotes: async (userId) => {
                const state = get();
                set({ isLoading: true, error: null });
                try {
                    const notes = await NotesAPI.getNotes(userId, {
                        folderId: state.selectedFolderId || undefined,
                        tagId: state.selectedTagId || undefined,
                        searchQuery: state.searchQuery || undefined,
                        includeArchived: state.showArchived
                    });
                    set({ notes, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            loadFolders: async (userId) => {
                set({ isLoading: true, error: null });
                try {
                    const folders = await NotesAPI.getFolders(userId);
                    set({ folders, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            loadTags: async (userId) => {
                set({ isLoading: true, error: null });
                try {
                    const tags = await NotesAPI.getTags(userId);
                    set({ tags, isLoading: false });
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            createNote: async (userId, note) => {
                set({ isLoading: true, error: null });
                try {
                    const newNote = await NotesAPI.createNote(userId, note);
                    set((state) => ({
                        notes: [newNote, ...state.notes],
                        selectedNoteId: newNote.id,
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            updateNote: async (noteId, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedNote = await NotesAPI.updateNote(noteId, updates);
                    set((state) => ({
                        notes: state.notes.map((note) =>
                            note.id === noteId ? updatedNote : note
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            deleteNote: async (noteId) => {
                set({ isLoading: true, error: null });
                try {
                    await NotesAPI.deleteNote(noteId);
                    set((state) => ({
                        notes: state.notes.filter((note) => note.id !== noteId),
                        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            createFolder: async (userId, folder) => {
                set({ isLoading: true, error: null });
                try {
                    const newFolder = await NotesAPI.createFolder(userId, folder);
                    set((state) => ({
                        folders: [...state.folders, newFolder],
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            updateFolder: async (folderId, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedFolder = await NotesAPI.updateFolder(folderId, updates);
                    set((state) => ({
                        folders: state.folders.map((folder) =>
                            folder.id === folderId ? updatedFolder : folder
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            deleteFolder: async (folderId) => {
                set({ isLoading: true, error: null });
                try {
                    await NotesAPI.deleteFolder(folderId);
                    set((state) => ({
                        folders: state.folders.filter((folder) => folder.id !== folderId),
                        selectedFolderId: state.selectedFolderId === folderId ? null : state.selectedFolderId,
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            createTag: async (userId, tag) => {
                set({ isLoading: true, error: null });
                try {
                    const newTag = await NotesAPI.createTag(userId, tag);
                    set((state) => ({
                        tags: [...state.tags, newTag],
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            updateTag: async (tagId, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const updatedTag = await NotesAPI.updateTag(tagId, updates);
                    set((state) => ({
                        tags: state.tags.map((tag) =>
                            tag.id === tagId ? updatedTag : tag
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            deleteTag: async (tagId) => {
                set({ isLoading: true, error: null });
                try {
                    await NotesAPI.deleteTag(tagId);
                    set((state) => ({
                        tags: state.tags.filter((tag) => tag.id !== tagId),
                        selectedTagId: state.selectedTagId === tagId ? null : state.selectedTagId,
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            addTagToNote: async (noteId, tagId) => {
                set({ isLoading: true, error: null });
                try {
                    await NotesAPI.addTagToNote(noteId, tagId);
                    const tag = get().tags.find((t) => t.id === tagId);
                    if (tag) {
                        set((state) => ({
                            notes: state.notes.map((note) =>
                                note.id === noteId
                                    ? { ...note, tags: [...(note.tags || []), tag] }
                                    : note
                            ),
                            isLoading: false
                        }));
                    }
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            },

            removeTagFromNote: async (noteId, tagId) => {
                set({ isLoading: true, error: null });
                try {
                    await NotesAPI.removeTagFromNote(noteId, tagId);
                    set((state) => ({
                        notes: state.notes.map((note) =>
                            note.id === noteId
                                ? { ...note, tags: note.tags?.filter((t) => t.id !== tagId) }
                                : note
                        ),
                        isLoading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, isLoading: false });
                }
            }
        }),
        {
            name: 'notes-storage',
            partialize: (state) => ({
                isDarkMode: state.isDarkMode,
                isFocusMode: state.isFocusMode,
                autoSaveInterval: state.autoSaveInterval,
                fontSize: state.fontSize,
                fontFamily: state.fontFamily
            })
        }
    )
); 