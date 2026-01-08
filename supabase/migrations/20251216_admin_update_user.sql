-- Function to allow admins to update user details and roles securely
-- handling the synchronization with the 'barbeiros' table automatically.

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
    v_old_role TEXT;
    v_result JSONB;
BEGIN
    -- Check if executing user is admin
    -- This ensures that only users with 'admin' role in 'perfis' can run this,
    -- bypassing the standard RLS that might restrict updates to own profile.
    IF NOT EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem executar esta ação.';
    END IF;

    -- Get old role to decide if we need to remove from barbers
    SELECT role INTO v_old_role FROM public.perfis WHERE id = p_user_id;

    -- Update profile data in 'perfis'
    UPDATE public.perfis
    SET nome = p_nome,
        role = p_role,
        telemovel = p_telemovel
    WHERE id = p_user_id;

    -- Handle Barbeiros table sync
    -- 1. If becoming a barber (or is one), ensure record exists in 'barbeiros'
    IF (p_role IN ('barbeiro', 'barber')) THEN
        INSERT INTO public.barbeiros (id, nome, bio, disponivel)
        VALUES (p_user_id, p_nome, 'Profissional da Barbearia Dourado', true)
        ON CONFLICT (id) DO UPDATE
        SET nome = EXCLUDED.nome; -- Update name if already exists
    
    -- 2. If was barber and now is NOT, remove from 'barbeiros'
    ELSIF (v_old_role IN ('barbeiro', 'barber') AND p_role NOT IN ('barbeiro', 'barber')) THEN
        DELETE FROM public.barbeiros WHERE id = p_user_id;
    END IF;

    v_result := jsonb_build_object('success', true);
    RETURN v_result;
END;
$$;
