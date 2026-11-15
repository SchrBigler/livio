BEGIN;
INSERT INTO cc_applications(id,name,enabled) VALUES('livio','BIGLER LIVIO – Insektenschutz',false) ON CONFLICT DO NOTHING;
INSERT INTO cc_product_series(id,app_id,name) VALUES('livio','livio','BIGLER LIVIO – Insektenschutz') ON CONFLICT DO NOTHING;
CREATE TABLE cc_livio_intakes (
 source_project_id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES cc_customers,
 case_id uuid NOT NULL UNIQUE REFERENCES cc_cases, draft_id uuid NOT NULL UNIQUE REFERENCES cc_drafts,
 source_revision integer NOT NULL, snapshot_hash text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE cc_livio_snapshots (
 source_project_id uuid NOT NULL REFERENCES cc_livio_intakes, source_revision integer NOT NULL,
 snapshot_hash text NOT NULL, snapshot jsonb NOT NULL, actor_id uuid NOT NULL REFERENCES cc_customers,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(source_project_id,source_revision)
);
CREATE TRIGGER cc_livio_snapshot_immutable BEFORE UPDATE OR DELETE ON cc_livio_snapshots FOR EACH ROW EXECUTE FUNCTION cc_immutable();
COMMIT;
