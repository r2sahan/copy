let toastTimeout;

export function showToast(text) {
  const toastMsg = document.getElementById('toastMsg');
  if (!toastMsg) return;
  
  toastMsg.textContent = text;
  toastMsg.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMsg.classList.remove('show');
  }, 2000);
}

export async function copyValue(text, checkEl, labelText) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(labelText + ' Kopyalandı');
    document.querySelectorAll('.check-icon').forEach(el => el.classList.remove('show'));
    if (checkEl) checkEl.classList.add('show');
    return true;
  } catch (e) {
    showToast('Kopyalama engellendi');
    return false;
  }
}
