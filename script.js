'use strict';

/* ============================================================
   Notenwerte-Definitionen
   Einheit: 1 "unit" = eine Achtelnote. Ein 4/4-Takt = 8 units.
   ============================================================ */

const UNITS_PER_MEASURE = 8; // Standard-Kapazität (4/4) - Fallback, wenn keine Taktart bekannt ist

// Jede Taktart bringt ihre eigene Kapazität (in Achtel-"units") mit, ihre
// eigenen Zählzeiten-Beschriftungen und ihr eigenes Grundschlag-Intervall
// (4/4 und 3/4: Klick auf jeder Viertel = alle 2 units; 6/8: Klick auf jedem
// der zwei zusammengesetzten Schläge = alle 3 units). displayDivisor
// rechnet units in die "X von Y"-Anzeige um (4/4, 3/4: Viertel = 2 units,
// also /2; 6/8: 1 Achtel = 1 Zähleinheit, also /1). Bei 6/8 klickt der
// Grundschlag bewusst auf JEDER Achtel (clickInterval 1, nicht 3 für die
// beiden zusammengesetzten Hauptschläge) - passend zur Zählzeiten-
// Beschriftung, die ebenfalls alle sechs Achtel einzeln zeigt.
const TIME_SIGNATURES = {
  '4/4': { top: 4, bottom: 4, units: 8, beatTicks: [0, 2, 4, 6, 8], labels: ['1', '+', '2', '+', '3', '+', '4', '+'], clickInterval: 2, displayDivisor: 2 },
  '3/4': { top: 3, bottom: 4, units: 6, beatTicks: [0, 2, 4, 6], labels: ['1', '+', '2', '+', '3', '+'], clickInterval: 2, displayDivisor: 2 },
  '6/8': { top: 6, bottom: 8, units: 6, beatTicks: [0, 3, 6], labels: ['1', '2', '3', '4', '5', '6'], clickInterval: 1, displayDivisor: 1 },
};
const TIME_SIGNATURE_CYCLE = ['4/4', '3/4', '6/8'];

function timeSigOf(measure) {
  return TIME_SIGNATURES[measure.timeSignature] || TIME_SIGNATURES['4/4'];
}

// Alle Breiten werden in % der Takt-Breite gerechnet (nicht in fixen px) -
// dadurch passt sich die Tafel jeder Bildschirmgröße an, ohne dass ein
// Takt, der eigentlich passt, einen horizontalen Scrollbalken braucht.
const unitsToPercent = (units, capacity) => (units / capacity) * 100;

// Notenkopf-Position (% der EIGENEN Notenbreite), sodass er immer exakt in
// der Mitte der ERSTEN Achtel-Einheit seiner Dauer landet - unabhängig von
// der Gesamtbreite der Note. Die eigentliche Pixel-Korrektur (-12.2px, an
// der Icon-Grafik empirisch ausgemessen) sitzt in style.css bei .icon
// (Icon-Größe bleibt bewusst fix).
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
    // Notenhals-Länge (40) im Verhältnis zur Notenkopf-Höhe (~15.5) folgt
    // dem realen Notationsstandard (~2,6:1, siehe Wikimedia-Referenzglyphe
    // "Figure_rythmique_noire_hampe_haut.svg") statt der alten, zu kurzen
    // Näherung (~1,8:1) - deshalb ist die viewBox jetzt höher (56 statt 48).
    icon: `<svg viewBox="0 0 40 56"><ellipse cx="16" cy="46" rx="11" ry="7.5" transform="rotate(-15 16 46)" fill="none" stroke="#1a1a1a" stroke-width="3.5"/><line x1="26" y1="43" x2="26" y2="3" stroke="#1a1a1a" stroke-width="3.5"/></svg>`,
  },
  {
    id: 'quarter',
    name: 'Viertel Note',
    units: 2,
    isRest: false,
    icon: `<svg viewBox="0 0 40 56"><ellipse cx="16" cy="46" rx="11" ry="7.5" transform="rotate(-15 16 46)" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3.5"/><line x1="26" y1="43" x2="26" y2="3" stroke="#1a1a1a" stroke-width="3.5"/></svg>`,
  },
  {
    id: 'eighth',
    name: 'Achtel (einzeln)',
    units: 1,
    isRest: false,
    // Einzelne, unverbundene Achtel bekommt ein Fähnchen (Standard-Notation).
    // Form/Proportion 1:1 von der echten Wikimedia-Referenzglyphe
    // "Figure_rythmique_croche_hampe_haut.svg" (selbe Zeichner-Familie wie
    // die Viertel-Referenz) übernommen und nur auf unseren Notenhals
    // skaliert - das Fähnchen reicht dadurch (wie im Original) deutlich
    // weiter am Hals herunter, statt wie vorher ein kleiner, kurzer Haken
    // direkt an der Spitze zu sein.
    icon: `<svg viewBox="0 0 40 56"><ellipse cx="16" cy="46" rx="11" ry="7.5" transform="rotate(-15 16 46)" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3.5"/><line x1="26" y1="43" x2="26" y2="3" stroke="#1a1a1a" stroke-width="3.5"/><path d="M26 3 C25.3 9.1 31.8 11.2 34.9 14 C37.9 16.7 39 19.7 38.9 22.5 C38.9 23.3 38.6 26.7 35.8 30 C39.6 21.6 36.1 18.3 32.6 15.6 C28.5 12.4 25.4 9.4 26 3 Z" fill="#1a1a1a"/></svg>`,
  },
  {
    id: 'wholeRest',
    name: 'Ganze Pause',
    units: 8,
    isRest: true,
    // Hängt UNTER der (angedeuteten) Linie - liegt mit der Oberkante auf ihr auf.
    icon: `<svg viewBox="0 0 40 48"><line x1="4" y1="20" x2="30" y2="20" stroke="#1a1a1a" stroke-width="1.5" opacity="0.3"/><rect x="7" y="20" width="18" height="7" fill="#1a1a1a"/></svg>`,
  },
  {
    id: 'halfRest',
    name: 'Halbe Pause',
    units: 4,
    isRest: true,
    // Sitzt AUF der (angedeuteten) Linie - liegt mit der Unterkante auf ihr auf.
    icon: `<svg viewBox="0 0 40 48"><line x1="4" y1="20" x2="30" y2="20" stroke="#1a1a1a" stroke-width="1.5" opacity="0.3"/><rect x="7" y="13" width="18" height="7" fill="#1a1a1a"/></svg>`,
  },
  {
    id: 'quarterRest',
    name: 'Viertelpause',
    units: 2,
    isRest: true,
    // Echte Bravura/Wikipedia-Pfaddaten (Datei "Crochet2.svg" von
    // commons.wikimedia.org, https://en.wikipedia.org/wiki/Rest_(music)),
    // nur per transform in unser 40x48-viewBox skaliert/verschoben - keine
    // Nachzeichnung mehr, sondern das Original-Zeichen selbst.
    icon: `<svg viewBox="0 0 40 48"><path d="M 33.585446,59.378537 49.000347,80.448853 C 34.510389,96.966456 43.303241,103.77053 46.891412,113.31714 L 30.195758,89.013879 c 9.651793,-11.411594 5.787047,-20.20785 2.345326,-29.067873 -0.002,-0.0045 1.042493,-0.561506 1.044362,-0.567469 z" fill="#1a1a1a" transform="translate(10,4) scale(0.564) translate(-28.293569,-59.378536)"/><path d="m 45.566519,110.60468 c -17.76994,-15.91987 -24.592214,4.82994 -7.083379,19.74003 -2.252919,-3.86658 -8.756028,-22.85814 7.953256,-17.07143" fill="#1a1a1a" transform="translate(10,4) scale(0.564) translate(-28.293569,-59.378536)"/></svg>`,
  },
  {
    id: 'eighthRest',
    name: 'Achtelpause',
    units: 1,
    isRest: true,
    // Echte Pfaddaten aus "Rests_on_stave_07_Quaver.svg" von
    // commons.wikimedia.org, genauso nur skaliert/verschoben statt
    // nachgezeichnet.
    icon: `<svg viewBox="0 0 40 48"><path d="m 531.098,74.847 c -0.52,0.098 -0.918,0.457 -1.098,0.953 -0.039,0.16 -0.039,0.199 -0.039,0.418 0,0.301 0.019,0.461 0.16,0.699 0.199,0.399 0.617,0.719 1.094,0.836 0.5,0.141 1.336,0.02 2.293,-0.297 l 0.238,-0.082 -1.176,3.25 -1.156,3.246 c 0,0 0.039,0.02 0.102,0.063 0.117,0.078 0.316,0.137 0.457,0.137 0.238,0 0.539,-0.137 0.578,-0.258 0,-0.039 0.558,-1.934 1.234,-4.184 l 1.195,-4.125 -0.039,-0.058 c -0.097,-0.121 -0.296,-0.16 -0.418,-0.063 -0.039,0.039 -0.101,0.121 -0.14,0.18 -0.18,0.301 -0.637,0.836 -0.875,1.035 -0.219,0.18 -0.34,0.199 -0.539,0.121 -0.18,-0.098 -0.239,-0.199 -0.36,-0.738 -0.117,-0.535 -0.257,-0.778 -0.558,-0.977 -0.278,-0.179 -0.637,-0.238 -0.953,-0.156 z" fill="#1a1a1a" transform="translate(13,8) scale(2.8) translate(-529.96,-74.81)"/></svg>`,
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
  { kind: 'single', typeId: 'wholeRest' },
  { kind: 'single', typeId: 'half' },
  { kind: 'single', typeId: 'halfRest' },
  { kind: 'single', typeId: 'quarter' },
  { kind: 'single', typeId: 'quarterRest' },
  { kind: 'pair', typeId: 'eighth', name: 'Achtelpaar', units: 2 },
  { kind: 'single', typeId: 'eighth' },
  { kind: 'single', typeId: 'eighthRest' },
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
  countIn: true,
  isPlaying: false,
  noteVolume: 0.6,
  clickVolume: 0.5,
};

function newMeasure() {
  return { id: uid('m'), notes: [], timeSignature: '4/4', repeatCount: 4 };
}

// Summe der tatsächlich belegten Achtel-Einheiten (unabhängig von Lücken -
// eine Note, die weiter hinten im Takt liegt, zählt trotzdem nur mit ihrer
// eigenen Dauer, nicht mit dem Platz davor).
function measureUnits(measure) {
  return measure.notes.reduce((sum, n) => sum + noteType(n.typeId).units, 0);
}

// Wie weit die am weitesten hinten liegende Note reicht (startUnit + Dauer).
// Zusammen mit measureUnits() ergibt das: reichen beide bis exakt zur
// Kapazität UND sind sie gleich groß, gibt es keine Lücke -> "voll". Reicht
// die letzte Note über die Kapazität hinaus -> "übervoll", ganz unabhängig
// davon, ob davor noch Lücken offen sind.
function measureExtent(measure, excludeNoteId) {
  return measure.notes.reduce((max, n) => {
    if (n.id === excludeNoteId) return max;
    return Math.max(max, n.startUnit + noteType(n.typeId).units);
  }, 0);
}

function measureStatus(measure) {
  const units = measureUnits(measure);
  if (units === 0) return 'leer';
  const capacity = timeSigOf(measure).units;
  const extent = measureExtent(measure, null);
  if (extent > capacity) return 'uebervoll';
  if (units === capacity && extent === capacity) return 'voll';
  return 'offen';
}

// Abspielen blockiert nur bei "offenen" (angefangen, aber noch mit
// unnotierten Lücken) oder "übervollen" Takten - beides würde beim
// Abspielen falsch/unvollständig klingen. Ein komplett UNBERÜHRTER
// ("leerer") Takt blockiert bewusst NICHT mehr: z.B. wenn versehentlich
// ein zweiter Takt per "+ Takt" angelegt, aber nie befüllt wurde, sollte
// der bereits fertige erste Takt trotzdem abspielbar sein, statt dass man
// erst den überflüssigen leeren Takt wieder entfernen muss. Leere Takte
// werden beim Abspielen einfach übersprungen (siehe buildMeasureQueue).
function blockingMeasureStatus(measure) {
  const status = measureStatus(measure);
  return status === 'offen' || status === 'uebervoll';
}

function allMeasuresFull() {
  const hasPlayableContent = state.measures.some((m) => measureStatus(m) === 'voll');
  return hasPlayableContent && !state.measures.some(blockingMeasureStatus);
}

// Formatiert eine Achtel-"unit"-Anzahl als Zählzeiten-Zahl für die
// Füllstand-Anzeige EINES Takts - abhängig von dessen Taktart (siehe
// displayDivisor in TIME_SIGNATURES).
function formatMeasureFill(units, measure) {
  const beats = units / timeSigOf(measure).displayDivisor;
  return Number.isInteger(beats) ? String(beats) : beats.toFixed(1);
}

// Noten tragen ihre Position (startUnit) jetzt explizit - Lücken sind damit
// einfach unbelegter Raum, keine echten Pausen. Für die Anzeige/Balken-
// Erkennung nach Position sortiert zurückgeben.
function layoutNotes(measure) {
  return measure.notes
    .slice()
    .sort((a, b) => a.startUnit - b.startUnit)
    .map((note) => ({ note, type: noteType(note.typeId), start: note.startUnit }));
}

function formatBeats(units) {
  const beats = units / 2;
  return Number.isInteger(beats) ? String(beats) : beats.toFixed(1);
}

/* ============================================================
   Rendering: Palette
   ============================================================ */

const paletteCardsNotesEl = document.getElementById('paletteCardsNotes');
const paletteCardsRestsEl = document.getElementById('paletteCardsRests');

function renderPalette() {
  paletteCardsNotesEl.innerHTML = '';
  paletteCardsRestsEl.innerHTML = '';
  const noteItems = PALETTE_ITEMS.filter((item) => !noteType(item.typeId).isRest);
  const restItems = PALETTE_ITEMS.filter((item) => noteType(item.typeId).isRest);
  // So viele Spalten wie nötig, um jede Gruppe in maximal 2 Zeilen
  // unterzubringen - Icon/Schrift skalieren dazu passend über die
  // container-query-Regeln von .note-card (siehe style.css).
  paletteCardsNotesEl.style.setProperty('--palette-cols', Math.ceil(noteItems.length / 2));
  paletteCardsRestsEl.style.setProperty('--palette-cols', Math.ceil(restItems.length / 2));

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
      <span class="card-body">
        <span class="icon">${icon}</span>
        <span class="label">
          <span class="name">${name}</span>
          <span class="beats">${beatsLabel} Zählzeit${beatsLabel === '1' ? '' : 'en'}</span>
        </span>
      </span>
    `;
    card.addEventListener('pointerdown', (e) => startDragNew(e, item));
    (type.isRest ? paletteCardsRestsEl : paletteCardsNotesEl).appendChild(card);
  });

  schedulePaletteSync();
}

// Noten- und Pausen-Gruppe haben unterschiedlich viele Spalten (5 Noten ->
// 3, 4 Pausen -> 2) und dadurch bei gleicher Gesamtbreite unterschiedlich
// breite Karten - die schmalere Gruppe (mehr Spalten) bekäme sonst kleinere
// Icons/Schrift als die andere. Hier wird die tatsächlich gerenderte
// Kartenbreite BEIDER Gruppen gemessen und die kleinere für BEIDE als
// gemeinsame Referenz verwendet, damit Noten und Pausen immer gleich groß
// aussehen.
function syncPaletteCardSizes() {
  const firstCardWidth = (container) => {
    const card = container.querySelector('.note-card');
    return card ? card.getBoundingClientRect().width : NaN;
  };
  const widths = [firstCardWidth(paletteCardsNotesEl), firstCardWidth(paletteCardsRestsEl)].filter(
    (w) => Number.isFinite(w) && w > 0
  );
  if (widths.length === 0) return;
  const refWidth = Math.min(...widths);

  const scaled = (min, ratio, max) => `${Math.max(min, Math.min(max, refWidth * ratio))}px`;
  const root = document.documentElement.style;
  root.setProperty('--palette-icon-w', scaled(20, 0.34, 40));
  root.setProperty('--palette-icon-h', scaled(24, 0.4, 48));
  root.setProperty('--palette-name-size', scaled(9.6, 0.17, 15.2));
  root.setProperty('--palette-beats-size', scaled(8.3, 0.14, 12.8));
  root.setProperty('--palette-card-gap', scaled(4, 0.09, 10));
  root.setProperty('--palette-card-pad-y', scaled(4, 0.08, 8));
  root.setProperty('--palette-card-pad-x', scaled(6, 0.11, 12));
}

let paletteSyncRAF = null;
function schedulePaletteSync() {
  if (paletteSyncRAF) return;
  paletteSyncRAF = requestAnimationFrame(() => {
    paletteSyncRAF = null;
    syncPaletteCardSizes();
  });
}
window.addEventListener('resize', schedulePaletteSync);

/* ============================================================
   Rendering: Measures
   ============================================================ */

const measuresEl = document.getElementById('measures');

function renderMeasures() {
  openTimeSigDropdown = null; // die alten DOM-Knoten sind gleich weg
  measuresEl.innerHTML = '';
  state.measures.forEach((measure, idx) => {
    measuresEl.appendChild(renderMeasure(measure, idx));
  });
  updatePlayAvailability();
}

// Nur vollständig ausgefüllte Takte dürfen abgespielt werden - der Button
// wird deaktiviert, statt beim Klick nur stillschweigend nichts zu tun,
// damit sofort sichtbar ist, dass (und warum) "Abspielen" gerade nicht geht.
function updatePlayAvailability() {
  const blocked = !allMeasuresFull();
  playPauseBtn.disabled = blocked && !state.isPlaying;
  if (!blocked) {
    playPauseBtn.title = '';
  } else if (state.measures.some(blockingMeasureStatus)) {
    playPauseBtn.title = 'Jeder begonnene Takt muss vollständig ausgefüllt sein, um abspielen zu können - leere Takte sind kein Problem';
  } else {
    playPauseBtn.title = 'Noch keine Noten platziert';
  }
}

function renderMeasure(measure, index) {
  const status = measureStatus(measure);
  const ts = timeSigOf(measure);
  const units = measureUnits(measure);
  const beats = formatMeasureFill(units, measure);

  const wrap = document.createElement('div');
  wrap.className = `measure status-${status}`;
  wrap.dataset.measureId = measure.id;

  const header = document.createElement('div');
  header.className = 'measure-header';

  const statusText = {
    leer: `0 / ${ts.top} Zählzeiten`,
    offen: `${beats} / ${ts.top} Zählzeiten`,
    voll: 'Voll ✓',
    uebervoll: 'Übervoll!',
  }[status];

  header.innerHTML = `
    <span class="measure-title">Takt ${index + 1}</span>
    <span class="measure-status">${statusText}</span>
  `;

  // Zufalls-Rhythmus + Leeren sitzen zwischen der Zählzeiten-Anzeige und "Wiederholungen".
  const randomBtn = document.createElement('button');
  randomBtn.className = 'measure-randomize';
  randomBtn.type = 'button';
  randomBtn.title = 'Zufälligen Rhythmus für diesen Takt erzeugen';
  randomBtn.textContent = '🎲 Zufall';
  randomBtn.addEventListener('click', () => randomizeMeasure(measure.id));
  header.appendChild(randomBtn);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'measure-randomize';
  clearBtn.type = 'button';
  clearBtn.title = 'Alle Noten/Pausen aus diesem Takt entfernen';
  clearBtn.textContent = '🧹 Leeren';
  clearBtn.addEventListener('click', () => clearMeasure(measure.id));
  header.appendChild(clearBtn);

  // Wiederholungen sitzt links vom "×" im Kopf (nicht mehr neben dem Raster).
  const repeatLabel = document.createElement('label');
  repeatLabel.className = 'measure-repeat';
  repeatLabel.title = 'Wie oft dieser Takt hintereinander wiederholt wird, bevor der nächste Takt beginnt';
  const repeatSelect = document.createElement('select');
  repeatSelect.innerHTML = Array.from({ length: 50 }, (_, i) => i + 1)
    .map((n) => `<option value="${n}"${n === measure.repeatCount ? ' selected' : ''}>${n}</option>`)
    .join('');
  repeatSelect.addEventListener('change', () => {
    measure.repeatCount = Number(repeatSelect.value);
  });
  repeatLabel.innerHTML = '<span>Wdh.</span>';
  repeatLabel.appendChild(repeatSelect);
  header.appendChild(repeatLabel);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'measure-remove';
  removeBtn.title = 'Takt entfernen';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => removeMeasure(measure.id));
  header.appendChild(removeBtn);

  const track = document.createElement('div');
  track.className = 'slot-track';
  track.dataset.measureId = measure.id;

  // Schlag-Trennlinien (Grundschlag der jeweiligen Taktart) + Taktende-Markierung
  ts.beatTicks.forEach((unitPos) => {
    const tick = document.createElement('div');
    tick.className = 'beat-tick';
    tick.style.position = 'absolute';
    tick.style.top = '0';
    tick.style.bottom = '0';
    tick.style.left = `${unitsToPercent(unitPos, ts.units)}%`;
    tick.style.width = unitPos === ts.units ? '3px' : '1px';
    tick.style.background = unitPos === ts.units ? '#8a8a8a' : '#dedad0';
    tick.style.pointerEvents = 'none';
    track.appendChild(tick);
  });

  renderMeasureNotes(track, measure);

  const playhead = document.createElement('div');
  playhead.className = 'playhead';
  track.appendChild(playhead);

  // Einzähler-Overlay sitzt NUR im ersten Takt (dort zählt "Abspielen" vor,
  // bevor der eigentliche Rhythmus losgeht) - eigene Anzeige statt des
  // normalen Playheads, damit nicht der Eindruck entsteht, eine Note wäre
  // schon "dran", während in Wahrheit noch gar nichts aus dem Raster klingt.
  // Sitzt bewusst auf der GANZEN Takt-Karte (wrap), nicht nur im Raster
  // (track) - so darf die Zahl so groß wie der komplette farbige Rahmen
  // werden, ohne an dessen overflow:hidden-Kante abgeschnitten zu werden.
  if (index === 0) {
    const clickCount = ts.units / ts.clickInterval; // gleiches Raster wie beginCountIn
    const overlay = document.createElement('div');
    overlay.className = 'count-in-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="count-in-number">1</div>
      <div class="count-in-dots">${'<span class="count-in-dot"></span>'.repeat(clickCount)}</div>
    `;
    wrap.appendChild(overlay);
  }

  // Kurz eingeblendete Warnung, wenn eine Note/Pause nicht abgelegt werden
  // konnte, weil der Takt dadurch übervoll würde (siehe onDragEnd) - jeder
  // Takt braucht seine eigene, da man in jeden ziehen kann.
  const warning = document.createElement('div');
  warning.className = 'measure-warning';
  warning.hidden = true;
  warning.innerHTML = '<span></span>';
  track.appendChild(warning);

  const beatLabels = document.createElement('div');
  beatLabels.className = ts.bottom === 8 ? 'beat-labels beat-labels-compound' : 'beat-labels';
  beatLabels.style.gridTemplateColumns = `repeat(${ts.labels.length}, 1fr)`;
  beatLabels.innerHTML = ts.labels.map((l) => `<span>${l}</span>`).join('');

  // Taktart-Auswahl sitzt direkt VOR dem ersten Feld im Raster (wie eine
  // echte Taktvorzeichnung am Anfang der Notenzeile) statt oben im Kopf.
  const timeSigDropdown = buildTimeSigDropdown(measure);

  const trackColumn = document.createElement('div');
  trackColumn.className = 'track-column';
  trackColumn.appendChild(timeSigDropdown);
  trackColumn.appendChild(track);
  trackColumn.appendChild(beatLabels);

  wrap.appendChild(header);
  wrap.appendChild(trackColumn);

  return wrap;
}

// Eigener kleiner Menü-Button statt eines nativen <select> - dadurch kann
// auch der GESCHLOSSENE Zustand wie eine echte Taktvorzeichnung aussehen
// (zwei Ziffern übereinander, kein Bruchstrich), was ein <select> nicht
// leisten kann. Es gibt pro Takt genau eins; nur eines ist je offen -
// openTimeSigDropdown/closeTimeSigMenu() sorgen dafür.
let openTimeSigDropdown = null;

function closeTimeSigMenu() {
  if (!openTimeSigDropdown) return;
  openTimeSigDropdown.menu.hidden = true;
  openTimeSigDropdown.trigger.setAttribute('aria-expanded', 'false');
  openTimeSigDropdown = null;
}

document.addEventListener('pointerdown', (e) => {
  if (!openTimeSigDropdown) return;
  const { trigger, menu } = openTimeSigDropdown;
  if (trigger.contains(e.target) || menu.contains(e.target)) return;
  closeTimeSigMenu();
});

function buildTimeSigDropdown(measure) {
  const wrap = document.createElement('div');
  wrap.className = 'time-sig-dropdown';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'time-sig-trigger';
  trigger.title = 'Taktart ändern';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  const ts = timeSigOf(measure);
  trigger.innerHTML = `<span class="ts-num">${ts.top}</span><span class="ts-num">${ts.bottom}</span>`;

  const menu = document.createElement('div');
  menu.className = 'time-sig-menu';
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;

  TIME_SIGNATURE_CYCLE.forEach((key) => {
    const [top, bottom] = key.split('/');
    const option = document.createElement('button');
    option.type = 'button';
    option.className = `time-sig-option${key === measure.timeSignature ? ' is-selected' : ''}`;
    option.innerHTML = `<span class="ts-num">${top}</span><span class="ts-num">${bottom}</span>`;
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      measure.timeSignature = key;
      closeTimeSigMenu();
      renderMeasures();
    });
    menu.appendChild(option);
  });

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = openTimeSigDropdown && openTimeSigDropdown.menu === menu;
    closeTimeSigMenu();
    if (wasOpen) return;
    // position:fixed statt absolute, damit das Menü nicht vom
    // overflow:hidden des Takts abgeschnitten wird.
    const rect = trigger.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 4}px`;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    openTimeSigDropdown = { trigger, menu };
  });

  wrap.appendChild(trigger);
  wrap.appendChild(menu);
  return wrap;
}

// Zwei direkt aufeinanderfolgende einzelne Achtel werden als verbundenes
// Paar mit gemeinsamem Balken dargestellt - unabhängig davon, auf welcher
// Zählzeit sie stehen (auch wenn die erste z. B. bei "+" beginnt) und ob
// sie über die "Achtelpaar"-Karte oder einzeln als "Achtel" hineingezogen
// wurden.
function renderMeasureNotes(track, measure) {
  const capacity = timeSigOf(measure).units;
  const layout = layoutNotes(measure);
  let i = 0;
  while (i < layout.length) {
    const cur = layout[i];
    const next = layout[i + 1];
    const canPair =
      cur.type.id === 'eighth' &&
      next &&
      next.type.id === 'eighth' &&
      next.start === cur.start + 1;

    if (canPair) {
      track.appendChild(renderEighthPair(cur.note, next.note, capacity, cur.start));
      i += 2;
    } else {
      track.appendChild(renderPlacedNote(cur.note, cur.type, capacity, cur.start));
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

function renderPlacedNote(note, type, capacity, startUnit) {
  const pct = unitsToPercent(type.units, capacity);
  const el = document.createElement('div');
  el.className = 'placed-note';
  el.dataset.noteId = note.id;
  el.style.left = `${unitsToPercent(startUnit, capacity)}%`;
  el.style.width = `${pct}%`;
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
function renderEighthPair(noteA, noteB, capacity, startUnit) {
  const pct = unitsToPercent(2, capacity);
  const beamedIcon = noteType('quarter').icon;
  const el = document.createElement('div');
  el.className = 'placed-note-pair';
  el.style.left = `${unitsToPercent(startUnit, capacity)}%`;
  el.style.width = `${pct}%`;
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

// Reihenfolge im Array spielt keine Rolle mehr (jede Note trägt ihre
// Position über startUnit) - einfach anhängen, die Anzeige sortiert beim
// Rendern selbst danach, wo die Note tatsächlich liegt.
function addNoteToMeasure(measureId, note) {
  const measure = state.measures.find((m) => m.id === measureId);
  if (!measure) return;
  measure.notes.push(note);
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

// Zufalls-Rhythmus: füllt den Takt von Anfang bis Ende komplett mit
// zufällig gewählten Notendauern - gewichtet Richtung Achtel/Viertel, damit
// nicht einfach eine einzige große Note "erwürfelt" wird, und gelegentlich
// (statt jeder Note) eine passende Pause für Abwechslung.
const RANDOM_DURATION_WEIGHTS = [
  { units: 1, weight: 4 },
  { units: 2, weight: 4 },
  { units: 4, weight: 2 },
  { units: 8, weight: 1 },
];
const RANDOM_REST_CHANCE = 0.22;
const UNITS_TO_TYPE_ID = { 1: 'eighth', 2: 'quarter', 4: 'half', 8: 'whole' };
const UNITS_TO_REST_TYPE_ID = { 1: 'eighthRest', 2: 'quarterRest', 4: 'halfRest', 8: 'wholeRest' };

function pickWeighted(candidates) {
  const total = candidates.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * total;
  for (const c of candidates) {
    if (r < c.weight) return c;
    r -= c.weight;
  }
  return candidates[candidates.length - 1];
}

function randomizeMeasure(measureId) {
  const measure = state.measures.find((m) => m.id === measureId);
  if (!measure) return;
  const capacity = timeSigOf(measure).units;
  const notes = [];
  let position = 0;
  while (position < capacity) {
    const remaining = capacity - position;
    const candidates = RANDOM_DURATION_WEIGHTS.filter((d) => d.units <= remaining);
    const units = pickWeighted(candidates).units;
    const isRest = Math.random() < RANDOM_REST_CHANCE;
    const typeId = isRest ? UNITS_TO_REST_TYPE_ID[units] : UNITS_TO_TYPE_ID[units];
    notes.push({ id: uid('n'), typeId, startUnit: position });
    position += units;
  }
  measure.notes = notes;
  renderMeasures();
}

function clearMeasure(measureId) {
  const measure = state.measures.find((m) => m.id === measureId);
  if (!measure) return;
  measure.notes = [];
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
  if (!track) return 320 / UNITS_PER_MEASURE;
  const width = track.getBoundingClientRect().width;
  const measure = state.measures.find((m) => m.id === track.dataset.measureId);
  const capacity = measure ? timeSigOf(measure).units : UNITS_PER_MEASURE;
  return width / capacity;
}

function startDragNew(e, paletteItem) {
  e.preventDefault();
  const isPair = paletteItem.kind === 'pair';
  const type = noteType(paletteItem.typeId);
  const units = isPair ? paletteItem.units : type.units;
  const innerHtml = isPair ? pairInnerHtml() : singleInnerHtml(type.icon, anchorPercent(units));
  drag = { kind: 'new', paletteItem, units, isPair, innerHtml };
  // Bei einem Achtelpaar sitzt der erste Notenkopf in der Mitte der ersten
  // (linken) Hälfte, also bei 25% der Gesamtbreite.
  const anchorPct = isPair ? 25 : anchorPercent(units);
  beginGhost(wrapHtml(innerHtml, units * currentUnitPx(), isPair), e.clientX, e.clientY, anchorPct);
  document.addEventListener('pointermove', onDragMove);
  document.addEventListener('pointerup', onDragEnd);
}

function startDragMove(e, noteId) {
  e.preventDefault();
  const loc = findNoteLocation(noteId);
  if (!loc) return;
  const type = noteType(loc.measure.notes[loc.index].typeId);
  const innerHtml = singleInnerHtml(type.icon, anchorPercent(type.units));
  drag = { kind: 'move', noteId, units: type.units, isPair: false, innerHtml };
  beginGhost(wrapHtml(innerHtml, type.units * currentUnitPx(), false), e.clientX, e.clientY, anchorPercent(type.units));
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

// left/top MÜSSEN schon hier gesetzt werden, nicht erst im ersten
// pointermove danach - sonst erscheint der Ghost für einen Frame an seiner
// alten Position von einem vorherigen Drag (meist irgendwo im Raster, wo
// zuletzt abgelegt wurde) und "beamt" sich erst beim ersten Mausereignis
// zum Cursor.
//
// Der Cursor sitzt NICHT in der Mitte der Note, sondern genau über dem
// Notenkopf (--ghost-anchor-x, dieselbe anchorPercent-Logik wie im Raster) -
// bei einer breiten Note (halbe/ganze) wäre die Mitte weit vom eigentlichen
// Notenkopf entfernt und man würde beim Ablegen leicht daneben zielen.
function beginGhost(html, x, y, anchorPct) {
  dragGhost.innerHTML = html;
  dragGhost.style.left = `${x}px`;
  dragGhost.style.top = `${y}px`;
  dragGhost.style.setProperty('--ghost-anchor-x', `${anchorPct}%`);
  dragGhost.hidden = false;
}

// Während des Ziehens bekommt die Note sofort ihre echte Feld-Breite direkt
// im Takt zu sehen (nicht nur als loser Cursor-Anhang) - so ist auf einen
// Blick klar, wie viel Platz noch da ist und ob die Note überhaupt passt.
let lastPointerX = 0;
let lastPointerY = 0;

function onDragMove(e) {
  if (!drag) return;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  dragGhost.style.left = `${e.clientX}px`;
  dragGhost.style.top = `${e.clientY}px`;

  updateAutoScroll(e.clientY);
  updateDragVisuals(e.clientX, e.clientY);
}

function updateDragVisuals(clientX, clientY) {
  clearDragHighlights();

  const track = trackUnderPoint(clientX, clientY);
  if (!track) return;
  track.classList.add('drag-over');

  const measure = state.measures.find((m) => m.id === track.dataset.measureId);
  const capacity = timeSigOf(measure).units;
  const excludeNoteId = drag.kind === 'move' ? drag.noteId : null;

  const targetUnit = pushPastOverlaps(measure, excludeNoteId, targetUnitFromX(track, clientX, capacity), drag.units);

  const pct = unitsToPercent(drag.units, capacity);
  const preview = document.createElement('div');
  preview.className = `insert-preview${drag.isPair ? ' insert-preview-pair' : ''}`;
  preview.innerHTML = drag.innerHtml;
  preview.style.left = `${unitsToPercent(targetUnit, capacity)}%`;
  preview.style.width = `${pct}%`;
  track.appendChild(preview);

  const extent = Math.max(measureExtent(measure, excludeNoteId), targetUnit + drag.units);
  track.closest('.measure').classList.toggle('preview-overfull', extent > capacity);
}

// Auto-Scroll beim Ziehen: kommt der Finger/Cursor nah an den oberen oder
// unteren Bildschirmrand, scrollt die Seite von selbst weiter - sonst
// müsste man auf dem Handy VOR dem Ziehen schon exakt zum Zielort gescrollt
// haben, weil man während des Ziehens sonst nicht mehr scrollen kann.
const AUTOSCROLL_EDGE = 90; // px vom Rand, ab dem Auto-Scroll einsetzt
const AUTOSCROLL_MAX_SPEED = 16; // px pro Frame direkt am Rand

let autoScrollSpeed = 0;
let autoScrollRAF = null;

function updateAutoScroll(clientY) {
  const vh = window.innerHeight;
  if (clientY < AUTOSCROLL_EDGE) {
    autoScrollSpeed = -AUTOSCROLL_MAX_SPEED * ((AUTOSCROLL_EDGE - clientY) / AUTOSCROLL_EDGE);
  } else if (clientY > vh - AUTOSCROLL_EDGE) {
    autoScrollSpeed = AUTOSCROLL_MAX_SPEED * ((clientY - (vh - AUTOSCROLL_EDGE)) / AUTOSCROLL_EDGE);
  } else {
    autoScrollSpeed = 0;
  }
  if (autoScrollSpeed !== 0 && autoScrollRAF === null) {
    autoScrollRAF = requestAnimationFrame(autoScrollTick);
  }
}

function autoScrollTick() {
  autoScrollRAF = null;
  if (!drag || autoScrollSpeed === 0) return;
  window.scrollBy(0, autoScrollSpeed);
  updateDragVisuals(lastPointerX, lastPointerY);
  autoScrollRAF = requestAnimationFrame(autoScrollTick);
}

function stopAutoScroll() {
  autoScrollSpeed = 0;
  if (autoScrollRAF !== null) cancelAnimationFrame(autoScrollRAF);
  autoScrollRAF = null;
}

function onDragEnd(e) {
  if (!drag) return;
  const track = trackUnderPoint(e.clientX, e.clientY);
  let overfullMeasureId = null;

  if (track) {
    const measureId = track.dataset.measureId;
    const measure = state.measures.find((m) => m.id === measureId);
    const capacity = timeSigOf(measure).units;
    const excludeNoteId = drag.kind === 'move' ? drag.noteId : null;
    const targetUnit = pushPastOverlaps(measure, excludeNoteId, targetUnitFromX(track, e.clientX, capacity), drag.units);

    // Ein Takt darf durch Ablegen/Verschieben nicht übervoll werden - statt
    // die Note trotzdem hinzuzufügen und den Takt rot/"Übervoll!" zu
    // markieren, wird das Ablegen hier verweigert (Note bleibt bei "move"
    // unverändert an ihrer alten Position) und kurz eine Meldung angezeigt.
    if (targetUnit + drag.units > capacity) {
      overfullMeasureId = measureId;
    } else if (drag.kind === 'new') {
      if (drag.paletteItem.kind === 'pair') {
        addNoteToMeasure(measureId, { id: uid('n'), typeId: 'eighth', startUnit: targetUnit });
        addNoteToMeasure(measureId, { id: uid('n'), typeId: 'eighth', startUnit: targetUnit + 1 });
      } else {
        addNoteToMeasure(measureId, { id: uid('n'), typeId: drag.paletteItem.typeId, startUnit: targetUnit });
      }
    } else if (drag.kind === 'move') {
      const loc = findNoteLocation(drag.noteId);
      if (loc) {
        const note = loc.measure.notes[loc.index];
        loc.measure.notes.splice(loc.index, 1);
        note.startUnit = targetUnit;
        addNoteToMeasure(measureId, note);
      }
    }
  } else if (drag.kind === 'move') {
    // außerhalb jeder Spur losgelassen -> Note entfernen
    deleteNote(drag.noteId);
  }

  cleanupDrag();
  renderMeasures();
  // ERST NACH renderMeasures(): das baut pro Takt ein frisches (verstecktes)
  // Warnungs-Overlay - würde die Meldung VORHER gesetzt, ginge sie durch
  // das Neu-Rendern sofort wieder verloren.
  if (overfullMeasureId) showMeasureWarning(overfullMeasureId, 'Takt ist zu voll dafür');
}

// Timeout sitzt AM Element selbst (nicht global) - sonst würde eine zweite
// Warnung an einem ANDEREN Takt den Timer der ersten canceln, ohne sie zu
// verstecken, und diese bliebe für immer sichtbar.
function showMeasureWarning(measureId, text) {
  const track = document.querySelector(`.slot-track[data-measure-id="${measureId}"]`);
  const warning = track && track.querySelector('.measure-warning');
  if (!warning) return;
  warning.querySelector('span').textContent = text;
  warning.hidden = false;
  clearTimeout(warning._hideTimeout);
  warning._hideTimeout = setTimeout(() => {
    warning.hidden = true;
  }, 1600);
}

function cleanupDrag() {
  document.removeEventListener('pointermove', onDragMove);
  document.removeEventListener('pointerup', onDragEnd);
  stopAutoScroll();
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

// Zählzeit, auf die der Cursor gerade zeigt (0..capacity) - das ist die
// Einheit, ÜBER der der Cursor steht (floor), nicht die nächstgelegene
// Grenze (round). Bei round() würde man schon in der ersten Hälfte einer
// Einheit zur NÄCHSTEN vorspringen, was sich als "landet eher rechts als
// links" bemerkbar macht; floor() bleibt, solange man irgendwo innerhalb
// der Einheit steht, konsequent bei dieser Einheit.
function targetUnitFromX(track, clientX, capacity) {
  const rect = track.getBoundingClientRect();
  const relativeX = Math.max(0, Math.min(rect.width - 0.01, clientX - rect.left));
  return Math.max(0, Math.min(capacity, Math.floor((relativeX / rect.width) * capacity)));
}

// Jede Note trägt jetzt ihre Position (startUnit) explizit - Lücken bleiben
// dadurch einfach unbelegter Raum (keine automatisch erzeugten Pausen).
// Würde die Ziel-Position eine vorhandene Note überlappen, rutscht sie
// direkt danach weiter (wiederholt, falls dort gleich die nächste anliegt).
function pushPastOverlaps(measure, excludeNoteId, targetUnit, units) {
  const others = measure.notes
    .filter((n) => n.id !== excludeNoteId)
    .map((n) => ({ start: n.startUnit, end: n.startUnit + noteType(n.typeId).units }))
    .sort((a, b) => a.start - b.start);

  let start = targetUnit;
  let moved = true;
  while (moved) {
    moved = false;
    for (const o of others) {
      if (start < o.end && start + units > o.start) {
        start = o.end;
        moved = true;
      }
    }
  }
  return start;
}

/* ============================================================
   Audio-Playback (Web Audio API)
   ============================================================ */

let audioCtx = null;
let activeOscillators = [];
let activeTimeouts = [];

// Feste Lautstärke-Regler-Knoten, durch die ALLE Töne/Klicks laufen. Dadurch
// wirkt eine Änderung der Lautstärke-Regler sofort auf gerade laufende UND
// zukünftige Noten (statt erst bei einem Stopp+Neustart), weil gain.value
// live verändert werden kann, während der Ton schon klingt.
let noteMasterGain = null;
let clickMasterGain = null;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    noteMasterGain = audioCtx.createGain();
    noteMasterGain.gain.value = state.noteVolume;
    noteMasterGain.connect(audioCtx.destination);
    clickMasterGain = audioCtx.createGain();
    clickMasterGain.gain.value = state.clickVolume;
    clickMasterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// FM-Glocke ("Extra glitzernd"): ein Träger-Oszillator wird von einem
// zweiten Oszillator in der Frequenz moduliert. Der Modulationsindex klingt
// am Anfang schnell ab - das gibt den glockig-glitzernden Anschlag, danach
// bleibt ein reiner, gehaltener Ton übrig. Weil der Ton komplett synthetisch
// ist (kein natürlich abklingendes Sample), hält er exakt so lange, wie die
// Notendauer es vorgibt - auch bei halben/ganzen Noten.
function scheduleTone(startTime, duration) {
  const ctx = audioCtx;
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const modGain = ctx.createGain();
  const gain = ctx.createGain();

  carrier.type = 'sine';
  carrier.frequency.value = 523.25;
  modulator.type = 'sine';
  modulator.frequency.value = 523.25 * 5.5;

  modGain.gain.setValueAtTime(1500, startTime);
  modGain.gain.exponentialRampToValueAtTime(30, startTime + Math.min(duration, 1.5));
  modulator.connect(modGain).connect(carrier.frequency);

  const attack = 0.004;
  const release = Math.min(0.08, duration * 0.25);
  const peak = 0.44;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + attack);
  gain.gain.setValueAtTime(peak, startTime + Math.max(attack, duration - release));
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  carrier.connect(gain).connect(noteMasterGain);

  const stopTime = startTime + duration + 0.05;
  modulator.start(startTime);
  modulator.stop(stopTime);
  carrier.start(startTime);
  carrier.stop(stopTime);
  activeOscillators.push(modulator, carrier);
}

function scheduleClick(startTime) {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 1500;
  gain.gain.setValueAtTime(0.24, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
  osc.connect(gain).connect(clickMasterGain);
  osc.start(startTime);
  osc.stop(startTime + 0.05);
  activeOscillators.push(osc);
}

function play() {
  if (state.isPlaying) return;
  if (!allMeasuresFull()) return; // siehe allMeasuresFull() - leere Takte blockieren nicht, offene/übervolle schon
  state.isPlaying = true;
  ensureAudioContext();
  playPauseBtn.textContent = '■ Stopp';
  playPauseBtn.classList.add('is-playing');

  const now = audioCtx.currentTime + 0.15;
  const startAt = state.countIn ? beginCountIn(now) : now;

  const queue = buildMeasureQueue();
  startScheduler(queue, startAt);
  startCursor();
}

// Einzähler: zählt EINMAL einen vollen Takt der Taktart des ERSTEN Takts
// vor (Klick-Raster wie beim normalen Grundschlag), bevor der eigentliche
// Rhythmus im selben Tempo nahtlos weiterläuft - unabhängig vom
// Grundschlag-Metronom-Schalter, da man sonst gar nicht hören würde, wann
// es losgeht. Läuft NICHT über den Live-editierbaren Scheduler (der ist
// für die lange Haupt-Wiedergabe gebaut) - für die paar kurzen Klicks
// reicht eine einmalig fest verplante Sequenz.
let countIn = null;

// Zählt im selben Klick-Raster wie der reguläre Grundschlag während der
// Wiedergabe (ts.clickInterval) - bei 6/8 also auf jeder einzelnen Achtel
// (clickInterval 1), bei 4/4 und 3/4 auf jeder Viertel (clickInterval 2).
function beginCountIn(startTime) {
  // Erster tatsächlich abgespielter (nicht-leerer) Takt statt zwingend
  // state.measures[0] - sonst würde ein versehentlich leer gelassener
  // ERSTER Takt den Einzähler in dessen (evtl. falscher) Taktart vorzählen.
  const firstPlayable = state.measures.find((m) => measureStatus(m) === 'voll') || state.measures[0];
  const ts = timeSigOf(firstPlayable);
  const clickCount = ts.units / ts.clickInterval;
  const unitSeconds = 60 / state.bpm / 2;
  const clickDuration = ts.clickInterval * unitSeconds;

  for (let i = 0; i < clickCount; i++) {
    scheduleClick(startTime + i * clickDuration);
  }

  countIn = { startTime, clickCount, clickDuration, endTime: startTime + clickCount * clickDuration, lastShownIdx: -1 };

  const overlay = document.querySelector('.count-in-overlay');
  if (overlay) {
    overlay.hidden = false;
    // Schriftgröße an die TATSÄCHLICHE Höhe der ganzen Takt-Karte koppeln
    // (nicht fix per CSS), damit die Zahl immer ungefähr so groß wie der
    // farbige Rahmen ist, unabhängig von Bildschirmgröße/Zoom.
    const measureEl = overlay.closest('.measure');
    const numberEl = overlay.querySelector('.count-in-number');
    if (measureEl && numberEl) {
      numberEl.style.fontSize = `${measureEl.getBoundingClientRect().height * 0.78}px`;
    }
  }

  return countIn.endTime;
}

function updateCountInVisual(now) {
  if (!countIn) return;
  const overlay = document.querySelector('.count-in-overlay');
  if (!overlay) return;
  const numberEl = overlay.querySelector('.count-in-number');

  // renderMeasures() kann WÄHREND des Einzählens laufen (Live-Editing ist ja
  // während der Wiedergabe erlaubt) und baut dabei ein frisches, wieder
  // verstecktes Overlay-Element ohne die dynamisch gesetzte Schriftgröße -
  // beides hier bei JEDEM Frame absichern, nicht nur beim ersten Aufruf,
  // sonst verschwindet die Anzeige beim nächsten Note-Ändern/Löschen.
  overlay.hidden = false;
  if (!numberEl.style.fontSize) {
    const measureEl = overlay.closest('.measure');
    if (measureEl) numberEl.style.fontSize = `${measureEl.getBoundingClientRect().height * 0.78}px`;
  }

  const elapsed = now - countIn.startTime;
  const idx = Math.max(0, Math.min(countIn.clickCount - 1, Math.floor(elapsed / countIn.clickDuration)));
  overlay.querySelectorAll('.count-in-dot').forEach((dot, i) => dot.classList.toggle('active', i <= idx));
  if (idx === countIn.lastShownIdx) return;
  countIn.lastShownIdx = idx;

  numberEl.textContent = String(idx + 1);
  numberEl.classList.remove('bounce');
  void numberEl.offsetWidth; // Reflow erzwingen, damit die Animation bei jedem Klick neu startet
  numberEl.classList.add('bounce');
}

function endCountIn() {
  countIn = null;
  const overlay = document.querySelector('.count-in-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  overlay.querySelector('.count-in-number').textContent = '1';
  overlay.querySelectorAll('.count-in-dot').forEach((dot) => dot.classList.remove('active'));
}

// Legt nur die REIHENFOLGE fest (welcher Takt wie oft direkt hintereinander
// dran ist - "Takt 1 4x, dann Takt 2 2x, ..." statt "die ganze Abfolge
// 4x"), eingefroren beim Start. Der NOTEN-INHALT jedes Durchlaufs wird
// bewusst NICHT hier eingefroren, sondern bei jedem Scheduler-Tick frisch
// aus state.measures gelesen (siehe instanceSnapshot/scheduleAhead) - so
// wirken Löschen/Hineinziehen von Noten während der Wiedergabe sofort auf
// den laufenden bzw. nächsten Durchlauf, ohne stoppen und neu starten zu
// müssen.
function buildMeasureQueue() {
  const queue = [];
  state.measures.forEach((measure) => {
    if (measureStatus(measure) === 'leer') return; // unberührte Takte werden einfach übersprungen, nicht als Stille mitgespielt
    const repeatCount = Math.max(1, Math.min(50, Math.round(measure.repeatCount) || 1));
    for (let rep = 0; rep < repeatCount; rep++) queue.push(measure.id);
  });
  return queue;
}

// Baut die Checkpoint-Struktur EINES einzelnen Takt-Durchlaufs, relativ zu
// dessen eigenem Anfang (Unit 0) - IMMER frisch aus dem aktuellen
// state.measures gelesen, nie zwischengespeichert. Liefert null, wenn der
// Takt während der Wiedergabe komplett entfernt wurde.
function instanceSnapshot(measureId) {
  const measure = state.measures.find((m) => m.id === measureId);
  if (!measure) return null;
  const ts = timeSigOf(measure);
  const extent = Math.max(ts.units, measureExtent(measure, null));
  const clickUnitSet = new Set();
  for (let k = 0; k < ts.units; k += ts.clickInterval) clickUnitSet.add(k);

  const noteByUnit = new Map();
  measure.notes.forEach((note) => {
    noteByUnit.set(note.startUnit, { note, type: noteType(note.typeId) });
  });

  const checkpointSet = new Set(clickUnitSet);
  noteByUnit.forEach((_, unit) => checkpointSet.add(unit));
  const checkpoints = Array.from(checkpointSet).sort((a, b) => a - b);

  return { measureId: measure.id, capacityUnits: ts.units, extent, clickUnitSet, noteByUnit, checkpoints };
}

const SCHEDULE_AHEAD_SECONDS = 0.15;
const SCHEDULE_INTERVAL_MS = 30;

let scheduler = null;
let schedulerTimer = null;

// Läuft alle SCHEDULE_INTERVAL_MS und verplant jeweils nur ein kleines Stück
// Vorlauf (SCHEDULE_AHEAD_SECONDS) - dadurch wird für jeden Schritt die
// Dauer mit dem GERADE JETZT gültigen Tempo (state.bpm) berechnet. Ändert
// man den Tempo-Regler während der Wiedergabe, wirkt sich das also auf den
// nächsten noch nicht verplanten Schritt aus (max. ~einen Schlag später),
// statt erst beim nächsten Stopp+Neustart.
function startScheduler(queue, startAt) {
  scheduler = {
    queue, // Reihenfolge der Takt-IDs (mit Wiederholungen), eingefroren beim Start
    queueIdx: 0,
    lastProcessedUnit: -1, // -1 = im aktuellen Durchlauf noch nichts verplant
    nextTime: startAt,
    noteRealSegments: [], // { noteId, startTime, endTime }
    measureRealSegments: [], // { measureId, startTime, endTime }
    finished: false,
  };
  scheduleAhead();
  schedulerTimer = setInterval(scheduleAhead, SCHEDULE_INTERVAL_MS);
}

function finishScheduler(s) {
  s.finished = true;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
  // Bis zum geplanten Ende in echten (Wanduhr-)Millisekunden, ausgehend von
  // audioCtx.currentTime JETZT + großzügiger Nachlauf, damit die letzte
  // Note/der letzte Klick nie vorzeitig abgeschnitten wird.
  const remainingSeconds = s.nextTime - audioCtx.currentTime + 0.4;
  activeTimeouts.push(setTimeout(() => stop(), Math.max(0, remainingSeconds * 1000)));
}

// Verplant Schritt für Schritt, jeweils den Takt-Durchlauf, der gerade an
// der Reihe ist NEU aus state.measures gelesen (instanceSnapshot) - eine
// während der Wiedergabe gelöschte/hinzugefügte/verschobene Note steht also
// spätestens beim nächsten Tick (≈30ms) in dieser frischen Momentaufnahme,
// solange ihre Zählzeit noch nicht verplant wurde (s.lastProcessedUnit).
// Bereits verplante Töne (innerhalb des winzigen Vorlaufs) laufen wie
// gewohnt zu Ende - das ist die einzige, kaum wahrnehmbare Grenze.
function scheduleAhead() {
  const s = scheduler;
  if (!s || s.finished) return;
  const horizon = audioCtx.currentTime + SCHEDULE_AHEAD_SECONDS;

  while (true) {
    if (s.queueIdx >= s.queue.length) {
      finishScheduler(s);
      return;
    }

    const instance = instanceSnapshot(s.queue[s.queueIdx]);
    if (!instance) {
      // Takt wurde während der Wiedergabe komplett entfernt - überspringen,
      // ohne Zeit zu verbrauchen.
      s.queueIdx += 1;
      s.lastProcessedUnit = -1;
      continue;
    }

    const unitSeconds = 60 / state.bpm / 2;
    const nextUnit = instance.checkpoints.find((u) => u > s.lastProcessedUnit);

    if (nextUnit === undefined) {
      // Durchlauf fertig (evtl. Stille nach der letzten Note bis zum
      // Taktende) - Restzeit addieren und zum nächsten Durchlauf weiter.
      // Kein hörbares Ereignis, deshalb keine Horizon-Prüfung nötig.
      // Math.max(0, ...) fängt den Fall ab, dass eine Live-Bearbeitung
      // (z.B. Taktart-Wechsel + gleichzeitig eine hintere Note entfernt)
      // extent kleiner als den schon verplanten lastProcessedUnit macht -
      // ohne die Absicherung würde die Zeit sonst rückwärts laufen.
      const remainingUnits = Math.max(0, instance.extent - Math.max(0, s.lastProcessedUnit));
      s.nextTime += remainingUnits * unitSeconds;
      s.queueIdx += 1;
      s.lastProcessedUnit = -1;
      continue;
    }

    // s.nextTime ist die Zeit des ZULETZT verplanten Checkpoints (bzw. der
    // Start der Wiedergabe, falls noch keiner dran war) - die Zeit DIESES
    // Checkpoints ist das um die Einheiten-Distanz vorgerückte "time" unten.
    // Wichtig: für das Verplanen MUSS die vorgerückte Zeit benutzt werden,
    // nicht die alte s.nextTime - sonst landet jede Note eine Zählzeit zu
    // früh (auf der Zeit des vorherigen Checkpoints).
    const deltaUnits = nextUnit - Math.max(0, s.lastProcessedUnit);
    const time = s.nextTime + deltaUnits * unitSeconds;
    if (time >= horizon) return; // erst beim nächsten Tick weiter

    if (instance.clickUnitSet.has(nextUnit) && state.metronome) {
      scheduleClick(time);
    }
    if (nextUnit === 0) {
      s.measureRealSegments.push({
        measureId: instance.measureId,
        startTime: time,
        endTime: time + instance.capacityUnits * unitSeconds,
      });
    }
    if (instance.noteByUnit.has(nextUnit)) {
      const { note, type } = instance.noteByUnit.get(nextUnit);
      const noteDuration = type.units * unitSeconds;
      if (!type.isRest) {
        scheduleTone(time, noteDuration * 0.92);
      }
      s.noteRealSegments.push({ noteId: note.id, startTime: time, endTime: time + noteDuration });
    }

    s.nextTime = time;
    s.lastProcessedUnit = nextUnit;
  }
}

// Laufender Zeigebalken UND Noten-Hervorhebung laufen über dieselbe Uhr
// (audioCtx.currentTime, nicht die System-/setTimeout-Uhr) - sonst laufen
// beide mit der Zeit leicht gegeneinander (und gegen den tatsächlichen Ton)
// auseinander, weil setTimeout-Verzögerungen nicht exakt sample-genau sind.
// Nutzt die tatsächlich verplanten Zeiten aus dem Scheduler (nicht eine
// feste Formel), damit das auch bei einer Tempo-Änderung mitten in der
// Wiedergabe korrekt bleibt.
let cursorRAF = null;
let highlightedNoteIds = new Set();

function startCursor() {
  function tick() {
    if (!state.isPlaying) return;
    const now = audioCtx.currentTime;
    const s = scheduler;

    if (countIn) {
      if (now < countIn.endTime) {
        updateCountInVisual(now);
        cursorRAF = requestAnimationFrame(tick);
        return; // während des Einzählens kein normaler Playhead/Noten-Highlight
      }
      endCountIn();
    }

    document.querySelectorAll('.playhead.active').forEach((p) => p.classList.remove('active'));

    if (s) {
      const activeMeasure = s.measureRealSegments.find((m) => now >= m.startTime && now < m.endTime);
      if (activeMeasure) {
        const track = document.querySelector(`.slot-track[data-measure-id="${activeMeasure.measureId}"]`);
        const playhead = track && track.querySelector('.playhead');
        if (playhead) {
          const pct = ((now - activeMeasure.startTime) / (activeMeasure.endTime - activeMeasure.startTime)) * 100;
          playhead.style.left = `${Math.max(0, Math.min(100, pct))}%`;
          playhead.classList.add('active');
        }
      }

      const activeIds = new Set();
      s.noteRealSegments.forEach((seg) => {
        if (now >= seg.startTime && now < seg.endTime) activeIds.add(seg.noteId);
      });
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
    }

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
  if (countIn) endCountIn();
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
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  scheduler = null;
  stopCursor();
  state.isPlaying = false;
  playPauseBtn.textContent = '▶ Abspielen';
  playPauseBtn.classList.remove('is-playing');
  // Während des Abspielens live editierte Takte können jetzt unvollständig
  // sein (der Button blieb dafür bewusst klickbar, um stoppen zu können) -
  // nach dem Stopp muss der deaktiviert/grau-Status also neu bewertet
  // werden, sonst bliebe "Abspielen" fälschlich grün+klickbar.
  updatePlayAvailability();
}

/* ============================================================
   Toolbar
   ============================================================ */

const playPauseBtn = document.getElementById('playPauseBtn');
const bpmSlider = document.getElementById('bpmSlider');
const bpmValue = document.getElementById('bpmValue');
const metronomeToggle = document.getElementById('metronomeToggle');
const countInToggle = document.getElementById('countInToggle');
const noteVolumeSlider = document.getElementById('noteVolumeSlider');
const noteVolumeValue = document.getElementById('noteVolumeValue');
const clickVolumeSlider = document.getElementById('clickVolumeSlider');
const clickVolumeValue = document.getElementById('clickVolumeValue');

document.getElementById('addMeasureBtn').addEventListener('click', addMeasure);
playPauseBtn.addEventListener('click', () => {
  if (state.isPlaying) stop();
  else play();
});
bpmSlider.addEventListener('input', () => {
  state.bpm = Number(bpmSlider.value);
  bpmValue.textContent = state.bpm;
});
metronomeToggle.addEventListener('change', () => {
  state.metronome = metronomeToggle.checked;
});
countInToggle.addEventListener('change', () => {
  state.countIn = countInToggle.checked;
});
noteVolumeSlider.addEventListener('input', () => {
  state.noteVolume = Number(noteVolumeSlider.value) / 100;
  noteVolumeValue.textContent = noteVolumeSlider.value;
  if (noteMasterGain) noteMasterGain.gain.setTargetAtTime(state.noteVolume, audioCtx.currentTime, 0.01);
});
clickVolumeSlider.addEventListener('input', () => {
  state.clickVolume = Number(clickVolumeSlider.value) / 100;
  clickVolumeValue.textContent = clickVolumeSlider.value;
  if (clickMasterGain) clickMasterGain.gain.setTargetAtTime(state.clickVolume, audioCtx.currentTime, 0.01);
});

// Einstellungen-Flyout: Tempo/Grundschlag/Wiederholungen sind nicht mehr
// permanent in der Werkzeugleiste sichtbar, sondern klappen als kleines
// Overlay auf - schließt sich beim erneuten Klick auf den Knopf oder bei
// einem Klick irgendwo außerhalb.
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');

settingsToggle.addEventListener('click', () => {
  const willOpen = settingsPanel.hidden;
  settingsPanel.hidden = !willOpen;
  settingsToggle.setAttribute('aria-expanded', String(willOpen));
});

document.addEventListener('pointerdown', (e) => {
  if (settingsPanel.hidden) return;
  if (settingsPanel.contains(e.target) || e.target === settingsToggle) return;
  settingsPanel.hidden = true;
  settingsToggle.setAttribute('aria-expanded', 'false');
});

/* ============================================================
   Init
   ============================================================ */

state.measures = [newMeasure()];
renderPalette();
renderMeasures();
