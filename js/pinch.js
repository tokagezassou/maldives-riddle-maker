export function setupPinch(el, handlers) {
  const pointers = new Map();
  let lastDist = 0;

  function distance() {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function center() {
    const [a, b] = [...pointers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  el.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    el.setPointerCapture(e.pointerId);

    if (pointers.size === 1) {
      handlers.onPanStart?.(e);
    } else if (pointers.size === 2) {
      lastDist = distance();
      handlers.onPanEnd?.();
    }
  });

  el.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;

    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const d = distance();
      if (lastDist > 0) {
        const c = center();
        handlers.onPinch?.(d / lastDist, c.x, c.y);
      }
      lastDist = d;
    } else if (pointers.size === 1) {
      handlers.onPan?.(e.clientX - prev.x, e.clientY - prev.y);
    }
  });

  function release(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);

    if (pointers.size < 2) lastDist = 0;
    if (pointers.size === 0) handlers.onPanEnd?.();
    if (pointers.size === 1) handlers.onPanStart?.([...pointers.values()][0]);
  }

  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);

  // ホイール（マウス）とトラックパッドのピンチ
  el.addEventListener('wheel', (e) => {
    e.preventDefault();

    // トラックパッドのピンチは ctrlKey が立つ
    const factor = e.ctrlKey ? 0.01 : 0.0015;
    const scale = Math.exp(-e.deltaY * factor);

    handlers.onPinch?.(scale, e.clientX, e.clientY);
  }, { passive: false });
}