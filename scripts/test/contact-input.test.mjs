import test from 'node:test';
import assert from 'node:assert/strict';
import { emailError, phoneError, formatPhone } from '../../apps/web/src/lib/contact-input.ts';

test('email validation accepts addresses and rejects malformed local and domain parts', () => {
  for (const email of ['', ' homeowner@example.com ', 'home.owner+project@example.co.uk']) {
    assert.equal(emailError(email), '', email);
  }
  for (const email of ['homeowner', 'a@b', 'a@@example.com', 'a b@example.com', '.a@example.com', 'a..b@example.com', 'a@-example.com', 'a@example..com']) {
    assert.notEqual(emailError(email), '', email);
  }
});

test('phone validation requires a complete US number and supports optional country code', () => {
  for (const phone of ['', '2085550123', '(208) 555-0123', '+1 (208) 555-0123', '12085550123']) {
    assert.equal(phoneError(phone), '', phone);
  }
  for (const phone of ['208', '20855501234', '0000000000', '2080550123', '+44 2085550123', '+1+2085550123', '2085550123 ext 9', 'call me']) {
    assert.notEqual(phoneError(phone), '', phone);
  }
});

test('phone masking preserves invalid input instead of silently converting it to a valid number', () => {
  assert.equal(formatPhone('2085550123'), '(208) 555-0123');
  assert.equal(formatPhone('+12085550123'), '+1 (208) 555-0123');
  assert.equal(formatPhone('2085'), '(208) 5');
  assert.equal(formatPhone('1'), '1');
  assert.equal(formatPhone('+'), '+');
  assert.equal(formatPhone(''), '');
  for (const phone of ['20855501234', '+44 2085550123', '+1+2085550123', '2085550123 ext 9']) {
    assert.equal(formatPhone(phone), phone);
    assert.notEqual(phoneError(formatPhone(phone)), '');
  }
});
