BEGIN;
-- Transport buffer in the EXISTING LIVIO database, not a marketing/analytics database.
CREATE TABLE IF NOT EXISTS livio_marketing_outbox (
 event_id uuid PRIMARY KEY,
 consent_id uuid NOT NULL,
 event_name text NOT NULL,
 payload jsonb,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','delivered','dead')),
 attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
 delivered_at timestamptz,
 last_error text
);
CREATE INDEX IF NOT EXISTS livio_marketing_pending ON livio_marketing_outbox(status,next_attempt_at);
CREATE INDEX IF NOT EXISTS livio_marketing_consent ON livio_marketing_outbox(consent_id);
COMMIT;
