import numpy as np
import rasterio
import cv2

def preprocess_image(image_path, target_size=(256, 256)):
    """Load and normalize a Sentinel-2 image. 
    Returns:
      - batched 4-band image (NIR + RGB) for the model
      - 3-band RGB image for visualization
    """

    with rasterio.open(image_path) as img_dataset:
        image = img_dataset.read()

        if image.shape[0] < 4:
            raise ValueError(f"Expected at least 4 bands, got {image.shape[0]}")

        # Extract bands for model: B8 (NIR), B4 (Red), B3 (Green), B2 (Blue)
        model_input = np.stack([image[0], image[1], image[2], image[3]], axis=-1)

        # Extract RGB for visualization: B4, B3, B2 → Red, Green, Blue
        rgb_only = np.stack([image[1], image[2], image[3]], axis=-1)

    # Resize both
    model_input = cv2.resize(model_input, target_size)
    rgb_only = cv2.resize(rgb_only, target_size)

    # Normalize model input
    model_min, model_max = np.min(model_input), np.max(model_input)
    if (model_max - model_min) < 1e-6:
        raise ValueError("Image normalization failed: flat model input image")

    model_input = (model_input - model_min) / (model_max - model_min + 1e-8)
    batched_model_input = np.expand_dims(model_input, axis=0)

    # Normalize RGB for display
    rgb_min, rgb_max = np.min(rgb_only), np.max(rgb_only)
    rgb_only = (rgb_only - rgb_min) / (rgb_max - rgb_min + 1e-8)

    return batched_model_input, rgb_only

