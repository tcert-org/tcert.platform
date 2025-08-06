
create table public.membership (
  id serial primary key,
  name text not null,
  count_from integer not null,
  count_up integer not null,
  price numeric(10, 2) not null,
  created_at timestamptz default now()
);


create table public.params (
  id serial primary key,
  name text not null,
  value text not null,
  created_at timestamptz default now()
);


-- Agregar columna membership_id a users
ALTER TABLE users
ADD COLUMN membership_id INTEGER;

-- Crear la relación entre users.membership_id y membership.id
ALTER TABLE users
ADD CONSTRAINT fk_users_membership
FOREIGN KEY (membership_id) REFERENCES membership(id)
ON DELETE SET NULL;

ALTER TABLE payments
ADD COLUMN purchase_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN expiration_date TIMESTAMPTZ DEFAULT NULL;
