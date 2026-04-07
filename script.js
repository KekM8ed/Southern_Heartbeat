const map = L.map('map').setView(
  CONFIG.INITIAL_VIEW.center,
  CONFIG.INITIAL_VIEW.zoom
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const aedIcon = L.icon({
  iconUrl: CONFIG.AED_ICON_URL,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const nearestList = document.getElementById('nearestList');
const walkBtn = document.getElementById('walkBtn');
const driveBtn = document.getElementById('driveBtn');
const homeBtn = document.getElementById('homeBtn');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('sidebar');
const disclaimerOverlay = document.getElementById('disclaimerOverlay');
const closeDisclaimerBtn = document.getElementById('closeDisclaimerBtn');

let aedData = [];
let userCoords = null;
let userMarker = null;
let routingMode = 'foot-walking';
let routeLine = null;
let activeRoute = null;
const aedLayers = [];

function highlightMode() {
  walkBtn.classList.remove('active-mode');
  driveBtn.classList.remove('active-mode');

  if (routingMode === 'foot-walking') {
    walkBtn.classList.add('active-mode');
  } else {
    driveBtn.classList.add('active-mode');
  }
}

function setMode(mode) {
  routingMode = mode;
  highlightMode();

  if (activeRoute) {
    getRouteTo(...activeRoute);
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildPopupHTML(feature, coords, layer, distance = null, duration = null) {
  const wrapper = document.createElement('div');

  const name = escapeHtml(feature.properties.name || 'AED');
  const availability = escapeHtml(feature.properties.availability || 'Availability unknown');
  const contact = escapeHtml(feature.properties.contact || 'No contact listed');

  wrapper.innerHTML = `
    <strong>${name}</strong><br>
    <em>${availability}</em><br>
    <small>Contact: ${contact}</small><br><br>
  `;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Get Route';
  btn.addEventListener('click', () => getRouteTo(coords, feature, layer));
  wrapper.appendChild(btn);

  if (distance && duration) {
    const details = document.createElement('div');
    details.innerHTML = `<br><strong>Distance:</strong> ${escapeHtml(distance)}<br><strong>Duration:</strong> ${escapeHtml(duration)}`;
    wrapper.appendChild(details);
  }

  return wrapper;
}

function showNearestAEDs() {
  if (!userCoords || !aedData.length) {
    return;
  }

  const sorted = aedData
    .map((aed) => {
      const distance = haversine(
        userCoords[0],
        userCoords[1],
        aed.coords[0],
        aed.coords[1]
      );
      return { ...aed, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, CONFIG.NEAREST_COUNT);

  nearestList.innerHTML = '';

  sorted.forEach((aed) => {
    const div = document.createElement('div');
    div.className = 'aed-entry';
    div.innerHTML = `
      <strong>${escapeHtml(aed.name)}</strong><br>
      ${escapeHtml(aed.availability)}<br>
      ${escapeHtml(aed.contact)}<br>
      <small>Distance: ${aed.distance.toFixed(2)} km</small>
    `;

    div.addEventListener('click', () => {
      const match = aedLayers.find(
        (entry) => entry.feature.properties.name === aed.name
      );

      if (!match) {
        return;
      }

      map.setView(aed.coords, CONFIG.AED_FOCUS_ZOOM);
      match.layer.openPopup();
    });

    nearestList.appendChild(div);
  });
}

async function getRouteTo(destination, feature, selectedLayer) {
  if (!userCoords) {
    alert('User location not available.');
    return;
  }

  if (!CONFIG.ORS_API_KEY || CONFIG.ORS_API_KEY === '5b3ce3597851110001cf6248f35489e30d774c72937058dc7ed65089') {
    alert('OpenRouteService API key is missing in config.js.');
    return;
  }

  activeRoute = [destination, feature, selectedLayer];

  aedLayers.forEach(({ layer, feature: popupFeature, coords }) => {
    layer.setPopupContent(buildPopupHTML(popupFeature, coords, layer));
  });

  const orsUrl = `https://api.openrouteservice.org/v2/directions/${routingMode}/geojson`;

  try {
    const response = await fetch(orsUrl, {
      method: 'POST',
      headers: {
        Authorization: CONFIG.ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [
          [userCoords[1], userCoords[0]],
          [destination[1], destination[0]]
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Routing request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (
      !data ||
      !Array.isArray(data.features) ||
      data.features.length === 0 ||
      !data.features[0].properties ||
      !data.features[0].properties.summary
    ) {
      throw new Error('No valid route returned from OpenRouteService');
    }

    if (routeLine) {
      map.removeLayer(routeLine);
    }

    routeLine = L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 4
      }
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());

    const summary = data.features[0].properties.summary;
    const distance = `${(summary.distance / 1000).toFixed(2)} km`;
    const duration = `${Math.round(summary.duration / 60)} min`;

    selectedLayer.setPopupContent(
      buildPopupHTML(feature, destination, selectedLayer, distance, duration)
    );
    selectedLayer.openPopup();
  } catch (error) {
    console.error('Routing error:', error);
    alert(`Failed to fetch route: ${error.message}`);
  }
}

function goHome() {
  if (!userCoords) {
    alert('Your location is not available yet.');
    return;
  }

  map.setView(userCoords, CONFIG.USER_FOCUS_ZOOM);

  if (userMarker) {
    userMarker.openPopup();
  }
}

function addAEDsToMap() {
  L.geoJSON(
    {
      type: 'FeatureCollection',
      features: aedData.map((aed) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [aed.coords[1], aed.coords[0]]
        },
        properties: aed
      }))
    },
    {
      pointToLayer: (feature, latlng) => L.marker(latlng, { icon: aedIcon }),
      onEachFeature: (feature, layer) => {
        const coords = feature.geometry.coordinates.slice().reverse();
        aedLayers.push({ layer, feature, coords });
        layer.bindPopup(buildPopupHTML(feature, coords, layer));
      }
    }
  ).addTo(map);
}

function initialiseGeolocation() {
  if (!navigator.geolocation) {
    nearestList.textContent = 'Geolocation is not supported by this browser.';
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      userCoords = [position.coords.latitude, position.coords.longitude];

      if (userMarker) {
        userMarker.setLatLng(userCoords);
      } else {
        userMarker = L.marker(userCoords)
          .addTo(map)
          .bindPopup('You are here.')
          .openPopup();

        map.setView(userCoords, CONFIG.USER_INITIAL_ZOOM);
      }

      showNearestAEDs();
    },
    (error) => {
      console.error('Geolocation error:', error);
      nearestList.textContent = 'Location unavailable. Allow location access to see nearest AEDs.';
      alert('Geolocation access denied.');
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  );
}

async function loadAEDData() {
  try {
    const response = await fetch('aed-data.json');

    if (!response.ok) {
      throw new Error(`AED data request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('AED data must be an array');
    }

    aedData = data.filter((aed) =>
      aed &&
      typeof aed.name === 'string' &&
      Array.isArray(aed.coords) &&
      aed.coords.length === 2 &&
      typeof aed.coords[0] === 'number' &&
      typeof aed.coords[1] === 'number'
    );

    if (!aedData.length) {
      nearestList.textContent = 'No AED data available.';
      return;
    }

    addAEDsToMap();
    nearestList.textContent = 'Calculating...';
    showNearestAEDs();
  } catch (error) {
    console.error('AED data loading error:', error);
    nearestList.textContent = `Failed to load AED data: ${error.message}`;
  }
}

if (closeDisclaimerBtn && disclaimerOverlay) {
  closeDisclaimerBtn.addEventListener('click', () => {
    disclaimerOverlay.classList.add('hidden');
  });
}

walkBtn.addEventListener('click', () => setMode('foot-walking'));
driveBtn.addEventListener('click', () => setMode('driving-car'));
homeBtn.addEventListener('click', goHome);

toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  toggleSidebarBtn.textContent = sidebar.classList.contains('collapsed') ? '➕' : '➖';
});

highlightMode();
loadAEDData();
initialiseGeolocation();
