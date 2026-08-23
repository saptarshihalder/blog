(() => {
  const canvas = document.querySelector('#ambient-field');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isPost = document.body.classList.contains('is-post');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let running = true;
  let particles = [];
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;

  const palette = [
    [123, 161, 127],
    [103, 139, 126],
    [144, 162, 126],
    [86, 125, 101],
    [114, 141, 137]
  ];

  const mobile = () => window.innerWidth <= 760;

  const rebuildParticles = () => {
    const count = mobile() ? 15 : 34;
    particles = Array.from({ length: count }, (_, i) => ({
      phase: Math.random() * Math.PI * 2,
      orbit: .48 + Math.random() * .86,
      speed: (.000022 + Math.random() * .000052) * (i % 2 ? 1 : -1),
      drift: .35 + Math.random() * 1.1,
      size: .55 + Math.random() * 1.25,
      alpha: .13 + Math.random() * .22,
      tilt: -.5 + Math.random()
    }));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, mobile() ? 1.35 : 1.8);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildParticles();
    if (reduceMotion.matches) draw(performance.now(), true);
  };

  const portalGeometry = () => {
    const small = mobile();
    const radius = Math.min(width, height) * (small ? .33 : .39);
    return {
      cx: width * (small ? .84 : .82) + pointerX * (small ? 4 : 16),
      cy: height * (small ? .22 : .27) + pointerY * (small ? 3 : 11),
      rx: radius * (small ? .74 : 1.04),
      ry: radius * (small ? 1.12 : .79)
    };
  };

  const traceRing = (geo, scale, time, index, alpha, staticFrame) => {
    const points = mobile() ? 88 : 144;
    const phase = staticFrame ? index * .69 : time * (.000043 + index * .000004) + index * .69;
    const color = palette[index % palette.length];

    ctx.beginPath();
    for (let i = 0; i <= points; i += 1) {
      const a = (i / points) * Math.PI * 2;
      const wobble =
        Math.sin(a * 3 + phase * 2.15) * .024 +
        Math.sin(a * 7 - phase * 1.35) * .012 +
        Math.cos(a * 13 + phase * .9) * .006;
      const breath = staticFrame ? 0 : Math.sin(time * .00055 + index * .7) * .009;
      const r = scale + wobble + breath;
      const twist = a + Math.sin(a * 2 + phase) * .026;
      const x = geo.cx + Math.cos(twist) * geo.rx * r;
      const y = geo.cy + Math.sin(twist) * geo.ry * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    ctx.lineWidth = index === 0 ? 1.05 : .72;
    ctx.stroke();
  };

  const drawDust = (geo, time, staticFrame) => {
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const t = staticFrame ? p.phase : p.phase + time * p.speed;
      const r = p.orbit + Math.sin(t * 2.1 + i) * .045;
      const x = geo.cx + Math.cos(t) * geo.rx * r + Math.sin(time * .00011 + i) * 7 * p.drift;
      const y = geo.cy + Math.sin(t) * geo.ry * r + Math.cos(time * .00009 + i) * 5 * p.drift;
      const color = palette[i % palette.length];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t + p.tilt);
      ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${p.alpha})`;
      ctx.fillRect(-p.size * 2.7, -p.size * .28, p.size * 5.4, p.size * .56);
      ctx.restore();
    }
  };

  const drawInnerCurrent = (geo, time, staticFrame) => {
    const phase = staticFrame ? 0 : time * .00018;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      const start = phase + i * 2.05;
      const radius = .2 + i * .095;
      for (let s = 0; s <= 34; s += 1) {
        const a = start + s * .105;
        const spiral = radius + s * .0052;
        const x = geo.cx + Math.cos(a) * geo.rx * spiral;
        const y = geo.cy + Math.sin(a) * geo.ry * spiral;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(118, 154, 121, ${isPost ? .035 : .07})`;
      ctx.lineWidth = .65;
      ctx.stroke();
    }
  };

  const draw = (time, staticFrame = false) => {
    pointerX += (targetPointerX - pointerX) * .025;
    pointerY += (targetPointerY - pointerY) * .025;
    ctx.clearRect(0, 0, width, height);
    const geo = portalGeometry();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const glow = ctx.createRadialGradient(
      geo.cx,
      geo.cy,
      geo.rx * .04,
      geo.cx,
      geo.cy,
      geo.rx * 1.28
    );
    glow.addColorStop(0, `rgba(101, 141, 105, ${isPost ? .025 : .055})`);
    glow.addColorStop(.46, `rgba(86, 124, 95, ${isPost ? .03 : .065})`);
    glow.addColorStop(.8, 'rgba(71, 105, 82, .025)');
    glow.addColorStop(1, 'rgba(65, 92, 75, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const baseAlpha = isPost ? .13 : .27;
    traceRing(geo, .57, time, 0, baseAlpha, staticFrame);
    traceRing(geo, .69, time, 1, baseAlpha * .88, staticFrame);
    traceRing(geo, .81, time, 2, baseAlpha * .76, staticFrame);
    traceRing(geo, .93, time, 3, baseAlpha * .64, staticFrame);
    traceRing(geo, 1.06, time, 4, baseAlpha * .49, staticFrame);
    traceRing(geo, 1.2, time, 5, baseAlpha * .34, staticFrame);

    drawInnerCurrent(geo, time, staticFrame);
    drawDust(geo, time, staticFrame);
    ctx.restore();
  };

  const loop = (time) => {
    if (!running) return;
    draw(time, false);
    frame = requestAnimationFrame(loop);
  };

  const syncMotion = () => {
    cancelAnimationFrame(frame);
    if (reduceMotion.matches) draw(performance.now(), true);
    else if (running) frame = requestAnimationFrame(loop);
  };

  window.addEventListener('pointermove', (event) => {
    if (mobile() || reduceMotion.matches) return;
    targetPointerX = (event.clientX / Math.max(width, 1) - .5) * 2;
    targetPointerY = (event.clientY / Math.max(height, 1) - .5) * 2;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    cancelAnimationFrame(frame);
    if (running) syncMotion();
  });

  window.addEventListener('resize', resize, { passive: true });
  reduceMotion.addEventListener?.('change', syncMotion);

  resize();
  syncMotion();
})();
