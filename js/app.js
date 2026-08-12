import { renderCopyView } from './views/copyView.js';
import { initGeneratorView } from './views/generator.js';
import { decodeV1Data } from './utils/v1Codec.js'; // <-- EKLENDİ

function parseV0(params) {
  const iParam = params.get('i');
  const aParam = params.get('a');
  if (!iParam) return null;

  try {
    const ibanList = JSON.parse(iParam);
    let nameList = aParam ? JSON.parse(aParam) : [];
    let lastValidName = '';

    const resolvedNames = nameList.map(name => {
      if (name === '1' || name === 1) {
        return lastValidName;
      } else {
        lastValidName = name;
        return name;
      }
    });

    return ibanList.map((iban, idx) => ({
      iban: iban,
      ad: resolvedNames[idx] || ''
    }));
  } catch (e) {
    console.error('v0 parametreleri çözülemedi:', e);
    return null;
  }
}

function parseV1(params) {
  const dParam = params.get('d');
  if (!dParam) return null;
  return decodeV1Data(dParam);
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let accounts = null;

  // 1. Önce v1 kontrolü yap (?v=1&d=...)
  if (params.get('v') === '1' && params.has('d')) {
    accounts = parseV1(params);
  }

  // 2. v1 yoksa veya v1 çözülemediyse v0 fallback (?i=[...])
  if (!accounts && params.has('i')) {
    accounts = parseV0(params);
  }

  // 3. Ekran Yönlendirmesi
  if (accounts && accounts.length > 0) {
    renderCopyView(accounts);
  } else {
    initGeneratorView();
  }
});
