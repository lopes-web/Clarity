-- Remover trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar a função handle_new_user com verificação de duplicação
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
        SELECT 1 FROM public.profiles 
        WHERE id = new.id
    ) INTO profile_exists;

    -- Só inserir se o perfil não existir
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (id, email, name)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'name', new.email)
        );
    END IF;

    -- Criar estatísticas do usuário
    INSERT INTO public.user_stats (user_id, xp)
    VALUES (new.id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
EXCEPTION
    WHEN unique_violation THEN
        -- Se ocorrer violação de unicidade, apenas retorna
        RETURN new;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN new;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forçar atualização do cache do schema
NOTIFY pgrst, 'reload schema'; 