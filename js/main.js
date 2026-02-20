mapboxgl.accessToken = "pk.eyJ1IjoieWVhYjEiLCJhIjoiY21sdTJ6bHZwMDZ6aDNmcTI4YnJicjRqcCJ9.g17-uYOvAut4uxJ71G43Kg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [-122.3032, 47.6555],
  zoom: 12
});

const scroller = scrollama();

async function loadGeoJSON(path) {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to load ${path}`);
  return await resp.json();
}

function setBuildingsVisibility(isVisible) {
  const v = isVisible ? "visible" : "none";
  if (map.getLayer("uwbuildings-fill")) map.setLayoutProperty("uwbuildings-fill", "visibility", v);
  if (map.getLayer("uwbuildings-outline")) map.setLayoutProperty("uwbuildings-outline", "visibility", v);
}

async function main() {
  // Load your local data files
  const stops = await loadGeoJSON("data/stops.geojson");
  const uwBuildings = await loadGeoJSON("data/uw_buildings.geojson");

  map.on("load", () => {
    // -----------------------
    // 1) ADD SOURCES
    // -----------------------
    map.addSource("stops-src", { type: "geojson", data: stops });
    map.addSource("uwbuildings-src", { type: "geojson", data: uwBuildings });

    // -----------------------
    // 2) ADD LAYERS
    // -----------------------

    // UW buildings layers (initially hidden; shown only on Scene 1 & 2)
    map.addLayer({
      id: "uwbuildings-fill",
      type: "fill",
      source: "uwbuildings-src",
      layout: { visibility: "none" },
      paint: {
        "fill-opacity": 0.25
      }
    });

    map.addLayer({
      id: "uwbuildings-outline",
      type: "line",
      source: "uwbuildings-src",
      layout: { visibility: "none" },
      paint: {
        "line-width": 1
      }
    });

    // Stops (always visible)
    map.addLayer({
      id: "stops-circle",
      type: "circle",
      source: "stops-src",
      paint: {
        "circle-radius": 7
      }
    });

    map.addLayer({
      id: "stops-label",
      type: "symbol",
      source: "stops-src",
      layout: {
        "text-field": ["get", "label"],
        "text-size": 12,
        "text-offset": [0, 1.2],
        "text-anchor": "top"
      }
    });

    // -----------------------
    // 3) SCROLLAMA SETUP
    // -----------------------
    scroller
      .setup({
        step: ".scene",
        offset: 0.33,
        debug: false
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);

    window.addEventListener("resize", scroller.resize);
  });
}

function handleStepEnter(response) {
  const i = response.index;

  // Scene 0: Home / Commute (Lynnwood area)
  if (i === 0) {
    document.getElementById("cover").style.visibility = "hidden";
    setBuildingsVisibility(false);

    map.flyTo({
      center: [-122.2509, 47.8490],
      zoom: 12,
      speed: 0.6,
      pitch: 0
    });
  }

  // Scene 1: Campus
  if (i === 1) {
    setBuildingsVisibility(true);

    map.flyTo({
      center: [-122.3032, 47.655548],
      zoom: 15,
      speed: 0.6,
      pitch: 35
    });
  }

  // Scene 2: Study Zone (Odegaard)
  if (i === 2) {
    setBuildingsVisibility(true);

    map.flyTo({
      center: [-122.3103636, 47.6564806],
      zoom: 16,
      speed: 0.6,
      pitch: 45
    });
  }

  // Scene 3: Wrap-up (UW overview)
  if (i === 3) {
    setBuildingsVisibility(false);

    map.flyTo({
      center: [-122.305, 47.656],
      zoom: 13,
      speed: 0.6,
      pitch: 0
    });
  }
}

function handleStepExit(response) {
  const i = response.index;

  // When leaving Scene 0:
  if (i === 0) {
    if (response.direction === "down") {
      document.getElementById("cover").style.visibility = "hidden";
    } else {
      document.getElementById("cover").style.visibility = "visible";
    }
  }
}

main().catch(err => console.error(err));
