Southern Heartbeat – AED Locator Map
Overview

Southern Heartbeat is a lightweight, browser-based web application designed to help users locate the nearest Automated External Defibrillators (AEDs) and generate routes to them in an emergency.

The application is built using a fully static architecture and is deployed via GitHub Pages. It uses live browser geolocation, a JSON-based AED dataset, and routing powered by OpenRouteService.

Purpose

This project aims to provide a simple, accessible tool to support emergency response by:

Displaying nearby AED locations on an interactive map
Showing key information about each AED (availability, contact details)
Identifying the nearest AEDs based on user location
Providing walking or driving routes to selected AEDs
Key Features
Interactive map using Leaflet
OpenStreetMap basemap
Live user geolocation
Custom AED marker icons (AED_Icon.webp)
Nearest AED calculation (straight-line distance)
Sidebar listing closest AEDs
Clickable AED entries and map markers
Popups with AED details and routing option
Routing via OpenRouteService (walking and driving modes)
Collapsible sidebar
Splash-screen disclaimer on first load
Project Structure
/
├── index.html          # Main page structure
├── style.css           # Styling and layout
├── script.js           # Core application logic
├── config.js           # Configuration (API key, settings)
├── aed-data.json       # AED dataset (currently dummy data)
├── AED_Icon.webp       # Custom AED marker icon
└── README.md
Configuration
OpenRouteService API Key

Routing functionality requires an API key from OpenRouteService.

Add your key to config.js:

const CONFIG = {
  ORS_API_KEY: "YOUR_API_KEY_HERE",
  ...
};

Important:

This is a public static site — the API key is visible client-side
Suitable for development and testing
For production use, consider a backend proxy to protect the key
AED Data

AED locations are stored in:

aed-data.json

Each entry follows this structure:

{
  "name": "Example AED",
  "coords": [-51.7000, -57.8500],
  "availability": "Available 24/7",
  "contact": "Example Contact, +500 00000"
}
Notes
Current data is placeholder/dummy data
Real data should be validated before use in a live environment
The structure can be extended (e.g. notes, access type, verification date)
How It Works
The map loads with a default view
Browser geolocation tracks the user’s position
AED data is loaded from aed-data.json
Distances to each AED are calculated using the Haversine formula
The nearest AEDs are displayed in the sidebar
Selecting an AED:
opens a popup
allows routing via OpenRouteService
Routes are displayed on the map with distance and duration
Disclaimer

This application is intended as a support tool only.

AED availability and access may vary
Information may not always be complete or up to date
In an emergency, always contact emergency services immediately

A splash-screen disclaimer is presented on first load to communicate this clearly to users.

Deployment

This project is deployed using GitHub Pages.

To update:
Edit files locally
Commit and push to the repository
GitHub Pages automatically updates the live site
Cache note

If changes are not visible immediately:

perform a hard refresh (Ctrl + Shift + R)
or update script references with versioning (?v=2)
Known Limitations
API key is exposed in client-side code
Nearest AED calculation is based on straight-line distance (not route time)
Requires user location permission for full functionality
No offline support
No backend validation of AED data
Future Improvements

Planned or potential enhancements:

Route-based nearest AED calculation
Backend proxy for API key security
Improved mobile UX and layout
Manual location selection if geolocation is denied
AED filtering (e.g. 24/7 vs restricted access)
Enhanced AED metadata (notes, access type, verification date)
Integration with authoritative AED datasets
Development Notes
Built as a static HTML/CSS/JavaScript application
No build tools or frameworks required
Designed for simplicity and ease of handover
All logic is contained within script.js
Configuration is isolated in config.js
Author / Project Context

Developed as part of the Southern Heartbeat project to explore accessible, lightweight emergency support tools for AED awareness and access.
