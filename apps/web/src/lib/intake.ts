export const intakeUrl = (import.meta.env.PUBLIC_INTAKE_API_URL ?? '').replace(/\/$/, '');
export const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
export const bookingUrl = import.meta.env.PUBLIC_BOOKING_URL ?? 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3yGOu537xocx0E6JCgrbNeC3bf_jSF8CuCn9fS41FLe8nhR9QZR_EH5suk7HGBTPbr1NZbxS_8?gv=true';

export async function sendInquiry(path: 'contact' | 'project', payload: Record<string, unknown>, key: string, token = ''): Promise<string> {
  if (!intakeUrl) throw new Error('This form is being prepared for launch. Please call (208) 608-4439 to discuss your project.');
  const response = await fetch(`${intakeUrl}/intake/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({ ...payload, ...(token ? { turnstileToken: token } : {}) }),
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json() as { receiptId?: string; state?: string; error?: string };
  if (response.status === 202 && result.state === 'accepted' && typeof result.receiptId === 'string') return result.receiptId;
  if (result.error === 'verification_required') throw new Error('Complete the security check and try again.');
  if (result.error === 'idempotency_conflict') throw new Error('The earlier attempt used different details. Restore those details to retry, or start a new inquiry.');
  if (response.status === 400) throw new Error('Check your contact details, project answers, and photos, then try again.');
  if (response.status === 410) throw new Error('This inquiry has expired. Start a new inquiry or call (208) 608-4439.');
  throw new Error('We could not confirm receipt. Try again with the same details, or call (208) 608-4439.');
}

// Re-encoding removes photo metadata and keeps full camera files out of the request.
export async function preparePhoto(file: File): Promise<{ type: string; data: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error('Choose JPEG, PNG, or WebP photos under 20 MB each.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the photo. Try a different browser or continue without photos.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const encoded = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    if (encoded.length > 2_796_204) throw new Error('This photo is too large after preparation. Choose a smaller photo.');
    return { type: 'image/jpeg', data: encoded };
  } finally { bitmap.close(); }
}

export function resetChallenge() {
  const turnstile = (window as unknown as { turnstile?: { reset: () => void } }).turnstile;
  turnstile?.reset();
}
