create type public.workspace_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.project_status as enum ('planning', 'active', 'on_hold', 'completed', 'archived');
create type public.task_status as enum ('backlog', 'todo', 'in_progress', 'in_review', 'done');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  date_format text not null default 'MMM d, yyyy',
  timezone text not null default 'UTC',
  email_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 500),
  logo_url text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role public.workspace_role not null default 'member' check (role <> 'owner'),
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '' check (char_length(description) <= 5000),
  color text not null default '#635bff',
  cover_image_url text,
  status public.project_status not null default 'planning',
  priority public.task_priority not null default 'medium',
  start_date date,
  due_date date,
  archived_at timestamptz,
  archived_from_status public.project_status,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id),
  check (due_date is null or start_date is null or due_date >= start_date)
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 10000),
  status public.task_status not null default 'backlog',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  start_date date,
  due_date date,
  position numeric not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id),
  foreign key (project_id, workspace_id) references public.projects(id, workspace_id) on delete cascade,
  check (due_date is null or start_date is null or due_date >= start_date)
);

create table public.task_labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null default '#8b90a0',
  created_at timestamptz not null default now(),
  unique (workspace_id, name),
  unique (id, workspace_id)
);

create table public.task_label_links (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.task_labels(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  primary key (task_id, label_id),
  foreign key (task_id, workspace_id) references public.tasks(id, workspace_id) on delete cascade,
  foreign key (label_id, workspace_id) references public.task_labels(id, workspace_id) on delete cascade
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null,
  author_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (task_id, workspace_id) references public.tasks(id, workspace_id) on delete cascade
);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  storage_path text not null unique,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now(),
  foreign key (task_id, workspace_id) references public.tasks(id, workspace_id) on delete cascade
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  type text not null check (type in ('task_assigned', 'task_updated', 'task_commented', 'project_invitation', 'workspace_invitation', 'deadline_approaching')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 1000),
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null check (entity_type in ('workspace', 'project', 'task', 'member')),
  entity_id uuid,
  action text not null check (char_length(action) between 1 and 80),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index workspace_members_user_idx on public.workspace_members(user_id, workspace_id);
create index invitations_email_idx on public.workspace_invitations(lower(email), expires_at) where accepted_at is null;
create index projects_workspace_status_idx on public.projects(workspace_id, status, updated_at desc);
create index tasks_workspace_status_idx on public.tasks(workspace_id, status, position);
create index tasks_project_status_idx on public.tasks(project_id, status, position);
create index tasks_assignee_due_idx on public.tasks(assignee_id, due_date) where assignee_id is not null;
create index tasks_workspace_due_idx on public.tasks(workspace_id, due_date) where due_date is not null;
create index comments_task_created_idx on public.task_comments(task_id, created_at);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index activity_workspace_created_idx on public.activity_logs(workspace_id, created_at desc);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger preferences_updated_at before update on public.user_preferences for each row execute function public.set_updated_at();
create trigger workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger comments_updated_at before update on public.task_comments for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.create_workspace(workspace_name text, workspace_description text default '')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_workspace_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(workspace_name)) not between 2 and 80 then
    raise exception 'Workspace name must be between 2 and 80 characters';
  end if;
  insert into public.workspaces (name, description, created_by)
  values (trim(workspace_name), coalesce(workspace_description, ''), auth.uid())
  returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, auth.uid(), 'owner');
  return new_workspace_id;
end;
$$;

create or replace function public.accept_workspace_invitation(invitation_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.workspace_invitations%rowtype;
  signed_in_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if invitation_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invitation is invalid or expired';
  end if;
  signed_in_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  select * into invitation
  from public.workspace_invitations
  where token_hash = invitation_token_hash
    and lower(email) = signed_in_email
    and accepted_at is null
    and expires_at > now()
  for update;
  if not found then
    raise exception 'Invitation is invalid or expired';
  end if;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (invitation.workspace_id, auth.uid(), invitation.role)
  on conflict (workspace_id, user_id) do nothing;
  update public.workspace_invitations set accepted_at = now() where id = invitation.id;
  return invitation.workspace_id;
end;
$$;

create or replace function public.has_workspace_access(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create or replace function public.ensure_task_assignee_is_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assignee_id is not null and not exists (
    select 1 from public.workspace_members
    where workspace_id = new.workspace_id and user_id = new.assignee_id
  ) then
    raise exception 'Task assignee must be a workspace member';
  end if;
  return new;
end;
$$;

create trigger tasks_validate_assignee before insert or update of assignee_id, workspace_id on public.tasks
for each row execute function public.ensure_task_assignee_is_member();

create or replace function public.keep_workspace_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owners_left integer;
begin
  if old.role = 'owner'
    and (tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.role <> 'owner'))
    and exists (select 1 from public.workspaces where id = old.workspace_id) then
    select count(*) into owners_left
    from public.workspace_members
    where workspace_id = old.workspace_id and role = 'owner' and user_id <> old.user_id;
    if owners_left = 0 then
      raise exception 'A workspace must retain at least one owner';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger workspace_members_keep_owner before update or delete on public.workspace_members
for each row execute function public.keep_workspace_owner();

create or replace function public.log_project_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
    values (new.workspace_id, auth.uid(), 'project', new.id, 'created project', jsonb_build_object('name', new.name));
    return new;
  elsif tg_op = 'UPDATE' then
    if (new.name, new.status, new.priority, new.due_date) is distinct from (old.name, old.status, old.priority, old.due_date) then
      insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
      values (new.workspace_id, auth.uid(), 'project', new.id, 'updated project', jsonb_build_object('name', new.name, 'status', new.status));
    end if;
    return new;
  else
    insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
    values (old.workspace_id, auth.uid(), 'project', old.id, 'deleted project', jsonb_build_object('name', old.name));
    return old;
  end if;
end;
$$;

create trigger projects_activity after insert or update or delete on public.projects
for each row execute function public.log_project_activity();

create or replace function public.log_task_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
    values (new.workspace_id, auth.uid(), 'task', new.id, 'created task', jsonb_build_object('title', new.title));
    if new.assignee_id is not null and new.assignee_id <> auth.uid() then
      insert into public.notifications (user_id, workspace_id, type, title, body, href)
      values (new.assignee_id, new.workspace_id, 'task_assigned', 'A task was assigned to you', new.title, '/app/' || new.workspace_id || '/tasks/' || new.id);
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if new.assignee_id is distinct from old.assignee_id and new.assignee_id is not null and new.assignee_id <> auth.uid() then
      insert into public.notifications (user_id, workspace_id, type, title, body, href)
      values (new.assignee_id, new.workspace_id, 'task_assigned', 'A task was assigned to you', new.title, '/app/' || new.workspace_id || '/tasks/' || new.id);
    end if;
    if (new.title, new.status, new.priority, new.assignee_id, new.due_date) is distinct from (old.title, old.status, old.priority, old.assignee_id, old.due_date) then
      insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
      values (new.workspace_id, auth.uid(), 'task', new.id, 'updated task', jsonb_build_object('title', new.title, 'status', new.status));
      if new.assignee_id is not null and new.assignee_id <> auth.uid() then
        insert into public.notifications (user_id, workspace_id, type, title, body, href)
        values (new.assignee_id, new.workspace_id, 'task_updated', 'A task you own was updated', new.title, '/app/' || new.workspace_id || '/tasks/' || new.id);
      end if;
    end if;
    return new;
  else
    insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
    values (old.workspace_id, auth.uid(), 'task', old.id, 'deleted task', jsonb_build_object('title', old.title));
    return old;
  end if;
end;
$$;

create trigger tasks_activity after insert or update or delete on public.tasks
for each row execute function public.log_task_activity();

create or replace function public.notify_task_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  task_row public.tasks%rowtype;
  recipient_id uuid;
begin
  select * into task_row from public.tasks where id = new.task_id;
  for recipient_id in
    select distinct recipient.user_id from unnest(array[task_row.created_by, task_row.assignee_id]) as recipient(user_id)
    where recipient.user_id is not null and recipient.user_id <> new.author_id
  loop
    insert into public.notifications (user_id, workspace_id, type, title, body, href)
    values (recipient_id, new.workspace_id, 'task_commented', 'New comment on a task', left(new.body, 160), '/app/' || new.workspace_id || '/tasks/' || new.task_id);
  end loop;
  insert into public.activity_logs (workspace_id, actor_id, entity_type, entity_id, action, details)
  values (new.workspace_id, new.author_id, 'task', new.task_id, 'commented on task', '{}'::jsonb);
  return new;
end;
$$;

create trigger task_comment_activity after insert on public.task_comments
for each row execute function public.notify_task_comment();

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid() and role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;
alter table public.task_label_links enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "Profiles are visible to self and teammates" on public.profiles for select to authenticated
using (id = (select auth.uid()) or exists (
  select 1 from public.workspace_members mine
  join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
  where mine.user_id = (select auth.uid()) and theirs.user_id = profiles.id
));
create policy "Users update own profile" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Users read own preferences" on public.user_preferences for select to authenticated
using (user_id = (select auth.uid()));
create policy "Users manage own preferences" on public.user_preferences for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Members read workspaces" on public.workspaces for select to authenticated
using (public.has_workspace_access(id));
create policy "Workspace admins update workspace" on public.workspaces for update to authenticated
using (public.has_workspace_role(id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(id, array['owner', 'admin']::public.workspace_role[]));
create policy "Workspace owners delete workspace" on public.workspaces for delete to authenticated
using (public.has_workspace_role(id, array['owner']::public.workspace_role[]));

create policy "Members read workspace members" on public.workspace_members for select to authenticated
using (public.has_workspace_access(workspace_id));
create policy "Admins add workspace members" on public.workspace_members for insert to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[])
  or (
    role <> 'owner'
    and public.has_workspace_role(workspace_id, array['admin']::public.workspace_role[])
  )
);
create policy "Admins update workspace members" on public.workspace_members for update to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]))
with check (
  public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[])
  or (
    role <> 'owner'
    and public.has_workspace_role(workspace_id, array['admin']::public.workspace_role[])
  )
);
create policy "Admins remove workspace members" on public.workspace_members for delete to authenticated
using (
  user_id = (select auth.uid())
  or public.has_workspace_role(workspace_id, array['owner']::public.workspace_role[])
  or (
    role <> 'owner'
    and public.has_workspace_role(workspace_id, array['admin']::public.workspace_role[])
  )
);

create policy "Admins manage invitations" on public.workspace_invitations for all to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "Workspace members read projects" on public.projects for select to authenticated
using (public.has_workspace_access(workspace_id));
create policy "Editors create projects" on public.projects for insert to authenticated
with check (created_by = (select auth.uid()) and public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Editors update projects" on public.projects for update to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Admins delete projects" on public.projects for delete to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));
create policy "Members read project members" on public.project_members for select to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and public.has_workspace_access(p.workspace_id)));
create policy "Admins manage project members" on public.project_members for all to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and public.has_workspace_role(p.workspace_id, array['owner', 'admin']::public.workspace_role[])))
with check (exists (select 1 from public.projects p where p.id = project_id and public.has_workspace_role(p.workspace_id, array['owner', 'admin']::public.workspace_role[])));

create policy "Workspace members read tasks" on public.tasks for select to authenticated
using (public.has_workspace_access(workspace_id));
create policy "Editors create tasks" on public.tasks for insert to authenticated
with check (created_by = (select auth.uid()) and public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Editors update tasks" on public.tasks for update to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Admins or task creator delete tasks" on public.tasks for delete to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]) or created_by = (select auth.uid()));

create policy "Members read labels" on public.task_labels for select to authenticated using (public.has_workspace_access(workspace_id));
create policy "Editors manage labels" on public.task_labels for all to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Members read task labels" on public.task_label_links for select to authenticated using (public.has_workspace_access(workspace_id));
create policy "Editors manage task labels" on public.task_label_links for all to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));

create policy "Members read comments" on public.task_comments for select to authenticated using (public.has_workspace_access(workspace_id));
create policy "Editors create comments" on public.task_comments for insert to authenticated
with check (author_id = (select auth.uid()) and public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Authors edit comments" on public.task_comments for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Authors or admins delete comments" on public.task_comments for delete to authenticated
using (author_id = (select auth.uid()) or public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "Members read attachments" on public.task_attachments for select to authenticated using (public.has_workspace_access(workspace_id));
create policy "Editors upload attachments" on public.task_attachments for insert to authenticated
with check (uploaded_by = (select auth.uid()) and public.has_workspace_role(workspace_id, array['owner', 'admin', 'member']::public.workspace_role[]));
create policy "Uploader or admins delete attachments" on public.task_attachments for delete to authenticated
using (uploaded_by = (select auth.uid()) or public.has_workspace_role(workspace_id, array['owner', 'admin']::public.workspace_role[]));

create policy "Users read own notifications" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "Users mark own notifications read" on public.notifications for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Workspace members read activity" on public.activity_logs for select to authenticated using (public.has_workspace_access(workspace_id));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projectflow-files', 'projectflow-files', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('projectflow-avatars', 'projectflow-avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Workspace members access workspace files" on storage.objects for select to authenticated
using (
  bucket_id = 'projectflow-files'
  and public.has_workspace_access(((storage.foldername(name))[1])::uuid)
);
create policy "Workspace editors upload files" on storage.objects for insert to authenticated
with check (
  bucket_id = 'projectflow-files'
  and public.has_workspace_role(((storage.foldername(name))[1])::uuid, array['owner', 'admin', 'member']::public.workspace_role[])
);
create policy "Workspace editors delete files" on storage.objects for delete to authenticated
using (
  bucket_id = 'projectflow-files'
  and public.has_workspace_role(((storage.foldername(name))[1])::uuid, array['owner', 'admin', 'member']::public.workspace_role[])
);
create policy "Public can read avatars" on storage.objects for select to anon, authenticated
using (bucket_id = 'projectflow-avatars');
create policy "Users upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'projectflow-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update own avatar" on storage.objects for update to authenticated
using (bucket_id = 'projectflow-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'projectflow-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'projectflow-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant execute on function public.create_workspace(text, text) to authenticated;
grant execute on function public.accept_workspace_invitation(text) to authenticated;
grant execute on function public.has_workspace_access(uuid) to authenticated;
grant execute on function public.has_workspace_role(uuid, public.workspace_role[]) to authenticated;
revoke all on function public.create_workspace(text, text) from public, anon;
revoke all on function public.accept_workspace_invitation(text) from public, anon;
revoke all on function public.has_workspace_access(uuid) from public, anon;
revoke all on function public.has_workspace_role(uuid, public.workspace_role[]) from public, anon;
