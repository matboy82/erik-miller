CREATE TABLE owner_notifications (
  receipt_id TEXT PRIMARY KEY REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','sending','sent','unknown','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  provider_id TEXT,
  error_category TEXT
);
