DROP TABLE IF EXISTS locations;

CREATE TABLE locations(
    id SERIAL PRIMARY KEY,
    searchedCity VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude DECIMAL(18,15),
    longitude DECIMAL(18,15)
);
