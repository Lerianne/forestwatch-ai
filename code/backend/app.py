from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from flask_cors import CORS
import rasterio
import matplotlib.pyplot as plt
import ee
import base64
import requests
from tempfile import NamedTemporaryFile
from utils import preprocess_image

# Load model
model = tf.keras.models.load_model("cnn_deforestation.keras", compile=False)

app = Flask(__name__)
CORS(app)

# Initialize GEE (assumes already authenticated)
ee.Initialize()

@app.route('/fetch-image', methods=['POST'])
def fetch_image():
    data = request.get_json()
    lat = data.get("lat")
    lng = data.get("lng")
    start_date = data.get("start_date")
    end_date = data.get("end_date")

    try:
        point = ee.Geometry.Point([lng, lat])
        region = point.buffer(500).bounds()

        image_collection = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(point)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10))
            .sort("CLOUDY_PIXEL_PERCENTAGE"))

        image = image_collection.first()

        # Check if an image was found
        info = image.getInfo()
        if info is None:
            return jsonify({"error": "No cloud-free image found in this date range and location."}), 404

        # Continue with clipping + band selection
        image = image.select(['B8', 'B4', 'B3', 'B2']).clip(region)


        # Get the download URL
        url = image.getDownloadURL({
            'scale': 10,
            'region': region,
            'format': 'GEO_TIFF'
        })

        # Download image
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": "Image download failed"}), 500

        # Save to temp file
        temp = NamedTemporaryFile(delete=False, suffix=".tif")
        temp.write(response.content)
        temp.close()

        print("Downloaded image saved to:", temp.name)

        # Preprocess image and get original RGB image
        image_tensor, rgb_image = preprocess_image(temp.name)

        # Save RGB image to PNG buffer
        rgb_array = (rgb_image * 255).astype(np.uint8)
        rgb_pil = Image.fromarray(rgb_array)
        rgb_buffer = io.BytesIO()
        rgb_pil.save(rgb_buffer, format="PNG")
        rgb_base64 = base64.b64encode(rgb_buffer.getvalue()).decode("utf-8")
        print("Input to model:", image_tensor.shape, "Range:", np.min(image_tensor), "→", np.max(image_tensor))


        # Run model prediction
        prediction = model.predict(image_tensor)[0]
        threshold = 0.5
        binary_mask = (prediction.squeeze() > threshold).astype(np.uint8) * 255
        mask_pil = Image.fromarray(binary_mask)

        # Convert mask to base64
        mask_buffer = io.BytesIO()
        mask_pil.save(mask_buffer, format="PNG")
        mask_base64 = base64.b64encode(mask_buffer.getvalue()).decode("utf-8")

        return jsonify({
            "rgb_image": rgb_base64,
            "mask_image": mask_base64
        })

    except Exception as e:
        print("Error in image prediction:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
