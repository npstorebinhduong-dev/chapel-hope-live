/** Original vector doves and slow glass-light breathing, no external assets. */
export function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seconds: number,
  low: boolean,
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 3; i++) {
    const drift = Math.sin(seconds * 0.075 + i) * 0.018;
    const x = (0.25 + i * 0.24) * width;
    const gradient = ctx.createLinearGradient(
      x,
      height * 0.36,
      x + width * 0.12,
      height * 0.79,
    );
    gradient.addColorStop(
      0,
      `rgba(${["196,184,240", "242,208,144", "151,193,231"][i]},${0.035 + Math.sin(seconds * 0.12 + i) * 0.012})`,
    );
    gradient.addColorStop(1, "rgba(255,220,160,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, height * 0.36);
    ctx.lineTo(x + width * 0.035, height * 0.36);
    ctx.lineTo(x + width * (0.22 + drift), height * 0.82);
    ctx.lineTo(x + width * (0.07 + drift), height * 0.82);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  const cycle = seconds % 27;
  let birds = 0;
  for (let i = 0; i < (low ? 1 : 2); i++) {
    const t = (cycle - i * 0.8) / 9;
    if (t <= 0 || t >= 1) continue;
    birds++;
    const reverse = Math.floor(seconds / 27) % 2 === 1;
    const x = (0.12 + (reverse ? 1 - t : t) * 0.76) * width;
    const y = (0.405 - Math.sin(t * Math.PI) * 0.045 + i * 0.014) * height;
    const size = width * (i ? 0.012 : 0.016),
      flap = Math.sin(seconds * 10 - i) * 0.7;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(reverse ? -1 : 1, 1);
    ctx.globalAlpha = Math.min(1, t * 8, (1 - t) * 8) * 0.8;
    ctx.fillStyle = "#e7dfcc";
    ctx.strokeStyle = "#c9c2b2";
    ctx.lineWidth = Math.max(0.4, width * 0.0006);
    // Tapered wings lift and fold around the body, rather than a blinking sprite.
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, 0);
    ctx.bezierCurveTo(
      -size,
      -size * (0.6 + flap),
      -size * 1.5,
      -size * (0.5 + flap),
      -size * 1.65,
      -size * (0.9 + flap),
    );
    ctx.quadraticCurveTo(-size * 0.4, size * 0.2, size * 0.6, 0);
    ctx.bezierCurveTo(
      size * 0.2,
      -size * (0.6 + flap),
      size * 0.9,
      -size * (0.8 + flap),
      size * 1.1,
      -size * (1.15 + flap),
    );
    ctx.quadraticCurveTo(size * 0.7, size * 0.35, -size * 0.15, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.7, size * 0.22, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.55, -size * 0.14, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  return birds;
}
