DROP TABLE IF EXISTS location;

CREATE TABLE locations (
    id PRIMARY KEY,
    searchedCity VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude DECIMAL(18,15),
    longitude DECIMAL(18,15)
);
