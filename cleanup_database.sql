-- ==============================================================================
-- LIMPEZA E CORREÇÃO DA BASE DE DADOS (SUPABASE SQL EDITOR)
-- ==============================================================================
-- Instruções:
-- 1. Copie e cole este script completo no SQL Editor do seu painel do Supabase.
-- 2. Execute o script para sincronizar a estrutura remota com as novas regras sem stock.

BEGIN;

-- 1. Remover a coluna de stock da tabela de produtos (não é mais necessária)
ALTER TABLE public.produtos DROP COLUMN IF EXISTS stock;

-- 2. Garantir que a tabela antiga 'agendamentos' é excluída (se ainda restar algum vestígio),
-- já que a tabela correta em produção é a 'Marcacoes'
DROP TABLE IF EXISTS public.agendamentos CASCADE;

-- 3. Atualizar a função handle_new_user para suportar avatar_url (caso não esteja atualizada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email, telemovel, role, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'nome',
    new.email,
    new.raw_user_meta_data->>'telemovel',
    CASE 
      WHEN new.email LIKE '%@dourado.com' THEN 'barbeiro'
      ELSE 'cliente'
    END,
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Garantir que o bucket de imagens existe e configurar as políticas RLS de Storage
-- Garante que o bucket "imagens" existe e é público para permitir exibição direta
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagens', 'imagens', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas antigas para evitar conflitos de duplicação
DROP POLICY IF EXISTS "Permitir leitura publica de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload publico de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update publico de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete publico de imagens" ON storage.objects;

-- Criar novas políticas públicas para o bucket 'imagens'
-- Isto permite que utilizadores não registados (no formulário de registo) enviem a foto de perfil
CREATE POLICY "Permitir leitura publica de imagens" ON storage.objects 
  FOR SELECT USING (bucket_id = 'imagens');

CREATE POLICY "Permitir upload publico de imagens" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'imagens');

CREATE POLICY "Permitir update publico de imagens" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'imagens');

CREATE POLICY "Permitir delete publico de imagens" ON storage.objects 
  FOR DELETE USING (bucket_id = 'imagens');

COMMIT;

-- Exibir mensagem de sucesso
SELECT 'Limpeza de base de dados efetuada com sucesso! A tabela agendamentos foi eliminada e a coluna stock foi removida de produtos.' AS resultado;
