-- Remover triggers existentes
DROP TRIGGER IF EXISTS handle_updated_at ON public.disciplines;
DROP TRIGGER IF EXISTS handle_updated_at ON public.grades;
DROP TRIGGER IF EXISTS handle_updated_at ON public.events;
DROP TRIGGER IF EXISTS handle_disciplines_updated_at ON public.disciplines;
DROP TRIGGER IF EXISTS handle_grades_updated_at ON public.grades;
DROP TRIGGER IF EXISTS handle_events_updated_at ON public.events;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "Users can insert their own disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "Users can update their own disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "Users can delete their own disciplines" ON public.disciplines;

DROP POLICY IF EXISTS "Users can view grades of their disciplines" ON public.grades;
DROP POLICY IF EXISTS "Users can insert grades in their disciplines" ON public.grades;
DROP POLICY IF EXISTS "Users can update grades of their disciplines" ON public.grades;
DROP POLICY IF EXISTS "Users can delete grades of their disciplines" ON public.grades;

DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

DROP POLICY IF EXISTS "Isolate disciplines by user" ON public.disciplines;
DROP POLICY IF EXISTS "Isolate grades by discipline owner" ON public.grades;
DROP POLICY IF EXISTS "Isolate events by user" ON public.events;

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Criar políticas para disciplinas
CREATE POLICY "Isolate disciplines by user"
    ON public.disciplines
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Criar políticas para notas
-- Notas só podem ser acessadas se o usuário for dono da disciplina
CREATE POLICY "Isolate grades by discipline owner"
    ON public.grades
    USING (
        EXISTS (
            SELECT 1
            FROM public.disciplines
            WHERE disciplines.id = grades.discipline_id
            AND disciplines.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.disciplines
            WHERE disciplines.id = grades.discipline_id
            AND disciplines.user_id = auth.uid()
        )
    );

-- Criar políticas para eventos
CREATE POLICY "Isolate events by user"
    ON public.events
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Recriar triggers para updated_at
CREATE TRIGGER handle_disciplines_updated_at
    BEFORE UPDATE ON public.disciplines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar índices para melhor performance nas consultas filtradas por usuário
DROP INDEX IF EXISTS idx_disciplines_user_id;
DROP INDEX IF EXISTS idx_events_user_id;
DROP INDEX IF EXISTS idx_grades_discipline_id;

CREATE INDEX idx_disciplines_user_id ON public.disciplines(user_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_grades_discipline_id ON public.grades(discipline_id);

-- Adicionar restrições de chave estrangeira com exclusão em cascata
ALTER TABLE public.grades
    DROP CONSTRAINT IF EXISTS grades_discipline_id_fkey,
    ADD CONSTRAINT grades_discipline_id_fkey
    FOREIGN KEY (discipline_id)
    REFERENCES public.disciplines(id)
    ON DELETE CASCADE;

-- Notificar PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema'; 