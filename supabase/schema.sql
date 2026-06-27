-- ============================================================
-- RAG Support Bot — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Tenants (one per signed-up user)
create table public.tenants (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade unique,
  name         text not null,
  api_token    text unique not null default encode(gen_random_bytes(32), 'hex'),
  bot_name     text not null default 'Support Bot',
  bot_greeting text not null default 'Hi! How can I help you today?',
  created_at   timestamptz default now()
);

-- 3. Documents uploaded by each tenant
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  filename    text not null,
  file_type   text not null,
  char_count  integer default 0,
  chunk_count integer default 0,
  status      text not null default 'processing', -- processing | ready | error
  created_at  timestamptz default now()
);

-- 4. Chunks with 384-dim embeddings (all-MiniLM-L6-v2)
create table public.document_chunks (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  content     text not null,
  embedding   vector(384),
  chunk_index integer,
  created_at  timestamptz default now()
);

-- 5. Query log (analytics)
create table public.queries (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  question    text not null,
  answer      text,
  sources     jsonb default '[]',
  confidence  float default 0,
  resolved    boolean default false,
  created_at  timestamptz default now()
);

-- 6. Vector similarity search function
create or replace function match_chunks(
  query_embedding   vector(384),
  match_tenant_id   uuid,
  match_count       int     default 5,
  similarity_threshold float default 0.25
)
returns table (
  id          uuid,
  content     text,
  similarity  float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.tenant_id = match_tenant_id
    and 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 7. HNSW index for fast ANN search
create index on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

-- 8. Row Level Security
alter table public.tenants         enable row level security;
alter table public.documents       enable row level security;
alter table public.document_chunks enable row level security;
alter table public.queries         enable row level security;

-- Tenants
create policy "own tenant select" on public.tenants
  for select using (auth.uid() = user_id);
create policy "own tenant insert" on public.tenants
  for insert with check (auth.uid() = user_id);
create policy "own tenant update" on public.tenants
  for update using (auth.uid() = user_id);

-- Documents (scoped to tenant)
create policy "own documents" on public.documents
  for all using (
    tenant_id in (select id from public.tenants where user_id = auth.uid())
  );

-- Chunks (scoped to tenant)
create policy "own chunks" on public.document_chunks
  for all using (
    tenant_id in (select id from public.tenants where user_id = auth.uid())
  );

-- Queries (read-only for dashboard; inserts done by service role)
create policy "own queries select" on public.queries
  for select using (
    tenant_id in (select id from public.tenants where user_id = auth.uid())
  );
