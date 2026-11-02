ALTER TABLE conversion_leads ADD COLUMN inquiry_nurture INTEGER NOT NULL DEFAULT 0;
ALTER TABLE conversion_leads ADD COLUMN unsubscribe_email_hash TEXT;
CREATE TABLE conversion_unsubscribed (
  email_hash TEXT PRIMARY KEY,
  unsubscribed_at TEXT NOT NULL
);
