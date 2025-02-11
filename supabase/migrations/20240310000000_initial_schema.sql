-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Criar tabela de disciplinas
create table public.disciplines (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    professor text not null,
    credits integer not null,
    grade numeric(4,1) default 0,
    absences integer default 0,
    progress integer default 0,
    status text default 'Em dia',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de notas
create table public.grades (
    id uuid default gen_random_uuid() primary key,
    discipline_id uuid references public.disciplines on delete cascade not null,
    value numeric(4,1) not null,
    description text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adicionar RLS (Row Level Security)
alter table public.disciplines enable row level security;
alter table public.grades enable row level security;

-- Criar políticas de segurança para disciplinas
create policy "Usuários podem ver suas próprias disciplinas"
    on public.disciplines for select
    using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias disciplinas"
    on public.disciplines for insert
    with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias disciplinas"
    on public.disciplines for update
    using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias disciplinas"
    on public.disciplines for delete
    using (auth.uid() = user_id);

-- Criar políticas de segurança para notas
create policy "Usuários podem ver notas de suas disciplinas"
    on public.grades for select
    using (
        exists (
            select 1
            from public.disciplines
            where disciplines.id = grades.discipline_id
            and disciplines.user_id = auth.uid()
        )
    );

create policy "Usuários podem inserir notas em suas disciplinas"
    on public.grades for insert
    with check (
        exists (
            select 1
            from public.disciplines
            where disciplines.id = grades.discipline_id
            and disciplines.user_id = auth.uid()
        )
    );

create policy "Usuários podem atualizar notas de suas disciplinas"
    on public.grades for update
    using (
        exists (
            select 1
            from public.disciplines
            where disciplines.id = grades.discipline_id
            and disciplines.user_id = auth.uid()
        )
    );

create policy "Usuários podem deletar notas de suas disciplinas"
    on public.grades for delete
    using (
        exists (
            select 1
            from public.disciplines
            where disciplines.id = grades.discipline_id
            and disciplines.user_id = auth.uid()
        )
    );

-- Criar função para atualizar o updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Criar triggers para atualizar o updated_at
create trigger handle_updated_at
    before update on public.disciplines
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.grades
    for each row
    execute function public.handle_updated_at(); 