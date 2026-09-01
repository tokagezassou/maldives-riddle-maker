import { showScreen, setupNavigation } from './screens.js';

if (location.protocol === 'file:') {
  document.body.innerHTML =
    '<p style="color:red">file:// では動作しません。ローカルサーバー経由で開いてください。</p>';
} else {
  setupNavigation();
  showScreen('screen-title');
}