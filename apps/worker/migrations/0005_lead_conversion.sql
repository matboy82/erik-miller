CREATE TABLE conversion_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision TEXT NOT NULL,
  draft TEXT NOT NULL,
  approved TEXT,
  approved_by TEXT,
  approved_at TEXT
);
CREATE TABLE conversion_leads (
  receipt_id TEXT PRIMARY KEY REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  email TEXT,
  nurture_consent INTEGER NOT NULL DEFAULT 0,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  download_token TEXT UNIQUE,
  guide_snapshot TEXT,
  enrolled_at TEXT,
  stopped_at TEXT,
  stop_reason TEXT,
  completed_at TEXT,
  review_reported_at TEXT,
  review_source TEXT
);
CREATE TABLE conversion_messages (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES conversion_leads(receipt_id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  due_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','sending','sent','failed','unknown','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  claimed_at TEXT,
  provider_id TEXT,
  sent_at TEXT,
  error_category TEXT,
  timeline_state TEXT NOT NULL DEFAULT 'pending' CHECK (timeline_state IN ('pending','writing','logged','unknown')),
  UNIQUE(receipt_id, kind)
);
CREATE INDEX conversion_due ON conversion_messages(state, due_at);
CREATE TABLE conversion_review_jobs (
  job_id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
