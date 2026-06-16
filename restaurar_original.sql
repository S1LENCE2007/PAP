-- ==============================================================================
-- RESTAURAR MIGRATION ORIGINAL COM CORREÇÕES (SUPABASE SQL EDITOR)
-- ==============================================================================
-- Este script reverte a base de dados para o estado original (apenas roles:
-- 'cliente', 'admin', 'barbeiro'), mas corrige as funções de criação e remoção
-- de utilizadores para que funcionem corretamente através do painel de administração.

BEGIN;

-- 1. Promover o utilizador desenvolvedor (Pedro) a 'admin' para evitar violações de constraint
UPDATE public.perfis SET role = 'admin' WHERE email = 'pedrorraposo@gmail.com';

-- 2. Alterar a constraint de cargos na tabela perfis para aceitar apenas os originais
ALTER TABLE public.perfis DROP CONSTRAINT IF EXISTS perfis_role_check;
ALTER TABLE public.perfis ADD CONSTRAINT perfis_role_check CHECK (role IN ('cliente', 'admin', 'barbeiro'));

-- 3. Atualizar a função do trigger para validar apenas o cargo 'admin'
CREATE OR REPLACE FUNCTION public.check_role_update()
RETURNS TRIGGER AS $$
BEGIN
  IF old.role IS DISTINCT FROM new.role THEN
    IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') THEN
      RAISE EXCEPTION 'Acesso negado: Apenas administradores podem alterar cargos.';
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO RPC DE CRIAÇÃO CORRIGIDA (admin_create_barber_v2)
-- Corrige a criação inserindo na tabela auth.identities para habilitar o login!
CREATE OR REPLACE FUNCTION public.admin_create_barber_v2(
    p_email text,
    p_password text,
    p_nome text,
    p_bio text,
    p_foto_url text,
    p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_editor_role text;
    v_user_id uuid;
    v_encrypted_pw text;
    v_result jsonb;
BEGIN
    -- Obter o cargo do utilizador que executa a função
    SELECT role INTO v_editor_role FROM public.perfis WHERE id = auth.uid();

    -- Check de permissão: Apenas admin pode executar
    IF v_editor_role IS NULL OR v_editor_role <> 'admin' THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem criar utilizadores.';
    END IF;

    -- Verificar se o e-mail já existe na tabela auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'Erro: Este endereço de email já está registado.';
    END IF;

    -- Criptografar a password e gerar novo ID
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));
    v_user_id := uuid_generate_v4();

    -- A. Criar utilizador na tabela auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmation_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        v_encrypted_pw,
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('nome', p_nome),
        false,
        now(),
        now(),
        ''
    );

    -- B. Criar identidade em auth.identities (CRÍTICO: Resolve o erro de login e "Database error finding user")
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', p_email),
        'email',
        now(),
        now(),
        now()
    );

    -- C. Atualizar o perfil com a role e nome
    UPDATE public.perfis
    SET role = p_role,
        nome = p_nome
    WHERE id = v_user_id;

    -- D. Se for barbeiro, insere na tabela de barbeiros
    IF (p_role = 'barbeiro') THEN
        INSERT INTO public.barbeiros (id, nome, bio, foto_url, disponivel)
        VALUES (v_user_id, p_nome, p_bio, p_foto_url, true)
        ON CONFLICT (id) DO UPDATE
        SET nome = EXCLUDED.nome,
            bio = EXCLUDED.bio,
            foto_url = EXCLUDED.foto_url;
    END IF;

    v_result := jsonb_build_object('success', true, 'user_id', v_user_id);
    RETURN v_result;
END;
$$;

-- 5. FUNÇÃO RPC DE ATUALIZAÇÃO CORRIGIDA (admin_update_user_v2)
CREATE OR REPLACE FUNCTION admin_update_user_v2(
    p_user_id UUID,
    p_nome TEXT,
    p_role TEXT,
    p_telemovel TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_editor_role TEXT;
    v_old_role TEXT;
    v_result JSONB;
BEGIN
    SELECT role INTO v_editor_role FROM public.perfis WHERE id = auth.uid();

    IF v_editor_role IS NULL OR v_editor_role <> 'admin' THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem executar esta ação.';
    END IF;

    SELECT role INTO v_old_role FROM public.perfis WHERE id = p_user_id;

    -- Atualizar os dados do utilizador na tabela 'perfis'
    UPDATE public.perfis
    SET nome = p_nome,
        role = p_role,
        telemovel = p_telemovel
    WHERE id = p_user_id;

    -- Sincronizar com a tabela 'barbeiros'
    IF (p_role = 'barbeiro') THEN
        INSERT INTO public.barbeiros (id, nome, bio, disponivel)
        VALUES (p_user_id, p_nome, 'Profissional da Barbearia Dourado', true)
        ON CONFLICT (id) DO UPDATE
        SET nome = EXCLUDED.nome;
    ELSIF (v_old_role = 'barbeiro' AND p_role <> 'barbeiro') THEN
        DELETE FROM public.barbeiros WHERE id = p_user_id;
    END IF;

    v_result := jsonb_build_object('success', true);
    RETURN v_result;
END;
$$;

-- 6. FUNÇÃO RPC DE EXCLUSÃO COMPLETA E SEGURA (admin_delete_user_v3)
-- Evita deixar utilizadores órfãos na tabela auth.users ao apagar do painel de administração
CREATE OR REPLACE FUNCTION admin_delete_user_v3(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_editor_role TEXT;
    v_result JSONB;
BEGIN
    SELECT role INTO v_editor_role FROM public.perfis WHERE id = auth.uid();

    IF v_editor_role IS NULL OR v_editor_role <> 'admin' THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem remover utilizadores.';
    END IF;

    -- Remover de todas as tabelas associadas
    DELETE FROM public.barbeiros WHERE id = p_user_id;
    DELETE FROM public.perfis WHERE id = p_user_id;
    DELETE FROM auth.users WHERE id = p_user_id;

    v_result := jsonb_build_object('success', true);
    RETURN v_result;
END;
$$;

-- 7. Limpar utilizadores órfãos ou de teste para evitar conflitos de email
DELETE FROM public.perfis WHERE email IN ('a@gmail.com', 'd@gmail.com');
DELETE FROM auth.users WHERE email IN ('a@gmail.com', 'd@gmail.com');
DELETE FROM public.perfis WHERE email LIKE 'test_temp_%' OR email LIKE 'test_dup_%';
DELETE FROM auth.users WHERE email LIKE 'test_temp_%' OR email LIKE 'test_dup_%';

COMMIT;
