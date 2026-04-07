# Southern Heartbeat -- AED Locator Map

## Overview

Southern Heartbeat is a lightweight, browser-based web application
designed to help users locate the nearest Automated External
Defibrillators (AEDs) and generate routes to them in an emergency.

The application is built using a fully static architecture and is
deployed via GitHub Pages. It uses live browser geolocation, a
JSON-based AED dataset, and routing powered by OpenRouteService.

## Purpose

This project aims to provide a simple, accessible tool to support
emergency response by: - Displaying nearby AED locations on an
interactive map\
- Showing key information about each AED (availability, contact
details)\
- Identifying the nearest AEDs based on user location\
- Providing walking or driving routes to selected AEDs

## Key Features

-   Interactive map using Leaflet\
-   OpenStreetMap basemap\
-   Live user geolocation\
-   Custom AED marker icons (`AED_Icon.webp`)\
-   Nearest AED calculation (straight-line distance)\
-   Sidebar listing closest AEDs\
-   Clickable AED entries and map markers\
-   Popups with AED details and routing option\
-   Routing via OpenRouteService (walking and driving modes)\
-   Collapsible sidebar\
-   Splash-screen disclaimer on first load

## Project Structure

/ ├── index.html\
├── style.css\
├── script.js\
├── config.js\
├── aed-data.json\
├── AED_Icon.webp\
└── README.md

## Configuration

### OpenRouteService API Key

Add your key to `config.js`:

``` javascript
const CONFIG = {
  ORS_API_KEY: "YOUR_API_KEY_HERE"
};
```

## AED Data

Stored in `aed-data.json`:

``` json
{
  "name": "Example AED",
  "coords": [-51.7000, -57.8500],
  "availability": "Available 24/7",
  "contact": "Example Contact"
}
```

## Disclaimer

This application is intended as a support tool only. In an emergency,
always contact emergency services immediately.

## Deployment

Deployed using GitHub Pages.
