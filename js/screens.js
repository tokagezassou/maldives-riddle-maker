const onEnter = {};

export function registerOnEnter(id, fn) {
  onEnter[id] = fn;
}

export function showScreen(id) {
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
  console.log(`画面遷移: ${id}`);

  if (onEnter[id]) onEnter[id]();
}

export function setupNavigation() {
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.goto);
    });
  });
}