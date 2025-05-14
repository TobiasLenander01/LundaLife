DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    organization_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    image TEXT,
    link TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    name TEXT,
    price NUMERIC(10, 2),
    active BOOLEAN,
    count INTEGER,
    max_count_per_person INTEGER,

    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT unique_ticket_for_event UNIQUE (event_id, name)
);