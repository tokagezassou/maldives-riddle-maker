import { showScreen, setupNavigation, registerOnEnter } from './screens.js';
import { setupUpload, initUpload } from './upload.js';
import { initCropper } from './zoom_out_cropper.js';
import { initMidpoint } from './zoom_out_midpoint.js';
import { initResult } from './result.js';

if (location.protocol === 'file:') {
  document.body.innerHTML =
    '<p style="color:red">file:// では動作しません。ローカルサーバー経由で開いてください。</p>';
} else {
  setupNavigation();
  setupUpload();
  registerOnEnter('screen-crop', initCropper);
  registerOnEnter('screen-midpoint', initMidpoint);
  registerOnEnter('screen-result', initResult);
  showScreen('screen-title');
    registerOnEnter('screen-upload', initUpload);
}