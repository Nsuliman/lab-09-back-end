CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude numeric ,
    longitude numeric
);
