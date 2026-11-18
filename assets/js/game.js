// ===== منطق بازی =====
const $ = s => document.querySelector(s);
const SAVE_KEY = "elementcraft-v1";
const XP_PER_NEW = 50;

// عناصری که در حداقل یک ترکیب شرکت می‌کنند (هاله‌ی زرد)
const CAN_MIX = new Set(REACTIONS.flatMap(r => r.key.split("+")));

let save = loadSave();
let selected = null;
let slots = [null, null];

function loadSave() {
  try { return Object.assign({ xp: 0, found: {} }, JSON.parse(localStorage.getItem(SAVE_KEY) || "{}")); }
  catch { return { xp: 0, found: {} }; }
}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* ignore */ } }

// ---------- جدول ----------
function buildTable() {
  const table = $("#table");
  ELEMENTS.forEach(el => {
    const b = document.createElement("button");
    b.className = "cell";
    b.style.gridRow = el.row;
    b.style.gridColumn = el.col;
    b.style.setProperty("--c", CAT[el.cat].color);
    b.dataset.sym = el.sym;
    b.title = el.fa + (CAN_MIX.has(el.sym) ? " (می‌تواند ترکیب شود)" : "");
    if (CAN_MIX.has(el.sym)) b.classList.add("canmix");
    b.innerHTML = `<i>${el.z}</i><b>${el.sym}</b>`;
    b.addEventListener("click", () => select(el.sym));
    table.appendChild(b);
  });
  [["لانتانیدها", 9], ["اکتینیدها", 10]].forEach(([t, r]) => {
    const d = document.createElement("div");
    d.className = "flabel"; d.textContent = t;
    d.style.gridRow = r; d.style.gridColumn = "1 / 3";
    table.appendChild(d);
  });
  $("#legend").innerHTML = Object.values(CAT)
    .map(c => `<li><span style="background:${c.color}"></span>${c.fa}</li>`).join("") +
    `<li><span class="halo-sw"></span>هاله‌ی زرد: این عنصر می‌تواند ترکیب شود</li>`;
}

// ---------- جزئیات عنصر ----------
const STATE_TEXT = {
  solid: "در شرایط عادی (۲۵°C و ۱ atm) جامد است.",
  liquid: "در شرایط عادی (۲۵°C و ۱ atm) مایع است.",
  gas: "در شرایط عادی (۲۵°C و ۱ atm) گاز است.",
  unknown: "عنصری ناپایدار یا مصنوعی است و حالت آن در شرایط عادی به‌طور تجربی تأیید نشده."
};

function select(sym) {
  selected = sym;
  document.querySelectorAll(".cell").forEach(c => c.classList.toggle("sel", c.dataset.sym === sym));
  const el = BY_SYM[sym];
  const period = el.row > 7 ? (el.row === 9 ? 6 : 7) : el.row;
  const group = el.row > 7 ? "—" : el.col;
  $("#details").innerHTML = `
    <div class="dhead">
      <canvas id="bigEl" class="pix"></canvas>
      <div>
        <div class="sym">${el.sym}</div>
        <h2>${el.fa}</h2>
      </div>
    </div>
    <dl>
      <dt>عدد اتمی</dt><dd>${el.z}</dd>
      <dt>جرم اتمی</dt><dd>${el.mass}</dd>
      <dt>دسته</dt><dd>${CAT[el.cat].fa}</dd>
      <dt>دوره / گروه</dt><dd>${period} / ${group}</dd>
      <dt>حالت ماده</dt><dd><span class="badge ${el.state}">${STATE_FA[el.state]}</span></dd>
    </dl>
    <p class="note">${STATE_TEXT[el.state]}</p>
    <button class="btn" id="addMix">بگذار روی میز کیمیاگری</button>`;
  drawVoxel($("#bigEl"), { color: el.look, type: elementVisual(el), seed: el.z });
  $("#addMix").addEventListener("click", () => addToMix(sym));
}

// ---------- میز ترکیب ----------
function addToMix(sym) {
  if (!slots[0]) slots[0] = sym;
  else if (!slots[1]) slots[1] = sym;
  else { slots[0] = slots[1]; slots[1] = sym; }
  $("#mixMsg").textContent = "";
  renderSlots();
}

function renderSlots() {
  slots.forEach((sym, i) => {
    const s = $("#slot" + i);
    s.innerHTML = "";
    s.classList.toggle("full", !!sym);
    if (!sym) { s.textContent = "+"; return; }
    const el = BY_SYM[sym];
    const c = document.createElement("canvas");
    c.className = "pix";
    drawVoxel(c, { color: el.look, type: elementVisual(el), seed: el.z });
    const t = document.createElement("span");
    t.textContent = sym;
    s.append(c, t);
  });
}

function mix() {
  if (!slots[0] || !slots[1]) {
    $("#mixMsg").textContent = "هر دو جای میز را با عنصر پر کن.";
    return;
  }
  const key = [...slots].sort().join("+");
  const r = REACTIONS.find(x => x.key === key);
  if (!r) {
    $("#mixMsg").textContent = "دستور ساختی برای این ترکیب در کتاب کشفیات فعلی تو وجود ندارد!";
    return;
  }
  const isNew = !save.found[r.key];
  if (isNew) { save.found[r.key] = true; save.xp += XP_PER_NEW; persist(); updateStats(); renderBook(); }
  $("#mixMsg").textContent = "";
  openResult(r, isNew);
}

// ---------- نتیجه ----------
function openResult(r, isNew) {
  const dlg = $("#resultDlg");
  dlg.innerHTML = `
    <div class="burst">${Array.from({ length: 14 }, (_, i) => `<s style="--a:${i * 26}deg;--d:${(i % 3) * 0.08}s"></s>`).join("")}</div>
    <p class="tag ${isNew ? "new" : ""}">${isNew ? "کشف جدید! ‎+" + XP_PER_NEW + " XP" : "قبلاً کشف شده"}</p>
    <canvas id="resCanvas" class="pix big"></canvas>
    <h2>${r.name}</h2>
    <div class="formula">${r.formula}</div>
    <div class="eq" dir="ltr">${r.equation}</div>
    <dl>
      <dt>دسته</dt><dd>${r.category}</dd>
      <dt>شرایط</dt><dd>${r.conditions}</dd>
    </dl>
    <p>${r.explanation}</p>
    <p class="safety inl">شبیه‌سازی آموزشی ساده‌شده؛ این واکنش‌ها را در دنیای واقعی انجام نده.</p>
    <button class="btn" id="resClose">بستن</button>`;
  drawVoxel($("#resCanvas"), { color: r.color, type: r.visual, seed: r.formula.length * 31 });
  $("#resClose").addEventListener("click", () => dlg.close());
  dlg.showModal();
}

// ---------- کتاب کشفیات ----------
function renderBook() {
  const grid = $("#bookGrid");
  grid.innerHTML = "";
  REACTIONS.forEach(r => {
    const found = !!save.found[r.key];
    const b = document.createElement("button");
    b.className = "bookcard" + (found ? "" : " locked");
    const c = document.createElement("canvas");
    c.className = "pix";
    drawVoxel(c, { color: found ? r.color : "#3a3a3a", type: r.visual, seed: r.formula.length * 31 });
    b.append(c);
    b.insertAdjacentHTML("beforeend", found
      ? `<b>${r.formula}</b><span>${r.name}</span><em>کشف شده</em>`
      : `<b>؟</b><span>هنوز کشف نشده</span><em>قفل</em>`);
    if (found) b.addEventListener("click", () => openResult(r, false));
    grid.appendChild(b);
  });
  $("#bookCount").textContent = `${Object.keys(save.found).length}/${REACTIONS.length}`;
}

function updateStats() {
  $("#xp").textContent = save.xp;
  $("#lvl").textContent = Math.floor(save.xp / 100) + 1;
}

// ---------- رویدادها ----------
function showView(book) {
  $("#viewTable").hidden = book;
  $("#viewBook").hidden = !book;
  $("#tabTable").classList.toggle("on", !book);
  $("#tabBook").classList.toggle("on", book);
}

$("#tabTable").addEventListener("click", () => showView(false));
$("#tabBook").addEventListener("click", () => showView(true));
$("#slot0").addEventListener("click", () => { slots[0] = null; renderSlots(); });
$("#slot1").addEventListener("click", () => { slots[1] = null; renderSlots(); });
$("#mixBtn").addEventListener("click", mix);
$("#resetBtn").addEventListener("click", () => $("#resetDlg").showModal());
$("#resetNo").addEventListener("click", () => $("#resetDlg").close());
$("#resetYes").addEventListener("click", () => {
  save = { xp: 0, found: {} };
  persist(); updateStats(); renderBook();
  $("#resetDlg").close();
});

buildTable();
renderSlots();
renderBook();
updateStats();
select("Fe");
