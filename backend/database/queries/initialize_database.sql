DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS organizations;

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    stuk_id BIGINT,
    fb_id BIGINT
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image TEXT,
    link TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,

    CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT unique_event_org_start UNIQUE (organization_id, start_date)
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    name TEXT,
    price NUMERIC(10, 2),
    active BOOLEAN,
    count INTEGER,
    max_count_per_person INTEGER,

    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT unique_ticket_for_event UNIQUE (event_id, name)
);