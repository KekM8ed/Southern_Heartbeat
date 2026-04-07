# Southern Heartbeat AED Map

## Overview
Southern Heartbeat is a static Leaflet web map designed to help users identify nearby AEDs and route to them from their current location.

This version keeps the full original functionality while using:
- `aed-data.json` for dummy AED records
- `AED_Icon.webp` as the local AED marker icon

## Files
- `index.html` – page structure
- `style.css` – page styling
- `script.js` – map logic, geolocation, nearest AED calculations, sidebar behaviour, routing, and popup handling
- `config.js` – configuration values such as the OpenRouteService API key and icon path
- `aed-data.json` – AED location and popup data
- `AED_Icon.webp` – local AED marker icon file (add this yourself to the project root)

## Current functionality
- Leaflet map with OpenStreetMap basemap
- Live browser geolocation
- User location marker
- Sidebar showing nearest AEDs by straight-line distance
- Clickable AED entries in sidebar
- AED popups with availability and contact details
- Route generation using OpenRouteService
- Walk / drive mode switching
- Home button to zoom back to user location
- Collapsible sidebar

## AED data
AED data is stored in `aed-data.json`.

Example entry:
```json
{
  "name": "Example AED",
  "coords": [-51.7000, -57.8500],
  "availability": "Available 24/7",
  "contact": "Example Contact, +500 00000"
}
```

## Important notes
- `aed-data.json` currently contains dummy data.
- Replace `PASTE_YOUR_API_KEY_HERE` in `config.js` with your OpenRouteService key.
- Place `AED_Icon.webp` in the same folder as `index.html`.
- Because this is a static GitHub Pages site, the API key remains visible client-side.
- If you open `index.html` directly from the file system, some browsers may block `fetch()` for `aed-data.json`. GitHub Pages or a local web server avoids this.

## Running locally
You can:
- serve the folder locally with a lightweight local server, for example `python -m http.server 8000`
- then open `http://localhost:8000`
- or publish directly through GitHub Pages

## Suggested next steps
- Replace dummy AED records with verified live data
- Add stronger public-facing emergency guidance and disclaimers
- Consider route-based nearest ranking in future if required
