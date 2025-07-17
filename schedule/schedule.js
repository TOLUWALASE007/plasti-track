// Get user
const userName = localStorage.getItem("userName") || "User";
document.getElementById("userName").textContent = userName;

// Initialize pickups as an empty array to avoid ReferenceError
let pickups = [];

// Handle form submission to backend
const form = document.getElementById("pickupForm");
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const weight = parseFloat(document.getElementById("weight").value);
  const date = document.getElementById("date").value;
  const note = document.getElementById("note") ? document.getElementById("note").value : "";
  const status = "Pending";

  // Validate required fields
  if (!address || !contact || !date || isNaN(weight) || !status) {
    alert("❌ Please fill in all required fields correctly.");
    return;
  }

  // Get email from login (localStorage or sessionStorage)
  const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail") || "";
  if (!email) {
    alert("❌ You must be logged in to schedule a pickup (email required). Please log in again.");
    return;
  }

  // Generate a unique pickupId (timestamp + random number for uniqueness)
  const pickupId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();

  const pickup = {
    pickupId: pickupId,
    email: email.toString(), // required by backend
    address: address.toString(),
    contact: parseInt(contact, 10), // send as integer
    weight, // already a number
    date: date.toString(),
    note: note.toString(),
    status: status.toString()
  };
  console.log("Sending pickup payload:", pickup);
  try {
    const response = await fetch("https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/schedulepickup2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pickup)
    });
    const result = await response.json();
    console.log("Schedule pickup response:", result);
    
    // Store pickupId in localStorage after scheduling
    if (response.ok) {
      // Save pickupId to localStorage array
      let userPickupIds = JSON.parse(localStorage.getItem("userPickupIds") || "[]");
      userPickupIds.push(pickupId);
      localStorage.setItem("userPickupIds", JSON.stringify(userPickupIds));
      console.log("Saved pickupId to localStorage:", pickupId);
      console.log("Updated userPickupIds:", userPickupIds);
      
      alert("✅ Pickup scheduled successfully!");
      form.reset();
      
      // Wait a moment then refresh pickups
      setTimeout(() => {
      fetchUserPickups(); // Refresh pickups after scheduling
      }, 500);
    } else {
      alert("❌ Failed to schedule pickup.");
      console.error("Schedule pickup error:", result);
    }
  } catch (err) {
    alert("⚠️ Something went wrong.");
    console.error(err);
  }
});

// Fetch and display user's pickups from backend
async function fetchUserPickups() {
  // Get user email for fetching pickups
  const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail") || "";
  if (!email) {
    console.log("No user email found, clearing pickups");
    pickups = [];
    renderPickups();
    updateStats();
    return;
  }

  try {
    // Use the new API endpoint to fetch all pickups for the user by email
    console.log(`Fetching pickups for email: ${email}`);
    const response = await fetch(`https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/getuserpickups4/${encodeURIComponent(email)}`);
    
    console.log("Response status:", response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log("API response:", result);
      
      // Handle the response structure
      if (result.data && Array.isArray(result.data)) {
        pickups = result.data;
        console.log("Successfully fetched pickups:", pickups);
      } else if (result.data && !Array.isArray(result.data)) {
        // If data is not an array, wrap it in an array
        pickups = [result.data];
        console.log("Single pickup wrapped in array:", pickups);
      } else {
        pickups = [];
        console.log("No pickups found in response");
      }
    } else {
      console.error(`Failed to fetch pickups: HTTP ${response.status}`);
      pickups = [];
      }
    } catch (err) {
    console.error("Error fetching user pickups:", err);
    pickups = [];
  }

  // Sort pickups by date (newest first)
  pickups.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log("Final sorted pickups array:", pickups);
  
  renderPickups();
  updateStats();
}

// Render pickup history
function renderPickups() {
  const table = document.getElementById("pickupTable");
  // Only render pickup rows, not the header
  // Remove all rows except the header
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  if (!pickups || pickups.length === 0) {
    // Show "no pickups" message
    const row = table.insertRow(-1);
    row.innerHTML = `
      <td colspan="5" class="p-4 text-center text-gray-500 border">
        📭 No pickup history found. Schedule your first pickup above!
      </td>
    `;
    return;
  }

  pickups.forEach((p, index) => {
    console.log(`Rendering pickup ${index}:`, p);
    console.log(`Pickup ${index} available fields:`, Object.keys(p));
    console.log(`Pickup ${index} ID fields:`, {
      pickupId: p.pickupId,
      id: p.id,
      _id: p._id
    });
    console.log(`Pickup ${index} full object:`, JSON.stringify(p, null, 2));
    
    // Check for common ID field names
    const possibleIdFields = ['pickupId', 'id', '_id', 'pickup_id', 'pickupid', 'pickupId', 'ID', 'Id'];
    let foundId = null;
    for (const field of possibleIdFields) {
      if (p[field] !== undefined) {
        foundId = p[field];
        console.log(`Found ID field: ${field} = ${foundId}`);
        break;
      }
    }
    if (!foundId) {
      console.log(`No ID field found for pickup ${index}. Available fields:`, Object.keys(p));
    }
    
    const badgeColor = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "In Transit": "bg-blue-100 text-blue-800",
      "Collected": "bg-green-100 text-green-800",
      "Missed": "bg-red-100 text-red-800"
    }[p.status] || "bg-gray-100 text-gray-800";

    // Format date for better display - handle different date formats
    let formattedDate = "N/A";
    if (p.date) {
      try {
        formattedDate = new Date(p.date).toLocaleDateString();
      } catch (dateErr) {
        console.error("Date parsing error:", dateErr, "for date:", p.date);
        formattedDate = p.date; // Use raw date string if parsing fails
      }
    }
    
    // Handle weight - ensure it's a number
    let weight = 0;
    if (p.weight !== undefined && p.weight !== null) {
      weight = parseFloat(p.weight) || 0;
    }

    const row = table.insertRow(-1);
    row.innerHTML = `
      <td class="p-2 border">${formattedDate}</td>
      <td class="p-2 border">${p.address || p.pickupAddress || "-"}</td>
      <td class="p-2 border">${weight} kg</td>
      <td class="p-2 border">
        <span class="px-2 py-1 rounded ${badgeColor} text-xs font-semibold">${p.status || "Unknown"}</span>
      </td>
      <td class="p-2 border text-center">
        <button onclick="deletePickup('${p.pickupId || p.id || p._id || p.email + '_' + p.date + '_' + p.address.replace(/\s+/g, '_') || ''}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs border-0">
          🗑️ Cancel
        </button>
      </td>
    `;
  });
}

// Update stats panel
function updateStats() {
  let totalKg = 0;
  pickups.forEach(p => {
    if (p.status === "Collected") totalKg += p.weight;
  });
  document.getElementById("totalKg").textContent = `${totalKg} kg`;
  document.getElementById("totalEarnings").textContent = `₦${totalKg * 50}`; // ₦50 per kg
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "../login/login.html";
}

// Debug function to check localStorage and current state
function debugPickupState() {
  console.log("=== DEBUG PICKUP STATE ===");
  console.log("User email:", localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail"));
  console.log("User pickup IDs:", JSON.parse(localStorage.getItem("userPickupIds") || "[]"));
  console.log("Current pickups array:", pickups);
  console.log("==========================");
}

// Test function to manually fetch a specific pickup
async function testFetchPickup(pickupId) {
  console.log(`Testing fetch for pickup ID: ${pickupId}`);
  try {
    const response = await fetch(`https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/getuserpickups3/${pickupId}`);
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    const result = await response.json();
    console.log("Raw API response:", result);
    
    // Try different ways to extract the data
    console.log("result.data:", result.data);
    console.log("result.pickup:", result.pickup);
    console.log("result itself:", result);
    
    return result;
  } catch (err) {
    console.error("Test fetch error:", err);
    return null;
  }
}

// Function to clean up duplicate pickupIds from localStorage
function cleanupDuplicatePickupIds() {
  let userPickupIds = JSON.parse(localStorage.getItem("userPickupIds") || "[]");
  const originalLength = userPickupIds.length;
  
  // Remove duplicates
  userPickupIds = [...new Set(userPickupIds)];
  
  if (userPickupIds.length !== originalLength) {
    localStorage.setItem("userPickupIds", JSON.stringify(userPickupIds));
    console.log(`Cleaned up ${originalLength - userPickupIds.length} duplicate pickup IDs`);
  }
  
  return userPickupIds;
}

// Delete pickup function
async function deletePickup(pickupId) {
  console.log("Delete pickup called with pickupId:", pickupId);
  console.log("Type of pickupId:", typeof pickupId);
  
  if (!pickupId || pickupId === 'undefined' || pickupId === '') {
    alert("❌ Cannot delete pickup: Invalid pickup ID");
    return;
  }
  
  if (!confirm("Are you sure you want to cancel this pickup?")) {
    return;
  }

  // Get user email
  const email = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail") || "";
  if (!email) {
    alert("❌ Cannot delete pickup: User email not found");
    return;
  }

  try {
    console.log(`Deleting pickup with ID: ${pickupId} for email: ${email}`);
    const response = await fetch(`https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/deletepickup4/${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pickupId: pickupId })
    });

    if (response.ok) {
      console.log("Pickup deleted successfully");
      alert("✅ Pickup cancelled successfully!");
      // Refresh the pickup list
      fetchUserPickups();
    } else {
      const result = await response.json();
      console.error("Failed to delete pickup:", result);
      alert("❌ Failed to cancel pickup. Please try again.");
    }
  } catch (err) {
    console.error("Error deleting pickup:", err);
    alert("⚠️ Something went wrong while cancelling the pickup.");
  }
}

// Init page: fetch user's pickups from backend
// Clean up any duplicate pickupIds first
cleanupDuplicatePickupIds();
fetchUserPickups();

// Debug on page load
setTimeout(debugPickupState, 1000);
