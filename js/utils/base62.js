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
 * TR123123... -> "TR" + encodeBase62("123123...")
 */
export function compressIban(cleanIbanStr) {
  if (!cleanIbanStr) return '';
  
  // TR ile başlamıyorsa ham halini döndür
  if (!cleanIbanStr.startsWith('TR')) {
    return cleanIbanStr;
  }

  // TR kısmını ayır, kalan rakamları al
  const numericPart = cleanIbanStr.substring(2);
  
  // Sadece rakamlardan oluşuyorsa Base62 yap
  if (/^\d+$/.test(numericPart)) {
    const b62 = encodeBase62(BigInt(numericPart));
    return 'TR' + b62; // TR ile birleştirip döndür
  }

  return cleanIbanStr;
}

/**
 * TRaxzdas -> "TR" ve "axzdas" ayır -> decodeBase62("axzdas") -> "123123" -> TR123123...
 */
export function decompressIban(str) {
  if (!str) return '';

  // "TR" ile başlıyorsa "TR" ve Base62 kısmını ayırıyoruz
  if (str.startsWith('TR')) {
    const b62Part = str.substring(2);

    // Eğer b62Part zaten sadece rakamlardan oluşuyorsa ham IBAN'dır (sıkıştırılmamıştır)
    if (/^\d+$/.test(b62Part)) {
      return str;
    }

    try {
      // Base62 kısmını çöz ve BigInt -> Rakam string'ine çevir
      const num = decodeBase62(b62Part);
      let numericStr = num.toString();

      // Standart TR IBAN 24 rakamdan oluşur, gerekirse soluna 0 ekle
      while (numericStr.length < 24) {
        numericStr = '0' + numericStr;
      }

      return 'TR' + numericStr;
    } catch (e) {
      console.error('Base62 çözme hatası:', e);
      return str;
    }
  }

  return str;
}
