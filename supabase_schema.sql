-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto"; -- Added pgcrypto

-- 1. Tabela de Perfis (Profiles)
-- Extends the default auth.users table
create table public.perfis (
  id uuid references auth.users not null primary key,
  nome text,
  email text,
  telemovel text,
  role text check (role in ('cliente', 'admin', 'barbeiro')) default 'cliente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Perfis
alter table public.perfis enable row level security;
create policy "Public profiles are viewable by everyone." on public.perfis for select using (true);
create policy "Users can insert their own profile." on public.perfis for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.perfis for update using (auth.uid() = id);

-- 2. Tabela de Serviços (Services)
create table public.servicos (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  preco numeric not null,
  duracao integer not null, -- em minutos
  imagem_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Servicos
alter table public.servicos enable row level security;
create policy "Services are viewable by everyone." on public.servicos for select using (true);
create policy "Admins can insert services." on public.servicos for insert with check (exists (select 1 from public.perfis where id = auth.uid() and role = 'admin'));
create policy "Admins can update services." on public.servicos for update using (exists (select 1 from public.perfis where id = auth.uid() and role = 'admin'));

-- 3. Tabela de Barbeiros (Barbers)
create table public.barbeiros (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  bio text,
  foto_url text,
  disponivel boolean default true,
  user_id uuid references auth.users(id), -- Added user_id link
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Barbeiros
alter table public.barbeiros enable row level security;
create policy "Barbers are viewable by everyone." on public.barbeiros for select using (true);
create policy "Admins can manage barbers." on public.barbeiros for all using (exists (select 1 from public.perfis where id = auth.uid() and role = 'admin'));

-- 4. Tabela de Agendamentos (Appointments)
create table public.agendamentos (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.perfis(id),
  barbeiro_id uuid references public.barbeiros(id),
  servico_id uuid references public.servicos(id),
  data_hora timestamp with time zone not null,
  status text check (status in ('pendente', 'confirmado', 'cancelado')) default 'pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Agendamentos
alter table public.agendamentos enable row level security;
create policy "Users can view their own appointments." on public.agendamentos for select using (auth.uid() = cliente_id);
create policy "Admins can view all appointments." on public.agendamentos for select using (exists (select 1 from public.perfis where id = auth.uid() and role = 'admin'));
create policy "Users can insert their own appointments." on public.agendamentos for insert with check (auth.uid() = cliente_id);

-- 5. Tabela de Produtos (Products)
create table public.produtos (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  preco numeric not null,
  stock integer default 0,
  imagem_url text,
  categoria text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Produtos
alter table public.produtos enable row level security;
create policy "Products are viewable by everyone." on public.produtos for select using (true);
create policy "Admins can manage products." on public.produtos for all using (exists (select 1 from public.perfis where id = auth.uid() and role = 'admin'));

-- 6. Tabela de Avaliações (Reviews)
create table public.avaliacoes (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.perfis(id),
  nota integer check (nota >= 1 and nota <= 5),
  comentario text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Avaliacoes
alter table public.avaliacoes enable row level security;
create policy "Reviews are viewable by everyone." on public.avaliacoes for select using (true);
create policy "Users can insert their own reviews." on public.avaliacoes for insert with check (auth.uid() = cliente_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome, email, telemovel, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'nome',
    new.email,
    new.raw_user_meta_data->>'telemovel',
    case 
      when new.email like '%@dourado.com' then 'barbeiro'
      else 'cliente'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to prevent non-admins from changing roles
create or replace function public.check_role_update()
returns trigger as $$
begin
  if old.role is distinct from new.role then
    if not exists (select 1 from public.perfis where id = auth.uid() and role = 'admin') then
      raise exception 'Apenas administradores podem alterar o cargo (role).';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_role_check
  before update on public.perfis
  for each row execute procedure public.check_role_update();

-- KEY FUNCTION: Admin Create Barber
create or replace function public.admin_create_barber(
    p_email text,
    p_password text,
    p_nome text,
    p_bio text,
    p_foto_url text
)
returns void
security definer
as $$
declare
    v_user_id uuid;
    v_encrypted_pw text;
begin
    -- Check if admin
    if not exists (select 1 from public.perfis where id = auth.uid() and role = 'admin') then
        raise exception 'Apenas administradores podem criar barbeiros.';
    end if;

    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- 1. Create Identity in auth.users
    insert into auth.users (
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
    values (
        '00000000-0000-0000-0000-000000000000',
        uuid_generate_v4(),
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
    )
    returning id into v_user_id;
    
    -- 2. Insert into public.barbeiros linked to this user
    insert into public.barbeiros (nome, bio, foto_url, user_id, disponivel)
    values (p_nome, p_bio, p_foto_url, v_user_id, true);
end;
$$ language plpgsql;
