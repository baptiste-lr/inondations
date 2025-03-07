/// AccesToken
mapboxgl.accessToken = 'pk.eyJ1IjoiYmFwdGlzdGVsciIsImEiOiJjbTczNjVxODAwNXc1MmpzNmxzZnlwcnoxIn0.6GA4OBEpTW9PN1bQKtwffw';

/// Configuration de la carte
var map = new mapboxgl.Map({
    container: 'map',
    style: 'https://openmaptiles.geo.data.gouv.fr/styles/positron/style.json', 
    customAttribution : '<a>Baptiste de La Rochebrochard</a>',
    center: [-1.669, 48.114],
    zoom: 10,
    pitch: 0,
    bearing: 0,
    projection: { name: 'equalEarth' }
});

/// Données intégrées
map.on('style.load', () => {

    // ✅ 1️⃣ Ajout de la source hydrologique
    map.addSource('mapbox-streets-v7', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v7'
    });

    // ✅ 2️⃣ Ajout du réseau hydrographique (couche du dessous)
    map.addLayer({
        "id": "hydrologie",
        "type": "line",
        "source": "mapbox-streets-v7",
        "source-layer": "waterway",
        "layout": { "visibility": "visible" },
        "paint": {
            "line-color": "#4dd2ff",
            "line-width": 2,
            "line-opacity": 0.9
        }
    });

    // ✅ 3️⃣ Ajout des données d'inondation AU-DESSUS
    map.addSource('flood-zones', {
        'type': 'geojson',
        'data': 'https://www.vigicrues.gouv.fr/services/InfoVigiCru.geojson'
    });

    map.addLayer({
        'id': 'flood-zones-line',
        'type': 'line',
        'source': 'flood-zones',
        'layout': { 'visibility': 'visible' },
        'paint': {
            'line-color': '#780000',
            'line-width': 6,
            'line-opacity': 0.85,
            'line-dasharray': [2, 2] // Effet pointillé pour mieux différencier
        }
    }, 'hydrologie'); // 🔥 Ajout au-dessus de "hydrologie"

    // Force l'ordre des couches au cas où
    map.moveLayer('flood-zones-line', 'hydrologie');

    // ✅ 4️⃣ Ajout des bâtiments en 3D
    map.addSource('Batiments', {
        type: 'vector',
        url: 'mapbox://mastersigat.a4h4ovrl'
    });

    map.addLayer({
        'id': 'Batiments',
        'type': 'fill-extrusion',
        'source': 'Batiments',
        'source-layer': 'batiIGN-8zf03o',
        'layout': { 'visibility': 'visible' },
        'paint': {
            'fill-extrusion-color': '#A9A9A9',
            'fill-extrusion-height': ['get', 'HAUTEUR'],
            'fill-extrusion-opacity': 0.9,
            'fill-extrusion-base': 0
        }
    });

});

/// Mise en Forme

// Boutons de navigation 
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

// Bouton de géolocalisation
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}));

// Création d'un conteneur pour la légende et l'échelle
document.addEventListener("DOMContentLoaded", function() {
    var legendContainer = document.createElement('div');
    legendContainer.id = 'legend-container';

    // Légende
    var legend = document.createElement('div');
    legend.id = 'legend';
    legend.innerHTML = ` 
        <div><span style="background-color:#4dd2ff;"></span> Réseau Hydrographique</div>
        <div><span style="background-color:#780000; border: 1px dashed white;"></span> Zones d'Inondation</div>
    `;
    legendContainer.appendChild(legend);

    // Ajout du conteneur à la page
    document.body.appendChild(legendContainer);

    // Ajout de l'échelle de distance à côté de la légende
    var scaleControl = new mapboxgl.ScaleControl({
        maxWidth: 120,
        unit: 'metric'
    });
    map.addControl(scaleControl, 'top-left');

    // Appliquer un ID pour cibler l'échelle en CSS si besoin
    scaleControl._container.id = 'scale-control';
});

// Ajout Marqueur personnalisé (Smiley Château)
const marker1 = new mapboxgl.Marker({
  element: document.createElement('div')
})
.setLngLat([-1.787667, 47.994533])
.setPopup(new mapboxgl.Popup({ offset: 25 })
  .setHTML(`
    <div style="font-family: 'Arial', sans-serif; color: #333; padding: 10px; border-radius: 10px; background: #f7f7f7; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <h2 style="font-size: 18px; color: #444;">Domaine de Massaye</h2>
      <p style="color: #555; font-size: 14px;">Un joli domaine dans la région Bretagne.</p>
      <img src="https://www.bretagne-economique.com/wp-content/uploads/2024/09/Massaye.jpg" style="max-width: 100%; border-radius: 8px; margin-top: 10px;"/>
    </div>
  `))
.addTo(map);

// Personnalisation du marqueur avec un smiley château
const smileyElement = marker1.getElement();
smileyElement.style.background = 'url("https://cdn.iconscout.com/icon/premium/png-256-thumb/castle-emoji-1101701.png") no-repeat center center';
smileyElement.style.backgroundSize = 'contain';
smileyElement.style.width = '40px';
smileyElement.style.height = '40px';
smileyElement.style.borderRadius = '50%'; // Forme ronde pour plus d'esthétique

// Mise en forme supplémentaire : pour la popup
const popup = marker1.getPopup();
popup._container.style.border = '2px solid #0074D9'; // Bordure bleue
popup._container.style.borderRadius = '10px';
popup._container.style.padding = '15px';
popup._container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
popup._container.style.backgroundColor = '#fff'; // Fond blanc
popup._container.style.fontFamily = '"Roboto", sans-serif'; // Police plus moderne
popup._container.style.color = '#333'; // Texte sombre
popup._container.style.maxWidth = '300px'; // Limite la largeur de la popup

// Associer le marqueur et la popup
marker1.setPopup(popup);