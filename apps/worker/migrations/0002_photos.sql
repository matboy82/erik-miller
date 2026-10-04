CREATE TABLE intake_photos (
  receipt_id TEXT NOT NULL REFERENCES intake_submissions(receipt_id) ON DELETE CASCADE,
  photo_index INTEGER NOT NULL CHECK (photo_index BETWEEN 0 AND 2),
  phase TEXT NOT NULL DEFAULT 'staged' CHECK (phase IN ('staged', 'upload_writing', 'upload_created', 'file_writing', 'file_created', 'verified')),
  upload_id TEXT,
  file_id TEXT,
  lease_until TEXT,
  PRIMARY KEY (receipt_id, photo_index)
);
