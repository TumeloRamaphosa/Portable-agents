# Studex Agent OS — command center

Static page, no build step. Open `index.html` or serve the folder.

## Add to studex-auto-meat
```
git clone https://github.com/TumeloRamaphosa/studex-auto-meat
cd studex-auto-meat
mkdir -p public/agent-os && cp -r <download>/studex-agent-os/* public/agent-os/
git add public/agent-os
git commit -m "Add Studex Agent OS command center (desktop + mobile)"
git push
```
Served at `/agent-os/` on Vite, Next.js or any static host.

## Notes
- Responsive: sidebar on desktop, bottom tabs under 900px.
- Mission, agent and log data are simulated in the page script. Wire to the real Hermes/agent API before launch.
- Images are cropped from the mockup screenshot; replace with originals.
