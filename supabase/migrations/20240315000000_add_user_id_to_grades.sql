-- Adicionar coluna user_id à tabela grades
ALTER TABLE grades
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Preencher user_id baseado na disciplina relacionada
UPDATE grades
SET user_id = disciplines.user_id
FROM disciplines
WHERE grades.discipline_id = disciplines.id;

-- Tornar a coluna user_id NOT NULL após preencher os dados
ALTER TABLE grades
ALTER COLUMN user_id SET NOT NULL;

-- Adicionar índice para melhorar performance de consultas
CREATE INDEX idx_grades_user_id ON grades(user_id);

-- Atualizar o cache do schema
NOTIFY pgrst, 'reload schema'; 