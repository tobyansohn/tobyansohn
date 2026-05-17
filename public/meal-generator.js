/**
 * MealGenerator — powered by TheMealDB (free, no API key required)
 *
 * ── Programmatic API ────────────────────────────────────────────────────────
 *
 *   const meals = await MealGenerator.generate({
 *     cuisine  : 'Italian',   // or 'any'
 *     mainType : 'Chicken',   // 'Beef'|'Chicken'|'Seafood'|'Lamb'|'Pasta'|'Pork'|'Vegetarian'|'any'
 *     weight   : 'light',     // 'light'|'medium'|'heavy'|'any'
 *     cookTime : 'quick',     // 'quick'|'medium'|'long'|'any'
 *     pairing  : 'match',     // 'match' = same cuisine for all 3 | 'free' = starter/dessert from any
 *   });
 *   // → { starter: MealObject, main: MealObject, dessert: MealObject }
 *
 * ── Widget embed ─────────────────────────────────────────────────────────────
 *
 *   <!-- Option A: auto-init -->
 *   <div data-meal-generator></div>
 *   <script src="meal-generator.js"></script>
 *
 *   <!-- Option B: manual init -->
 *   <div id="my-meal-gen"></div>
 *   <script src="meal-generator.js"></script>
 *   <script>MealGenerator.render('#my-meal-gen', { theme: 'dark' })</script>
 *
 *   <!-- Option C: ES module import -->
 *   <script type="module">
 *     import MealGenerator from './meal-generator.js';
 *     const meals = await MealGenerator.generate({ cuisine: 'Japanese' });
 *   </script>
 *
 * ── MealObject shape ─────────────────────────────────────────────────────────
 *
 *   {
 *     idMeal        : "52772",
 *     strMeal       : "Teriyaki Chicken Casserole",
 *     strMealThumb  : "https://…",
 *     strArea       : "Japanese",
 *     strCategory   : "Chicken",
 *     strInstructions: "…",
 *     strYoutube    : "https://youtube.com/…",
 *     strSource     : "https://…",
 *     ingredients   : [{ measure: "3 cups", name: "soy sauce" }, …],
 *     cookTimeEstimate: "quick" | "medium" | "long" | "unknown",
 *     weightEstimate  : "light" | "medium" | "heavy" | "unknown",
 *   }
 */

;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);                       // AMD
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();                // CommonJS / Node
  } else {
    root.MealGenerator = factory();            // Browser global
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────

  const BASE = 'https://www.themealdb.com/api/json/v1/1';

  const ALL_AREAS = [
    'American','British','Canadian','Chinese','Croatian','Dutch','Egyptian',
    'Filipino','French','Greek','Indian','Irish','Italian','Jamaican','Japanese',
    'Kenyan','Malaysian','Mexican','Moroccan','Polish','Portuguese','Russian',
    'Spanish','Thai','Tunisian','Turkish','Ukrainian','Vietnamese',
  ];

  const STARTER_CATS = ['Starter', 'Side', 'Miscellaneous'];
  const MAIN_CATS    = ['Beef','Chicken','Seafood','Lamb','Pasta','Pork','Vegetarian','Goat'];
  const DESSERT_CATS = ['Dessert'];

  const WEIGHT_CATS = {
    light  : ['Seafood', 'Vegetarian', 'Vegan'],
    medium : ['Chicken', 'Pasta', 'Miscellaneous'],
    heavy  : ['Beef', 'Lamb', 'Pork', 'Goat'],
  };

  // ── Utils ──────────────────────────────────────────────────────────────────

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── API helpers ────────────────────────────────────────────────────────────

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MealGenerator: HTTP ${res.status} — ${url}`);
    return res.json();
  }

  async function getMealsByArea(area) {
    const d = await fetchJSON(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
    return d.meals || [];
  }

  async function getMealsByCategory(cat) {
    const d = await fetchJSON(`${BASE}/filter.php?c=${encodeURIComponent(cat)}`);
    return d.meals || [];
  }

  async function getMealById(id) {
    const d = await fetchJSON(`${BASE}/lookup.php?i=${id}`);
    const raw = d.meals?.[0];
    if (!raw) return null;
    return normalizeMeal(raw);
  }

  // ── Meal normalization ─────────────────────────────────────────────────────
  // Adds computed `ingredients`, `cookTimeEstimate`, `weightEstimate` fields

  function normalizeMeal(raw) {
    // Build clean ingredients array
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const name    = (raw[`strIngredient${i}`] || '').trim();
      const measure = (raw[`strMeasure${i}`]    || '').trim();
      if (!name) break;
      ingredients.push({ measure, name });
    }

    return {
      ...raw,
      ingredients,
      cookTimeEstimate : estimateCookTime(raw.strInstructions),
      weightEstimate   : weightFromCategory(raw.strCategory),
    };
  }

  function estimateCookTime(instructions) {
    if (!instructions) return 'unknown';
    const matches = [...instructions.matchAll(/(\d+)\s*(?:to\s*\d+\s*)?(min(?:ute)?s?|hour?s?|hr)/gi)];
    let maxMins = 0;
    for (const m of matches) {
      let val = parseInt(m[1]);
      if (/hour|hr/i.test(m[2])) val *= 60;
      if (val > maxMins) maxMins = val;
    }
    if (maxMins === 0)  return 'unknown';
    if (maxMins <= 30)  return 'quick';
    if (maxMins <= 60)  return 'medium';
    return 'long';
  }

  function weightFromCategory(cat) {
    if (!cat) return 'unknown';
    const c = cat.toLowerCase();
    if (['seafood','vegetarian','vegan','starter','side'].some(k => c.includes(k))) return 'light';
    if (['chicken','pasta','miscellaneous','breakfast'].some(k => c.includes(k)))   return 'medium';
    if (['beef','lamb','pork','goat'].some(k => c.includes(k)))                     return 'heavy';
    return 'unknown';
  }

  function timeMatches(meal, filter) {
    if (filter === 'any') return true;
    const est = meal.cookTimeEstimate;
    return est === 'unknown' || est === filter;
  }

  // ── Pool building ──────────────────────────────────────────────────────────

  async function buildPool(categories, area) {
    let pool = [];
    if (area) {
      const byArea = await getMealsByArea(area);
      if (byArea.length) {
        const areaIds = new Set(byArea.map(m => m.idMeal));
        for (const cat of categories) {
          try {
            const byCat = await getMealsByCategory(cat);
            pool.push(...byCat.filter(m => areaIds.has(m.idMeal)));
          } catch { /* skip */ }
        }
        if (!pool.length) pool = byArea;
      }
    }
    if (!pool.length) {
      for (const cat of categories) {
        try { pool.push(...await getMealsByCategory(cat)); } catch { /* skip */ }
      }
    }
    return pool;
  }

  async function selectMeal(categories, area, cookTime = 'any') {
    const pool = await buildPool(categories, area);
    if (!pool.length) return null;

    if (cookTime === 'any') {
      return getMealById(pickRandom(pool).idMeal);
    }

    const candidates = shuffle(pool).slice(0, 8);
    const details    = await Promise.all(candidates.map(m => getMealById(m.idMeal).catch(() => null)));
    const valid      = details.filter(m => m && timeMatches(m, cookTime));
    return pickRandom(valid.length ? valid : details.filter(Boolean)) || null;
  }

  // ── Public: generate() ─────────────────────────────────────────────────────

  /**
   * Generate a 3-course meal based on preferences.
   *
   * @param {object} opts
   * @param {string} [opts.cuisine='any']
   * @param {string} [opts.mainType='any']
   * @param {string} [opts.weight='any']    'light' | 'medium' | 'heavy' | 'any'
   * @param {string} [opts.cookTime='any']  'quick' | 'medium' | 'long'  | 'any'
   * @param {string} [opts.pairing='match'] 'match' | 'free'
   * @returns {Promise<{ starter: MealObject, main: MealObject, dessert: MealObject }>}
   */
  async function generate(opts = {}) {
    const {
      cuisine  = 'any',
      mainType = 'any',
      weight   = 'any',
      cookTime = 'any',
      pairing  = 'match',
    } = opts;

    const mainArea = cuisine === 'any' ? pickRandom(ALL_AREAS) : cuisine;
    const sideArea = pairing === 'match' ? mainArea : null;

    let mainCats;
    if (mainType !== 'any')    mainCats = [mainType];
    else if (weight !== 'any') mainCats = WEIGHT_CATS[weight] || MAIN_CATS;
    else                       mainCats = [pickRandom(MAIN_CATS)];

    const [starter, main, dessert] = await Promise.all([
      selectMeal(STARTER_CATS, sideArea, cookTime),
      selectMeal(mainCats,     mainArea, cookTime),
      selectMeal(DESSERT_CATS, sideArea, 'any'),
    ]);

    return { starter, main, dessert };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Widget renderer
  // ══════════════════════════════════════════════════════════════════════════

  const WIDGET_CSS = `
.mg-wrap{font-family:Georgia,serif;background:#0f0e17;color:#fffffe;border-radius:16px;overflow:hidden;padding:28px 24px 32px;}
.mg-title{font-size:1.6rem;color:#f5c842;text-align:center;letter-spacing:.04em;margin-bottom:4px;}
.mg-subtitle{text-align:center;color:#a8a4c8;font-style:italic;font-size:.9rem;margin-bottom:24px;}
.mg-filters{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:20px;}
.mg-filter{display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px;}
.mg-filter label{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#a8a4c8;font-family:Arial,sans-serif;}
.mg-filter select{appearance:none;background:#1e1c30;color:#fffffe;border:1.5px solid #3a3660;border-radius:8px;padding:10px 32px 10px 12px;font-size:.92rem;font-family:inherit;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='none' stroke='%23a8a4c8' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;transition:border-color .2s;}
.mg-filter select:focus{outline:none;border-color:#f5c842;}
.mg-filter select option{background:#1e1c30;}
.mg-btn{display:block;width:100%;margin:4px 0 24px;padding:13px;background:#f5c842;color:#0f0e17;border:none;border-radius:40px;font-size:1rem;font-family:inherit;font-weight:bold;letter-spacing:.06em;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 20px rgba(245,200,66,.22);}
.mg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(245,200,66,.38);}
.mg-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.mg-cards{display:flex;gap:16px;flex-wrap:wrap;}
.mg-card{background:#1e1c30;border:1.5px solid #2e2b50;border-radius:14px;flex:1;min-width:220px;overflow:hidden;opacity:0;transform:translateY(20px);transition:opacity .45s,transform .45s;}
.mg-card.mg-visible{opacity:1;transform:translateY(0);}
.mg-card::before{content:'';display:block;height:3px;}
.mg-card.mg-starter::before{background:#6ec6f5;}
.mg-card.mg-main::before{background:#f5c842;}
.mg-card.mg-dessert::before{background:#f57fa0;}
.mg-card img{width:100%;height:160px;object-fit:cover;display:block;background:#2e2b50;}
.mg-card-body{padding:14px 16px 14px;}
.mg-course{font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:8px;}
.mg-card.mg-starter .mg-course{color:#6ec6f5;}
.mg-card.mg-main .mg-course{color:#f5c842;}
.mg-card.mg-dessert .mg-course{color:#f57fa0;}
.mg-name{font-size:1.05rem;margin-bottom:5px;}
.mg-meta{font-size:.75rem;color:#6e6a90;font-family:Arial,sans-serif;margin-bottom:8px;}
.mg-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
.mg-tag{font-size:.68rem;font-family:Arial,sans-serif;padding:2px 9px;border-radius:20px;background:#2e2b50;color:#a8a4c8;}
.mg-recipe-btn{width:100%;padding:8px;background:transparent;border:1.5px solid #3a3660;border-radius:7px;color:#a8a4c8;font-size:.8rem;font-family:Arial,sans-serif;cursor:pointer;transition:border-color .2s,color .2s;}
.mg-recipe-btn:hover{border-color:#f5c842;color:#f5c842;}
.mg-empty{text-align:center;color:#a8a4c8;font-style:italic;padding:32px;width:100%;}
.mg-skeleton{background:linear-gradient(90deg,#2e2b50 25%,#3a3660 50%,#2e2b50 75%);background-size:200% 100%;animation:mg-shimmer 1.4s infinite;border-radius:6px;}
@keyframes mg-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
/* Modal */
.mg-overlay{position:fixed;inset:0;background:rgba(10,9,20,.88);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .25s;}
.mg-overlay.mg-open{opacity:1;pointer-events:all;}
.mg-modal{background:#1a1830;border:1.5px solid #3a3660;border-radius:18px;width:100%;max-width:780px;max-height:88vh;overflow-y:auto;transform:translateY(16px) scale(.97);transition:transform .25s;scrollbar-width:thin;scrollbar-color:#3a3660 transparent;}
.mg-overlay.mg-open .mg-modal{transform:translateY(0) scale(1);}
.mg-modal-header{position:sticky;top:0;background:#1a1830;border-bottom:1px solid #2e2b50;padding:18px 22px 14px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;z-index:1;border-radius:18px 18px 0 0;}
.mg-modal-header h2{font-size:1.35rem;color:#fffffe;line-height:1.2;}
.mg-modal-sub{margin-top:3px;font-size:.76rem;color:#6e6a90;font-family:Arial,sans-serif;letter-spacing:.06em;}
.mg-close{background:none;border:none;color:#a8a4c8;font-size:1.4rem;cursor:pointer;padding:3px 7px;border-radius:6px;transition:color .2s,background .2s;line-height:1;}
.mg-close:hover{color:#fffffe;background:#2e2b50;}
.mg-modal img{width:100%;height:220px;object-fit:cover;}
.mg-modal-body{padding:24px 24px 28px;display:grid;grid-template-columns:1fr 1.6fr;gap:28px;}
@media(max-width:560px){.mg-modal-body{grid-template-columns:1fr;gap:20px;}}
.mg-modal-body h3{font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:#f5c842;margin-bottom:12px;font-family:Arial,sans-serif;}
.mg-ing-list{list-style:none;display:flex;flex-direction:column;gap:7px;}
.mg-ing-list li{font-size:.87rem;color:#c8c4e8;display:flex;gap:8px;line-height:1.4;}
.mg-ing-list li::before{content:'·';color:#f5c842;flex-shrink:0;}
.mg-measure{color:#fffffe;font-weight:bold;flex-shrink:0;min-width:66px;font-family:Arial,sans-serif;font-size:.8rem;}
.mg-steps{list-style:none;display:flex;flex-direction:column;gap:14px;}
.mg-steps li{display:flex;gap:12px;font-size:.87rem;color:#c8c4e8;line-height:1.6;}
.mg-step-num{font-size:.72rem;font-family:Arial,sans-serif;font-weight:bold;color:#f5c842;background:rgba(245,200,66,.12);border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:3px;}
.mg-modal-footer{padding:0 24px 22px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.mg-yt{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;background:rgba(255,80,80,.1);border:1px solid rgba(255,80,80,.3);border-radius:8px;color:#ff8080;font-size:.8rem;font-family:Arial,sans-serif;text-decoration:none;transition:background .2s;}
.mg-yt:hover{background:rgba(255,80,80,.2);}
.mg-src{font-size:.76rem;color:#6e6a90;font-family:Arial,sans-serif;font-style:italic;text-decoration:none;}
.mg-src:hover{color:#a8a4c8;}
`;

  let _styleInjected = false;
  function injectStyles() {
    if (_styleInjected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = WIDGET_CSS;
    document.head.appendChild(el);
    _styleInjected = true;
  }

  // ── Widget HTML builder ────────────────────────────────────────────────────

  const CUISINES = [
    ['any','Surprise Me'],['American','American'],['British','British'],
    ['Chinese','Chinese'],['French','French'],['Greek','Greek'],
    ['Indian','Indian'],['Italian','Italian'],['Japanese','Japanese'],
    ['Mexican','Mexican'],['Spanish','Spanish'],['Thai','Thai'],
    ['Vietnamese','Vietnamese'],
  ];
  const MAIN_TYPES = [
    ['any','Any'],['Beef','Beef'],['Chicken','Chicken'],['Seafood','Seafood'],
    ['Lamb','Lamb'],['Pasta','Pasta'],['Vegetarian','Vegetarian'],['Pork','Pork'],
  ];
  const WEIGHTS    = [['any','Any Weight'],['light','Light'],['medium','Medium'],['heavy','Heavy']];
  const COOK_TIMES = [['any','Any Time'],['quick','Quick (<30 min)'],['medium','Medium (30–60 min)'],['long','Long (60+ min)']];
  const PAIRINGS   = [['match','Match cuisine throughout'],['free','Mix starter & dessert']];

  function selectHTML(id, opts) {
    return `<select id="${id}">${opts.map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}</select>`;
  }

  function buildWidgetHTML(uid) {
    return `
<div class="mg-wrap">
  <div class="mg-title">3-Course Meal Generator</div>
  <div class="mg-subtitle">Real recipes, live from TheMealDB</div>
  <div class="mg-filters">
    <div class="mg-filter"><label>Cuisine</label>${selectHTML(`${uid}-cuisine`, CUISINES)}</div>
    <div class="mg-filter"><label>Main Type</label>${selectHTML(`${uid}-maintype`, MAIN_TYPES)}</div>
    <div class="mg-filter"><label>Weight</label>${selectHTML(`${uid}-weight`, WEIGHTS)}</div>
    <div class="mg-filter"><label>Cook Time</label>${selectHTML(`${uid}-cooktime`, COOK_TIMES)}</div>
    <div class="mg-filter"><label>Pairing</label>${selectHTML(`${uid}-pairing`, PAIRINGS)}</div>
  </div>
  <button class="mg-btn" id="${uid}-btn">Generate My Meal</button>
  <div class="mg-cards" id="${uid}-cards">
    <div class="mg-empty">Your 3-course meal will appear here ✦</div>
  </div>
</div>
<!-- Modal (shared, appended to body) -->
`;
  }

  // ── Widget time / weight helpers ───────────────────────────────────────────

  const TIME_LABEL   = { quick:'⏱ Under 30 min', medium:'⏱ 30–60 min', long:'⏱ 60+ min' };
  const WEIGHT_LABEL = { light:'🥗 Light', medium:'⚖️ Medium', heavy:'🍖 Heavy' };
  const COURSE_ICON  = { starter:'🥗', main:'🍽️', dessert:'🍮' };
  const COURSE_LABEL = { starter:'Starter', main:'Main', dessert:'Dessert' };

  function excerpt(text, max = 130) {
    if (!text) return '';
    const clean = text.replace(/\r?\n+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
  }

  function parseSteps(text) {
    if (!text) return [];
    let parts = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    parts = parts.filter(p => !/^(step\s*)?\d+[\.\):]?\s*$/i.test(p));
    parts = parts.map(p => p.replace(/^(step\s*)?\d+[\.\):\-]\s*/i, '').trim()).filter(Boolean);
    if (parts.length <= 2) {
      const sentences = text.replace(/\r?\n/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z])/);
      const chunks = [];
      let cur = '';
      for (const s of sentences) {
        cur += (cur ? ' ' : '') + s;
        if (cur.length > 120) { chunks.push(cur.trim()); cur = ''; }
      }
      if (cur.trim()) chunks.push(cur.trim());
      return chunks.filter(Boolean);
    }
    return parts;
  }

  // ── Global modal (one instance per page) ───────────────────────────────────

  let _modal = null;

  function ensureModal() {
    if (_modal || typeof document === 'undefined') return;
    const div = document.createElement('div');
    div.className = 'mg-overlay';
    div.id = 'mg-global-overlay';
    div.innerHTML = `
      <div class="mg-modal" id="mg-global-modal">
        <div class="mg-modal-header">
          <div><h2 id="mg-modal-title"></h2><div class="mg-modal-sub" id="mg-modal-sub"></div></div>
          <button class="mg-close" id="mg-modal-close">✕</button>
        </div>
        <img id="mg-modal-img" src="" alt="" style="width:100%;height:220px;object-fit:cover;">
        <div class="mg-modal-body">
          <div><h3>Ingredients</h3><ul class="mg-ing-list" id="mg-modal-ing"></ul></div>
          <div><h3>Method</h3><ul class="mg-steps" id="mg-modal-steps"></ul></div>
        </div>
        <div class="mg-modal-footer" id="mg-modal-footer"></div>
      </div>`;
    document.body.appendChild(div);
    _modal = div;

    div.addEventListener('click', e => { if (e.target === div) closeModal(); });
    document.getElementById('mg-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  function openModal(meal) {
    ensureModal();
    document.getElementById('mg-modal-title').textContent = meal.strMeal;
    document.getElementById('mg-modal-sub').textContent =
      [meal.strArea, meal.strCategory].filter(Boolean).join(' · ');
    document.getElementById('mg-modal-img').src = meal.strMealThumb || '';
    document.getElementById('mg-modal-img').alt = meal.strMeal;

    const ingEl = document.getElementById('mg-modal-ing');
    ingEl.innerHTML = '';
    (meal.ingredients || []).forEach(({ measure, name }) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="mg-measure">${measure}</span><span>${name}</span>`;
      ingEl.appendChild(li);
    });

    const stepsEl = document.getElementById('mg-modal-steps');
    stepsEl.innerHTML = '';
    parseSteps(meal.strInstructions || '').forEach((step, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="mg-step-num">${i + 1}</span><span>${step}</span>`;
      stepsEl.appendChild(li);
    });

    const footer = document.getElementById('mg-modal-footer');
    footer.innerHTML = '';
    if (meal.strYoutube) {
      footer.innerHTML += `<a class="mg-yt" href="${meal.strYoutube}" target="_blank" rel="noopener">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.3.3 4.3s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.4 21.8 12 21.8 12 21.8s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.3v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8l6.6 3.8-6.6 3.7z"/></svg>
        Watch on YouTube</a>`;
    }
    if (meal.strSource) {
      footer.innerHTML += `<a class="mg-src" href="${meal.strSource}" target="_blank" rel="noopener">Original source ↗</a>`;
    }

    _modal.classList.add('mg-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (_modal) _modal.classList.remove('mg-open');
    document.body.style.overflow = '';
  }

  // ── Skeleton ───────────────────────────────────────────────────────────────

  function renderSkeletons(container) {
    container.innerHTML = '';
    ['starter','main','dessert'].forEach(course => {
      const card = document.createElement('div');
      card.className = `mg-card mg-${course} mg-visible`;
      card.innerHTML = `
        <div class="mg-skeleton" style="height:160px;border-radius:0;"></div>
        <div class="mg-card-body" style="padding:14px 16px;">
          <div class="mg-skeleton" style="height:9px;width:55px;margin-bottom:12px;"></div>
          <div class="mg-skeleton" style="height:18px;width:80%;margin-bottom:7px;"></div>
          <div class="mg-skeleton" style="height:11px;width:40%;margin-bottom:10px;"></div>
          <div class="mg-skeleton" style="height:10px;width:95%;margin-bottom:5px;"></div>
          <div class="mg-skeleton" style="height:10px;width:75%;"></div>
        </div>`;
      container.appendChild(card);
    });
  }

  // ── Card renderer ──────────────────────────────────────────────────────────

  function renderCards(container, meals) {
    container.innerHTML = '';
    ['starter','main','dessert'].forEach((course, idx) => {
      const meal = meals[course];
      if (!meal) return;

      const card  = document.createElement('div');
      card.className = `mg-card mg-${course}`;

      const timeTag   = TIME_LABEL[meal.cookTimeEstimate]   || '';
      const weightTag = WEIGHT_LABEL[meal.weightEstimate]   || '';
      const tags      = [timeTag, weightTag].filter(Boolean)
        .map(t => `<span class="mg-tag">${t}</span>`).join('');

      card.innerHTML = `
        <img src="${meal.strMealThumb}/preview" alt="${meal.strMeal}" loading="lazy"
             onerror="this.style.display='none'">
        <div class="mg-card-body">
          <div class="mg-course">${COURSE_ICON[course]} ${COURSE_LABEL[course]}</div>
          <div class="mg-name">${meal.strMeal}</div>
          <div class="mg-meta">${[meal.strArea, meal.strCategory].filter(Boolean).join(' · ')}</div>
          ${tags ? `<div class="mg-tags">${tags}</div>` : ''}
          <div style="font-size:.82rem;color:#a8a4c8;font-style:italic;line-height:1.5;margin-bottom:10px;">${excerpt(meal.strInstructions)}</div>
          <button class="mg-recipe-btn">View Full Recipe →</button>
        </div>`;

      card.querySelector('.mg-recipe-btn').addEventListener('click', () => openModal(meal));
      container.appendChild(card);
      setTimeout(() => card.classList.add('mg-visible'), idx * 110 + 30);
    });
  }

  // ── Widget init ────────────────────────────────────────────────────────────

  /**
   * Render the full meal generator widget into a DOM element.
   *
   * @param {string|Element} target  CSS selector or DOM element
   * @param {object}         [opts]  Default filter values (same keys as generate())
   */
  function render(target, opts = {}) {
    if (typeof document === 'undefined') throw new Error('render() requires a browser environment');
    injectStyles();
    ensureModal();

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) throw new Error(`MealGenerator.render: target not found — "${target}"`);

    const uid = 'mg' + Math.random().toString(36).slice(2, 7);
    el.innerHTML = buildWidgetHTML(uid);

    // Apply default values from opts
    const map = { cuisine:`${uid}-cuisine`, mainType:`${uid}-maintype`,
                  weight:`${uid}-weight`, cookTime:`${uid}-cooktime`, pairing:`${uid}-pairing` };
    Object.entries(map).forEach(([key, id]) => {
      if (opts[key]) {
        const sel = document.getElementById(id);
        if (sel) sel.value = opts[key];
      }
    });

    const btn       = document.getElementById(`${uid}-btn`);
    const cardsEl   = document.getElementById(`${uid}-cards`);

    btn.addEventListener('click', async () => {
      btn.disabled    = true;
      btn.textContent = 'Finding dishes…';
      renderSkeletons(cardsEl);

      try {
        const meals = await generate({
          cuisine  : document.getElementById(`${uid}-cuisine`).value,
          mainType : document.getElementById(`${uid}-maintype`).value,
          weight   : document.getElementById(`${uid}-weight`).value,
          cookTime : document.getElementById(`${uid}-cooktime`).value,
          pairing  : document.getElementById(`${uid}-pairing`).value,
        });
        renderCards(cardsEl, meals);
      } catch (err) {
        cardsEl.innerHTML = '<div class="mg-empty">Could not load meals — check your internet connection.</div>';
        console.error('MealGenerator error:', err);
      } finally {
        btn.disabled    = false;
        btn.textContent = 'Generate My Meal';
      }
    });
  }

  // ── Auto-init ──────────────────────────────────────────────────────────────
  // Any element with data-meal-generator gets the widget rendered into it.

  function autoInit() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-meal-generator]').forEach(el => {
      const opts = {};
      if (el.dataset.cuisine)   opts.cuisine   = el.dataset.cuisine;
      if (el.dataset.mainType)  opts.mainType  = el.dataset.mainType;
      if (el.dataset.weight)    opts.weight    = el.dataset.weight;
      if (el.dataset.cookTime)  opts.cookTime  = el.dataset.cookTime;
      if (el.dataset.pairing)   opts.pairing   = el.dataset.pairing;
      render(el, opts);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return { generate, render };
}));
