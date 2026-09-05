import { showScreen, setupNavigation, registerOnEnter } from './screens.js';
import { setupUpload } from './upload.js';
import { initCropper } from './cropper.js';
import { initPreview } from './preview.js';
import { initResult } from './result.js';

if (location.protocol === 'file:') {
  document.body.innerHTML =
    '<p style="color:red">file:// では動作しません。ローカルサーバー経由で開いてください。</p>';
} else {
  setupNavigation();
  setupUpload();
  registerOnEnter('screen-crop', initCropper);
  registerOnEnter('screen-preview', initPreview);
  registerOnEnter('screen-result', initResult);
  showScreen('screen-title');
}