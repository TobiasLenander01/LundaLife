-- Clean up any existing tables
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS stuk_tickets;
DROP TABLE IF EXISTS stuk_events;
DROP TABLE IF EXISTS fb_events;

-- Facebook Events Table
CREATE TABLE fb_events (
    id SERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    organization_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    image TEXT,
    link TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ
);

-- STUK Events Table
CREATE TABLE stuk_events (
    id SERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    organization_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    image TEXT,
    link TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ
);

-- STUK Tickets Table
CREATE TABLE stuk_tickets (
    id SERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    name TEXT,
    price NUMERIC(10, 2),
    active BOOLEAN,
    count INTEGER,
    max_count_per_person INTEGER,
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES stuk_events(id) ON DELETE CASCADE,
    CONSTRAINT unique_ticket_for_event UNIQUE (event_id, name)
);
