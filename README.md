# Rhythmus-Generator

Interaktive Web-App für die digitale Tafel: Notenwerte per Drag & Drop in einen
4/4-Takt legen, den Füllstand (offen / voll / übervoll) sofort sehen und den
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
  eine Live-Vorschau schon die echte Feldgröße im Takt.
- Bereits platzierte Noten lassen sich innerhalb eines Takts oder in einen
  anderen Takt verschieben; aus dem Raster herausziehen entfernt sie.
- Kleines "×" auf einer Note entfernt sie direkt.
- "+ Takt" fügt einen weiteren Takt hinzu, "×" am Takt-Kopf entfernt ihn.
- Ein Takt zeigt seinen Füllstand farbig an: grau = leer, amber = angefangen
  aber noch nicht voll, grün ("Voll ✓") = genau 4 Zählzeiten belegt, rot
  ("Übervoll!") = mehr als 4 Zählzeiten – die überzähligen Noten laufen dabei
  sichtbar aus, statt einen Scrollbalken zu brauchen.
- "Abspielen" spielt alle Takte der Reihe nach in der eingestellten
  Geschwindigkeit (Tempo-Regler) ab; jede Note (auch jede einzelne Achtel)
  klingt für ihre eigene, korrekte Dauer, Pausen bleiben still. Ein laufender
  Zeigebalken zeigt dabei genau, wann eine Note dran ist. "Grundschlag"
  blendet einen leisen Klick auf jeder Zählzeit ein/aus. "Wiederholungen"
  legt fest, wie oft der komplette Rhythmus hintereinander abgespielt wird
  (Standard: 4, frei einstellbar von 1 bis 50).

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
