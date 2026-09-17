# Rhythmus-Generator

Interaktive Web-App für die digitale Tafel: Notenwerte per Drag & Drop in einen
Takt legen, den Füllstand (offen / voll / übervoll) sofort sehen und den
gelegten Rhythmus optional hörbar abspielen.

Passend zur Unterrichtsreihe "Rhythmusnotationen 3/4" – die Notenwerte
entsprechen den physischen Ausschneidekarten und der Notenwerte-Übersicht:
Ganze, Halbe, Viertel und Achtel (einzeln oder als Achtelpaar) sowie die
passenden Pausen (Ganze, Halbe, Viertel, Achtel). Zwei benachbarte Achtel,
die auf derselben Zählzeit beginnen, werden automatisch mit einem
gemeinsamen Notenbalken dargestellt – exakt wie auf der
Notenwerte-Übersicht: die erste Achtel liegt über der Zählzeit ("1", "2", …),
die zweite über dem "+". Flächenmäßig ergeben 2 Achtel immer exakt eine
Viertelnote.

## Nutzung

- Notenwerte-Palette liegt oben (Noten links, Pausen rechts) und bleibt beim
  Scrollen sichtbar. Karte in einen Takt ziehen; während des Ziehens zeigt
  eine Live-Vorschau schon die echte Feldgröße an der Ziel-Zählzeit. Eine
  Note landet dabei exakt dort, wo man sie ablegt – auch wenn davor noch
  nichts liegt (z. B. direkt auf Zählzeit 4 ziehen, ohne 1-3 erst zu
  belegen). Die Felder davor bleiben dann einfach leer, statt automatisch
  mit Pausen aufgefüllt zu werden.
- Bereits platzierte Noten lassen sich innerhalb eines Takts oder in einen
  anderen Takt verschieben; aus dem Raster herausziehen entfernt sie.
- Kleines "×" auf einer Note entfernt sie direkt.
- "+ Takt" fügt einen weiteren Takt hinzu.
- Jeder Takt hat seine eigene Taktart: das Dropdown direkt vor dem ersten
  Feld im Raster (in klassischer Notenschrift, zwei Ziffern übereinander)
  wählt zwischen 4/4, 3/4 und 6/8. Zählzeiten-Beschriftung, Schlag-
  Trennlinien und Grundschlag passen sich automatisch an (6/8 klickt auf
  den zwei zusammengesetzten Schlägen statt auf jeder Achtel).
- Ein Takt zeigt seinen Füllstand farbig an: grau = leer, amber = angefangen
  aber noch nicht voll, grün ("Voll ✓") = genau voll, rot ("Übervoll!") =
  mehr Noten als die Taktart erlaubt – die überzähligen Noten laufen dabei
  sichtbar aus, statt einen Scrollbalken zu brauchen. "Abspielen" ist
  deaktiviert, solange nicht JEDER Takt genau voll ist (also bei leeren,
  offenen oder übervollen Takten) - erst wenn alle "Voll ✓" zeigen, geht's los.
- "🎲 Zufall" im Takt-Kopf erzeugt einen zufälligen, aber garantiert
  passenden Rhythmus für diesen Takt (füllt ihn komplett, meist Noten,
  gelegentlich eine Pause für Abwechslung).
- Im Takt-Kopf wählt ein Dropdown ("Wdh."), wie oft genau DIESER Takt
  wiederholt wird (Standard: 4, frei von 1 bis 50), bevor es mit dem
  nächsten Takt weitergeht; "×" direkt daneben entfernt den ganzen Takt.
- Die Notenwerte-Palette (Noten/Pausen) skaliert Icon- und Schriftgröße
  automatisch so, dass jede der beiden Gruppen immer in maximal 2 Zeilen
  passt, egal wie breit der Bildschirm ist - beide Gruppen bleiben dabei
  gleich groß (an der jeweils engeren orientiert), auch wenn sie
  unterschiedlich viele Spalten haben.
- "Abspielen" spielt alle Takte der Reihe nach in der eingestellten
  Geschwindigkeit (Tempo-Regler) ab, jeden Takt so oft wie eingestellt
  direkt hintereinander; jede Note (auch jede einzelne Achtel) klingt für
  ihre eigene, korrekte Dauer, Pausen bleiben still. Ein laufender
  Zeigebalken zeigt dabei genau, wann eine Note dran ist. "Grundschlag"
  blendet einen leisen Klick auf jeder Zählzeit ein/aus.
- Auch WÄHREND des Abspielens lässt sich der Rhythmus verändern: Noten
  löschen oder neue hinein- bzw. verschieben wirkt sofort auf die laufende
  Wiedergabe, ohne stoppen und neu starten zu müssen - nur der jeweils
  nächste, schon ganz kurz bevorstehende Ton ist davon nicht mehr betroffen.

Funktioniert mit Maus, Finger (Touch) und Stift, und passt sich jeder
Bildschirmgröße an (kein horizontales Scrollen) – gedacht für den Einsatz auf
einem interaktiven Whiteboard/Tafel, aber auch auf Tablet/Laptop nutzbar.

## Lokal starten

Kein Build-Schritt nötig, reines HTML/CSS/JS.

```bash
node serve.js
```

und dann `http://localhost:5178` öffnen – oder `index.html` direkt per
Doppelklick im Browser öffnen (Drag & Drop und Audio funktionieren auch so,
ein lokaler Server ist nur bei manchen Browser-Sicherheitseinstellungen
nötig).

## Hosting über GitHub Pages

1. Dieses Verzeichnis in ein GitHub-Repository pushen (siehe Befehle unten).
2. Im Repo unter **Settings → Pages** als Quelle "Deploy from a branch",
   Branch `main`, Ordner `/ (root)` auswählen.
3. Nach kurzer Zeit ist die App unter
   `https://<dein-github-name>.github.io/<repo-name>/` erreichbar.

```bash
git remote add origin <URL-deines-leeren-GitHub-Repos>
git branch -M main
git push -u origin main
```
