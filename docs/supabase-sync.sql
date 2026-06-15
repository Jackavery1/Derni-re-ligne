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

-- Classement global B10 (scores publics par mode / biome)
create table if not exists public.leaderboard_entries (
    id bigint generated always as identity primary key,
    sync_id uuid not null,
    pseudo text not null default 'Joueur',
    mode text not null,
    biome text not null,
    score bigint not null default 0,
    sprint_ms int,
    niveau int not null default 1,
    created_at timestamptz not null default now()
);

alter table public.leaderboard_entries enable row level security;

create policy "leaderboard anon read write"
on public.leaderboard_entries
for all
to anon
using (true)
with check (true);

create index if not exists leaderboard_mode_biome_score_idx
on public.leaderboard_entries (mode, biome, score desc);

create index if not exists leaderboard_mode_biome_sprint_idx
on public.leaderboard_entries (mode, biome, sprint_ms asc);
