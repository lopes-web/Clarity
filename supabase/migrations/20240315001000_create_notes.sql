-- Criar enum para o tipo de nota
CREATE TYPE note_type AS ENUM ('markdown', 'rich_text');

-- Criar tabela de pastas
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de notas
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    type note_type DEFAULT 'rich_text',
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Criar tabela de relação entre notas e tags
CREATE TABLE note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (note_id, tag_id)
);

-- Criar índices
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX idx_notes_is_archived ON notes(is_archived);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Habilitar RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Folders are viewable by owner"
    ON folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Folders are insertable by owner"
    ON folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Folders are updatable by owner"
    ON folders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Folders are deletable by owner"
    ON folders FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Notes are viewable by owner"
    ON notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Notes are insertable by owner"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Notes are updatable by owner"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Notes are deletable by owner"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Tags are viewable by owner"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Tags are insertable by owner"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tags are updatable by owner"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Tags are deletable by owner"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Note tags are viewable by note owner"
    ON note_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = note_id
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Note tags are insertable by note owner"
    ON note_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = note_id
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Note tags are deletable by note owner"
    ON note_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM notes
            WHERE notes.id = note_id
            AND notes.user_id = auth.uid()
        )
    );

-- Criar funções para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Atualizar o cache do schema
NOTIFY pgrst, 'reload schema'; 