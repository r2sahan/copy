import { compressIban, decompressIban } from './base62.js';

/**
 * Accounts dizisini v1 formatında kısa bir string'e dönüştürür.
 * Yapı Örneği: iban1~isim1|iban2~isim2
 * İsim tekrarlarında "1" bayrağı kullanılır.
 */
export function encodeV1Data(accounts) {
  let lastVal = null;

  const payloadParts = accounts.map(acc => {
    const compressedIban = compressIban(acc.iban);
    let namePart = acc.ad || '';

    // İsim tekrarı kontrolü (v0'daki "1" mantığı)
    if (lastVal !== null && namePart !== '' && namePart === lastVal) {
      namePart = '1';
    } else if (namePart !== '') {
      lastVal = namePart;
    }

    return namePart ? `${compressedIban}~${encodeURIComponent(namePart)}` : compressedIban;
  });

  // Hesapları pipe '|' karakteri ile birleştiriyoruz
  return payloadParts.join('|');
}

/**
 * v1 string parametresini çözer ve [ { iban, ad }, ... ] formatında döndürür.
 */
export function decodeV1Data(dParam) {
  if (!dParam) return null;

  try {
    const cardTokens = dParam.split('|');
    let lastValidName = '';

    return cardTokens.map(token => {
      const parts = token.split('~');
      const compressedIban = parts[0];
      let rawName = parts[1] ? decodeURIComponent(parts[1]) : '';

      // İsim çözümleme
      if (rawName === '1') {
        rawName = lastValidName;
      } else if (rawName !== '') {
        lastValidName = rawName;
      }

      return {
        iban: decompressIban(compressedIban),
        ad: rawName
      };
    });
  } catch (e) {
    console.error('v1 verisi çözülemedi:', e);
    return null;
  }
}
