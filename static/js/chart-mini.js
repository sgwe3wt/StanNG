/* ===========================================================
   StanNG — tiny dependency-free canvas bar/line chart
   Renders hourly upload/download traffic without any CDN.
   =========================================================== */
function renderTrafficChart(canvas, hourlyData) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, 300);
  const height = canvas.getAttribute('height') ? parseInt(canvas.getAttribute('height')) : 140;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const styles = getComputedStyle(document.documentElement);
  const goldColor = styles.getPropertyValue('--gold-500').trim() || '#c9a227';
  const azureColor = styles.getPropertyValue('--azure').trim() || '#4d9fec';
  const textColor = styles.getPropertyValue('--text-2').trim() || '#9d93bd';
  const gridColor = styles.getPropertyValue('--border-soft').trim() || 'rgba(201,162,39,0.2)';

  const data = (hourlyData || []).slice(-24);
  const padding = { top: 14, right: 10, bottom: 24, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!data.length) {
    ctx.fillStyle = textColor;
    ctx.font = '13px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('—', width / 2, height / 2);
    return;
  }

  const maxVal = Math.max(1, ...data.map(d => (d.up || 0) + (d.down || 0)));
  const n = data.length;
  const groupW = chartW / n;
  const barW = Math.min(16, groupW * 0.32);

  // grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = padding.top + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  data.forEach((d, i) => {
    const cx = padding.left + groupW * i + groupW / 2;
    const upH = ((d.up || 0) / maxVal) * chartH;
    const downH = ((d.down || 0) / maxVal) * chartH;

    // upload bar
    const gradUp = ctx.createLinearGradient(0, padding.top + chartH - upH, 0, padding.top + chartH);
    gradUp.addColorStop(0, goldColor);
    gradUp.addColorStop(1, 'rgba(201,162,39,0.15)');
    ctx.fillStyle = gradUp;
    roundRect(ctx, cx - barW - 2, padding.top + chartH - upH, barW, upH, 3);
    ctx.fill();

    // download bar
    const gradDown = ctx.createLinearGradient(0, padding.top + chartH - downH, 0, padding.top + chartH);
    gradDown.addColorStop(0, azureColor);
    gradDown.addColorStop(1, 'rgba(77,159,236,0.15)');
    ctx.fillStyle = gradDown;
    roundRect(ctx, cx + 2, padding.top + chartH - downH, barW, downH, 3);
    ctx.fill();

    if (i % Math.ceil(n / 8 || 1) === 0) {
      const dt = new Date((d.t || 0) * 1000);
      const label = dt.getHours().toString().padStart(2, '0') + ':00';
      ctx.fillStyle = textColor;
      ctx.font = '10px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, height - 6);
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  if (h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
