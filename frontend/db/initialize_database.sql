DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS organizations;

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    stuk_id BIGINT,
    fb_id BIGINT,
    icon TEXT
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