DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
 id SERIAL PRIMARY KEY,
 first_name VARCHAR NOT NULL CHECK(first_name != ''),
 last_name VARCHAR NOT NULL CHECK(last_name != ''),
--  signature VARCHAR(15) NOT NULL CHECK(signature != ''),
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);