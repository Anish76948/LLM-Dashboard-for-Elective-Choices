-- Enable RLS on all 3 tables
alter table public.students enable row level security;
alter table public.electives enable row level security;
alter table public.choices enable row level security;

-- Helper to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.students
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Electives policies: Any authenticated user can read
drop policy if exists "Authenticated users can view electives" on public.electives;
create policy "Authenticated users can view electives"
  on public.electives for select
  to authenticated
  using (true);

-- Students policies: Select own row OR all rows if admin
drop policy if exists "Students can view own profile or admin can view all" on public.students;
create policy "Students can view own profile or admin can view all"
  on public.students for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Students can update own profile" on public.students;
create policy "Students can update own profile"
  on public.students for update
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Choices policies: Students can CRUD own rows, Admins can CRUD all rows
drop policy if exists "Students can view own choices or admin can view all" on public.choices;
create policy "Students can view own choices or admin can view all"
  on public.choices for select
  to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "Students can insert own choices or admin can insert" on public.choices;
create policy "Students can insert own choices or admin can insert"
  on public.choices for insert
  to authenticated
  with check (student_id = auth.uid() or public.is_admin());

drop policy if exists "Students can update own choices or admin can update" on public.choices;
create policy "Students can update own choices or admin can update"
  on public.choices for update
  to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "Students can delete own choices or admin can delete" on public.choices;
create policy "Students can delete own choices or admin can delete"
  on public.choices for delete
  to authenticated
  using (student_id = auth.uid() or public.is_admin());
