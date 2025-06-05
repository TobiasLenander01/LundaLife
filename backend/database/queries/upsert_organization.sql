INSERT INTO organizations (
    name, address, latitude, longitude, stuk_id, fb_id, icon
)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (name) DO UPDATE SET
    address = COALESCE(EXCLUDED.address, organizations.address),
    latitude = COALESCE(EXCLUDED.latitude, organizations.latitude),
    longitude = COALESCE(EXCLUDED.longitude, organizations.longitude),
    stuk_id = COALESCE(EXCLUDED.stuk_id, organizations.stuk_id),
    fb_id = COALESCE(EXCLUDED.fb_id, organizations.fb_id),
    icon = COALESCE(EXCLUDED.icon, organizations.icon)
RETURNING id;
