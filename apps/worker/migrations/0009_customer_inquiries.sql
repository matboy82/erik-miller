ALTER TABLE intake_submissions ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'legacy';
CREATE TABLE intake_customer_comments (
  receipt_id TEXT NOT NULL REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  comment_index INTEGER NOT NULL,
  external_comment_id TEXT,
  PRIMARY KEY (receipt_id, comment_index)
);
UPDATE intake_submissions SET delivery_mode = 'customer'
WHERE delivery_step = 'queued' AND external_account_id IS NULL;
