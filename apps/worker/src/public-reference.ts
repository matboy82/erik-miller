const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const chars = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]);
  return `MR-${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`;
}

export async function ensurePublicReference(db: D1Database, receiptId: string): Promise<string> {
  const existing = await db.prepare('SELECT reference FROM intake_public_references WHERE receipt_id = ?1')
    .bind(receiptId).first<{ reference: string }>();
  if (existing?.reference) return existing.reference;
  for (let attempt = 0; attempt < 8; attempt++) {
    const reference = randomCode();
    const inserted = await db.prepare('INSERT OR IGNORE INTO intake_public_references (reference, receipt_id, created_at) VALUES (?1, ?2, ?3)')
      .bind(reference, receiptId, new Date().toISOString()).run();
    const saved = await db.prepare('SELECT reference FROM intake_public_references WHERE receipt_id = ?1')
      .bind(receiptId).first<{ reference: string }>();
    if (saved?.reference) return saved.reference;
    if (!inserted.success) throw new Error('public_reference_write_failed');
  }
  throw new Error('public_reference_generation_failed');
}
