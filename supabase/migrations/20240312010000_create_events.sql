-- Criar tabela de eventos
CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    title text NOT NULL,
    date timestamp with time zone NOT NULL,
    type text NOT NULL,
    description text,
    disciplina text,
    completed boolean DEFAULT false,
    google_event_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view their own events"
    ON public.events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
    ON public.events FOR DELETE
    USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Notificar PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema'; 