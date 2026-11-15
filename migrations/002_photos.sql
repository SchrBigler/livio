CREATE TABLE IF NOT EXISTS livio_photos (
 id uuid PRIMARY KEY, project_id uuid NOT NULL, owner_hash text NOT NULL,
 pathname text NOT NULL UNIQUE, original_name text NOT NULL, size_bytes integer NOT NULL,
 content_type text NOT NULL, state text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS livio_photos_project ON livio_photos(project_id);
