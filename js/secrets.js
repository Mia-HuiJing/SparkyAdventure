/* ================= Global Refresh Guard (true reload only) ================= */
(function () {
  window.addEventListener('pageshow', function (evt) {
    if (evt && evt.persisted) return; // bfcache restore (back/forward) — ignore

    const navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    const isReload = (navEntry && navEntry.type === 'reload') ||
                     (performance.navigation && performance.navigation.type === performance.navigation.TYPE_RELOAD);

    if (!isReload) return; // only act on real reload (Cmd+R / F5)

    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}

    // Always restart from intro.html after a true reload
    window.location.replace('intro.html');
  }, { once: true });
})();

/* ================= Secrets (left-to-right order) =================
   Storage shape:
   { order: [ {scene:'powergrid', letter:'Q'}, ... ] }
   ================================================================= */
const Secrets = {
  KEY: 'sparky-secrets-v2',

  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.KEY));
      if (raw && Array.isArray(raw.order)) return raw;
    } catch {}
    return { order: [] };
  },

  save(obj) { localStorage.setItem(this.KEY, JSON.stringify(obj)); },

  randomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random()*26)); // A–Z
  },

  has(scene) {
    return this.load().order.some(e => e.scene === scene);
  },

  getLetter(scene) {
    const s = this.load();
    const found = s.order.find(e => e.scene === scene);
    return found ? found.letter : null;
  },

  mark(scene) {
    const s = this.load();
    if (!this.has(scene)) {
      s.order.push({ scene, letter: this.randomLetter() });
      this.save(s);
    }
    return this.getLetter(scene);
  },

  renderCabinet() {
    const s = this.load();
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, i) => {
      const entry = s.order[i];
      if (entry) {
        slot.textContent = entry.letter;
        slot.dataset.filled = 'true';
      } else {
        slot.textContent = '';
        slot.dataset.filled = 'false';
      }
    });
  },

  allDone() { return this.load().order.length >= 5; },

  reset() { localStorage.removeItem(this.KEY); }
};

/* ================= Visits (map points clicked) =================== */
const Visits = {
  KEY: 'sparky-visits-v2',

  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },

  mark(scene) {
    const v = this.load();
    if (!v.includes(scene)) {
      v.push(scene);
      this.save(v);
    }
  },

  has(scene) { return this.load().includes(scene); },

  allClicked(allIds) {
    const v = this.load();
    return allIds.every(id => v.includes(id));
  },

  reset() { localStorage.removeItem(this.KEY); }
};

/* ================= Scene Helpers (shared) ======================== */
const Scene = {
  START_X: -336,             // exact start position requested
  SPARKY_SCALE: 0.35,
  STEP_PX: 15,
  TRIGGER_X: 17,
  BUBBLE_SCALE: 0.95,

  initCabinet() {
    Secrets.renderCabinet();
  },

  afterSecretGoNext() {
    if (Secrets.allDone()) {
      // all secrets collected → go to password gate (SecretGate.html) first
      window.location.href = 'SecretGate.html';
    } else {
      // otherwise, always go back to map
      window.location.href = 'map.html';
    }
  }
};
