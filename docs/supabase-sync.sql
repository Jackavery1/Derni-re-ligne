-- Schema Supabase pour sync cloud B10 (Dernière Ligne)
-- Exécuter dans l'éditeur SQL du projet Supabase.

create table if not exists public.progression_snapshots (
    sync_id uuid primary key,
    payload jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.progression_snapshots enable row level security;

create policy "sync anon read write"
on public.progression_snapshots
for all
to anon
using (true)
with check (true);

create index if not exists progression_snapshots_updated_idx
on public.progression_snapshots (updated_at desc);
