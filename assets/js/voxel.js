// ===== رسم بلوک‌های پیکسلی (ماینکرفتی) روی canvas ۱۶×۱۶ =====
// استفاده: drawVoxel(canvas, { color: "#9aa0a6", type: "metal", seed: 26 })
// type: solid | metal | liquid | gas | crystal | dark | water

function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16 & 255)},${c(n >> 8 & 255)},${c(n & 255)})`;
}

function drawVoxel(canvas, opts) {
  const { color = "#888888", type = "solid", seed = 1 } = opts;
  canvas.width = 16; canvas.height = 16;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 16, 16);
  const rand = mulberry(seed * 7919 + 13);
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  if (type === "solid" || type === "metal") {
    for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) {
      let f = 0.82 + rand() * 0.28;
      if (type === "metal" && y % 4 === 2) f += 0.14;
      if (x === 1 || y === 1) f += 0.25;
      if (x === 14 || y === 14) f -= 0.3;
      px(x, y, shade(color, f));
    }
    for (let i = 0; i < 16; i++) {
      const o = shade(color, 0.35);
      px(i, 0, o); px(i, 15, o); px(0, i, o); px(15, i, o);
    }
    if (type === "metal") {
      [[3, 3], [12, 3], [3, 12], [12, 12]].forEach(([x, y]) => px(x, y, shade(color, 1.5)));
    } else {
      for (let i = 0; i < 6; i++) px(2 + Math.floor(rand() * 11), 2 + Math.floor(rand() * 11), shade(color, 0.55));
    }
    return;
  }

  if (type === "liquid" || type === "water" || type === "gas") {
    const glass = "#9fc8e0";
    // درپوش
    for (let x = 5; x <= 10; x++) { px(x, 0, "#8a5a2b"); px(x, 1, "#6e4520"); }
    // گردن و بدنه
    for (let x = 4; x <= 11; x++) px(x, 2, glass);
    for (let y = 3; y <= 14; y++) { px(2, y, glass); px(13, y, glass); }
    for (let x = 2; x <= 13; x++) px(x, 14, glass);
    const top = type === "gas" ? 3 : 5;
    for (let y = top; y <= 13; y++) for (let x = 3; x <= 12; x++) {
      if (type === "gas") px(x, y, "#10202c");
      else px(x, y, shade(color, (type === "water" ? 0.95 : 0.85) + rand() * 0.2));
    }
    if (type !== "gas") for (let x = 3; x <= 12; x++) px(x, top, shade(color, 1.35));
    const n = type === "gas" ? 22 : 4;
    for (let i = 0; i < n; i++) {
      const x = 3 + Math.floor(rand() * 10), y = top + 1 + Math.floor(rand() * (13 - top));
      px(x, y, type === "gas" ? shade(color, 0.8 + rand() * 0.5) : "rgba(255,255,255,0.7)");
    }
    px(3, 4, "#ffffff"); px(3, 6, "#ffffff"); // براق شیشه
    return;
  }

  // crystal | dark
  const base = type === "dark" ? shade(color, 1) : color;
  const crystal = (cx, top, bot, w) => {
    const h = bot - top;
    for (let y = top; y <= bot; y++) {
      const half = Math.max(0, Math.round(((y - top) / h) * (w / 2) * 1.4));
      for (let x = cx - half; x <= cx + half; x++) {
        let f = x < cx ? 1.18 : x > cx ? 0.72 : 1.0;
        if (y === top) f = 1.4;
        if (type === "dark") f *= 1.8; // رنگ‌های تیره کمی روشن‌تر دیده شوند
        px(x, y, shade(base, f * (0.94 + rand() * 0.12)));
      }
    }
  };
  for (let x = 1; x < 15; x++) px(x, 15, "rgba(0,0,0,0.35)");
  crystal(4, 6, 14, 5);
  crystal(11, 4, 14, 5);
  crystal(8, 1, 14, 7);
  if (type === "dark") for (let i = 0; i < 4; i++) px(2 + Math.floor(rand() * 12), 2 + Math.floor(rand() * 11), "#ffffff");
}

// نوع تصویر هر عنصر بر اساس حالت ماده و دسته
function elementVisual(el) {
  if (el.state === "gas") return "gas";
  if (el.state === "liquid") return el.sym === "Hg" ? "liquid" : "liquid";
  if (["nonmetal", "metalloid"].includes(el.cat)) return el.sym === "C" ? "dark" : "solid";
  if (el.cat === "halogen") return "crystal";
  return "metal";
}
