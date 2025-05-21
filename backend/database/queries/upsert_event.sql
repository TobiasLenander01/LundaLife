INSERT INTO events (id, organization_id, organization_name, name, description, address, image, start_date, end_date, link)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    organization_name = EXCLUDED.organization_name,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    image = EXCLUDED.image,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    link = EXCLUDED.link
RETURNING id;