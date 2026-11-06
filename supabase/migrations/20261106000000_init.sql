-- =============================================================================
-- Kids Rewards · esquema inicial
-- Familias con varios padres, hijos, tareas con puntos y recompensas canjeables.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'parent' check (role in ('owner', 'parent')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

-- Un padre pertenece a una única familia (que puede compartir con otro padre).
create unique index family_members_one_family_per_user on public.family_members (user_id);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  avatar text not null default '🧒',
  color text not null default 'sky',
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text,
  points integer not null check (points between 1 and 10000),
  icon text not null default '⭐',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete set null,
  child_id uuid not null references public.children (id) on delete cascade,
  completed_by uuid references public.profiles (id) on delete set null,
  title text not null,
  icon text not null default '⭐',
  points integer not null,
  completed_at timestamptz not null default now()
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text,
  cost integer not null check (cost between 1 and 1000000),
  icon text not null default '🎁',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid references public.rewards (id) on delete set null,
  child_id uuid not null references public.children (id) on delete cascade,
  redeemed_by uuid references public.profiles (id) on delete set null,
  title text not null,
  icon text not null default '🎁',
  cost integer not null,
  redeemed_at timestamptz not null default now()
);

create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

create index children_family_idx on public.children (family_id);
create index tasks_child_idx on public.tasks (child_id);
create index completions_child_idx on public.task_completions (child_id, completed_at desc);
create index rewards_child_idx on public.rewards (child_id);
create index redemptions_child_idx on public.reward_redemptions (child_id, redeemed_at desc);
create index invites_family_idx on public.family_invites (family_id);
create index invites_email_idx on public.family_invites (lower(email));

-- -----------------------------------------------------------------------------
-- Perfil automático al registrarse
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Utilidades de permisos
-- -----------------------------------------------------------------------------

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.is_family_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members m
    where m.family_id = p_family_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.child_family_id(p_child_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.children where id = p_child_id;
$$;

create or replace function public.is_child_member(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_family_member(public.child_family_id(p_child_id));
$$;

create or replace function public.child_balance(p_child_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select (
    coalesce((select sum(points) from public.task_completions where child_id = p_child_id), 0)
    - coalesce((select sum(cost) from public.reward_redemptions where child_id = p_child_id), 0)
  )::integer;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.family_invites enable row level security;

-- profiles --------------------------------------------------------------------
create policy "profiles_select_self_or_family" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.family_members me
      join public.family_members other on other.family_id = me.family_id
      where me.user_id = auth.uid() and other.user_id = public.profiles.id
    )
  );

create policy "profiles_insert_self" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- families --------------------------------------------------------------------
create policy "families_select_members" on public.families
  for select to authenticated
  using (
    public.is_family_member(id)
    or created_by = auth.uid()
  );

create policy "families_insert_self" on public.families
  for insert to authenticated
  with check (created_by = auth.uid());

create policy "families_update_members" on public.families
  for update to authenticated
  using (public.is_family_member(id))
  with check (public.is_family_member(id));

create policy "families_delete_creator" on public.families
  for delete to authenticated
  using (created_by = auth.uid());

-- family_members --------------------------------------------------------------
create policy "family_members_select" on public.family_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_family_member(family_id));

create policy "family_members_insert_owner" on public.family_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.families f
      where f.id = family_id and f.created_by = auth.uid()
    )
  );

create policy "family_members_delete_self" on public.family_members
  for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.families f
      where f.id = family_id and f.created_by = auth.uid()
    )
  );

-- children --------------------------------------------------------------------
create policy "children_select" on public.children
  for select to authenticated
  using (public.is_family_member(family_id));

create policy "children_insert" on public.children
  for insert to authenticated
  with check (public.is_family_member(family_id));

create policy "children_update" on public.children
  for update to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy "children_delete" on public.children
  for delete to authenticated
  using (public.is_family_member(family_id));

-- tasks -----------------------------------------------------------------------
create policy "tasks_select" on public.tasks
  for select to authenticated
  using (public.is_child_member(child_id));

create policy "tasks_insert" on public.tasks
  for insert to authenticated
  with check (public.is_child_member(child_id));

create policy "tasks_update" on public.tasks
  for update to authenticated
  using (public.is_child_member(child_id))
  with check (public.is_child_member(child_id));

create policy "tasks_delete" on public.tasks
  for delete to authenticated
  using (public.is_child_member(child_id));

-- task_completions: sólo lectura. Las altas/bajas van por RPC.
create policy "task_completions_select" on public.task_completions
  for select to authenticated
  using (public.is_child_member(child_id));

-- rewards ---------------------------------------------------------------------
create policy "rewards_select" on public.rewards
  for select to authenticated
  using (public.is_child_member(child_id));

create policy "rewards_insert" on public.rewards
  for insert to authenticated
  with check (public.is_child_member(child_id));

create policy "rewards_update" on public.rewards
  for update to authenticated
  using (public.is_child_member(child_id))
  with check (public.is_child_member(child_id));

create policy "rewards_delete" on public.rewards
  for delete to authenticated
  using (public.is_child_member(child_id));

-- reward_redemptions: sólo lectura. Las altas/bajas van por RPC.
create policy "reward_redemptions_select" on public.reward_redemptions
  for select to authenticated
  using (public.is_child_member(child_id));

-- family_invites --------------------------------------------------------------
create policy "family_invites_select" on public.family_invites
  for select to authenticated
  using (
    public.is_family_member(family_id)
    or email = public.current_email()
  );

create policy "family_invites_insert" on public.family_invites
  for insert to authenticated
  with check (
    public.is_family_member(family_id)
    and invited_by = auth.uid()
  );

create policy "family_invites_delete" on public.family_invites
  for delete to authenticated
  using (public.is_family_member(family_id));

-- -----------------------------------------------------------------------------
-- RPC: operaciones sobre puntos
-- -----------------------------------------------------------------------------

create or replace function public.complete_task(p_task_id uuid)
returns table (child_id uuid, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks%rowtype;
  v_balance integer;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select * into v_task from public.tasks where id = p_task_id;
  if not found then
    raise exception 'La tarea no existe';
  end if;
  if not public.is_child_member(v_task.child_id) then
    raise exception 'No tienes permiso sobre esta tarea';
  end if;
  if not v_task.active then
    raise exception 'La tarea está archivada';
  end if;

  -- Serializa las operaciones de puntos de un mismo hijo.
  perform 1 from public.children where id = v_task.child_id for update;

  insert into public.task_completions (task_id, child_id, completed_by, title, icon, points)
  values (v_task.id, v_task.child_id, auth.uid(), v_task.title, v_task.icon, v_task.points);

  v_balance := public.child_balance(v_task.child_id);
  return query select v_task.child_id, v_balance;
end;
$$;

create or replace function public.redeem_reward(p_reward_id uuid)
returns table (child_id uuid, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reward public.rewards%rowtype;
  v_balance integer;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select * into v_reward from public.rewards where id = p_reward_id;
  if not found then
    raise exception 'La recompensa no existe';
  end if;
  if not public.is_child_member(v_reward.child_id) then
    raise exception 'No tienes permiso sobre esta recompensa';
  end if;
  if not v_reward.active then
    raise exception 'La recompensa está archivada';
  end if;

  perform 1 from public.children where id = v_reward.child_id for update;

  v_balance := public.child_balance(v_reward.child_id);
  if v_balance < v_reward.cost then
    raise exception 'No hay puntos suficientes para canjear esta recompensa';
  end if;

  insert into public.reward_redemptions (reward_id, child_id, redeemed_by, title, icon, cost)
  values (v_reward.id, v_reward.child_id, auth.uid(), v_reward.title, v_reward.icon, v_reward.cost);

  v_balance := public.child_balance(v_reward.child_id);
  return query select v_reward.child_id, v_balance;
end;
$$;

create or replace function public.undo_task_completion(p_completion_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_child_id uuid;
  v_points integer;
  v_balance integer;
begin
  select child_id, points into v_child_id, v_points
  from public.task_completions
  where id = p_completion_id;

  if v_child_id is null then
    raise exception 'El registro no existe';
  end if;
  if not public.is_child_member(v_child_id) then
    raise exception 'No tienes permiso';
  end if;

  perform 1 from public.children where id = v_child_id for update;

  v_balance := public.child_balance(v_child_id);
  if v_balance < v_points then
    raise exception 'No puedes deshacer esta tarea porque sus puntos ya se han canjeado';
  end if;

  delete from public.task_completions where id = p_completion_id;
  return v_child_id;
end;
$$;

create or replace function public.undo_reward_redemption(p_redemption_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_child_id uuid;
begin
  select child_id into v_child_id
  from public.reward_redemptions
  where id = p_redemption_id;

  if v_child_id is null then
    raise exception 'El registro no existe';
  end if;
  if not public.is_child_member(v_child_id) then
    raise exception 'No tienes permiso';
  end if;

  perform 1 from public.children where id = v_child_id for update;
  delete from public.reward_redemptions where id = p_redemption_id;
  return v_child_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: invitaciones
-- -----------------------------------------------------------------------------

create or replace function public.get_family_invite(p_token uuid)
returns table (
  family_id uuid,
  family_name text,
  invited_email text,
  inviter_email text,
  expires_at timestamptz,
  accepted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  return query
  select
    i.family_id,
    f.name,
    i.email,
    coalesce(p.email, ''),
    i.expires_at,
    i.accepted_at
  from public.family_invites i
  join public.families f on f.id = i.family_id
  left join public.profiles p on p.id = i.invited_by
  where i.token = p_token
    and i.email = public.current_email();
end;
$$;

create or replace function public.accept_family_invite(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.family_invites%rowtype;
  v_existing_family uuid;
  v_existing_members integer;
  v_existing_children integer;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select * into v_invite
  from public.family_invites
  where token = p_token
  for update;

  if not found then
    raise exception 'La invitación no existe';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'Esta invitación ya se ha utilizado';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'Esta invitación ha caducado';
  end if;
  if v_invite.email <> public.current_email() then
    raise exception 'Esta invitación es para otro correo electrónico';
  end if;

  select family_id into v_existing_family
  from public.family_members
  where user_id = auth.uid()
  limit 1;

  if v_existing_family is null then
    insert into public.family_members (family_id, user_id, role)
    values (v_invite.family_id, auth.uid(), 'parent');
  elsif v_existing_family <> v_invite.family_id then
    select count(*) into v_existing_members from public.family_members where family_id = v_existing_family;
    select count(*) into v_existing_children from public.children where family_id = v_existing_family;

    if v_existing_members = 1 and v_existing_children = 0 then
      -- El padre aún no había configurado nada: se descarta su familia vacía.
      delete from public.families where id = v_existing_family;
      insert into public.family_members (family_id, user_id, role)
      values (v_invite.family_id, auth.uid(), 'parent');
    else
      raise exception 'Ya perteneces a otra familia. Este correo no puede unirse a una segunda familia.';
    end if;
  end if;

  update public.family_invites
  set accepted_by = auth.uid(), accepted_at = now()
  where id = v_invite.id;

  return v_invite.family_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Vista de saldos
-- -----------------------------------------------------------------------------

create or replace view public.child_balances
with (security_invoker = true)
as
select
  c.id as child_id,
  (
    coalesce(t.total, 0) - coalesce(r.total, 0)
  )::integer as balance
from public.children c
left join (
  select child_id, sum(points)::integer as total
  from public.task_completions
  group by child_id
) t on t.child_id = c.id
left join (
  select child_id, sum(cost)::integer as total
  from public.reward_redemptions
  group by child_id
) r on r.child_id = c.id;

-- -----------------------------------------------------------------------------
-- Permisos
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.child_balances to authenticated;

revoke all on function public.complete_task(uuid) from public;
revoke all on function public.redeem_reward(uuid) from public;
revoke all on function public.undo_task_completion(uuid) from public;
revoke all on function public.undo_reward_redemption(uuid) from public;
revoke all on function public.get_family_invite(uuid) from public;
revoke all on function public.accept_family_invite(uuid) from public;

grant execute on function public.complete_task(uuid) to authenticated;
grant execute on function public.redeem_reward(uuid) to authenticated;
grant execute on function public.undo_task_completion(uuid) to authenticated;
grant execute on function public.undo_reward_redemption(uuid) to authenticated;
grant execute on function public.get_family_invite(uuid) to authenticated;
grant execute on function public.accept_family_invite(uuid) to authenticated;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_child_member(uuid) to authenticated;
grant execute on function public.child_family_id(uuid) to authenticated;
grant execute on function public.current_email() to authenticated;