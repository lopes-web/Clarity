-- Adicionar a coluna name
ALTER TABLE public.profiles ADD COLUMN name text;

-- Atualizar registros existentes (se houver)
UPDATE public.profiles SET name = email WHERE name IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE public.profiles ALTER COLUMN name SET NOT NULL;

-- Atualizar a função que cria novos perfis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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