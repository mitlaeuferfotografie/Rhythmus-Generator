'use strict';

/* ============================================================
   Notenwerte-Definitionen
   Einheit: 1 "unit" = eine Achtelnote. Ein 4/4-Takt = 8 units.
   ============================================================ */

const SLOT_W = 64; // px pro Achtel-Einheit, muss zu --slot-w in style.css passen
const UNITS_PER_MEASURE = 8;

const NOTE_TYPES = [
  {
    id: 'whole',
    name: 'Ganze Note',
    units: 8,
    isRest: false,
    icon: `<svg viewBox="0 0 40 48"><ellipse cx="20" cy="30" rx="13" ry="8" transform="rotate(-15 20 30)" fill="none" stroke="#1a1a1a" stroke-width="4"/></svg>`,
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
    id: 'eighthPair',
    name: 'Achtelpaar',
    units: 2,
    isRest: false,
    icon: `<svg viewBox="0 0 56 48"><ellipse cx="12" cy="36" rx="10" ry="7" transform="rotate(-15 12 36)" fill="#1a1a1a"/><ellipse cx="44" cy="36" rx="10" ry="7" transform="rotate(-15 44 36)" fill="#1a1a1a"/><line x1="21" y1="33" x2="21" y2="8" stroke="#1a1a1a" stroke-width="3.5"/><line x1="53" y1="33" x2="53" y2="8" stroke="#1a1a1a" stroke-width="3.5"/><rect x="21" y="6" width="32" height="6" fill="#1a1a1a"/></svg>`,
  },
  {
    id: 'quarterRest',
    name: 'Viertelpause',
    units: 2,
    isRest: true,
    icon: `<svg viewBox="0 0 40 48"><path d="M18 6 L27 15 L18 24 L27 31 L16 43" fill="none" stroke="#1a1a1a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
];

const noteType = (id) => NOTE_TYPES.find((t) => t.id === id);

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

/* ============================================================
   Rendering: Palette
   ============================================================ */

const paletteCardsEl = document.getElementById('paletteCards');

function renderPalette() {
  paletteCardsEl.innerHTML = '';
  NOTE_TYPES.forEach((type) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.typeId = type.id;
    const beats = type.units / 2;
    card.innerHTML = `
      <span class="icon">${type.icon}</span>
      <span class="label">
        <span class="name">${type.name}</span>
        <span class="beats">${beats} Zählzeit${beats === 1 ? '' : 'en'}</span>
      </span>
    `;
    card.addEventListener('pointerdown', (e) => startDragNew(e, type.id));
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
  const beats = units / 2;

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
  track.style.minWidth = `${UNITS_PER_MEASURE * SLOT_W}px`;
  track.dataset.measureId = measure.id;

  // Schlag-Trennlinien (nach jeder Viertel) + Taktende-Markierung
  [0, 2, 4, 6, 8].forEach((unitPos) => {
    const tick = document.createElement('div');
    tick.className = 'beat-tick';
    tick.style.position = 'absolute';
    tick.style.top = '0';
    tick.style.bottom = '0';
    tick.style.left = `${unitPos * SLOT_W}px`;
    tick.style.width = unitPos === UNITS_PER_MEASURE ? '3px' : '1px';
    tick.style.background = unitPos === UNITS_PER_MEASURE ? '#8a8a8a' : '#dedad0';
    tick.style.pointerEvents = 'none';
    track.appendChild(tick);
  });

  measure.notes.forEach((note) => {
    track.appendChild(renderPlacedNote(note));
  });

  const beatLabels = document.createElement('div');
  beatLabels.className = 'beat-labels';
  beatLabels.style.width = `${UNITS_PER_MEASURE * SLOT_W}px`;
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

function renderPlacedNote(note) {
  const type = noteType(note.typeId);
  const el = document.createElement('div');
  el.className = 'placed-note';
  el.dataset.noteId = note.id;
  el.style.width = `${type.units * SLOT_W}px`;
  el.style.flex = `0 0 ${type.units * SLOT_W}px`;
  el.innerHTML = `
    <span class="icon">${type.icon}</span>
    <button class="delete-btn" title="Entfernen">×</button>
  `;
  el.querySelector('.delete-btn').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });
  el.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteNote(note.id);
  });
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.delete-btn')) return;
    startDragMove(e, note.id);
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
  state.measures = [newMeasure(), newMeasure()];
  renderMeasures();
}

/* ============================================================
   Drag & Drop (Pointer Events - funktioniert mit Maus, Touch & Stift)
   ============================================================ */

let drag = null; // { kind: 'new'|'move', typeId?, noteId?, ghostEl, width }

const dragGhost = document.getElementById('dragGhost');

function startDragNew(e, typeId) {
  if (state.isPlaying) return;
  e.preventDefault();
  const type = noteType(typeId);
  drag = { kind: 'new', typeId, width: type.units * SLOT_W };
  beginGhost(type.icon, drag.width);
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragEnd);
}

function startDragMove(e, noteId) {
  if (state.isPlaying) return;
  e.preventDefault();
  const loc = findNoteLocation(noteId);
  if (!loc) return;
  const type = noteType(loc.measure.notes[loc.index].typeId);
  drag = { kind: 'move', noteId, width: type.units * SLOT_W };
  beginGhost(type.icon, drag.width);
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragEnd);
}

function beginGhost(iconSvg, width) {
  dragGhost.innerHTML = `<div class="placed-note" style="width:${width}px;"><span class="icon">${iconSvg}</span></div>`;
  dragGhost.hidden = false;
}

function onDragMove(e) {
  if (!drag) return;
  dragGhost.style.left = `${e.clientX}px`;
  dragGhost.style.top = `${e.clientY}px`;

  clearDragHighlights();

  const track = trackUnderPoint(e.clientX, e.clientY);
  if (!track) return;
  track.classList.add('drag-over');

  const { index, markerX } = computeDropIndex(track, e.clientX, drag.kind === 'move' ? drag.noteId : null);
  const marker = document.createElement('div');
  marker.className = 'drop-marker';
  marker.style.left = `${markerX}px`;
  track.appendChild(marker);
}

function onDragEnd(e) {
  if (!drag) return;
  const track = trackUnderPoint(e.clientX, e.clientY);

  if (track) {
    const measureId = track.dataset.measureId;
    const { index } = computeDropIndex(track, e.clientX, drag.kind === 'move' ? drag.noteId : null);

    if (drag.kind === 'new') {
      insertNote(measureId, index, { id: uid('n'), typeId: drag.typeId });
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
  drag = null;
}

function clearDragHighlights() {
  document.querySelectorAll('.slot-track.drag-over').forEach((t) => t.classList.remove('drag-over'));
  document.querySelectorAll('.drop-marker').forEach((m) => m.remove());
}

function trackUnderPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest('.slot-track') : null;
}

function computeDropIndex(track, clientX, excludeNoteId) {
  const rect = track.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  const items = Array.from(track.querySelectorAll('.placed-note')).filter(
    (el) => el.dataset.noteId !== excludeNoteId
  );

  let index = items.length;
  let markerX = items.length
    ? items[items.length - 1].offsetLeft + items[items.length - 1].offsetWidth
    : 0;

  for (let i = 0; i < items.length; i++) {
    const itemRect = items[i].getBoundingClientRect();
    const mid = itemRect.left - rect.left + itemRect.width / 2;
    if (relativeX < mid) {
      index = i;
      markerX = items[i].offsetLeft;
      break;
    }
  }
  return { index, markerX };
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
  let cursorUnits = 0;
  let totalUnits = 0;

  state.measures.forEach((measure) => {
    measure.notes.forEach((note) => {
      const type = noteType(note.typeId);
      const noteStart = startAt + cursorUnits * unitSeconds;
      const noteDuration = type.units * unitSeconds;

      if (!type.isRest) {
        scheduleTone(noteStart, noteDuration * 0.92, 523.25);
      }

      const noteId = note.id;
      const delayMs = (noteStart - audioCtx.currentTime) * 1000;
      activeTimeouts.push(
        setTimeout(() => {
          const el = document.querySelector(`.placed-note[data-note-id="${noteId}"]`);
          if (el) el.classList.add('playing');
        }, Math.max(0, delayMs))
      );
      activeTimeouts.push(
        setTimeout(() => {
          const el = document.querySelector(`.placed-note[data-note-id="${noteId}"]`);
          if (el) el.classList.remove('playing');
        }, Math.max(0, delayMs + noteDuration * 1000))
      );

      cursorUnits += type.units;
    });
    totalUnits += Math.max(measureUnits(measure), UNITS_PER_MEASURE);
    cursorUnits = totalUnits;
  });

  if (state.metronome) {
    for (let u = 0; u < totalUnits; u += 2) {
      scheduleClick(startAt + u * unitSeconds);
    }
  }

  const totalMs = totalUnits * unitSeconds * 1000 + 200;
  activeTimeouts.push(setTimeout(() => stop(), totalMs));
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
  document.querySelectorAll('.placed-note.playing').forEach((el) => el.classList.remove('playing'));
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

/* ============================================================
   Init
   ============================================================ */

state.measures = [newMeasure(), newMeasure()];
renderPalette();
renderMeasures();
