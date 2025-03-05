-- Migrations will appear here as you chat with AI

create table roles (
  id bigint primary key generated always as identity,
  name text not null unique
);

create table permissions (
  id bigint primary key generated always as identity,
  name text not null unique
);

create table users (
  id bigint primary key generated always as identity,
  username text not null,
  email text not null unique,
  password_hash text not null,
  role_id bigint references roles (id)
);

create table role_permissions (
  role_id bigint references roles (id),
  permission_id bigint references permissions (id),
  primary key (role_id, permission_id)
);

create table certifications (
  id bigint primary key generated always as identity,
  name text not null,
  study_material_url text
);

create table vouchers (
  id bigint primary key generated always as identity,
  code text not null unique,
  partner_id bigint references users (id),
  student_id bigint references users (id),
  certification_id bigint references certifications (id),
  purchase_date timestamp with time zone not null default now(),
  used boolean not null default false
);

create table exams (
  id bigint primary key generated always as identity,
  certification_id bigint references certifications (id),
  type text not null,
  time_limit int,
  attempts int not null default 0,
  max_attempts int not null
);

create table exam_attempts (
  id bigint primary key generated always as identity,
  exam_id bigint references exams (id),
  student_id bigint references users (id),
  attempt_date timestamp with time zone not null default now(),
  score int,
  passed boolean
);

alter table certifications
add column price numeric(10, 2) not null,
add column description text,
add column duration int;

create table sessions (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  ip_address text not null,
  device text,
  session_token text not null unique,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone
);

create table diplomas (
  id bigint primary key generated always as identity,
  exam_attempt_id bigint references exam_attempts (id),
  student_id bigint references users (id),
  certification_id bigint references certifications (id),
  completion_date timestamp with time zone not null,
  student_fullname text not null,
  diploma_url text
);

alter table users
add column fullname text;

alter table diplomas
drop student_fullname;

create table questions (
  id bigint primary key generated always as identity,
  exam_id bigint references exams (id),
  content text not null,
  correct_answer text not null
);

create table answers (
  id bigint primary key generated always as identity,
  exam_attempt_id bigint references exam_attempts (id),
  question_id bigint references questions (id),
  student_answer text,
  is_correct boolean
);

create table feedback (
  id bigint primary key generated always as identity,
  exam_attempt_id bigint references exam_attempts (id),
  correct_count int not null,
  incorrect_count int not null,
  unanswered_count int not null
);

alter table role_permissions
drop permission_id;

drop table if exists role_permissions;

drop table if exists permissions;

alter table users
add column document_number text,
add column document_type text,
add column phone_number text;

alter table users
drop username;

create table options (
  id bigint primary key generated always as identity,
  question_id bigint references questions (id),
  content text not null,
  is_correct boolean not null
);

alter table answers
drop student_answer,
add column selected_option_id bigint references options (id);

alter table answers
drop is_correct;

alter table questions
drop correct_answer;

alter table exams
rename column type to simulator;

alter table exams
alter column simulator type boolean using simulator::boolean;

alter table vouchers
add column status text;

create table voucher_statuses (
  id bigint primary key generated always as identity,
  name text not null
);

alter table vouchers
add column status_id bigint references voucher_statuses (id);

alter table vouchers
drop status;

create table student_info (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  document_number text,
  document_type text,
  phone_number text,
  address text
);

create table company_info (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  company_name text,
  company_address text,
  contact_number text
);

alter table users
add column student_info_id bigint references student_info (id),
add column company_info_id bigint references company_info (id);

alter table users
drop document_number,
drop document_type,
drop phone_number;

alter table users
drop fullname;

alter table student_info
drop address;

alter table users
alter column role_id
set not null;

alter table vouchers
alter column student_id
set not null;

alter table users
drop constraint if exists users_student_info_id_fkey;

drop table if exists student_info;

create table students (
  id bigint primary key generated always as identity,
  voucher_id bigint references vouchers (id),
  fullname text,
  document_number text,
  document_type text,
  email text not null,
  unique (email)
);

alter table vouchers
alter column student_id
drop not null;

alter table students
drop constraint if exists students_email_key;

alter table users
drop if exists student_info_id;

alter table students
alter column email
drop not null;

alter table exam_attempts
add column voucher_id bigint references vouchers (id);

alter table users
drop if exists company_info_id;

alter table users
add column company_name text,
add column company_address text,
add column contact_number text;

alter table certifications
add column expiration_period_months int;

alter table vouchers
add column expiration_date timestamptz;

alter table diplomas
add column expiration_date timestamptz;

alter table vouchers
drop if exists used;

drop table if exists company_info;

alter table vouchers
add column email text;

alter table vouchers
add column used boolean default false;

create view partner_voucher_counts as
select
  u.id as partner_id,
  u.email as partner_email,
  count(v.id) filter (
    where
      v.used = true
  ) as used_vouchers,
  count(v.id) filter (
    where
      v.used = false
  ) as unused_vouchers
from
  users u
  join vouchers v on u.id = v.partner_id
where
  u.role_id = (
    select
      id
    from
      roles
    where
      name = 'partner'
  )
group by
  u.id,
  u.email;

drop view if exists partner_voucher_counts;

create view partner_voucher_counts as
select
  u.id as partner_id,
  count(v.id) filter (
    where
      v.used = true
  ) as used_vouchers,
  count(v.id) filter (
    where
      v.used = false
  ) as unused_vouchers
from
  users u
  join vouchers v on u.id = v.partner_id
where
  u.role_id = (
    select
      id
    from
      roles
    where
      name = 'partner'
  )
group by
  u.id;