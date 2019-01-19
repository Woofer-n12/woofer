DROP TABLE IF EXISTS dogs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS shelters;

CREATE TABLE dogs (
  id SERIAL PRIMARY KEY,
  dog_id VARCHAR unique,
  name VARCHAR (255),
  age VARCHAR (255),
  gender VARCHAR(255),
  size VARCHAR(255),
  availability VARCHAR(255),
  breed VARCHAR(255),
  mix VARCHAR(255),
  photos TEXT,
  description TEXT,
  shelter_id VARCHAR(255),
  housetrained VARCHAR(255),
  fixed VARCHAR(255),
  kids VARCHAR(255),
  cats VARCHAR(255),
  vaccinated VARCHAR(255)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  likes TEXT,
  views TEXT
);

CREATE TABLE shelters (
  id SERIAL PRIMARY KEY,
  shelters_id VARCHAR(255),
  name VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  zip VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255)
);