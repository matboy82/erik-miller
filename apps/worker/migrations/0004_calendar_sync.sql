CREATE TABLE integration_state (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}',
  lease_until TEXT,
  lease_token TEXT
);
CREATE TABLE calendar_booking_events (
  event_id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  delivered_at TEXT,
  last_attempt_at TEXT,
  error_category TEXT
);
