// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/Toy92tVlh/";

let model, webcam, labelContainer, maxPredictions;
let running = false;
let loopId = null;
let scanBtn;
let liveFeedId = null;

// Add event listeners for Start/Stop buttons after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    scanBtn = document.getElementById('scan-btn');
    startBtn.addEventListener('click', startWebcam);
    stopBtn.addEventListener('click', stopWebcam);
    scanBtn.addEventListener('click', scanPlastic);
});

async function startWebcam() {
    if (running) return;
    running = true;
    document.getElementById('start-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
    scanBtn.disabled = false;
    await init();
    startLiveFeed();
}

function startLiveFeed() {
    function updateFrame() {
        if (!running || !webcam) return;
        webcam.update();
        liveFeedId = requestAnimationFrame(updateFrame);
    }
    updateFrame();
}

async function stopWebcam() {
    if (!running) return;
    running = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
    scanBtn.disabled = true;
    if (liveFeedId) {
        cancelAnimationFrame(liveFeedId);
        liveFeedId = null;
    }
    if (webcam) {
        await webcam.stop();
        if (webcam.canvas && webcam.canvas.parentNode) {
            webcam.canvas.parentNode.removeChild(webcam.canvas);
        }
    }
    // Clear results
    if (labelContainer) {
        labelContainer.innerHTML = '';
    }
}

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    try {
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        webcam.update(); // Show the current frame on canvas

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = '';
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            const div = document.createElement("div");
            div.className = "text-lg font-mono px-4 py-2 rounded w-full text-center bg-gray-50 border";
            labelContainer.appendChild(div);
        }
    } catch (err) {
        alert("Could not access webcam: " + err.message);
        console.error("Webcam setup/play error:", err);
        running = false;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        scanBtn.disabled = true;
    }
}

// Remove loop and live prediction logic

async function scanPlastic() {
    if (!running || !webcam || !model) return;
    // webcam.update(); // Not needed, live feed is running
    await predict();
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const percent = (prediction[i].probability * 100).toFixed(1) + '%';
        const classPrediction = `<span class="font-bold">${prediction[i].className}:</span> <span class="text-blue-600">${percent}</span>`;
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
