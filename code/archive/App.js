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
  lat: 9.7489, // Example: Costa Rica
  lng: -83.7534,
};

function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDgJEwZxTX6nd1ir2lmRD86fH2g1b9ON98",
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
    console.log("Selected location:", lat, lng);
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

      // const imageUrl = URL.createObjectURL(res.data);
      // setResultImage(imageUrl);
      // setGeeImageURL(res.data.url);
    } catch (error) {
      console.error("Error fetching image from GEE:", error);
      alert("Failed to fetch and predict image.");
    }
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div style={{ padding: "1rem" }}>
      <h1>🛰️ Select a Location & Date for Deforestation Analysis</h1>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={7}
        center={center}
        onClick={handleMapClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>

      <div style={{ marginTop: "1rem" }}>
        <label>Start Date: </label>
        <DatePicker selected={startDate} onChange={setStartDate} />
        <br />
        <label>End Date: </label>
        <DatePicker selected={endDate} onChange={setEndDate} />
      </div>

      <button
        style={{ marginTop: "1rem", padding: "10px 20px" }}
        onClick={handleSubmit}
      >
        Fetch Image & Predict
      </button>

      {geeImageURL && (
        <div style={{ marginTop: "2rem" }}>
          <h2>🌍 Sentinel-2 Image</h2>
          <img src={geeImageURL} alt="GEE image" style={{ maxWidth: "400px" }} />
        </div>
      )}

      {resultImage && (
        <div style={{ marginTop: "2rem" }}>
          <h3>🧠 Predicted Deforestation Mask:</h3>
          <img
            src={resultImage}
            alt="Deforestation Prediction"
            style={{ maxWidth: "100%", border: "2px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
