// ===== داده‌ی عناصر و واکنش‌ها =====
// برای اضافه کردن ترکیب جدید فقط کافی است یک آیتم به REACTIONS اضافه کنید.

const SYMBOLS = ("H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
  "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
  "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
  "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og").split(" ");

// نام فارسی : جرم اتمی
const RAW = ("هیدروژن:1.008 هلیم:4.003 لیتیم:6.94 برلیم:9.012 بور:10.81 کربن:12.011 نیتروژن:14.007 اکسیژن:15.999 فلوئور:18.998 نئون:20.180 " +
  "سدیم:22.990 منیزیم:24.305 آلومینیوم:26.982 سیلیسیم:28.085 فسفر:30.974 گوگرد:32.06 کلر:35.45 آرگون:39.948 پتاسیم:39.098 کلسیم:40.078 " +
  "اسکاندیم:44.956 تیتانیوم:47.867 وانادیم:50.942 کروم:51.996 منگنز:54.938 آهن:55.845 کبالت:58.933 نیکل:58.693 مس:63.546 روی:65.38 " +
  "گالیم:69.723 ژرمانیم:72.630 آرسنیک:74.922 سلنیم:78.971 برم:79.904 کریپتون:83.798 روبیدیم:85.468 استرانسیم:87.62 ایتریم:88.906 زیرکونیم:91.224 " +
  "نیوبیم:92.906 مولیبدن:95.95 تکنسیم:98 روتنیم:101.07 رودیم:102.91 پالادیم:106.42 نقره:107.87 کادمیم:112.41 ایندیم:114.82 قلع:118.71 " +
  "آنتیموان:121.76 تلوریم:127.60 ید:126.90 زنون:131.29 سزیم:132.91 باریم:137.33 لانتان:138.91 سریم:140.12 پرازئودیمیم:140.91 نئودیمیم:144.24 " +
  "پرومتیم:145 ساماریم:150.36 اروپیم:151.96 گادولینیم:157.25 تربیم:158.93 دیسپروزیم:162.50 هولمیم:164.93 اربیم:167.26 تولیم:168.93 ایتربیم:173.05 " +
  "لوتتیم:174.97 هافنیم:178.49 تانتال:180.95 تنگستن:183.84 رنیم:186.21 اسمیم:190.23 ایریدیم:192.22 پلاتین:195.08 طلا:196.97 جیوه:200.59 " +
  "تالیم:204.38 سرب:207.2 بیسموت:208.98 پولونیم:209 آستاتین:210 رادون:222 فرانسیم:223 رادیم:226 اکتینیم:227 توریم:232.04 " +
  "پروتاکتینیم:231.04 اورانیم:238.03 نپتونیم:237 پلوتونیم:244 آمریسیم:243 کوریم:247 برکلیم:247 کالیفرنیم:251 انیشتینیم:252 فرمیم:257 " +
  "مندلیفیم:258 نوبلیم:259 لورنسیم:266 راترفوردیم:267 دوبنیم:268 سیبورگیم:269 بوریم:270 هاسیم:277 مایتنریم:278 دارمشتادتیم:281 " +
  "رونتگنیم:282 کوپرنیسیم:285 نیهونیم:286 فلروویم:289 مسکوویم:290 لیورموریم:293 تنسین:294 اوگانسون:294").split(" ");

const CAT = {
  alkali:     { fa: "فلز قلیایی",          color: "#e0734a" },
  alkaline:   { fa: "قلیایی خاکی",         color: "#e0a84a" },
  transition: { fa: "فلز واسطه",           color: "#5a8fd6" },
  post:       { fa: "فلز پس‌انتقالی",       color: "#6ab7a6" },
  metalloid:  { fa: "شبه‌فلز",             color: "#8fbf5a" },
  nonmetal:   { fa: "نافلز",               color: "#62c46a" },
  halogen:    { fa: "هالوژن",              color: "#c8c84a" },
  noble:      { fa: "گاز نجیب",            color: "#b17ad6" },
  lanthanide: { fa: "لانتانید",            color: "#d66aa0" },
  actinide:   { fa: "اکتینید",             color: "#c4566a" }
};

const STATE_FA = { solid: "جامد", liquid: "مایع", gas: "گاز", unknown: "نامشخص" };

const CAT_SETS = {
  alkali: [3, 11, 19, 37, 55, 87],
  alkaline: [4, 12, 20, 38, 56, 88],
  nonmetal: [1, 6, 7, 8, 15, 16, 34],
  halogen: [9, 17, 35, 53, 85, 117],
  noble: [2, 10, 18, 36, 54, 86, 118],
  metalloid: [5, 14, 32, 33, 51, 52],
  post: [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116]
};

function catOf(z) {
  for (const k in CAT_SETS) if (CAT_SETS[k].includes(z)) return k;
  if (z >= 57 && z <= 71) return "lanthanide";
  if (z >= 89 && z <= 103) return "actinide";
  return "transition";
}

// حالت ماده در دمای اتاق (۲۵ درجه‌ی سانتی‌گراد و ۱ اتمسفر)
const GAS = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86];
const LIQUID = [35, 80];
function stateOf(z) {
  if (GAS.includes(z)) return "gas";
  if (LIQUID.includes(z)) return "liquid";
  if (z === 85 || z === 87 || z >= 104) return "unknown"; // ناپایدار یا مصنوعی
  return "solid";
}

// جای هر عنصر در جدول (۱۸ ستون)
function posOf(z) {
  if (z === 1) return { row: 1, col: 1 };
  if (z === 2) return { row: 1, col: 18 };
  if (z <= 4) return { row: 2, col: z - 2 };
  if (z <= 10) return { row: 2, col: z + 8 };
  if (z <= 12) return { row: 3, col: z - 10 };
  if (z <= 18) return { row: 3, col: z };
  if (z <= 54) return { row: z <= 36 ? 4 : 5, col: z <= 36 ? z - 18 : z - 36 };
  if (z <= 56) return { row: 6, col: z - 54 };
  if (z <= 71) return { row: 9, col: z - 57 + 3 };
  if (z <= 86) return { row: 6, col: z - 72 + 4 };
  if (z <= 88) return { row: 7, col: z - 86 };
  if (z <= 103) return { row: 10, col: z - 89 + 3 };
  return { row: 7, col: z - 104 + 4 };
}

// رنگ‌های ویژه‌ی ظاهری بعضی عناصر (بقیه از رنگ دسته می‌آیند)
const LOOK = {
  H: "#dbe9ff", He: "#ffe9a0", C: "#2b2b32", N: "#b8c8ff", O: "#8fd3ff", F: "#d8f08a", Ne: "#ff6a3a",
  Na: "#c9ced6", Mg: "#c6cacf", Al: "#c8cdd2", Si: "#6b6f7a", P: "#e6d7a0", S: "#e8d43a", Cl: "#b8d24a",
  Ar: "#b57aff", K: "#cfd3da", Ca: "#e3e0d2", Ti: "#a9b2bd", Cr: "#b9c3cc", Mn: "#9a8fa0", Fe: "#9aa0a6",
  Co: "#7f8fa6", Ni: "#aab4bd", Cu: "#c8693a", Zn: "#aab4bd", Br: "#8a2f1a", Kr: "#8affd0", Ag: "#d8dde2",
  Sn: "#c3c8cd", I: "#5b3a7a", Xe: "#7aa8ff", W: "#7d848c", Pt: "#d4d8dc", Au: "#f2c230", Hg: "#c9ced6",
  Pb: "#5d6672", Rn: "#c77aff", U: "#7fa05a"
};

const ELEMENTS = SYMBOLS.map((sym, i) => {
  const z = i + 1;
  const [fa, mass] = RAW[i].split(":");
  const cat = catOf(z);
  const p = posOf(z);
  return { z, sym, fa, mass, cat, state: stateOf(z), row: p.row, col: p.col, look: LOOK[sym] || CAT[cat].color };
});
const BY_SYM = Object.fromEntries(ELEMENTS.map(e => [e.sym, e]));

// ===== ترکیب‌ها =====
// کلید: نماد دو عنصر به ترتیب حروف الفبا. بازیکن مقدار وارد نمی‌کند؛ این یک مکانیک ساده‌ی «تطبیق دستور» است.
// visual: crystal | water | gas | metal | dark
const REACTIONS = [
  { key: "Cl+Na", formula: "NaCl", name: "سدیم کلرید (نمک خوراکی)", visual: "crystal", color: "#f2f2ee", category: "نمک",
    equation: "2Na(s) + Cl₂(g) → 2NaCl(s)", conditions: "گرمای اولیه؛ واکنش بسیار گرمازا است",
    explanation: "نمک خوراکی بلورهای مکعبی دارد. کلر در طبیعت به شکل مولکول دو‌اتمی Cl₂ است، برای همین در معادله Cl₂ نوشته می‌شود." },
  { key: "H+O", formula: "H₂O", name: "آب", visual: "water", color: "#3f9bff", category: "اکسید مولکولی",
    equation: "2H₂(g) + O₂(g) → 2H₂O(l)", conditions: "جرقه یا گرما؛ واکنش شدید و انفجاری",
    explanation: "آب مایعی بی‌رنگ است که برای همه‌ی موجودات زنده حیاتی است. در بازی آن را آبی و نیمه‌شفاف نشان می‌دهیم." },
  { key: "C+O", formula: "CO₂", name: "کربن دی‌اکسید", visual: "gas", color: "#b8c0c8", category: "اکسید نافلز",
    equation: "C(s) + O₂(g) → CO₂(g)", conditions: "سوختن کامل کربن در اکسیژن کافی",
    explanation: "گازی بی‌رنگ که در تنفس تولید می‌شود و گیاهان در فتوسنتز مصرفش می‌کنند." },
  { key: "Mg+O", formula: "MgO", name: "منیزیم اکسید", visual: "metal", color: "#e8e8e4", category: "اکسید فلزی",
    equation: "2Mg(s) + O₂(g) → 2MgO(s)", conditions: "گرمای زیاد؛ شعله‌ی سفید و خیره‌کننده",
    explanation: "پودر سفید و نسوز که در ساخت آجرهای نسوز کاربرد دارد." },
  { key: "Fe+O", formula: "Fe₂O₃", name: "آهن(III) اکسید", visual: "metal", color: "#a8442a", category: "اکسید فلزی",
    equation: "4Fe(s) + 3O₂(g) → 2Fe₂O₃(s)", conditions: "دمای بالا یا اکسایش طولانی",
    explanation: "ترکیبی قرمز‌قهوه‌ای. زنگ معمولی آهن آبدار است و دقیقاً با Fe₂O₃ خالص یکی نیست." },
  { key: "H+N", formula: "NH₃", name: "آمونیاک", visual: "gas", color: "#c8e0ff", category: "ترکیب مولکولی",
    equation: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g)", conditions: "فرایند هابر: کاتالیزگر آهن، حدود ۴۰۰ تا ۵۰۰ درجه‌ی سانتی‌گراد و فشار بالا",
    explanation: "گازی با بوی تند که ماده‌ی اصلی کودهای شیمیایی است. واکنش برگشت‌پذیر است و با فرایند هابر صنعتی تولید می‌شود." },
  { key: "O+S", formula: "SO₂", name: "گوگرد دی‌اکسید", visual: "gas", color: "#d8d070", category: "اکسید نافلز",
    equation: "S(s) + O₂(g) → SO₂(g)", conditions: "سوختن گوگرد با شعله‌ی آبی",
    explanation: "گازی خفه‌کننده با بوی تند که از سوختن گوگرد و آتشفشان‌ها به وجود می‌آید." },
  { key: "Fe+S", formula: "FeS", name: "آهن(II) سولفید", visual: "dark", color: "#3a3430", category: "سولفید",
    equation: "Fe(s) + S(s) → FeS(s)", conditions: "گرما دادن مخلوط پودر آهن و گوگرد",
    explanation: "جامدی تیره و شکننده که برخلاف مخلوط اولیه، خاصیت آهن‌ربایی آهن را ندارد." },
  { key: "Ca+O", formula: "CaO", name: "کلسیم اکسید (آهک زنده)", visual: "metal", color: "#ece6d4", category: "اکسید فلزی",
    equation: "2Ca(s) + O₂(g) → 2CaO(s)", conditions: "گرما؛ در صنعت از تجزیه‌ی سنگ آهک هم تولید می‌شود",
    explanation: "جامد سفید که در ساخت سیمان و ملات کاربرد دارد." },
  { key: "Al+O", formula: "Al₂O₃", name: "آلومینیوم اکسید", visual: "crystal", color: "#8fb4ff", category: "اکسید فلزی",
    equation: "4Al(s) + 3O₂(g) → 2Al₂O₃(s)", conditions: "گرمای زیاد؛ لایه‌ی اکسید روی آلومینیوم هم خودبه‌خود تشکیل می‌شود",
    explanation: "بلور بسیار سخت. یاقوت و یاقوت کبود شکل‌های رنگی آن هستند." },
  { key: "Cl+K", formula: "KCl", name: "پتاسیم کلرید", visual: "crystal", color: "#ecf0f4", category: "نمک",
    equation: "2K(s) + Cl₂(g) → 2KCl(s)", conditions: "واکنش بسیار شدید؛ در آزمایشگاه خیلی کنترل‌شده انجام می‌شود",
    explanation: "نمکی بلوری که در کود کشاورزی و بدن موجودات زنده نقش دارد." },
  { key: "Cl+H", formula: "HCl", name: "هیدروژن کلرید", visual: "gas", color: "#d5e8a0", category: "ترکیب مولکولی",
    equation: "H₂(g) + Cl₂(g) → 2HCl(g)", conditions: "نور یا جرقه؛ واکنش می‌تواند انفجاری باشد",
    explanation: "گازی که در آب حل می‌شود و هیدروکلریک اسید می‌سازد." },
  { key: "Cu+O", formula: "CuO", name: "مس(II) اکسید", visual: "dark", color: "#2a2a2e", category: "اکسید فلزی",
    equation: "2Cu(s) + O₂(g) → 2CuO(s)", conditions: "حرارت دادن مس در هوا",
    explanation: "پودری سیاه رنگ که هنگام گرم کردن مس در هوا روی سطح آن تشکیل می‌شود." },
  { key: "O+Zn", formula: "ZnO", name: "روی اکسید", visual: "metal", color: "#efefe8", category: "اکسید فلزی",
    equation: "2Zn(s) + O₂(g) → 2ZnO(s)", conditions: "سوختن بخار روی با شعله‌ی سبزرنگ",
    explanation: "پودر سفیدی که در کرم‌های ضدآفتاب و رنگ‌سازی استفاده می‌شود." },
  { key: "O+Si", formula: "SiO₂", name: "سیلیسیم دی‌اکسید (کوارتز)", visual: "crystal", color: "#d8ecf4", category: "اکسید شبه‌فلز",
    equation: "Si(s) + O₂(g) → SiO₂(s)", conditions: "دمای بسیار بالا",
    explanation: "ماده‌ی اصلی ماسه و شیشه. بلور آن کوارتز نام دارد." },
  { key: "Ag+S", formula: "Ag₂S", name: "نقره سولفید", visual: "dark", color: "#34343a", category: "سولفید",
    equation: "2Ag(s) + S(s) → Ag₂S(s)", conditions: "دمای اتاق یا گرما؛ با ترکیبات گوگردی هوا هم رخ می‌دهد",
    explanation: "لایه‌ی سیاه روی وسایل نقره‌ای که به آن «کدر شدن» می‌گویند." },
  { key: "Cl+Mg", formula: "MgCl₂", name: "منیزیم کلرید", visual: "crystal", color: "#e8f0ee", category: "نمک",
    equation: "Mg(s) + Cl₂(g) → MgCl₂(s)", conditions: "گرما دادن منیزیم در گاز کلر",
    explanation: "نمکی که در آب دریا وجود دارد و در ساخت فلز منیزیم کاربرد دارد." },
  { key: "F+Na", formula: "NaF", name: "سدیم فلوئورید", visual: "crystal", color: "#f6f6ff", category: "نمک",
    equation: "2Na(s) + F₂(g) → 2NaF(s)", conditions: "واکنش بسیار شدید؛ فلوئور خطرناک‌ترین هالوژن است",
    explanation: "نمکی که به مقدار بسیار کم در خمیردندان برای محافظت از مینای دندان به کار می‌رود." },
  { key: "H+S", formula: "H₂S", name: "هیدروژن سولفید", visual: "gas", color: "#e6e08a", category: "ترکیب مولکولی",
    equation: "H₂(g) + S(s) → H₂S(g)", conditions: "گرما دادن؛ در طبیعت از تجزیه‌ی مواد آلی هم تولید می‌شود",
    explanation: "گازی با بوی تخم‌مرغ گندیده که سمی است." },
  { key: "Li+O", formula: "Li₂O", name: "لیتیم اکسید", visual: "metal", color: "#e6e6ea", category: "اکسید فلزی",
    equation: "4Li(s) + O₂(g) → 2Li₂O(s)", conditions: "سوختن لیتیم در هوا با شعله‌ی قرمز",
    explanation: "جامدی سفید که در ساخت شیشه و سرامیک کاربرد دارد." },
  { key: "C+H", formula: "CH₄", name: "متان", visual: "gas", color: "#a8d8ff", category: "ترکیب آلی",
    equation: "C(s) + 2H₂(g) → CH₄(g)", conditions: "کاتالیزگر نیکل و دمای بالا (ساده‌شده)",
    explanation: "ساده‌ترین هیدروکربن و جزء اصلی گاز طبیعی." }
];
