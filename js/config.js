export const CONFIG = {
  // --- 全体 ---
  duration: 19.0,           // 動画の長さ（秒）
  fps: 24,                  // フレームレート
  backgroundColor: '#f5f5f5',   // 余白の色

  // --- 謎画像のズームアウト ---
  slowZoomDuration: 3.0,    // 前半、ゆっくり引く時間（秒）
  slowZoomProgress: 60,     // 前半で進む割合（%）
  fastZoomDuration: 5.0,    // 後半、残りを引ききる時間（秒）

  // --- 答え画像 ---
  answerStartTime: 12.0,    // 答え画像が出始める時刻（秒）
  answerFadeDuration: 2.0,  // フェードインの長さ（秒）

  // --- BGM ---
  bgmFile: 'assets/maldives_music.m4a',
  bgmFadeOutDuration: 2.0,
};