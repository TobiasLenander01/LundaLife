INSERT INTO tickets (event_id, name, price, active, count, max_count_per_person)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (event_id, name) DO UPDATE SET -- Assuming (event_id, name) is your unique constraint for tickets
    price = EXCLUDED.price,
    active = EXCLUDED.active,
    count = EXCLUDED.count,
    max_count_per_person = EXCLUDED.max_count_per_person
RETURNING id;