# Tonlerner

Eine kleine Gehörbildungs-App für Blechbläser (Posaune / Bariton), gebaut als
**Progressive Web App (PWA)** – läuft direkt im Browser auf dem iPhone und lässt
sich per „Zum Home-Bildschirm hinzufügen" wie eine echte App installieren.
Kein App Store, kein Apple-Entwicklerkonto, kein Mac nötig.

## Übungen

- **Höher / Tiefer** – zwei Töne nacheinander, war der zweite höher oder tiefer?
  (Basis fürs Stimmen/Intonation)
- **Ton erkennen** – Grundton als Referenz, dann Zielton benennen; Anzeige im
  gewählten Notenschlüssel.
- **Tonsprünge** – Intervalle erkennen (Sekunde … Oktave).
- **Intonation** – derselbe Ton leicht verstimmt: zu hoch oder zu tief?

Jede Übung hat ein Level-System, das sich mit der Trefferquote automatisch
anpasst, dazu einen Tages-Streak. Voreingestellt: **Bassschlüssel**, deutsche
Notennamen (H/B) und der Tonumfang **Posaune / Bariton**. Alles in den
Einstellungen umstellbar. Fortschritt und Einstellungen liegen lokal im Browser.

## Technik

Vite · React · TypeScript · Tailwind CSS · VexFlow (Notendarstellung) ·
Web Audio API (Tonsynthese) · vite-plugin-pwa (Offline & Home-Screen-Icon).

## Lokal starten

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Auf dem iPhone benutzen (Live-Deployment)

Bei jedem Push auf `main` oder den Feature-Branch baut GitHub Actions die App
und veröffentlicht sie automatisch. Die Live-URL lautet:

```
https://felixalbrs.github.io/tonlerner/
```

**Einmalig einzurichten** (im GitHub-Repo):
1. *Settings → Pages* öffnen.
2. Unter *Build and deployment → Source* **„GitHub Actions"** auswählen.
3. Falls das Deployment blockiert wird: unter *Settings → Environments →
   github-pages* den Branch für Deployments freigeben.

Danach die URL in Safari öffnen und über *Teilen → Zum Home-Bildschirm
hinzufügen* als App installieren. Für die beste Tonqualität Kopfhörer nutzen.
