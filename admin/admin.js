// Placeholder API endpoints
const usersAPI = "https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/getallusers";
const pickupsAPI = "https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/getallpickups";

async function loadAdminStats() {
  try {
    // Fetch all users and pickups (adjust method and headers as needed)
    const usersRes = await fetch(usersAPI, { method: "GET" });
    const pickupsRes = await fetch(pickupsAPI, { method: "GET" });

    const usersData = await usersRes.json();
    const pickupsData = await pickupsRes.json();

    // If API returns { data: [...] }, extract .data, else use as is
    const users = Array.isArray(usersData) ? usersData : usersData.data || [];
    const pickups = Array.isArray(pickupsData) ? pickupsData : pickupsData.data || [];

    // Only count pickups with a valid pickupid
    const validPickups = pickups.filter(p => p.pickupid || p.pickupId || p.id);

    // Total counts
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalPickups").textContent = validPickups.length;

    // Count by status (only for valid pickups)
    const pending = validPickups.filter(p => p.status === "Pending").length;
    const inTransit = validPickups.filter(p => p.status === "In Transit").length;
    const collected = validPickups.filter(p => p.status === "Collected").length;

    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("inTransitCount").textContent = inTransit;
    document.getElementById("collectedCount").textContent = collected;

  } catch (error) {
    console.error("Error loading admin stats:", error);
    alert("Failed to load dashboard data.");
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "../login/login.html";
}

document.addEventListener("DOMContentLoaded", loadAdminStats);
