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

  const palette = [
    [111, 140, 115],
    [105, 129, 121],
    [130, 145, 118],
    [82, 111, 93]
  ];

  const mobile = () => window.innerWidth <= 760;

  const rebuildParticles = () => {
    const count = mobile() ? 10 : 20;
    particles = Array.from({ length: count }, (_, i) => ({
      phase: Math.random() * Math.PI * 2,
      orbit: .52 + Math.random() * .78,
      speed: (.000018 + Math.random() * .000034) * (i % 2 ? 1 : -1),
      drift: .3 + Math.random() * .9,
      size: .45 + Math.random() * 1.15,
      alpha: .08 + Math.random() * .16,
      tilt: -.45 + Math.random() * .9
    }));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, mobile() ? 1.25 : 1.6);
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
    const radius = Math.min(width, height) * (small ? .29 : .34);
    return {
      cx: width * (small ? .83 : .86),
      cy: height * (small ? .24 : .29),
      rx: radius * (small ? .78 : 1.02),
      ry: radius * (small ? 1.08 : .82)
    };
  };

  const traceRing = (geo, scale, time, index, alpha, staticFrame) => {
    const points = mobile() ? 78 : 118;
    const phase = staticFrame ? index * .72 : time * (.000028 + index * .000004) + index * .72;
    const color = palette[index % palette.length];

    ctx.beginPath();
    for (let i = 0; i <= points; i += 1) {
      const a = (i / points) * Math.PI * 2;
      const wobble =
        Math.sin(a * 3 + phase * 2.2) * .018 +
        Math.sin(a * 7 - phase * 1.4) * .009 +
        Math.cos(a * 11 + phase) * .004;
      const breath = staticFrame ? 0 : Math.sin(time * .00042 + index) * .006;
      const r = scale + wobble + breath;
      const twist = a + Math.sin(a * 2 + phase) * .018;
      const x = geo.cx + Math.cos(twist) * geo.rx * r;
      const y = geo.cy + Math.sin(twist) * geo.ry * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    ctx.lineWidth = index === 0 ? .8 : .55;
    ctx.stroke();
  };

  const drawDust = (geo, time, staticFrame) => {
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const t = staticFrame ? p.phase : p.phase + time * p.speed;
      const r = p.orbit + Math.sin(t * 2.2) * .035;
      const x = geo.cx + Math.cos(t) * geo.rx * r + Math.sin(time * .00009 + i) * 5 * p.drift;
      const y = geo.cy + Math.sin(t) * geo.ry * r + Math.cos(time * .00008 + i) * 3 * p.drift;
      const color = palette[i % palette.length];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t + p.tilt);
      ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${p.alpha})`;
      ctx.fillRect(-p.size * 2.2, -p.size * .28, p.size * 4.4, p.size * .56);
      ctx.restore();
    }
  };

  const draw = (time, staticFrame = false) => {
    ctx.clearRect(0, 0, width, height);
    const geo = portalGeometry();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const glow = ctx.createRadialGradient(
      geo.cx,
      geo.cy,
      geo.rx * .08,
      geo.cx,
      geo.cy,
      geo.rx * 1.2
    );
    glow.addColorStop(0, 'rgba(92, 122, 96, .014)');
    glow.addColorStop(.58, 'rgba(83, 108, 89, .022)');
    glow.addColorStop(1, 'rgba(73, 94, 81, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const baseAlpha = isPost ? .095 : .14;
    traceRing(geo, .66, time, 0, baseAlpha, staticFrame);
    traceRing(geo, .79, time, 1, baseAlpha * .82, staticFrame);
    traceRing(geo, .94, time, 2, baseAlpha * .66, staticFrame);
    traceRing(geo, 1.08, time, 3, baseAlpha * .48, staticFrame);

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
    if (reduceMotion.matches) {
      draw(performance.now(), true);
    } else if (running) {
      frame = requestAnimationFrame(loop);
    }
  };

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
