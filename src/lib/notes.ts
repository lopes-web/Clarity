import { supabase } from './supabase';

export type NoteType = 'markdown' | 'rich_text';

export interface Folder {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    parent_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Tag {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface Note {
    id: string;
    user_id: string;
    folder_id?: string;
    title: string;
    content?: string;
    type: NoteType;
    is_pinned: boolean;
    is_archived: boolean;
    last_edited_at: string;
    created_at: string;
    updated_at: string;
    tags?: Tag[];
}

// Funções para manipular pastas
export const getFolders = async (userId: string): Promise<Folder[]> => {
    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) throw error;
    return data || [];
};

export const createFolder = async (userId: string, folder: Pick<Folder, 'name' | 'description' | 'parent_id'>): Promise<Folder> => {
    const { data, error } = await supabase
        .from('folders')
        .insert([{ user_id: userId, ...folder }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateFolder = async (folderId: string, updates: Partial<Folder>): Promise<Folder> => {
    const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', folderId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
    const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

    if (error) throw error;
};

// Funções para manipular tags
export const getTags = async (userId: string): Promise<Tag[]> => {
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) throw error;
    return data || [];
};

export const createTag = async (userId: string, tag: Pick<Tag, 'name' | 'color'>): Promise<Tag> => {
    const { data, error } = await supabase
        .from('tags')
        .insert([{ user_id: userId, ...tag }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateTag = async (tagId: string, updates: Partial<Tag>): Promise<Tag> => {
    const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', tagId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteTag = async (tagId: string): Promise<void> => {
    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

    if (error) throw error;
};

// Funções para manipular notas
export const getNotes = async (userId: string, options?: {
    folderId?: string;
    tagId?: string;
    searchQuery?: string;
    includeArchived?: boolean;
}): Promise<Note[]> => {
    let query = supabase
        .from('notes')
        .select(`
            *,
            tags (*)
        `)
        .eq('user_id', userId);

    if (options?.folderId) {
        query = query.eq('folder_id', options.folderId);
    }

    if (options?.tagId) {
        query = query.contains('tags', [{ id: options.tagId }]);
    }

    if (!options?.includeArchived) {
        query = query.eq('is_archived', false);
    }

    if (options?.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,content.ilike.%${options.searchQuery}%`);
    }

    const { data, error } = await query.order('is_pinned', { ascending: false }).order('last_edited_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const createNote = async (userId: string, note: Pick<Note, 'title' | 'content' | 'type' | 'folder_id'>): Promise<Note> => {
    const { data, error } = await supabase
        .from('notes')
        .insert([{
            user_id: userId,
            ...note,
            last_edited_at: new Date().toISOString()
        }])
        .select(`
            *,
            tags (*)
        `)
        .single();

    if (error) throw error;
    return data;
};

export const updateNote = async (noteId: string, updates: Partial<Note>): Promise<Note> => {
    const { data, error } = await supabase
        .from('notes')
        .update({
            ...updates,
            last_edited_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select(`
            *,
            tags (*)
        `)
        .single();

    if (error) throw error;
    return data;
};

export const deleteNote = async (noteId: string): Promise<void> => {
    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

    if (error) throw error;
};

// Funções para manipular tags de notas
export const addTagToNote = async (noteId: string, tagId: string): Promise<void> => {
    const { error } = await supabase
        .from('note_tags')
        .insert([{ note_id: noteId, tag_id: tagId }]);

    if (error) throw error;
};

export const removeTagFromNote = async (noteId: string, tagId: string): Promise<void> => {
    const { error } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)
        .eq('tag_id', tagId);

    if (error) throw error;
}; 