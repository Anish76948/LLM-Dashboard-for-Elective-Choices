-- 1. Students table (links to Supabase auth.users)
create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  roll_no text not null,
  dept text not null,
  year int not null,
  gpa numeric(3, 2) default 3.5,
  career_goal text,
  interests text[] default '{}',
  completed_courses text[] default '{}',
  role text not null default 'student' check (role in ('student', 'admin'))
);

-- 2. Electives catalog
create table if not exists public.electives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  dept text not null,
  credits int not null default 3,
  capacity int not null,
  enrolled int not null default 0,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  prereqs text[] default '{}',
  description text not null,
  tags text[] default '{}',
  day text not null,
  start_time text not null,
  end_time text not null
);

-- 3. Student Choices
create table if not exists public.choices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  elective_id uuid not null references public.electives(id) on delete cascade,
  preference int not null,
  status text not null default 'pending' check (status in ('confirmed', 'waitlist', 'blocked')),
  reason text,
  created_at timestamptz not null default now(),
  unique (student_id, elective_id)
);
