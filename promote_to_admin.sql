-- ==============================================================================
-- PROMOVER UTILIZADOR A ADMIN (MÉTODO REPLICA - SUPERSAFER)
-- ==============================================================================

-- INSTRUÇÕES:
-- 1. Substitua 'pedrorraposo@gmail.com' pelo seu email se necessário.
-- 2. Copie e execute este script no SQL Editor do Supabase.

DO $$
DECLARE
    v_email text := 'pedrorraposo@gmail.com'; -- <--- JÁ ESTÁ O SEU EMAIL
BEGIN
    -- 1. Definir modo de réplica para ignorar TODOS os triggers (incluindo system triggers) apenas nesta transação
    SET session_replication_role = 'replica';

    -- 2. Atualizar tabela de perfis 
    UPDATE public.perfis
    SET role = 'admin'
    WHERE email = v_email;

    -- 3. Atualizar metadata do utilizador
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE email = v_email;

    -- 4. Voltar ao modo normal (embora o DO block termine a sessão, é boa prática)
    SET session_replication_role = 'origin';

    IF FOUND THEN
        RAISE NOTICE 'SUCESSO: O utilizador % agora é ADMIN (Modo Replica).', v_email;
    ELSE
        RAISE NOTICE 'AVISO: Nenhum utilizador encontrado com o email %', v_email;
    END IF;
END $$;
