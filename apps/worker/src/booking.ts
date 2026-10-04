export type BookingInput = { eventId: string; date: string; start: string; end: string; cancelled?: boolean };
type Input = BookingInput;
export function validBooking(value: unknown): value is Input {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !['eventId', 'date', 'start', 'end', 'cancelled'].includes(key))
    || (input.cancelled !== undefined && typeof input.cancelled !== 'boolean')
    || typeof input.eventId !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(input.eventId)
    || typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)
    || !['start', 'end'].every((key) => typeof input[key] === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(input[key] as string))) return false;
  const date = new Date(`${input.date}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === input.date && (input.end as string) > (input.start as string);
}

export async function recordBooking(receiptId: string, input: Input, db: D1Database,
  call: (operation: Record<string, unknown>) => Promise<Record<string, unknown>>): Promise<{ status: number; body: Record<string, unknown> }> {
  const inquiry = await db.prepare('SELECT state, external_job_id FROM intake_submissions WHERE receipt_id = ?1').bind(receiptId).first<{ state: string; external_job_id: string | null }>();
  if (!inquiry) return { status: 404, body: { error: 'not_found' } };
  if (inquiry.state !== 'delivered' || !inquiry.external_job_id) return { status: 409, body: { error: 'delivery_required' } };
  const existing = await db.prepare('SELECT receipt_id, phase, payload, task_id FROM intake_bookings WHERE event_id = ?1').bind(input.eventId).first<{ receipt_id: string; phase: string; payload: string; task_id: string | null }>();
  const payload = JSON.stringify({ eventId: input.eventId, date: input.date, start: input.start, end: input.end, cancelled: input.cancelled ?? false });
  if (existing && existing.receipt_id !== receiptId) return { status: 409, body: { error: 'booking_conflict' } };
  if (existing?.phase === 'verified' && existing.payload === payload) return { status: 200, body: { receiptId, booking: input.cancelled ? 'cancelled' : 'recorded' } };
  if (existing?.phase === 'writing') return { status: 409, body: { error: 'booking_reconciliation_required' } };
  if (existing?.phase === 'created' && existing.payload !== payload) {
    const prior = await recordBooking(receiptId, JSON.parse(existing.payload), db, call);
    if (prior.status !== 200) return prior;
    return recordBooking(receiptId, input, db, call);
  }
  if (!existing) {
    const saved = await db.prepare("INSERT INTO intake_bookings (event_id, receipt_id, payload, phase) VALUES (?1, ?2, ?3, 'writing')").bind(input.eventId, receiptId, payload).run();
    if (!saved.success) throw new Error('booking_checkpoint_failed');
  } else if (existing.phase === 'verified') {
    const claimed = await db.prepare("UPDATE intake_bookings SET phase = 'writing', payload = ?1 WHERE event_id = ?2 AND phase = 'verified' AND payload = ?3").bind(payload, input.eventId, existing.payload).run();
    if (!claimed.success || claimed.meta?.changes !== 1) return { status: 409, body: { error: 'booking_claimed' } };
  }
  let taskId = existing?.task_id;
  if (existing?.phase !== 'created') {
    if (taskId) {
      const ownership = await call({ task: { $: { id: taskId }, id: {}, job: { id: {} } } });
      const owned = ownership.task as { id?: string; job?: { id?: string } } | null;
      if (owned && (owned.id !== taskId || owned.job?.id !== inquiry.external_job_id)) throw new Error('booking_ownership_failed');
      if (!owned && !input.cancelled) throw new Error('booking_task_missing');
    }
    if (input.cancelled) {
      if (taskId) await call({ deleteTask: { $: { id: taskId, deleteRecurringTasks: false } } });
    } else if (taskId) {
      await call({ updateTask: { $: { id: taskId, startDate: input.date, endDate: input.date, startTime: `${input.start}:00`, endTime: `${input.end}:00`, notify: false, updateDependentTasks: false, updateRecurringTasks: false } } });
    } else {
      const result = await call({ createTask: { $: { name: `Consultation ${receiptId.slice(-8)}`, targetId: inquiry.external_job_id, targetType: 'job',
        description: `Google Calendar event: ${input.eventId}\nWebsite inquiry: ${receiptId}`, startDate: input.date, endDate: input.date,
        startTime: `${input.start}:00`, endTime: `${input.end}:00`, notify: false }, createdTask: { id: {} } } });
      taskId = (result.createTask as { createdTask?: { id?: string } })?.createdTask?.id;
      if (!taskId) throw new Error('booking_result_unknown');
    }
    const saved = await db.prepare("UPDATE intake_bookings SET task_id = ?1, phase = 'created' WHERE event_id = ?2 AND phase = 'writing'").bind(taskId ?? null, input.eventId).run();
    if (!saved.success || saved.meta?.changes !== 1) throw new Error('booking_checkpoint_failed');
  }
  const result = taskId ? await call({ task: { $: { id: taskId }, id: {}, job: { id: {} }, startDate: {}, endDate: {}, startTime: {}, endTime: {} } }) : { task: null };
  const task = result.task as { id?: string; job?: { id?: string }; startDate?: string; endDate?: string; startTime?: string; endTime?: string };
  if (input.cancelled ? result.task !== null : task?.id !== taskId || task.job?.id !== inquiry.external_job_id || task.startDate !== input.date || task.endDate !== input.date
    || task.startTime?.slice(0, 5) !== input.start || task.endTime?.slice(0, 5) !== input.end) throw new Error('booking_readback_failed');
  const saved = await db.prepare("UPDATE intake_bookings SET phase = 'verified' WHERE event_id = ?1 AND phase = 'created'").bind(input.eventId).run();
  if (!saved.success || saved.meta?.changes !== 1) throw new Error('booking_checkpoint_failed');
  return { status: 200, body: { receiptId, booking: input.cancelled ? 'cancelled' : 'recorded' } };
}
