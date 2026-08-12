import { cleanIban, formatIban, isValidIban, getBankInfo } from '../utils/iban.js';
import { copyValue } from '../utils/ui.js';

export function renderCopyView(accounts) {
  document.getElementById('generatorView').style.display = 'none';
  const copyView = document.getElementById('copyView');
  copyView.classList.add('show');

  const container = document.getElementById('walletCardsContainer');
  container.innerHTML = '';

  accounts.forEach((acc, index) => {
    const iban = cleanIban(acc.iban);
    const ibanDisplay = isValidIban(iban) ? formatIban(iban) : iban;
    const bank = getBankInfo(iban);
    const bankName = bank ? bank.name : 'Transfer Bilgisi';
    const bankColor = bank ? bank.color : 'var(--accent)';

    const card = document.createElement('div');
    card.className = 'wallet-card';
    card.innerHTML = `
      <div class="wallet-card-stripe" style="background:${bankColor}"></div>
      <div class="wallet-header header-row-${index}">
        <div class="wallet-icon" style="background:${bankColor}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"></rect><path d="M2 10h20"></path></svg>
        </div>
        <div class="wallet-header-text">
          <div class="wallet-eyebrow">${bankName}</div>
          <div class="wallet-heading">${acc.ad ? acc.ad : 'Hesap ' + (index + 1)}</div>
        </div>
        <svg class="check-icon check-name-${index}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
      </div>
      <div class="wallet-row iban-row-${index}">
        <div class="wallet-row-text">
          <div class="wallet-row-label">IBAN</div>
          <div class="wallet-row-value mono">${ibanDisplay}</div>
        </div>
        <svg class="check-icon check-iban-${index}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
      </div>
    `;
    container.appendChild(card);

    const ibanCheck = card.querySelector(`.check-iban-${index}`);
    const ibanRow = card.querySelector(`.iban-row-${index}`);
    ibanRow.addEventListener('click', () => copyValue(iban, ibanCheck, 'IBAN'));

    if (acc.ad) {
      const nameCheck = card.querySelector(`.check-name-${index}`);
      const headerRow = card.querySelector(`.header-row-${index}`);
      headerRow.addEventListener('click', () => copyValue(acc.ad, nameCheck, 'Hesap Adı'));
    }

    if (index === 0) {
      copyValue(iban, ibanCheck, 'IBAN');
    }
  });
}
