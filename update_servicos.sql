ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS categoria text check (categoria in ('cabelo', 'barba', 'combo')) default 'cabelo';
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS disponivel boolean default true;
