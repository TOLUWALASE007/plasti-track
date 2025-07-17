
♻️ PlastiTrack: Recyclable Plastic Waste Logistics Platform 

PlastiTrack is a web-based logistics application that simplifies plastic waste recycling. It allows users to schedule pickups, collectors to manage collections, and admins to oversee operations. The system includes an integrated AI feature to detect plastic materials and promotes sustainable waste handling practices.

---

 🚀 Features

- 👤 User Role 
  - Register and log in
  - Schedule plastic waste pickups
  - Access the plastic detector tool

- 🚛 Collector Role 
  - View and manage assigned pickup requests
  - Update pickup status: Pending → In Transit → Collected

- 🛠️ Admin Role 
  - Monitor all pickups
  - View dashboard analytics
  - Access AI detection tool

- 🤖 AI Plastic Detector 
  - Real-time detection of plastic vs. non-plastic materials using your webcam
  - Powered by TensorFlow.js + Teachable Machine

---

🛠️ Tech Stack 

- Frontend: HTML, CSS(Tailwind), JavaScript 
- Backend: MantaHQ (no-code API platform) 
- AI Integration: Teachable Machine (TensorFlow.js) 
- Database: MantaHQ Tables 

---



📦 Setup & Usage 

1. Clone the Repository   
   bash 
   git clone https://github.com/yourusername/plastitrack.git
   cd plastitrack
 

2. Open index.html in your browser to start the app. 

3. To use the AI feature: 

   * Go to scan.html 
   * Allow webcam access
   * Point plastic items at the camera

---

🧠 AI Feature Details

* Trained using [Teachable Machine](https://teachablemachine.withgoogle.com/)
* Two classes: `Plastic`, `Not Plastic`
* Runs entirely in the browser using TensorFlow\.js

---

📌 Current Limitations

* Pickup status updates must be synced manually via the backend
* AI model accuracy depends on lighting and camera quality
* Admin dashboard is minimal—future versions will include charts and real-time stats

---

📈 Planned Features

* 📊 Advanced analytics and reporting for admins
* 📍 Geo-mapping pickup locations (Google Maps integration)
* 📦 Collector reassignment and tracking
* 🌐 User dashboard for pickup history

---

🤝 Contributing

We welcome contributions!

1. Fork this repo
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to your fork: `git push origin feature-name`
5. Submit a pull request

---



 
