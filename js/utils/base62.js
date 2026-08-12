const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Sayıyı / BigInt değerini Base62 string'e çevirir
 */
export function encodeBase62(number) {
  if (number === 0n || number === 0) return '0';
  let num = BigInt(number);
  let result = '';
  const base = BigInt(BASE62_ALPHABET.length);

  while (num > 0n) {
    const remainder = num % base;
    result = BASE62_ALPHABET[Number(remainder)] + result;
    num = num / base;
  }
  return result;
}

/**
 * Base62 string'i BigInt değerine çevirir
 */
export function decodeBase62(str) {
  let result = 0n;
  const base = BigInt(BASE62_ALPHABET.length);

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = BASE62_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Geçersiz Base62 karakteri: ${char}`);
    result = result * base + BigInt(index);
  }
  return result;
}

/**
 * Sadece rakamlardan oluşan TR IBAN'ı sıkıştırır.
 * TRXX YYYY Y... (24 hane rakam) -> BigInt -> Base62
 */
export function compressIban(cleanIbanStr) {
  // TR ile başlamıyorsa veya 26 karakter değilse ham halini döndür/işle
  if (!cleanIbanStr.startsWith('TR') || cleanIbanStr.length !== 26) {
    return cleanIbanStr;
  }
  // TR kısmını atıp kalan 24 haneli rakamı alıyoruz
  const numericPart = cleanIbanStr.substring(2);
  return encodeBase62(BigInt(numericPart));
}

/**
 * Sıkıştırılmış Base62 IBAN'ı tekrar standart TR IBAN'a dönüştürür.
 */
export function decompressIban(b62Str) {
  try {
    const num = decodeBase62(b62Str);
    let numericStr = num.toString();
    // Eksik basamakları 24 haneye tamamla (soluna 0 ekle)
    while (numericStr.length < 24) {
      numericStr = '0' + numericStr;
    }
    return 'TR' + numericStr;
  } catch (e) {
    return b62Str; // Çözülemezse olduğu gibi döndür
  }
}
