'use strict';

/* ============================================================
   Notenwerte-Definitionen
   Einheit: 1 "unit" = eine Achtelnote. Ein 4/4-Takt = 8 units.
   ============================================================ */

const UNITS_PER_MEASURE = 8;

// Alle Breiten werden in % der Takt-Breite gerechnet (nicht in fixen px) -
// dadurch passt sich die Tafel jeder Bildschirmgröße an, ohne dass ein
// Takt, der eigentlich passt, einen horizontalen Scrollbalken braucht.
const unitsToPercent = (units) => (units / UNITS_PER_MEASURE) * 100;

// Notenkopf-Position (% der EIGENEN Notenbreite), sodass er immer exakt in
// der Mitte der ERSTEN Achtel-Einheit seiner Dauer landet - unabhängig von
// der Gesamtbreite der Note. -17px ist ein fester, an der Icon-Grafik
// empirisch ausgemessener Korrekturwert (Icon-Größe bleibt bewusst fix).
const anchorPercent = (units) => 50 / units;

// Jede Note wird per CSS (.placed-note .icon) an einer festen Position
// verankert, NICHT in der Mitte ihrer gesamten Dauer-Fläche: der Notenkopf
// (immer bei cx=16 im 40er-viewBox) sitzt exakt über der Zählzeit, an der
// die Note beginnt - so wie auf der Notenwerte-Übersicht. Die Fläche rechts
// davon zeigt nur, wie lange die Note klingt.
const NOTE_TYPES = [
  {
    id: 'whole',
    name: 'Ganze Note',
    units: 8,
    isRest: false,
    icon: `<svg viewBox="0 0 40 48"><ellipse cx="16" cy="30" rx="13" ry="8" transform="rotate(-15 16 30)" fill="none" stroke="#1a1a1a" stroke-width="4"/></svg>`,
  },
  {
    id: 'half',
    name: 'Halbe Note',
    units: 4,
    isRest: false,
    icon: `<svg viewBox="0 0 40 48"><ellipse cx="16" cy="36" rx="11" ry="7.5" transform="rotate(-15 16 36)" fill="none" stroke="#1a1a1a" stroke-width="3.5"/><line x1="26" y1="33" x2="26" y2="6" stroke="#1a1a1a" stroke-width="3.5"/></svg>`,
  },
  {
    id: 'quarter',
    name: 'Viertel Note',
    units: 2,
    isRest: false,
    icon: `<svg viewBox="0 0 40 48"><ellipse cx="16" cy="36" rx="11" ry="7.5" transform="rotate(-15 16 36)" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3.5"/><line x1="26" y1="33" x2="26" y2="6" stroke="#1a1a1a" stroke-width="3.5"/></svg>`,
  },
  {
    id: 'eighth',
    name: 'Achtel (einzeln)',
    units: 1,
    isRest: false,
    // Einzelne, unverbundene Achtel bekommt ein Fähnchen (Standard-Notation).
    icon: `<svg viewBox="0 0 40 48"><ellipse cx="16" cy="36" rx="11" ry="7.5" transform="rotate(-15 16 36)" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3.5"/><line x1="26" y1="33" x2="26" y2="6" stroke="#1a1a1a" stroke-width="3.5"/><path d="M26 6 C34 9 35 17 27 21" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'quarterRest',
    name: 'Viertelpause',
    units: 2,
    isRest: true,
    icon: `<svg viewBox="0 0 40 48"><path d="M18 6 L27 15 L18 24 L27 31 L16 43" fill="none" stroke="#1a1a1a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
];

// Kompakte, NICHT verzerrte Vorschau-Grafik nur für die Palette-Karte
// "Achtelpaar" (natürliches Seitenverhältnis, kein preserveAspectRatio-Hack).
const PALETTE_PAIR_ICON = `<svg viewBox="0 0 64 40">
  <ellipse cx="12" cy="30" rx="9" ry="6.5" transform="rotate(-15 12 30)" fill="#1a1a1a"/>
  <ellipse cx="44" cy="30" rx="9" ry="6.5" transform="rotate(-15 44 30)" fill="#1a1a1a"/>
  <line x1="20" y1="27" x2="20" y2="4" stroke="#1a1a1a" stroke-width="3"/>
  <line x1="52" y1="27" x2="52" y2="4" stroke="#1a1a1a" stroke-width="3"/>
  <rect x="20" y="2" width="32" height="5" fill="#1a1a1a"/>
</svg>`;

const noteType = (id) => NOTE_TYPES.find((t) => t.id === id);

// Palette: die meisten Karten erzeugen 1 Note; "Achtelpaar" ist eine
// Komfort-Karte, die 2 einzelne Achtel-Noten gleichzeitig einfügt (passend
// zu den physischen "Notenblöcken"). Nach dem Einfügen sind es zwei völlig
// unabhängige Noten - Balken werden beim Rendern automatisch erkannt.
const PALETTE_ITEMS = [
  { kind: 'single', typeId: 'whole' },
  { kind: 'single', typeId: 'half' },
  { kind: 'single', typeId: 'quarter' },
  { kind: 'pair', typeId: 'eighth', name: 'Achtelpaar', units: 2 },
  { kind: 'single', typeId: 'eighth' },
  { kind: 'single', typeId: 'quarterRest' },
];

/* ============================================================
   State
   ============================================================ */

let uidCounter = 1;
const uid = (prefix) => `${prefix}-${uidCounter++}`;

const state = {
  measures: [],
  bpm: 90,
  metronome: true,
  isPlaying: false,
};

function newMeasure() {
  return { id: uid('m'), notes: [] };
}

function measureUnits(measure) {
  return measure.notes.reduce((sum, n) => sum + noteType(n.typeId).units, 0);
}

function measureStatus(measure) {
  const units = measureUnits(measure);
  if (units === 0) return 'leer';
  if (units < UNITS_PER_MEASURE) return 'offen';
  if (units === UNITS_PER_MEASURE) return 'voll';
  return 'uebervoll';
}

// Reihenfolge + Startposition (in Achtel-Einheiten) jeder Note im Takt -
// wird gebraucht, um benachbarte Achtel zu einem Balkenpaar zu gruppieren.
function layoutNotes(measure) {
  let cursor = 0;
  return measure.notes.map((note) => {
    const type = noteType(note.typeId);
    const entry = { note, type, start: cursor };
    cursor += type.units;
    return entry;
  });
}

function formatBeats(units) {
  const beats = units / 2;
  return Number.isInteger(beats) ? String(beats) : beats.toFixed(1);
}

/* ============================================================
   Rendering: Palette
   ============================================================ */

const paletteCardsEl = document.getElementById('paletteCards');

function renderPalette() {
  paletteCardsEl.innerHTML = '';
  PALETTE_ITEMS.forEach((item) => {
    const type = noteType(item.typeId);
    const isPair = item.kind === 'pair';
    const units = isPair ? item.units : type.units;
    const name = isPair ? item.name : type.name;
    const icon = isPair ? PALETTE_PAIR_ICON : type.icon;
    const beatsLabel = formatBeats(units);

    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <span class="icon">${icon}</span>
      <span class="label">
        <span class="name">${name}</span>
        <span class="beats">${beatsLabel} Zählzeit${beatsLabel === '1' ? '' : 'en'}</span>
      </span>
    `;
    card.addEventListener('pointerdown', (e) => startDragNew(e, item));
    paletteCardsEl.appendChild(card);
  });
}

/* ============================================================
   Rendering: Measures
   ============================================================ */

const measuresEl = document.getElementById('measures');

function renderMeasures() {
  measuresEl.innerHTML = '';
  state.measures.forEach((measure, idx) => {
    measuresEl.appendChild(renderMeasure(measure, idx));
  });
}

function renderMeasure(measure, index) {
  const status = measureStatus(measure);
  const units = measureUnits(measure);
  const beats = formatBeats(units);

  const wrap = document.createElement('div');
  wrap.className = `measure status-${status}`;
  wrap.dataset.measureId = measure.id;

  const header = document.createElement('div');
  header.className = 'measure-header';

  const statusText = {
    leer: '0 / 4 Zählzeiten',
    offen: `${beats} / 4 Zählzeiten`,
    voll: 'Voll ✓',
    uebervoll: 'Übervoll!',
  }[status];

  header.innerHTML = `
    <span class="measure-title">Takt ${index + 1}</span>
    <span class="measure-status">${statusText}</span>
    <button class="measure-remove" title="Takt entfernen">×</button>
  `;
  header.querySelector('.measure-remove').addEventListener('click', () => {
    removeMeasure(measure.id);
  });

  const track = document.createElement('div');
  track.className = 'slot-track';
  track.dataset.measureId = measure.id;

  // Schlag-Trennlinien (nach jeder Viertel) + Taktende-Markierung
  [0, 2, 4, 6, 8].forEach((unitPos) => {
    const tick = document.createElement('div');
    tick.className = 'beat-tick';
    tick.style.position = 'absolute';
    tick.style.top = '0';
    tick.style.bottom = '0';
    tick.style.left = `${unitsToPercent(unitPos)}%`;
    tick.style.width = unitPos === UNITS_PER_MEASURE ? '3px' : '1px';
    tick.style.background = unitPos === UNITS_PER_MEASURE ? '#8a8a8a' : '#dedad0';
    tick.style.pointerEvents = 'none';
    track.appendChild(tick);
  });

  renderMeasureNotes(track, measure);

  const playhead = document.createElement('div');
  playhead.className = 'playhead';
  track.appendChild(playhead);

  const beatLabels = document.createElement('div');
  beatLabels.className = 'beat-labels';
  beatLabels.innerHTML = ['1', '+', '2', '+', '3', '+', '4', '+']
    .map((l) => `<span>${l}</span>`)
    .join('');

  wrap.appendChild(header);
  wrap.appendChild(track);
  wrap.appendChild(beatLabels);

  track.addEventListener('pointerdown', (e) => {
    // Klicks auf leeren Bereich der Spur sollen nichts auslösen; das Ziehen
    // startet ausschließlich über die Karten (Palette oder platzierte Note).
  });

  return wrap;
}

// Zwei benachbarte einzelne Achtel, die exakt auf einer Zählzeit beginnen
// (z. B. Position 0+1, 2+3, 4+5, 6+7), werden als verbundenes Paar mit
// gemeinsamem Balken dargestellt - unabhängig davon, ob sie über die
// "Achtelpaar"-Karte oder einzeln als "Achtel" hineingezogen wurden.
function renderMeasureNotes(track, measure) {
  const layout = layoutNotes(measure);
  let i = 0;
  while (i < layout.length) {
    const cur = layout[i];
    const next = layout[i + 1];
    const canPair =
      cur.type.id === 'eighth' &&
      next &&
      next.type.id === 'eighth' &&
      cur.start % 2 === 0 &&
      next.start === cur.start + 1;

    if (canPair) {
      track.appendChild(renderEighthPair(cur.note, next.note));
      i += 2;
    } else {
      track.appendChild(renderPlacedNote(cur.note, cur.type));
      i += 1;
    }
  }
}

function attachNoteInteractions(el, noteId) {
  const deleteBtn = el.querySelector('.delete-btn');
  deleteBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteNote(noteId);
  });
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.delete-btn')) return;
    startDragMove(e, noteId);
  });
}

function renderPlacedNote(note, type) {
  const pct = unitsToPercent(type.units);
  const el = document.createElement('div');
  el.className = 'placed-note';
  el.dataset.noteId = note.id;
  el.style.width = `${pct}%`;
  el.style.flex = `0 0 ${pct}%`;
  el.style.setProperty('--anchor-pct', anchorPercent(type.units));
  el.innerHTML = `
    <span class="icon">${type.icon}</span>
    <button class="delete-btn" title="Entfernen">×</button>
  `;
  attachNoteInteractions(el, note.id);
  return el;
}

// Zwei einzelne, undehnte Notenkopf-Grafiken (gleiche Form wie die Viertel,
// nur ohne Fähnchen) + ein per CSS positionierter Balken dazwischen - anstatt
// eine einzelne Grafik zu verzerren. Jede Hälfte bleibt einzeln greifbar/
// löschbar (eigene note-id), sitzt aber ohne eigenen Rahmen in einer
// gemeinsamen Karte, damit es wie EIN Notenblock aussieht.
function renderEighthPair(noteA, noteB) {
  const pct = unitsToPercent(2);
  const beamedIcon = noteType('quarter').icon;
  const el = document.createElement('div');
  el.className = 'placed-note-pair';
  el.style.width = `${pct}%`;
  el.style.flex = `0 0 ${pct}%`;
  el.innerHTML = `
    <div class="eighth-half" data-note-id="${noteA.id}">
      <span class="icon">${beamedIcon}</span>
      <button class="delete-btn delete-btn-left" title="Entfernen">×</button>
    </div>
    <div class="eighth-half" data-note-id="${noteB.id}">
      <span class="icon">${beamedIcon}</span>
      <button class="delete-btn" title="Entfernen">×</button>
    </div>
    <div class="beam-bar"></div>
  `;
  el.querySelectorAll('.eighth-half').forEach((half) => {
    attachNoteInteractions(half, half.dataset.noteId);
  });
  return el;
}

/* ============================================================
   State mutation
   ============================================================ */

function findNoteLocation(noteId) {
  for (const measure of state.measures) {
    const index = measure.notes.findIndex((n) => n.id === noteId);
    if (index !== -1) return { measure, index };
  }
  return null;
}

function deleteNote(noteId) {
  const loc = findNoteLocation(noteId);
  if (!loc) return;
  loc.measure.notes.splice(loc.index, 1);
  renderMeasures();
}

function insertNote(measureId, index, note) {
  const measure = state.measures.find((m) => m.id === measureId);
  if (!measure) return;
  measure.notes.splice(index, 0, note);
}

function addMeasure() {
  state.measures.push(newMeasure());
  renderMeasures();
}

function removeMeasure(measureId) {
  state.measures = state.measures.filter((m) => m.id !== measureId);
  if (state.measures.length === 0) state.measures.push(newMeasure());
  renderMeasures();
}

function clearAll() {
  state.measures = [newMeasure()];
  renderMeasures();
}

/* ============================================================
   Drag & Drop (Pointer Events - funktioniert mit Maus, Touch & Stift)
   ============================================================ */

let drag = null; // { kind: 'new'|'move', paletteItem?, noteId?, units, isPair, innerHtml }

const dragGhost = document.getElementById('dragGhost');

// Der schwebende Cursor-Anhang ist fixed-positioniert (nicht Teil des
// Takt-Layouts) und braucht deshalb eine echte px-Breite - gemessen an der
// aktuell gerenderten Taktbreite, damit sie zur jeweiligen Bildschirmgröße passt.
function currentUnitPx() {
  const track = document.querySelector('.slot-track');
  const width = track ? track.getBoundingClientRect().width : 320;
  return width / UNITS_PER_MEASURE;
}

function startDragNew(e, paletteItem) {
  if (state.isPlaying) return;
  e.preventDefault();
  const isPair = paletteItem.kind === 'pair';
  const type = noteType(paletteItem.typeId);
  const units = isPair ? paletteItem.units : type.units;
  const innerHtml = isPair ? pairInnerHtml() : singleInnerHtml(type.icon, anchorPercent(units));
  drag = { kind: 'new', paletteItem, units, isPair, innerHtml };
  beginGhost(wrapHtml(innerHtml, units * currentUnitPx(), isPair));
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragEnd);
}

function startDragMove(e, noteId) {
  if (state.isPlaying) return;
  e.preventDefault();
  const loc = findNoteLocation(noteId);
  if (!loc) return;
  const type = noteType(loc.measure.notes[loc.index].typeId);
  const innerHtml = singleInnerHtml(type.icon, anchorPercent(type.units));
  drag = { kind: 'move', noteId, units: type.units, isPair: false, innerHtml };
  beginGhost(wrapHtml(innerHtml, type.units * currentUnitPx(), false));
  document.querySelectorAll(`[data-note-id="${noteId}"]`).forEach((el) => el.classList.add('dragging-source'));
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragEnd);
}

function singleInnerHtml(iconSvg, anchorPct) {
  return `<span class="icon" style="--anchor-pct:${anchorPct}">${iconSvg}</span>`;
}

function pairInnerHtml() {
  const beamedIcon = noteType('quarter').icon;
  return `<div class="eighth-half"><span class="icon">${beamedIcon}</span></div><div class="eighth-half"><span class="icon">${beamedIcon}</span></div><div class="beam-bar"></div>`;
}

function wrapHtml(innerHtml, widthPx, isPair) {
  const cls = isPair ? 'placed-note-pair' : 'placed-note';
  return `<div class="${cls}" style="width:${widthPx}px;">${innerHtml}</div>`;
}

function beginGhost(html) {
  dragGhost.innerHTML = html;
  dragGhost.hidden = false;
}

// Während des Ziehens bekommt die Note sofort ihre echte Feld-Breite direkt
// im Takt zu sehen (nicht nur als loser Cursor-Anhang) - so ist auf einen
// Blick klar, wie viel Platz noch da ist und ob die Note überhaupt passt.
function onDragMove(e) {
  if (!drag) return;
  dragGhost.style.left = `${e.clientX}px`;
  dragGhost.style.top = `${e.clientY}px`;

  clearDragHighlights();

  const track = trackUnderPoint(e.clientX, e.clientY);
  if (!track) return;
  track.classList.add('drag-over');

  const excludeNoteId = drag.kind === 'move' ? drag.noteId : null;
  const { referenceEl } = computeDropIndex(track, e.clientX, excludeNoteId);

  const pct = unitsToPercent(drag.units);
  const preview = document.createElement('div');
  preview.className = `insert-preview${drag.isPair ? ' insert-preview-pair' : ''}`;
  preview.style.width = `${pct}%`;
  preview.style.flex = `0 0 ${pct}%`;
  preview.innerHTML = drag.innerHtml;

  const insertBeforeEl = topLevelChildOf(track, referenceEl);
  if (insertBeforeEl) track.insertBefore(preview, insertBeforeEl);
  else track.appendChild(preview);

  const measure = state.measures.find((m) => m.id === track.dataset.measureId);
  const existingUnits = measure.notes.reduce(
    (sum, n) => sum + (n.id === excludeNoteId ? 0 : noteType(n.typeId).units),
    0
  );
  const wouldBeUnits = existingUnits + drag.units;
  track.closest('.measure').classList.toggle('preview-overfull', wouldBeUnits > UNITS_PER_MEASURE);
}

// Läuft von einem Nachfahren (z. B. .eighth-half) zum direkten Kind von
// `track` hoch, damit insertBefore ein gültiges Referenz-Element bekommt.
function topLevelChildOf(track, el) {
  let node = el;
  while (node && node.parentElement !== track) node = node.parentElement;
  return node;
}

function onDragEnd(e) {
  if (!drag) return;
  const track = trackUnderPoint(e.clientX, e.clientY);

  if (track) {
    const measureId = track.dataset.measureId;
    const { index } = computeDropIndex(track, e.clientX, drag.kind === 'move' ? drag.noteId : null);

    if (drag.kind === 'new') {
      if (drag.paletteItem.kind === 'pair') {
        insertNote(measureId, index, { id: uid('n'), typeId: 'eighth' });
        insertNote(measureId, index + 1, { id: uid('n'), typeId: 'eighth' });
      } else {
        insertNote(measureId, index, { id: uid('n'), typeId: drag.paletteItem.typeId });
      }
    } else if (drag.kind === 'move') {
      const loc = findNoteLocation(drag.noteId);
      if (loc) {
        const note = loc.measure.notes[loc.index];
        loc.measure.notes.splice(loc.index, 1);
        const targetMeasure = state.measures.find((m) => m.id === measureId);
        // Index ggf. korrigieren, falls im selben Takt vor der alten Position entfernt wurde
        let insertAt = index;
        if (loc.measure.id === measureId && loc.index < index) insertAt -= 1;
        targetMeasure.notes.splice(insertAt, 0, note);
      }
    }
  } else if (drag.kind === 'move') {
    // außerhalb jeder Spur losgelassen -> Note entfernen
    deleteNote(drag.noteId);
  }

  cleanupDrag();
  renderMeasures();
}

function cleanupDrag() {
  document.removeEventListener('pointermove', onDragMove);
  document.removeEventListener('pointerup', onDragEnd);
  dragGhost.hidden = true;
  dragGhost.innerHTML = '';
  clearDragHighlights();
  document.querySelectorAll('.dragging-source').forEach((el) => el.classList.remove('dragging-source'));
  drag = null;
}

function clearDragHighlights() {
  document.querySelectorAll('.slot-track.drag-over').forEach((t) => t.classList.remove('drag-over'));
  document.querySelectorAll('.insert-preview').forEach((p) => p.remove());
  document.querySelectorAll('.measure.preview-overfull').forEach((m) => m.classList.remove('preview-overfull'));
}

function trackUnderPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest('.slot-track') : null;
}

function computeDropIndex(track, clientX, excludeNoteId) {
  const rect = track.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  // [data-note-id] matcht sowohl einzelne Noten (.placed-note) als auch
  // jede Hälfte eines Achtelpaars (.eighth-half) - eine echte Note pro
  // Eintrag, unabhängig davon, wie sie gerade gruppiert dargestellt wird.
  const items = Array.from(track.querySelectorAll('[data-note-id]')).filter(
    (el) => el.dataset.noteId !== excludeNoteId
  );

  let index = items.length;
  let referenceEl = null;

  for (let i = 0; i < items.length; i++) {
    const itemRect = items[i].getBoundingClientRect();
    const mid = itemRect.left - rect.left + itemRect.width / 2;
    if (relativeX < mid) {
      index = i;
      referenceEl = items[i];
      break;
    }
  }
  return { index, referenceEl };
}

/* ============================================================
   Audio-Playback (Web Audio API)
   ============================================================ */

let audioCtx = null;
let activeOscillators = [];
let activeTimeouts = [];

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function scheduleTone(startTime, duration, frequency) {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = frequency;

  const attack = 0.015;
  const release = Math.min(0.08, duration * 0.3);
  const peak = 0.28;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + attack);
  gain.gain.setValueAtTime(peak * 0.85, startTime + Math.max(attack, duration - release));
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
  activeOscillators.push(osc);
}

function scheduleClick(startTime) {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 1500;
  gain.gain.setValueAtTime(0.12, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + 0.05);
  activeOscillators.push(osc);
}

function play() {
  if (state.isPlaying) return;
  ensureAudioContext();
  state.isPlaying = true;
  playBtn.disabled = true;
  stopBtn.disabled = false;

  const secondsPerBeat = 60 / state.bpm;
  const unitSeconds = secondsPerBeat / 2;
  const startAt = audioCtx.currentTime + 0.15;
  const repeatCount = Math.max(1, Math.min(50, Math.round(Number(repeatInput.value)) || 1));

  let cursorUnits = 0;
  const measureSegments = []; // { measureId, startUnit } - für den laufenden Cursor
  const noteSegments = []; // { noteId, startUnit, endUnit } - für die Hervorhebung

  for (let rep = 0; rep < repeatCount; rep++) {
    state.measures.forEach((measure) => {
      const measureStartUnits = cursorUnits;
      measureSegments.push({ measureId: measure.id, startUnit: measureStartUnits });

      measure.notes.forEach((note) => {
        const type = noteType(note.typeId);
        const noteStart = startAt + cursorUnits * unitSeconds;
        const noteDuration = type.units * unitSeconds;

        if (!type.isRest) {
          scheduleTone(noteStart, noteDuration * 0.92, 523.25);
        }
        noteSegments.push({ noteId: note.id, startUnit: cursorUnits, endUnit: cursorUnits + type.units });

        cursorUnits += type.units;
      });

      const measureUsedUnits = cursorUnits - measureStartUnits;
      if (measureUsedUnits < UNITS_PER_MEASURE) {
        cursorUnits = measureStartUnits + UNITS_PER_MEASURE;
      }
    });
  }

  const totalUnits = cursorUnits;

  if (state.metronome) {
    for (let u = 0; u < totalUnits; u += 2) {
      scheduleClick(startAt + u * unitSeconds);
    }
  }

  const totalMs = totalUnits * unitSeconds * 1000 + 200;
  activeTimeouts.push(setTimeout(() => stop(), totalMs));

  startCursor(measureSegments, noteSegments, unitSeconds, startAt);
}

// Laufender Zeigebalken UND Noten-Hervorhebung laufen über dieselbe Uhr
// (audioCtx.currentTime, nicht die System-/setTimeout-Uhr) - sonst laufen
// beide mit der Zeit leicht gegeneinander (und gegen den tatsächlichen Ton)
// auseinander, weil setTimeout-Verzögerungen nicht exakt sample-genau sind.
let cursorRAF = null;
let highlightedNoteIds = new Set();

function startCursor(measureSegments, noteSegments, unitSeconds, startAt) {
  function tick() {
    if (!state.isPlaying) return;
    const elapsedUnits = (audioCtx.currentTime - startAt) / unitSeconds;

    document.querySelectorAll('.playhead.active').forEach((p) => p.classList.remove('active'));

    if (elapsedUnits >= 0) {
      const segment = measureSegments.find(
        (s) => elapsedUnits >= s.startUnit && elapsedUnits < s.startUnit + UNITS_PER_MEASURE
      );
      if (segment) {
        const track = document.querySelector(`.slot-track[data-measure-id="${segment.measureId}"]`);
        const playhead = track && track.querySelector('.playhead');
        if (playhead) {
          const pct = ((elapsedUnits - segment.startUnit) / UNITS_PER_MEASURE) * 100;
          playhead.style.left = `${Math.max(0, Math.min(100, pct))}%`;
          playhead.classList.add('active');
        }
      }
    }

    const activeIds = new Set();
    if (elapsedUnits >= 0) {
      noteSegments.forEach((seg) => {
        if (elapsedUnits >= seg.startUnit && elapsedUnits < seg.endUnit) activeIds.add(seg.noteId);
      });
    }
    highlightedNoteIds.forEach((id) => {
      if (!activeIds.has(id)) {
        document.querySelectorAll(`[data-note-id="${id}"]`).forEach((el) => el.classList.remove('playing'));
      }
    });
    activeIds.forEach((id) => {
      if (!highlightedNoteIds.has(id)) {
        document.querySelectorAll(`[data-note-id="${id}"]`).forEach((el) => el.classList.add('playing'));
      }
    });
    highlightedNoteIds = activeIds;

    cursorRAF = requestAnimationFrame(tick);
  }
  cursorRAF = requestAnimationFrame(tick);
}

function stopCursor() {
  if (cursorRAF) cancelAnimationFrame(cursorRAF);
  cursorRAF = null;
  document.querySelectorAll('.playhead.active').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.playing').forEach((el) => el.classList.remove('playing'));
  highlightedNoteIds = new Set();
}

function stop() {
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (err) {
      /* bereits gestoppt */
    }
  });
  activeOscillators = [];
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];
  stopCursor();
  state.isPlaying = false;
  playBtn.disabled = false;
  stopBtn.disabled = true;
}

/* ============================================================
   Toolbar
   ============================================================ */

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const bpmSlider = document.getElementById('bpmSlider');
const bpmValue = document.getElementById('bpmValue');
const metronomeToggle = document.getElementById('metronomeToggle');
const repeatInput = document.getElementById('repeatInput');

document.getElementById('addMeasureBtn').addEventListener('click', addMeasure);
document.getElementById('clearBtn').addEventListener('click', clearAll);
playBtn.addEventListener('click', play);
stopBtn.addEventListener('click', stop);
bpmSlider.addEventListener('input', () => {
  state.bpm = Number(bpmSlider.value);
  bpmValue.textContent = state.bpm;
});
metronomeToggle.addEventListener('change', () => {
  state.metronome = metronomeToggle.checked;
});
repeatInput.addEventListener('change', () => {
  repeatInput.value = Math.max(1, Math.min(50, Math.round(Number(repeatInput.value)) || 1));
});

/* ============================================================
   Init
   ============================================================ */

state.measures = [newMeasure()];
renderPalette();
renderMeasures();
