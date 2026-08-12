import { compressIban, decompressIban } from './base62.js';

/**
 * Accounts dizisini v1 formatına dönüştürür.
 * Çıktı Örneği: TRaxzdas~Ahmet|TR3c8k9~Mehmet
 */
export function encodeV1Data(accounts) {
  let lastVal = null;

  const payloadParts = accounts.map(acc => {
    const compressedIban = compressIban(acc.iban);
    let namePart = acc.ad || '';

    // İsim tekrarı kontrolü ("1" flag'i)
    if (lastVal !== null && namePart !== '' && namePart === lastVal) {
      namePart = '1';
    } else if (namePart !== '') {
      lastVal = namePart;
    }

    return namePart ? `${compressedIban}~${encodeURIComponent(namePart)}` : compressedIban;
  });

  return payloadParts.join('|');
}

/**
 * v1 d parametresini çözer
 */
export function decodeV1Data(dParam) {
  if (!dParam) return null;

  try {
    const cardTokens = dParam.split('|');
    let lastValidName = '';

    const accounts = cardTokens.map(token => {
      if (!token) return null;

      const parts = token.split('~');
      const compressedIbanWithTR = parts[0];
      let rawName = parts[1] ? decodeURIComponent(parts[1]) : '';

      // İsim çözme
      if (rawName === '1') {
        rawName = lastValidName;
      } else if (rawName !== '') {
        lastValidName = rawName;
      }

      return {
        iban: decompressIban(compressedIbanWithTR),
        ad: rawName
      };
    }).filter(acc => acc && acc.iban);

    return accounts.length > 0 ? accounts : null;
  } catch (e) {
    console.error('v1 verisi çözülemedi:', e);
    return null;
  }
}
