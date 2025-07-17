const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const result = document.getElementById('result');
const captureBtn = document.getElementById('captureBtn');
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const debugWebcam = document.getElementById('debugWebcam');
const debugModel = document.getElementById('debugModel');
const debugScan = document.getElementById('debugScan');

let stream = null;
let model = null;
let maxPredictions = 0;
let modelLoaded = false;

function updateDebugPanel() {
  debugWebcam.textContent = stream ? 'ON' : 'OFF';
  debugModel.textContent = modelLoaded ? 'LOADED' : 'NOT LOADED';
  debugScan.textContent = !captureBtn.disabled ? 'ENABLED' : 'DISABLED';
}

// Update debug panel on page load
updateDebugPanel();

// Start the webcam
async function startWebcam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 320, 
        height: 240,
        facingMode: 'environment' // Use back camera if available
      } 
    });
    video.srcObject = stream;
    video.classList.remove('hidden');
    stopCameraBtn.classList.remove('hidden');
    startCameraBtn.classList.add('hidden');
    result.textContent = '';
    canvas.classList.add('hidden');
    if (modelLoaded) {
      captureBtn.disabled = false;
    }
    updateDebugPanel();
    console.log("Webcam started!");
  } catch (error) {
    console.error("Error accessing webcam:", error);
    alert("⚠️ Camera access denied or not available.");
    updateDebugPanel();
  }
}

// Stop the webcam
function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.srcObject = null;
  video.classList.add('hidden');
  stopCameraBtn.classList.add('hidden');
  startCameraBtn.classList.remove('hidden');
  captureBtn.disabled = true;
  canvas.classList.add('hidden');
  result.textContent = '';
  updateDebugPanel();
  console.log("Webcam stopped!");
}

// Load Teachable Machine model
async function loadModel() {
  const modelURL = "teachablemachine/model.json";
  const metadataURL = "teachablemachine/metadata.json";
  try {
    console.log("[AI] Starting to load model...");
    result.textContent = "Loading AI model...";
    captureBtn.disabled = true;
    updateDebugPanel();
    console.log("[AI] Loading model from:", modelURL);
    console.log("[AI] Loading metadata from:", metadataURL);
    model = await tmImage.load(modelURL, metadataURL);
    console.log("[AI] Model loaded:", model);
    maxPredictions = model.getTotalClasses();
    modelLoaded = true;
    result.textContent = "AI model loaded!";
    // Only enable scan if webcam is running
    if (stream) {
      captureBtn.disabled = false;
    }
    updateDebugPanel();
    console.log("[AI] Teachable Machine model loaded! maxPredictions:", maxPredictions);
  } catch (err) {
    result.textContent = "⚠️ Could not load AI model.";
    captureBtn.disabled = true;
    updateDebugPanel();
    alert("⚠️ Could not load AI model. Please check your connection and try again.");
    console.error("[AI] Error loading AI model:", err);
  }
}

// Predict using Teachable Machine
async function predictWithAI() {
  if (!modelLoaded) {
    result.textContent = "AI model not loaded yet. Please wait...";
    result.className = "text-xl font-semibold text-yellow-600";
    return;
  }
  if (!model) {
    result.textContent = "AI model not loaded.";
    result.className = "text-xl font-semibold text-red-600";
    return;
  }
  // Draw current video frame to canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // Run prediction
  const prediction = await model.predict(canvas);
  // Find the highest probability
  let best = { className: '', probability: 0 };
  for (let i = 0; i < prediction.length; i++) {
    if (prediction[i].probability > best.probability) {
      best = prediction[i];
    }
  }
  // Show result
  if (best.className.toLowerCase() === 'plastic') {
    result.textContent = `✅ PLASTIC (${(best.probability * 100).toFixed(1)}% confidence)`;
    result.className = "text-xl font-semibold text-green-600";
  } else if (best.className.toLowerCase() === 'non-plastic') {
    result.textContent = `❌ NON-PLASTIC (${(best.probability * 100).toFixed(1)}% confidence)`;
    result.className = "text-xl font-semibold text-red-600";
  } else {
    result.textContent = `⚠️ Unknown (${(best.probability * 100).toFixed(1)}% confidence)`;
    result.className = "text-xl font-semibold text-yellow-600";
  }
}

// Capture and analyze image
captureBtn.addEventListener('click', async () => {
  if (!stream) return;
  if (!modelLoaded) {
    result.textContent = "AI model not loaded yet. Please wait...";
    result.className = "text-xl font-semibold text-yellow-600";
    updateDebugPanel();
    return;
  }
  canvas.classList.remove("hidden");
  await predictWithAI();
  updateDebugPanel();
});

startCameraBtn.addEventListener('click', startWebcam);
stopCameraBtn.addEventListener('click', stopWebcam);

// Load the model on page load
function waitForTmImageAndLoadModel() {
  if (typeof tmImage !== 'undefined') {
    loadModel();
  } else {
    setTimeout(waitForTmImageAndLoadModel, 100);
  }
}

window.addEventListener('DOMContentLoaded', waitForTmImageAndLoadModel);

// Add some helpful tips
console.log("🧠 Plastic Detector Tips:");
console.log("- Point camera at clear, well-lit objects");
console.log("- Avoid shadows and reflections");
console.log("- For best results, use natural lighting");
