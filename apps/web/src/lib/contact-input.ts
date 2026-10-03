export function emailError(value: string): string {
  const email = value.trim();
  if (!email) return '';
  const local = email.split('@')[0];
  const valid = email.length <= 254
    && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(email)
    && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
  return valid ? '' : 'Enter a valid email address, such as name@example.com.';
}

export function phoneError(value: string): string {
  if (!value.trim()) return '';
  const digits = value.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  const valid = /^[+\d\s().-]+$/.test(value) && (!value.includes('+') || /^\s*\+1[^+]*$/.test(value))
    && /^[2-9]\d{2}[2-9]\d{6}$/.test(national);
  return valid ? '' : 'Enter a 10-digit US phone number, such as (208) 555-0123. An optional +1 is accepted.';
}

export function formatPhone(value: string): string {
  if (!/^[+\d\s().-]*$/.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return value.trim() === '+' ? '+' : digits;
  const countryCode = digits.startsWith('1');
  if (digits.length > (countryCode ? 11 : 10) || (value.includes('+') && !/^\s*\+1[^+]*$/.test(value))) return value;
  const national = countryCode ? digits.slice(1) : digits;
  const prefix = countryCode ? '+1 ' : '';
  // Keep partial entries easy to edit; group digits as the number is completed.
  if (national.length <= 3) return prefix + national;
  if (national.length <= 6) return `${prefix}(${national.slice(0, 3)}) ${national.slice(3)}`;
  return `${prefix}(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}
