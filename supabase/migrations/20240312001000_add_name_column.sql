-- Add name column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN name text;
        -- Update existing rows to have a default name if needed
        UPDATE public.profiles SET name = email WHERE name IS NULL;
        -- Make the column not null after setting default values
        ALTER TABLE public.profiles ALTER COLUMN name SET NOT NULL;
    END IF;
END $$;

-- Recreate the handle_new_user function to ensure it uses the name field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema'; 