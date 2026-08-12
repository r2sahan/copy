import { cleanIban, getBankInfo } from '../utils/iban.js';

export function initGeneratorView() {
  const ibanContainer = document.getElementById('ibanContainer');
  const addIbanBtn = document.getElementById('addIbanBtn');
  const generateBtn = document.getElementById('generateBtn');
  const ibanHint = document.getElementById('ibanHint');
  const qrCard = document.getElementById('qrCard');
  const qrHolder = document.getElementById('qrHolder');
  const linkText = document.getElementById('linkText');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let cardCount = 0;

  function addIbanCard(initialName = '', initialIban = '') {
    cardCount++;
    const cardId = cardCount;
    const card = document.createElement('div');
    card.className = 'iban-card-item';
    card.id = `ibanCard_${cardId}`;

    card.innerHTML = `
      <div class="iban-card-header">
        <span class="iban-card-title">Hesap #${cardId}</span>
        ${cardId > 1 ? `<button class="btn-remove" data-remove-id="${cardId}">Sil</button>` : ''}
      </div>
      <div class="field-group" style="margin-bottom:12px;">
        <input class="name-input" type="text" placeholder="Hesap Sahibi (opsiyonel)" value="${initialName}">
      </div>
      <div class="field-group" style="margin-bottom:0;">
        <input class="iban-input" type="text" placeholder="TR33 0006 1005 1978 6457 8413 26" value="${initialIban}">
        <div class="bank-badge" style="display:none;">
          <span class="bank-dot"></span>
          <span class="bank-badge-name"></span>
        </div>
      </div>
    `;

    ibanContainer.appendChild(card);

    const ibanInput = card.querySelector('.iban-input');
    const bankBadge = card.querySelector('.bank-badge');
    const bankBadgeName = card.querySelector('.bank-badge-name');
    const bankDot = card.querySelector('.bank-dot');

    ibanInput.addEventListener('input', () => {
      const bank = getBankInfo(ibanInput.value);
      if (bank) {
        bankBadgeName.textContent = bank.name;
        bankDot.style.background = bank.color;
        bankBadge.style.display = 'inline-flex';
      } else {
        bankBadge.style.display = 'none';
      }
    });

    const removeBtn = card.querySelector('.btn-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => card.remove());
    }
  }

  addIbanCard();
  addIbanBtn.addEventListener('click', () => addIbanCard());

  generateBtn.addEventListener('click', () => {
    const cards = ibanContainer.querySelectorAll('.iban-card-item');
    const ibanList = [];
    const rawNameList = [];
    let hasValid = false;

    cards.forEach(card => {
      const nameVal = card.querySelector('.name-input').value.trim();
      const ibanVal = cleanIban(card.querySelector('.iban-input').value);

      if (ibanVal) {
        hasValid = true;
        ibanList.push(ibanVal);
        rawNameList.push(nameVal);
      }
    });

    if (!hasValid) {
      ibanHint.textContent = 'Lütfen en az bir geçerli IBAN girin.';
      ibanHint.classList.add('err');
      return;
    }

    ibanHint.textContent = '';
    ibanHint.classList.remove('err');

    let hasAnyName = false;
    let lastVal = null;
    const compressedNameList = rawNameList.map(name => {
      if (name) hasAnyName = true;
      if (lastVal !== null && name !== '' && name === lastVal) {
        return "1";
      } else {
        lastVal = name;
        return name;
      }
    });

    // Şimdilik v0 URL yapısını üretiyoruz
    let queryParts = [`i=${encodeURIComponent(JSON.stringify(ibanList))}`];
    if (hasAnyName) {
      queryParts.push(`a=${encodeURIComponent(JSON.stringify(compressedNameList))}`);
    }

    const targetUrl = window.location.origin + window.location.pathname + '?' + queryParts.join('&');

    qrHolder.innerHTML = '';
    new QRCode(qrHolder, {
      text: targetUrl,
      width: 220,
      height: 220,
      colorDark: '#1d1d1f',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    linkText.value = targetUrl;
    qrCard.classList.add('show');
  });

  copyLinkBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(linkText.value);
      copyLinkBtn.textContent = 'Kopyalandı';
      setTimeout(() => copyLinkBtn.textContent = 'Kopyala', 1500);
    } catch (e) {}
  });

  downloadBtn.addEventListener('click', () => {
    const canvas = qrHolder.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'iban-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
