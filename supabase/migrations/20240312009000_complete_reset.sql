-- Remover completamente todos os objetos relacionados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;
DROP TABLE IF EXISTS public.profiles;

-- Recriar a tabela profiles
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    email text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_email_key UNIQUE (email)
);

-- Configurar permissões básicas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Garantir que o service_role tem acesso total
GRANT ALL ON public.profiles TO postgres, service_role;

-- Criar políticas mais permissivas
CREATE POLICY "Permitir acesso total ao service_role"
    ON public.profiles
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir select para usuários autenticados"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Permitir insert para usuários autenticados"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir update para usuários autenticados"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Criar função para novos usuários com mais permissões
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    profile_exists boolean;
BEGIN
    -- Verificar se o perfil já existe
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = new.id
    ) INTO profile_exists;

    -- Se não existir, criar novo perfil
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (id, email, name)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'name', new.email)
        );
    END IF;

    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN new;
END;
$$;

-- Garantir permissões na função
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, authenticated, service_role;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Forçar atualização do cache
NOTIFY pgrst, 'reload schema'; 