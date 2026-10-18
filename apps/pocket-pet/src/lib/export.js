// Turn an on-screen <svg> into a PNG and hand it to the iOS share sheet (or download on desktop).

export function svgToImage(svgEl, size) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute('width', size);
  clone.setAttribute('height', size * (clone.viewBox.baseVal.height / clone.viewBox.baseVal.width));
  clone.querySelectorAll('[class]').forEach((n) => n.removeAttribute('class'));
  const xml = new XMLSerializer().serializeToString(clone);
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

export async function svgToBlob(svgEl, size = 512) {
  const img = await svgToImage(svgEl, size);
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return new Promise((r) => c.toBlob(r, 'image/png'));
}

export async function shareBlob(blob, filename, text) {
  const file = new File([blob], filename, { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancelled';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return 'saved';
}

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The "I turned my cat into a Pocket Pet" before/after card, 1080x1350 (Instagram/TikTok friendly).
export async function beforeAfterBlob({ photo, petSvg, name, species }) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ffe3d3'); g.addColorStop(1, '#ffd0e0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#3b2e3a';
  ctx.textAlign = 'center';
  ctx.font = '900 64px Nunito, ui-rounded, system-ui, sans-serif';
  ctx.fillText(`I turned my ${species} into`, W / 2, 140);
  ctx.fillText('a Pocket Pet 🥹', W / 2, 220);

  const card = (x, y, w, h, rot, label, draw) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(59,46,58,0.22)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    ctx.fillStyle = '#fff';
    roundRect(ctx, -w / 2, -h / 2, w, h, 28); ctx.fill();
    ctx.shadowColor = 'transparent';
    draw(-w / 2 + 28, -h / 2 + 28, w - 56, h - 150);
    ctx.fillStyle = '#3b2e3a';
    ctx.font = '800 46px Nunito, ui-rounded, system-ui, sans-serif';
    ctx.fillText(label, 0, h / 2 - 50);
    ctx.restore();
  };

  if (photo) {
    const pi = await loadImg(photo);
    card(70, 330, 460, 620, -0.06, 'real ' + name, (x, y, w, h) => {
      ctx.save();
      roundRect(ctx, x, y, w, h, 16); ctx.clip();
      const r = Math.max(w / pi.width, h / pi.height);
      ctx.drawImage(pi, x + (w - pi.width * r) / 2, y + (h - pi.height * r) / 2, pi.width * r, pi.height * r);
      ctx.restore();
    });
  }
  const petImg = await svgToImage(petSvg, 800);
  card(photo ? 550 : 290, 360, 460, 620, photo ? 0.06 : 0, 'pocket ' + name, (x, y, w, h) => {
    ctx.fillStyle = '#fff6ec';
    roundRect(ctx, x, y, w, h, 16); ctx.fill();
    const r = Math.min(w / petImg.width, h / petImg.height) * 0.92;
    ctx.drawImage(petImg, x + (w - petImg.width * r) / 2, y + (h - petImg.height * r) / 2, petImg.width * r, petImg.height * r);
  });
  ctx.fillStyle = '#ff7a59';
  ctx.font = '900 54px Nunito, ui-rounded, system-ui, sans-serif';
  ctx.fillText('✦ Pocket Pet', W / 2, 1180);
  ctx.fillStyle = 'rgba(59,46,58,0.6)';
  ctx.font = '700 36px Nunito, ui-rounded, system-ui, sans-serif';
  ctx.fillText('scan your pet. raise your buddy.', W / 2, 1240);
  return new Promise((r) => c.toBlob(r, 'image/png'));
}
