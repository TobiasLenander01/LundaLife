INSERT INTO events (
    id, organization_id, name, description, address, latitude, longitude, image, start_date, end_date, link
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    image = EXCLUDED.image,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    link = EXCLUDED.link
RETURNING id;
