# Rhythmus-Tafel

Interaktive Web-App für die digitale Tafel: Notenwerte per Drag & Drop in einen
4/4-Takt legen, den Füllstand (offen / voll / übervoll) sofort sehen und den
gelegten Rhythmus optional hörbar abspielen.

Passend zur Unterrichtsreihe "Rhythmusnotationen 3/4" – die Notenwerte
entsprechen den physischen Ausschneidekarten und der Notenwerte-Übersicht:
Ganze Note, Halbe Note, Viertel Note, Achtel (einzeln oder als Achtelpaar),
Viertelpause. Zwei benachbarte Achtel, die auf derselben Zählzeit beginnen,
werden automatisch mit einem gemeinsamen Notenbalken dargestellt – exakt wie
auf der Notenwerte-Übersicht: die erste Achtel liegt über der Zählzeit
("1", "2", …), die zweite über dem "+". Flächenmäßig ergeben 2 Achtel immer
exakt eine Viertelnote.

## Nutzung

- Notenkarte aus der Palette links in einen Takt ziehen.
- Bereits platzierte Noten lassen sich innerhalb eines Takts oder in einen
  anderen Takt verschieben; aus dem Raster herausziehen entfernt sie.
- Kleines "×" auf einer Note entfernt sie direkt.
- "+ Takt" fügt einen weiteren Takt hinzu, "×" am Takt-Kopf entfernt ihn.
- Ein Takt färbt sich grün ("Voll"), sobald genau 4 Zählzeiten belegt sind,
  und rot ("Übervoll"), sobald mehr als 4 Zählzeiten belegt sind – die
  überzählige Note ragt dabei sichtbar über die Taktgrenze hinaus.
- "Abspielen" spielt alle Takte der Reihe nach in der eingestellten
  Geschwindigkeit (Tempo-Regler) ab; jede Note (auch jede einzelne Achtel)
  klingt für ihre eigene, korrekte Dauer, Pausen bleiben still. "Grundschlag"
  blendet einen leisen Klick auf jeder Zählzeit ein/aus. "Wiederholungen"
  legt fest, wie oft der komplette Rhythmus hintereinander abgespielt wird
  (Standard: 4, frei einstellbar von 1 bis 50).

Funktioniert mit Maus, Finger (Touch) und Stift – gedacht für den Einsatz auf
einem interaktiven Whiteboard/Tafel.

## Lokal starten

Kein Build-Schritt nötig, reines HTML/CSS/JS. Zwei Optionen:

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
