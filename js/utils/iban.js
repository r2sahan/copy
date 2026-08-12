import { BANK_MAP } from '../constants.js';

export function cleanIban(raw) {
  return (raw || '').replace(/\s+/g, '').toUpperCase();
}

export function formatIban(raw) {
  return raw.replace(/(.{4})/g, '$1 ').trim();
}

export function isValidIban(raw) {
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(raw);
}

export function getBankInfo(rawIban) {
  const clean = cleanIban(rawIban);
  if (clean.length >= 9 && clean.startsWith('TR')) {
    const bankCode = clean.substring(4, 9);
    if (BANK_MAP[bankCode]) {
      return BANK_MAP[bankCode];
    }
  }
  return null;
}
