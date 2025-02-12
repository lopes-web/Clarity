-- Remover trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Criar função para inicializar usuário
CREATE OR REPLACE FUNCTION public.initialize_user(user_id uuid, user_email text, user_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Criar perfil se não existir
    INSERT INTO public.profiles (id, email, name)
    VALUES (user_id, user_email, COALESCE(user_name, user_email))
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();

    -- Criar estatísticas se não existirem
    INSERT INTO public.user_stats (user_id, xp)
    VALUES (user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Criar função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Inicializar usuário com perfil e estatísticas
    PERFORM initialize_user(
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email)
    );
    RETURN new;
END;
$$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.initialize_user TO postgres, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO postgres, authenticated, service_role;

-- Inicializar usuários existentes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT * FROM auth.users LOOP
        PERFORM initialize_user(
            user_record.id,
            user_record.email,
            COALESCE(user_record.raw_user_meta_data->>'name', user_record.email)
        );
    END LOOP;
END;
$$;

-- Forçar atualização do cache
NOTIFY pgrst, 'reload schema'; 