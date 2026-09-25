# Rhythmus-Generator – Funktionsübersicht

## 1. Stand

24.09.2026

Diese Übersicht beschreibt ausschließlich das, was im Programmcode tatsächlich eingebaut ist – keine geplanten oder denkbaren Funktionen.

## 2. Was die App kann

**Notenwerte und Pausen (Palette oben)**
- Noten: Ganze Note, Halbe Note, Viertel Note, Achtel (einzeln, mit Fähnchen), Achtelpaar (fügt zwei Achtel auf einmal ein, automatisch mit Notenbalken verbunden)
- Pausen: Ganze Pause, Halbe Pause, Viertelpause, Achtelpause

**Taktarten**
- 4/4, 3/4 und 6/8 – jeder Takt hat seine eigene Taktart, umschaltbar über ein kleines Dropdown direkt vor dem Takt (in klassischer Notenschrift, zwei Ziffern übereinander)
- Zählzeiten-Beschriftung, Schlaglinien und Metronom-Klick passen sich automatisch an die gewählte Taktart an

**Rhythmus zusammenstellen (Drag & Drop)**
- Karten aus der Palette per Ziehen (Maus, Finger oder Stift) in einen Takt ablegen – landet exakt an der gewählten Zählzeit, freie Felder davor bleiben einfach leer
- Bereits platzierte Noten lassen sich innerhalb eines Takts oder in einen anderen Takt verschieben
- Eine Note aus dem Raster herausziehen oder auf das kleine "×" tippen entfernt sie
- Ein Takt kann nicht "übervoll" gezogen werden: passt eine Note nicht mehr hinein, wird sie nicht abgelegt und eine kurze Meldung erscheint
- "🎲 Zufall" füllt einen Takt automatisch mit einem passenden Zufallsrhythmus
- "🧹 Leeren" entfernt alle Noten/Pausen aus einem Takt auf einmal
- "+ Takt" fügt einen weiteren Takt hinzu, "×" im Takt-Kopf entfernt ihn wieder
- Ein Farbrahmen zeigt den Füllstand: grau = leer, orange = angefangen, grün = genau voll

**Abspielen**
- "Abspielen" ist klickbar, sobald mindestens ein Takt genau voll ist und kein anderer Takt "angefangen" (halb befüllt) oder "übervoll" ist - ein komplett unberührter, leerer Takt (z.B. versehentlich per "+ Takt" zusätzlich angelegt) blockiert NICHT und wird beim Abspielen einfach übersprungen (seit 24.09.2026 - vorher musste jeder vorhandene Takt genau voll sein, auch nie befüllte)
- Jeder Takt kann einzeln oft wiederholt werden (1–50 mal), bevor der nächste Takt beginnt
- Ein Einzähler zählt vor Beginn einen vollen Takt im eingestellten Tempo per Metronom-Klick vor (große Zahl + Punkte-Anzeige), lässt sich in den Einstellungen abschalten
- Während des Abspielens läuft ein Zeigebalken mit, und die gerade klingende Note wird farblich hervorgehoben
- Noten/Pausen lassen sich auch **während** des Abspielens noch verändern (hinzufügen, löschen, verschieben) – die Änderung wirkt sich sofort bzw. beim nächsten Durchlauf des betroffenen Takts aus
- Der Klang ist ein einzelner künstlich erzeugter Ton (keine Audioaufnahme, keine unterschiedlichen Tonhöhen) – die App stellt nur den Rhythmus dar, keine Melodie

**Tempo und Lautstärke**
- Tempo-Regler von 40 bis 180 BPM, auch während des Abspielens veränderbar
- Grundschlag/Metronom ein- oder ausschaltbar
- Lautstärke für Noten und für das Metronom getrennt einstellbar

**Bedienung auf Tablet, Smartphone und interaktivem Whiteboard**
- Die App passt ihr Layout automatisch an die Bildschirmgröße an (kein seitliches Scrollen nötig)
- Funktioniert gleichermaßen mit Maus, Finger (Touch) und Stift
- In den Einstellungen liegt ein QR-Code, mit dem Schüler:innen die App direkt über ihr eigenes Tablet/Smartphone öffnen können

**Design und Navigation (seit dem Redesign am 24.09.2026)**
- Helle Slate-Optik mit royalblauer Kopfleiste - identisch zu Rhythmus-Trainer, Noten-Rätsel und der Musik-Apps-Übersicht, damit der Wechsel zwischen den Apps nahtlos wirkt
- 🎵-Icon vor dem Titel "Rhythmus-Generator" in der Kopfleiste
- Oben rechts in der Kopfleiste führt ein Pfeil-Link ("← Musik-Apps") zurück zur Übersichtsseite aller Musik-Apps
- In den Einstellungen ganz unten ein klar beschrifteter "Impressum"-Link (führt zur zentralen Impressum-/Datenschutzseite der Musik-Apps)

## 3. Was die App NICHT kann

- **Kein Speichern**: Ein gelegter Rhythmus wird nirgends gesichert. Beim Neuladen oder Schließen der Seite ist alles unwiderruflich weg.
- **Kein Export**: Es gibt keine Möglichkeit, den Rhythmus als Bild, PDF, Noten-Datei oder Audiodatei zu exportieren oder zu drucken.
- **Kein Teilen/Versenden** eines erstellten Rhythmus an andere Personen oder Geräte.
- **Kein Benutzerkonto** und keine Speicherung in einer Cloud.
- **Keine weiteren Notenwerte**: keine Sechzehntelnoten, keine punktierten Noten (außer der impliziten Zählweise bei 6/8), keine Triolen.
- **Keine Melodien/Tonhöhen**: Jede Note klingt gleich hoch; es können keine unterschiedlichen Töne oder ein echtes Instrument nachgebildet werden.
- **Keine Mehrstimmigkeit**: Pro Takt gibt es nur eine einzige Notenzeile, kein zweites gleichzeitiges Rhythmus-Raster.
- **Keine weiteren Taktarten** außer 4/4, 3/4 und 6/8 (z. B. kein 2/4, 5/4 oder 7/8).
- **Keine Audio-/Video-Aufnahme**: Die App kann kein Mikrofon oder eine Kamera nutzen, um eigenen Gesang oder Instrumente aufzunehmen.
- **Kein garantierter Offline-Betrieb**: Die App muss beim Aufrufen aus dem Internet geladen werden; ob sie danach ganz ohne Internetverbindung weiterläuft, ist unklar (dafür ist im Programmcode keine eigene Vorkehrung eingebaut).

## 4. Bedienung im Unterricht – kurze Schrittfolge

1. Link öffnen (siehe Punkt 5) – am Whiteboard direkt, auf Schüler-Tablets z. B. über den QR-Code in den Einstellungen (⚙ unten links).
2. Passende Taktart für den ersten Takt über das Dropdown vor dem Raster wählen (Standard: 4/4).
3. Noten- bzw. Pausenkarte aus der Palette oben in das gewünschte Feld im Takt ziehen, bis der Takt grün "Voll ✓" anzeigt. Alternativ "🎲 Zufall" für einen automatischen Rhythmus nutzen.
4. Bei Bedarf über "+ Takt" weitere Takte ergänzen und deren Wiederholungsanzahl ("Wdh.") festlegen.
5. Tempo und Lautstärke bei Bedarf über "⚙ Einstellungen" anpassen.
6. Auf "▶ Abspielen" tippen – nach dem Einzähler ("1, 2, 3, 4 …") startet der Rhythmus.
7. Während des Abspielens können Noten weiter verändert werden, um z. B. live auf Fehler zu reagieren.
8. Mit "■ Stopp" die Wiedergabe jederzeit beenden.
9. Wichtig: Vor dem Schließen der Seite gibt es keine Sicherungsfunktion – ein gewünschter Rhythmus muss ggf. per Foto/Screenshot des Bildschirms festgehalten werden.

## 5. Link zur App

https://mitlaeuferfotografie.github.io/Rhythmus-Generator/

Kurzlink: https://kurzlinks.de/rhythmus
