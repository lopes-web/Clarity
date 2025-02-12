-- Remover objetos existentes se existirem
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.grades;
DROP TABLE IF EXISTS public.disciplines;
DROP TABLE IF EXISTS public.profiles;

-- Criar tabela de perfis
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de disciplinas
CREATE TABLE public.disciplines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    professor text NOT NULL,
    credits integer NOT NULL,
    grade numeric(4,1) DEFAULT 0,
    absences integer DEFAULT 0,
    progress integer DEFAULT 0,
    status text DEFAULT 'Em dia',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de notas
CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    discipline_id uuid REFERENCES public.disciplines ON DELETE CASCADE NOT NULL,
    value numeric(4,1) NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile."
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para disciplines
CREATE POLICY "Users can view their own disciplines."
    ON public.disciplines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disciplines."
    ON public.disciplines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disciplines."
    ON public.disciplines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disciplines."
    ON public.disciplines FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para grades
CREATE POLICY "Users can view grades of their disciplines."
    ON public.grades FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.disciplines
            WHERE disciplines.id = grades.discipline_id
            AND disciplines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert grades in their disciplines."
    ON public.grades FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.disciplines
            WHERE disciplines.id = grades.discipline_id
            AND disciplines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update grades of their disciplines."
    ON public.grades FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.disciplines
            WHERE disciplines.id = grades.discipline_id
            AND disciplines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete grades of their disciplines."
    ON public.grades FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.disciplines
            WHERE disciplines.id = grades.discipline_id
            AND disciplines.user_id = auth.uid()
        )
    );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Triggers para updated_at
CREATE TRIGGER handle_disciplines_updated_at
    BEFORE UPDATE ON public.disciplines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil de novo usuário
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email)
    );
    RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forçar atualização do cache do schema
NOTIFY pgrst, 'reload schema'; 