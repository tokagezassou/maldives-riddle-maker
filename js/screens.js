const onEnter = {};

export function registerOnEnter(id, fn) {
  onEnter[id] = fn;
}

let locked = false;

export function lockNavigation() {
  locked = true;
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.disabled = true;
  });
}

export function unlockNavigation() {
  locked = false;
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.disabled = false;
  });
}

export function showScreen(id) {
  if (locked) {
    console.warn('処理中のため画面を移動できません');
    return;
  }

  const target = document.getElementById(id);

  if (!target) {
    console.error(`画面が見つかりません: ${id}`);
    return;
  }

  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.remove('active');
  });

  target.classList.add('active');
  window.scrollTo(0, 0);

  if (onEnter[id]) onEnter[id]();
}

export function setupNavigation() {
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.goto);
    });
  });
}