CREATE TABLE intake_bookings (
  event_id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  payload TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('writing', 'created', 'verified')),
  task_id TEXT
);
