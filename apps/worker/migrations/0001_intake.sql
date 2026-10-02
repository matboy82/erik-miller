CREATE TABLE IF NOT EXISTS intake_submissions (
  receipt_id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK (state IN ('accepted', 'processing', 'delayed', 'failed', 'delivered')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  delivered_at TEXT,
  payload_expires_at TEXT NOT NULL,
  metadata_expires_at TEXT NOT NULL,
  payload TEXT,
  error_category TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  delivery_step TEXT NOT NULL DEFAULT 'queued',
  delivery_lease_until TEXT,
  delivery_lease_token TEXT,
  external_account_id TEXT,
  external_location_id TEXT,
  external_contact_id TEXT,
  external_job_id TEXT,
  last_reconciled_at TEXT,
  last_operator_email TEXT
);

CREATE INDEX IF NOT EXISTS idx_intake_state_updated
  ON intake_submissions (state, updated_at);

CREATE INDEX IF NOT EXISTS idx_intake_payload_expires
  ON intake_submissions (payload_expires_at);

CREATE INDEX IF NOT EXISTS idx_intake_metadata_expires
  ON intake_submissions (metadata_expires_at);
