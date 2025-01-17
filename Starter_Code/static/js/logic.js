// Add the basemap
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
});

// Initialize the map
let map = L.map("map", {
  center: [0, 0], // Centered at latitude 0, longitude 0
  zoom: 2,
  layers: [basemap], // Set basemap as default
});

// Function to determine circle marker style
function styleInfo(feature) {
  return {
    opacity: 1,
    fillOpacity: 0.8,
    fillColor: getColor(feature.geometry.coordinates[2]), // Depth determines color
    color: "#000000",
    radius: getRadius(feature.properties.mag), // Magnitude determines radius
    weight: 0.5,
  };
}

// Function to determine color based on depth
function getColor(depth) {
  if (depth > 50) return "#ff0000";
  if (depth > 30) return "#ff8000";
  if (depth > 10) return "#ffff00";
  return "#00ff00";
}

// Function to determine radius based on magnitude
function getRadius(magnitude) {
  return magnitude > 0 ? magnitude * 4 : 1; // Minimum size for small magnitudes
}

// Fetch and plot earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  let earthquakesLayer = L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>
         <strong>Magnitude:</strong> ${feature.properties.mag}<br>
         <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    },
  });

  // Add earthquake layer to map
  earthquakesLayer.addTo(map);

  // Add layer control
  let overlayMaps = { Earthquakes: earthquakesLayer };

  // Fetch tectonic plate data and add to map
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    let tectonicPlatesLayer = L.geoJson(plate_data, {
      style: {
        color: "#ff6500",
        weight: 2,
      },
    });

    // Add tectonic plates layer to overlay
    tectonicPlatesLayer.addTo(map);
    overlayMaps["Tectonic Plates"] = tectonicPlatesLayer;

    // Add control for layers
    L.control.layers(null, overlayMaps).addTo(map);
  });

  // Add legend to map
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depths = [0, 10, 30, 50];
    const colors = ["#00ff00", "#ffff00", "#ff8000", "#ff0000"];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background: ${colors[i]}"></i> ` +
        `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
    }
    return div;
  };

  legend.addTo(map);
});
