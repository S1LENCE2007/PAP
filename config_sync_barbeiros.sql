-- 1. Criar função de sincronização automática com Security Definer para ignorar RLS
create or replace function public.sync_barber_profile()
returns trigger as $$
begin
  if new.role in ('barbeiro', 'admin') then
    insert into public.barbeiros (id, nome, bio, disponivel, user_id)
    values (
      new.id, 
      new.nome, 
      case when new.role = 'admin' then 'Administrador da Barbearia' else 'Profissional da Barbearia' end, 
      true, 
      new.id
    )
    on conflict (id) do update set
      nome = excluded.nome,
      user_id = excluded.user_id;
  elsif new.role = 'cliente' then
    -- Se mudar para cliente, remove da tabela de barbeiros
    delete from public.barbeiros where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Associar trigger à tabela perfis
drop trigger if exists on_profile_sync_barber on public.perfis;
create trigger on_profile_sync_barber
  after insert or update of role, nome on public.perfis
  for each row execute procedure public.sync_barber_profile();

-- 3. Sincronizar perfis existentes de administradores e barbeiros
insert into public.barbeiros (id, nome, bio, disponivel, user_id)
select 
  id, 
  nome, 
  case when role = 'admin' then 'Administrador da Barbearia' else 'Profissional da Barbearia' end, 
  true, 
  id
from public.perfis
where role in ('barbeiro', 'admin')
on conflict (id) do update set
  nome = excluded.nome,
  user_id = excluded.user_id;
