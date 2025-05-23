INSERT INTO organizations (
    name, address, latitude, longitude, stuk_id, fb_id
)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (name) DO UPDATE SET
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    stuk_id = EXCLUDED.stuk_id,
    fb_id = EXCLUDED.fb_id
RETURNING id;
