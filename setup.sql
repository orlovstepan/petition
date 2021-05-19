DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
 id SERIAL PRIMARY KEY,
 first_name VARCHAR NOT NULL CHECK(first_name != ''),
 last_name VARCHAR NOT NULL CHECK(last_name != ''),
 signature VARCHAR NOT NULL CHECK(signature != ''),
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )