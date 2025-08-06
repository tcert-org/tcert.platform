------------------------------Elliminacion de Campos  de nombres y url de diplomas----------------

ALTER TABLE users
DROP COLUMN first_name,
DROP COLUMN last_name

ALTER TABLE diplomas
drop COLUMN  diploma_url