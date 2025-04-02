import React, { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "500px",
};
const center = {
  lat: 9.7489,
  lng: -83.7534,
};

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAPS_KEY,
    libraries,
  });

  const [marker, setMarker] = useState(null);
  const [startDate, setStartDate] = useState(new Date("2023-01-01"));
  const [endDate, setEndDate] = useState(new Date("2023-12-31"));
  const [geeImageURL, setGeeImageURL] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
  };

  const handleSubmit = async () => {
    if (!marker) {
      alert("Please select a location on the map.");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/fetch-image", {
        lat: marker.lat,
        lng: marker.lng,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });

      const { rgb_image, mask_image } = res.data;
      setGeeImageURL(`data:image/png;base64,${rgb_image}`);
      setResultImage(`data:image/png;base64,${mask_image}`);
    } catch (error) {
      console.error("Error fetching image from GEE:", error);
      alert("Failed to fetch and predict image.");
    }
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div style={{ padding: "0", backgroundColor: "#133C12", minHeight: "100vh", color: "white" }}>
      <nav style={{ backgroundColor: "black", padding: "1rem", position: "sticky", top: 0, zIndex: 1000 }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Deforestation Analysis Tool</h1>
      </nav>

      <div style={{ padding: "1rem" }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={7}
          center={center}
          onClick={handleMapClick}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>

        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label>Start Date:</label>
          <DatePicker selected={startDate} onChange={setStartDate} />
          <label>End Date:</label>
          <DatePicker selected={endDate} onChange={setEndDate} />

          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "5px",
              transition: "transform 0.2s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={handleSubmit}
          >
            Fetch Image & Predict
          </button>
        </div>

        {geeImageURL && resultImage && (
          <div style={{ marginTop: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem" }}>Sentinel-2 Image</h2>
              <img src={geeImageURL} alt="Sentinel-2" style={{ maxWidth: "400px", borderRadius: "8px" }} />
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem" }}>Deforestation Prediction</h2>
              <img
                src={resultImage}
                alt="Deforestation"
                style={{ maxWidth: "400px", border: "2px solid #ccc", borderRadius: "8px" }}
              />
            </div>
          </div>
        )}
      </div>
      <footer style={{ backgroundColor: "black", color: "white", textAlign: "center", padding: "0.5rem", fontSize: "0.9rem" }}>
        Built by Léanne Ricard
      </footer>
    </div>
  );
}

export default App;
