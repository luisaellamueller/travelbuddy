// ── JSONBIN CONFIG ──
const BIN_ID  = '6a1ed128da38895dfe7b7ca9';
const API_KEY = '$2a$10$gfeQhRYKoFgyvSxFCR6LOuxAVv0JimNL215ZFCrUOeZX1Z5.0y.YO';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
 
// ── SHARED STATE ──
let db = { journeys: [] };
let saveTimer = null;
 
// ── FETCH ──
async function fetchData() {
  const res = await fetch(BIN_URL, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' }
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}
 
// ── PUSH ──
async function pushData(data) {
  const res = await fetch(BIN_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Push failed: ${res.status}`);
}
 
// ── SYNC INDICATOR ──
function setSyncing() {
  const el = document.getElementById('sync-badge');
  if (!el) return;
  el.textContent = 'syncing…';
  el.className = 'sync-badge syncing';
}
 
function setSynced() {
  const el = document.getElementById('sync-badge');
  if (!el) return;
  el.textContent = 'synced';
  el.className = 'sync-badge';
  showToast('Changes saved');
}
 
function setSyncErr() {
  const el = document.getElementById('sync-badge');
  if (!el) return;
  el.textContent = 'sync error';
  el.className = 'sync-badge err';
}
 
// ── DEBOUNCED SAVE ──
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    setSyncing();
    try {
      await pushData(db);
      setSynced();
    } catch (e) {
      setSyncErr();
      console.error('Sync error:', e);
    }
  }, 900);
}
 
// ── TOAST ──
let toastTimer;
function showToast(msg = 'Saved') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
 