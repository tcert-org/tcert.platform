------------------------------Elliminacion de Campos  de nombres y url de diplomas----------------

ALTER TABLE users
DROP COLUMN first_name,
DROP COLUMN last_name

ALTER TABLE diplomas
drop COLUMN  diploma_url

--- Nuevos campos para logos y páginas specialmente de partners ---
alter table users
add column logo_url text null

alter table users
add column page_url text null