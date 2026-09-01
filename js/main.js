const status = document.getElementById('status');
const result = document.getElementById('result');
const testBtn = document.getElementById('testBtn');

if (location.protocol === 'file:') {
  status.textContent = 'file:// で開いています。ローカルサーバー経由で開き直してください';
  status.className = 'ng';
} else {
  status.textContent = `OK: ${location.protocol}//${location.host} で動作中`;
  status.className = 'ok';
}

let count = 0;
testBtn.addEventListener('click', () => {
  count++;
  result.textContent = `${count} 回クリックされましたよん`;
});

console.log('スクリプトが読み込まれました');