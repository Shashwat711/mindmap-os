-- mindmap-os — initial schema
-- Tables split between per-user (things that follow the founder) and
-- per-workspace (things that belong to a single startup idea).

-- ============================================================================
-- Workspaces
-- ============================================================================

create table public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workspaces_user_id_idx on public.workspaces(user_id);

-- ============================================================================
-- Workspace-scoped tables
-- ============================================================================

create table public.startup_contexts (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  idea         text,
  problem      text,
  icp          text,
  stage        text,
  updated_at   timestamptz not null default now()
);

create table public.card_positions (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  agent_id     text not null,
  x            int not null,
  y            int not null,
  primary key (workspace_id, agent_id)
);

create table public.chat_messages (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id     text not null,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null default '',
  tool_calls   jsonb,
  created_at   timestamptz not null default now()
);
create index chat_messages_workspace_agent_idx
  on public.chat_messages(workspace_id, agent_id, created_at);

-- ============================================================================
-- Per-user tables (settings that follow the founder across workspaces)
-- ============================================================================

create table public.model_connectors (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  provider   text not null,
  api_key    text,
  model      text,
  updated_at timestamptz not null default now()
);

create table public.tool_keys (
  user_id    uuid references auth.users(id) on delete cascade,
  tool_id    text not null,
  api_key    text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

create table public.mcp_connections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  url        text not null,
  transport  text not null,
  enabled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index mcp_connections_user_idx on public.mcp_connections(user_id);

-- ============================================================================
-- Row Level Security — every table
-- ============================================================================

alter table public.workspaces         enable row level security;
alter table public.startup_contexts   enable row level security;
alter table public.card_positions     enable row level security;
alter table public.chat_messages      enable row level security;
alter table public.model_connectors   enable row level security;
alter table public.tool_keys          enable row level security;
alter table public.mcp_connections    enable row level security;

-- Per-user tables: user owns rows where user_id matches auth.uid()

create policy "workspaces_owner_all" on public.workspaces
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "model_connectors_owner_all" on public.model_connectors
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tool_keys_owner_all" on public.tool_keys
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mcp_connections_owner_all" on public.mcp_connections
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Workspace-scoped tables: user owns rows whose workspace they own

create policy "startup_contexts_owner_all" on public.startup_contexts
  for all using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.user_id = auth.uid()
    )
  );

create policy "card_positions_owner_all" on public.card_positions
  for all using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.user_id = auth.uid()
    )
  );

create policy "chat_messages_owner_all" on public.chat_messages
  for all using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.user_id = auth.uid()
    )
  );
