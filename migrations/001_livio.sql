BEGIN;
CREATE TABLE IF NOT EXISTS livio_projects (
 id uuid PRIMARY KEY, owner_hash text NOT NULL, revision integer NOT NULL DEFAULT 1,
 data jsonb NOT NULL, status text NOT NULL DEFAULT 'received', public_message text NOT NULL DEFAULT '',
 calculation jsonb, commerce_id text, commerce_snapshot_hash text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS livio_audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, project_id uuid NOT NULL REFERENCES livio_projects(id),
 actor text NOT NULL, action text NOT NULL, snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS livio_settings (
 key text PRIMARY KEY, value jsonb NOT NULL, updated_by text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS livio_setting_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, key text NOT NULL, value jsonb NOT NULL, actor text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
