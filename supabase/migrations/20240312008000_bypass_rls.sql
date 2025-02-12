-- Recriar a função handle_new_user com bypass de RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Usar uma função auxiliar para inserir o perfil
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email)
    );
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro para debug
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN new;
END;
$$;

-- Garantir que a função tem as permissões corretas
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forçar atualização do cache do schema
NOTIFY pgrst, 'reload schema'; 