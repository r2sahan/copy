import { renderCopyView } from './views/copyView.js';
import { initGeneratorView } from './views/generator.js';

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
    console.error("v0 parametreleri çözülemedi:", e);
    return null;
  }
}

function parseV1(params) {
  // ex: return decodeBase62Params(params.get('d'));
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let accounts = null;

  if (params.has('v') && params.get('v') === '1') {
    accounts = parseV1(params);
  }

  if (!accounts && params.has('i')) {
    accounts = parseV0(params);
  }

  if (accounts && accounts.length > 0) {
    renderCopyView(accounts);
  } else {
    initGeneratorView();
  }
});
