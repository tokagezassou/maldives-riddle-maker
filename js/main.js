import { showScreen, setupNavigation, registerOnEnter } from './screens.js';
import { setupUpload } from './upload.js';
import { initCropper } from './cropper.js';

if (location.protocol === 'file:') {
  document.body.innerHTML =
    '<p style="color:red">file:// では動作しません。ローカルサーバー経由で開いてください。</p>';
} else {
  setupNavigation();
  setupUpload();
  registerOnEnter('screen-crop', initCropper);
  showScreen('screen-title');
}