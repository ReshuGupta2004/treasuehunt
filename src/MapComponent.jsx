// pk.eyJ1IjoiaXRzc2JvaWkiLCJhIjoiY20wdjBzOXEwMTZoaDJqc2JhaDU2N3hrYyJ9.Sy00wAH4JQuxQe250sjlGQ
import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import lol from "./assets/lol.png";
import dummyIcon from "./assets/pngwing.com.png"

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiaXRzc2JvaWkiLCJhIjoiY20wdjBzOXEwMTZoaDJqc2JhaDU2N3hrYyJ9.Sy00wAH4JQuxQe250sjlGQ"; // Replace with your token

const iitKgpBoundary = [
  // Define the boundary coordinates of IIT KGP (polygon coordinates)
  [87.2912, 22.3306],
  [87.3029, 22.3223],
  [87.3147, 22.3187],
  [87.3173, 22.3202],
  [87.3097, 22.3385],
  [87.2962, 22.3388],
  [87.2912, 22.3306],
];

const locations = [
  
  {
    id: 1,
    name: "Gym 1",
    coordinates: [87.302583, 22.320714],
    riddle: "I am in JCB HALL.",
  },
  {
    id: 2,
    name: "Gym 2",
    coordinates: [87.302612, 22.320688],
    riddle: "I am in HJB HALL.",
  },
  {
    id: 3,
    name: "Gym 3",
    coordinates: [87.3046356, 22.3200155],
    riddle: "I am in VS HALL.",
  },
  {
    id: 4,
    name: "Gym 4",
    coordinates: [87.3062231242479, 22.32220416075874],
    riddle: "I am in RK HALL.",
  },
  {
    id: 5,
    name: "Gym 5",
    coordinates: [87.30784765558387, 22.321816046076076],
    riddle: "I am in RP HALL.",
  },
  {
    id: 6,
    name: "Gym 6",
    coordinates: [87.2997781702829, 22.31492457533713],
    riddle: "I am in TECH MARKET HALL.",
  },
  {
    id: 7,
    name: "Gym 7",
    coordinates: [87.30266075883311, 22.31868935537711],
    riddle: "I am in GYMKHANA.",
  },
  {
    id: 8,
    name: "Gym 8",
    coordinates: [87.30984452042071, 22.319681389431057],
    riddle: "I am in MAIN BUILDING HALL.",
  },
  {
    id: 9,
    name: "Gym 9",
    coordinates: [87.307127441973, 22.31710497628903],
    riddle: "I am in CLOCK TOWER HALL.",
  },
  {
    id: 10,
    name: "Gym 10",
    coordinates: [87.29837591768798, 22.32127181668998],
    riddle: "I am in LLR HALL.",
  },

  // Add more gyms with riddles...
];

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeRiddle, setActiveRiddle] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        const location = [longitude, latitude];
        setUserLocation(location);
      }, (error) => {
        console.error("Error getting user location:", error);
        alert("Unable to retrieve your location.");
      }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation,
        zoom: 16,
        pitch: 60,
        bearing: 40,
      });

      mapInstance.on("load", () => {
        mapInstance.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
            "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
            "fill-extrusion-opacity": 0.6,
          },
        });

        locations.forEach((location) => {
          const markerEl = document.createElement("div");
          markerEl.className = "marker";
          markerEl.style.width = "50px";
          markerEl.style.height = "50px";
          markerEl.style.backgroundImage = `url(${lol})`;
          markerEl.style.backgroundSize = "contain";
          markerEl.style.backgroundRepeat = "no-repeat";
          markerEl.style.backgroundPosition = "center";

          markerEl.addEventListener("click", () => {
            const gymLocation = turf.point(location.coordinates);
            const userPoint = turf.point(userLocation);
            const distance = turf.distance(userPoint, gymLocation, { units: "meters" });

            if (distance <= 200) {
              setActiveRiddle(location);
            } else {
              alert("You are too far from the gym! Get closer to access it.");
            }
          });

          new mapboxgl.Marker(markerEl)
            .setLngLat(location.coordinates)
            .addTo(mapInstance);
        });

        mapInstance.addSource("iitKgpBoundary", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [iitKgpBoundary],
            },
          },
        });

        mapInstance.addLayer({
          id: "iitKgpBoundaryLayer",
          type: "fill",
          source: "iitKgpBoundary",
          layout: {},
          paint: {
            "fill-color": "#088",
            "fill-opacity": 0.3,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        iitKgpBoundary.forEach((coord) => bounds.extend(coord));
        mapInstance.fitBounds(bounds, { padding: 20 });
      });

      setMap(mapInstance);
    }
  }, [userLocation]);

  useEffect(() => {
    if (map && userLocation) {
      // Move the dummy character with the user's location
      const dummyEl = document.createElement("div");
      dummyEl.className = "dummy-character";
      dummyEl.style.width = "50px";
      dummyEl.style.height = "50px";
      dummyEl.style.backgroundImage = `url(${dummyIcon})`;
      dummyEl.style.backgroundSize = "contain";
      dummyEl.style.backgroundRepeat = "no-repeat";
      dummyEl.style.backgroundPosition = "center";

      const dummyMarker = new mapboxgl.Marker(dummyEl)
        .setLngLat(userLocation)
        .addTo(map);

      // Update the dummy marker position when the user's location changes
      map.once("move", () => {
        dummyMarker.setLngLat(userLocation);
      });

      map.flyTo({
        center: userLocation,
        zoom: 16,
        pitch: 60,
        bearing: 40,
        essential: true,
      });
    }
  }, [map, userLocation]);

  const zoomToLocation = () => {
    if (map && userLocation) {
      map.flyTo({
        center: userLocation,
        zoom: 19,
        pitch: 75,
        bearing: 0,
        essential: true,
      });
    }
  };

  const closeRiddle = () => {
    setActiveRiddle(null);
  };

  return (
    <div>
      <button
        onClick={zoomToLocation}
        style={{
          position: "absolute",
          zIndex: 1,
          top: "10px",
          right: "10px",
          padding: "10px",
          backgroundColor: "blue",
          color: "white",
          borderRadius: "5px",
        }}
      >
        My Location
      </button>

      <div
        id="map"
        style={{
          width: "100%",
          height: "500px",
        }}
      ></div>

      {activeRiddle && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 2,
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2>{activeRiddle.name}</h2>
          <p>{activeRiddle.riddle}</p>
          <button
            onClick={closeRiddle}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "5px",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;