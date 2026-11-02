CREATE TABLE IF NOT EXISTS intake_public_references (
  reference TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL UNIQUE REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intake_public_reference_receipt
  ON intake_public_references (receipt_id);
