INSERT INTO events (
    organization_id, name, description, address, latitude, longitude, image, start_date, end_date, link
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (organization_id, start_date) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    image = EXCLUDED.image,
    end_date = EXCLUDED.end_date,
    link = EXCLUDED.link
RETURNING id;
