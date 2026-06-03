// ── AUTH ──
const CREDS = { user: 'lu_secure', pass: 'Hengeler101!' };

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  if (u === CREDS.user && p === CREDS.pass) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    renderDashboard();
  } else {
    const err = document.getElementById('login-error');
    err.style.display = 'block';
    document.getElementById('login-pass').value = '';
    setTimeout(() => { err.style.display = 'none'; }, 3000);
  }
}

function doLogout() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ── INIT ──
window.addEventListener('load', async () => {
  try {
    const data = await fetchData();
    db = data;
    if (!db.journeys) db.journeys = [];
  } catch (e) {
    db = { journeys: [] };
    console.error('Init error:', e);
  }
  document.getElementById('loading-overlay').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const ls = document.getElementById('login-screen');
    if (ls && ls.style.display === 'flex') doLogin();
  }
  if (e.key === 'Escape') {
    closeAddModal();
    closeEntryModal();
  }
});

// ── ACCENT CLASSES ──
const ACCENTS = ['acc-0','acc-1','acc-2','acc-3','acc-4'];

// ── DASHBOARD ──
function renderDashboard() {
  const grid = document.getElementById('journeys-grid');
  if (!db.journeys.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧳</div>
        <h3>No trips yet</h3>
        <p>Add your first journey to get started.</p>
      </div>`;
    return;
  }
  grid.innerHTML = db.journeys.map((j, i) => `
    <div class="journey-card" onclick="openJourney(${i})">
      <div class="card-accent ${ACCENTS[i % ACCENTS.length]}"></div>
      <div class="card-body">
        <span class="card-emoji">${j.emoji || '✈️'}</span>
        <div class="card-title">${j.title}</div>
        <div class="card-dates">${fmt(j.start)} → ${fmt(j.end)}</div>
        <div class="card-desc">${j.desc || 'No description.'}</div>
      </div>
      <div class="card-footer">
        <span class="card-stats">
          ${(j.todo||[]).length} tasks &middot; ${(j.days||[]).length} days &middot; ${(j.tips||[]).length} tips
        </span>
        <button class="card-del" onclick="event.stopPropagation(); deleteJourney(${i})">Delete</button>
      </div>
    </div>
  `).join('');
}

function fmt(d) { return d ? d.split('-').reverse().join('.') : '–'; }

function showDashboard() {
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('journey-detail').style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('brand-label').style.display = 'block';
  renderDashboard();
}

// ── ADD JOURNEY ──
function openAddModal() {
  document.getElementById('add-modal').classList.add('open');
  setTimeout(() => document.getElementById('new-title').focus(), 60);
}

function closeAddModal() {
  document.getElementById('add-modal').classList.remove('open');
  ['new-title','new-start','new-end','new-desc','new-emoji'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function handleModalClick(e) {
  if (e.target === e.currentTarget) closeAddModal();
}

function addJourney() {
  const title = document.getElementById('new-title').value.trim();
  if (!title) { document.getElementById('new-title').focus(); return; }
  db.journeys.push({
    title,
    start: document.getElementById('new-start').value,
    end: document.getElementById('new-end').value,
    desc: document.getElementById('new-desc').value.trim(),
    emoji: document.getElementById('new-emoji').value.trim() || '✈️',
    todo: [], days: [], tips: []
  });
  closeAddModal();
  renderDashboard();
  scheduleSave();
}

function deleteJourney(i) {
  if (!confirm(`Delete "${db.journeys[i].title}"? This cannot be undone.`)) return;
  db.journeys.splice(i, 1);
  renderDashboard();
  scheduleSave();
}

// ── JOURNEY DETAIL ──
let curIdx = null;

function openJourney(i) {
  curIdx = i;
  const j = db.journeys[i];
  document.getElementById('detail-emoji').textContent = j.emoji || '✈️';
  document.getElementById('detail-title').textContent = j.title;
  document.getElementById('detail-meta').textContent =
    [j.start && j.end ? `${fmt(j.start)} – ${fmt(j.end)}` : null, j.desc]
      .filter(Boolean).join('  ·  ');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('journey-detail').style.display = 'block';
  document.getElementById('back-btn').style.display = 'inline-flex';
  document.getElementById('brand-label').style.display = 'none';
  // reset to first tab
  switchTab('todo', document.querySelector('.tab-pill'));
  renderTodo();
  renderItinerary();
  renderTips();
}

function cur() { return db.journeys[curIdx]; }

// ── TABS ──
function switchTab(name, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ──────────────────────────────────────────────
// TO-DO
// ──────────────────────────────────────────────
function renderTodo() {
  const list = document.getElementById('todo-list');
  const items = cur().todo || [];
  if (!items.length) {
    list.innerHTML = '<li class="empty-msg">No tasks yet — add one above.</li>';
    return;
  }
  list.innerHTML = items.map((item, i) => `
    <li class="todo-item ${item.done ? 'done' : ''}">
      <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleTodo(${i})">
      <span class="todo-text">${escHtml(item.text)}</span>
      <button class="item-del" onclick="deleteTodo(${i})" title="Delete task">✕</button>
    </li>
  `).join('');
}

function addTodo() {
  const inp = document.getElementById('todo-input');
  const text = inp.value.trim();
  if (!text) return;
  cur().todo = cur().todo || [];
  cur().todo.push({ text, done: false });
  inp.value = '';
  renderTodo();
  scheduleSave();
}

function toggleTodo(i) {
  cur().todo[i].done = !cur().todo[i].done;
  renderTodo();
  scheduleSave();
}

function deleteTodo(i) {
  cur().todo.splice(i, 1);
  renderTodo();
  scheduleSave();
}

// ──────────────────────────────────────────────
// ITINERARY — TIMELINE
// ──────────────────────────────────────────────
function renderItinerary() {
  const container = document.getElementById('timeline');
  const days = cur().days || [];
  if (!days.length) {
    container.innerHTML = '<p class="empty-msg">No days yet — add one below.</p>';
    return;
  }
  container.innerHTML = days.map((day, di) => `
    <div class="timeline-day">
      <div class="timeline-day-dot"></div>
      <div class="timeline-day-header">
        <span class="timeline-day-label">${escHtml(day.label)}</span>
        <div class="day-actions">
          <button class="btn-day-entry" onclick="openEntryModal(${di})">+ Entry</button>
          <button class="btn-day-del" onclick="deleteDay(${di})" title="Delete day">Delete day</button>
        </div>
      </div>
      <div class="timeline-entries" id="day-entries-${di}">
        ${renderEntries(day.entries || [], di)}
      </div>
    </div>
  `).join('');
}

function renderEntries(entries, di) {
  if (!entries.length) return '<p class="timeline-empty">No entries yet.</p>';
  return entries.map((e, ei) => `
    <div class="timeline-entry">
      <span class="entry-time-badge ${e.time ? '' : 'no-time'}">${e.time || '——'}</span>
      <span class="entry-content" contenteditable="true"
        onblur="updateEntry(${di},${ei},this.textContent)">${escHtml(e.text)}</span>
      <button class="item-del" onclick="deleteEntry(${di},${ei})" title="Delete entry">✕</button>
    </div>
  `).join('');
}

function addDay() {
  const inp = document.getElementById('new-day-input');
  const label = inp.value.trim();
  if (!label) return;
  cur().days = cur().days || [];
  cur().days.push({ label, entries: [] });
  inp.value = '';
  renderItinerary();
  scheduleSave();
}

function deleteDay(di) {
  if (!confirm('Delete this day and all its entries?')) return;
  cur().days.splice(di, 1);
  renderItinerary();
  scheduleSave();
}

// Entry modal
let pendingDayIdx = null;

function openEntryModal(di) {
  pendingDayIdx = di;
  document.getElementById('entry-time').value = '';
  document.getElementById('entry-text').value = '';
  document.getElementById('entry-modal').classList.add('open');
  setTimeout(() => document.getElementById('entry-text').focus(), 60);
}

function closeEntryModal() {
  document.getElementById('entry-modal').classList.remove('open');
  pendingDayIdx = null;
}

function handleEntryModalClick(e) {
  if (e.target === e.currentTarget) closeEntryModal();
}

function confirmEntry() {
  const text = document.getElementById('entry-text').value.trim();
  if (!text) { document.getElementById('entry-text').focus(); return; }
  const time = document.getElementById('entry-time').value;
  cur().days[pendingDayIdx].entries = cur().days[pendingDayIdx].entries || [];
  cur().days[pendingDayIdx].entries.push({ time, text });
  closeEntryModal();
  renderItinerary();
  scheduleSave();
}

function updateEntry(di, ei, text) {
  if (!cur().days[di] || !cur().days[di].entries[ei]) return;
  cur().days[di].entries[ei].text = text.trim();
  scheduleSave();
}

function deleteEntry(di, ei) {
  cur().days[di].entries.splice(ei, 1);
  renderItinerary();
  scheduleSave();
}

// ──────────────────────────────────────────────
// TIPS
// ──────────────────────────────────────────────
const TAG_META = {
  general:       { label: 'General',       cls: 'badge-general' },
  food:          { label: 'Food',           cls: 'badge-food' },
  transport:     { label: 'Transport',      cls: 'badge-transport' },
  accommodation: { label: 'Accommodation', cls: 'badge-accommodation' },
  culture:       { label: 'Culture',        cls: 'badge-culture' },
};

const TAG_ICONS = {
  general: '💡', food: '🍜', transport: '🚇', accommodation: '🏨', culture: '🎭'
};

function renderTips() {
  const container = document.getElementById('tips-container');
  const tips = cur().tips || [];
  if (!tips.length) {
    container.innerHTML = '<p class="empty-msg">No tips yet — add one below.</p>';
    return;
  }
  // Group by tag
  const groups = {};
  tips.forEach((t, i) => {
    const tag = t.tag || 'general';
    if (!groups[tag]) groups[tag] = [];
    groups[tag].push({ ...t, index: i });
  });
  container.innerHTML = Object.entries(groups).map(([tag, items]) => {
    const meta = TAG_META[tag] || TAG_META.general;
    const icon = TAG_ICONS[tag] || '💡';
    return `
      <div class="tips-group">
        <div class="tips-group-label">${icon} ${meta.label}</div>
        ${items.map(t => `
          <div class="tip-item">
            <span class="tip-badge ${meta.cls}">${meta.label}</span>
            <span class="tip-text" contenteditable="true"
              onblur="updateTip(${t.index},this.textContent)">${escHtml(t.text)}</span>
            <button class="item-del" onclick="deleteTip(${t.index})" title="Delete tip">✕</button>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function addTip() {
  const inp = document.getElementById('tip-input');
  const text = inp.value.trim();
  const tag = document.getElementById('tip-tag').value;
  if (!text) return;
  cur().tips = cur().tips || [];
  cur().tips.push({ text, tag });
  inp.value = '';
  renderTips();
  scheduleSave();
}

function updateTip(i, text) {
  if (!cur().tips[i]) return;
  cur().tips[i].text = text.trim();
  scheduleSave();
}

function deleteTip(i) {
  cur().tips.splice(i, 1);
  renderTips();
  scheduleSave();
}

// ── HELPERS ──
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}