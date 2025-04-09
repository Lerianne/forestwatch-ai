# 🌳 ForestWatch-AI

**ForestWatch-AI** is a full-stack web application that lets users analyze deforestation in any region using satellite imagery from Google Earth Engine and a custom-trained convolutional neural network.

The app fetches Sentinel-2 satellite images for a selected location and timeframe, processes them, and returns a segmentation mask predicting areas of deforestation.

---

## 🛰️ What It Does

- Lets users select a location on an interactive Google Map  
- Allows users to choose a timeframe for analysis  
- Fetches the corresponding satellite image using Google Earth Engine (GEE)  
- Feeds the image to a trained CNN model  
- Displays the GEE image next to the predicted deforestation mask  

---

## 🧠 How the Model Works

The backend uses a lightweight custom CNN model trained on 4-band Sentinel-2 images (NIR + RGB). The model performs binary segmentation to highlight deforested areas. It was trained to generalize well across unseen regions and shows strong precision, recall, and F1 score performance on a held-out test set.

---

## 📁 Project Structure

```
forestwatch-ai/
│
├── code/
│   ├── backend/
│   │   ├── app.py                # Flask backend API
│   │   ├── utils.py              # Helper functions
│   │   ├── temp_image.png        # Temporary image file
│   │   └── cnn_deforestation.keras  # Saved model weights
│   │
│   └── frontend/
│       ├── src/                  # React source code
│       ├── public/               # Static assets
│       ├── .env                  # Stores the Google Maps API key
│       ├── package.json          # Frontend dependencies and scripts
│       └── node_modules/         # Installed modules (auto-generated)
│
├── model/                        # Model training, evaluation, training dataset and experimentation
│
├── requirements.txt              # Python dependencies for backend + training
├── README.md                     # Project overview and setup instructions
├── .gitignore                    # Files and folders to ignore in version control
│
├── Final Results.pdf             # Report - final iteration
├── Preliminary Results.pdf       # Report - earlier iteration
└── Project Proposal.pdf          # Initial proposal document
```

## 🛠️ How to Build the Project

### 1. Clone the Repository

Clone the project and navigate into the folder:
```bash
git clone https://github.com/Lerianne/forestwatch-ai.git
cd forestwatch-ai
```

### 2. Earth Engine Authentication

From the terminal, run the following command to be allowed access to the GEE API:
```bash
earthengine authenticate --auth_mode=notebook
```
A browser tab will open. Log in with your Google account and copy-paste the token back into the terminal.

### 3. Install Backend Requirements

Make sure your virtual environment is activated, then:
```bash
pip install -r requirements.txt
```

### 4. Backend Setup (Flask API)

Run the Flask backend:
```bash
cd code/backend
python app.py
```

### 5. Frontend Setup (React App)

In a new terminal window, navigate to the frontend folder and start the React development server:
```bash
cd code/frontend
npm install
npm start
```
This will launch the app on http://localhost:3000.


### 6. Set Up Your Google Maps API Key

To use the map feature, you must provide a Google Maps API key.

- Visit Google Cloud Console
- Create a new project or use an existing one
- Enable Maps JavaScript API
- Generate an API key under Credentials

Then, create a .env file inside the code/frontend directory:
```bash
REACT_APP_MAPS_KEY=your_google_maps_api_key
```

## 👩‍💻 Author

Léanne Ricard — Forest preservation meets AI.