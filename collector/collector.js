// Fetch and display all pending pickups from backend
async function fetchAvailablePickups() {
  try {
    console.log("Fetching available pickups...");
    const res = await fetch("https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/getavailablepickups3", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    console.log("Response status:", res.status);
    
    if (!res.ok) {
      console.error("Failed to fetch pickups:", res.status);
      document.getElementById("assignedPickupTable").innerHTML = `
        <tr>
          <td colspan="6" class="text-center p-4 text-red-500">
            ⚠️ Error loading pickups. Please try again later.
          </td>
        </tr>
      `;
      return;
    }
    
    const result = await res.json();
    console.log("API response:", result);
    
    const allPickups = Array.isArray(result.data) ? result.data : [];
    console.log("All pickups:", allPickups);
    
    // Filter pickups to only show those with email and valid pickupid
    const pickups = allPickups.filter(pickup => 
      pickup.email && 
      pickup.email.trim() !== '' && 
      (pickup.pickupid || pickup.pickupId || pickup.id)
    );
    console.log("Filtered pickups with email and pickupid:", pickups);
    
    // Store pickups globally for status updates
    window.currentPickups = pickups;
    
    // Separate pickups by status
    const assignedPickups = pickups.filter(pickup => pickup.status === 'Pending' || pickup.status === 'In Transit');
    const collectedPickups = pickups.filter(pickup => pickup.status === 'Collected');
    
    // Render assigned pickups table
    const assignedTable = document.getElementById("assignedPickupTable");
    if (assignedPickups.length > 0) {
      assignedTable.innerHTML = "";
      assignedPickups.forEach((pickup, index) => {
        console.log(`Rendering assigned pickup ${index}:`, pickup);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="p-2 border">${pickup.date || 'N/A'}</td>
          <td class="p-2 border">${pickup.address || 'N/A'}</td>
          <td class="p-2 border">${pickup.contact || 'N/A'}</td>
          <td class="p-2 border">${pickup.weight || 0} kg</td>
          <td class="p-2 border">
            <span class="px-2 py-1 rounded text-xs font-semibold ${
              pickup.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              pickup.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }">${pickup.status || 'Unknown'}</span>
          </td>
          <td class="p-2 border">
            <button onclick="updateStatus('${pickup.email + '_' + pickup.date + '_' + pickup.address.replace(/\s+/g, '_')}', 'In Transit')" class="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-xs">In Transit</button>
            <button onclick="updateStatus('${pickup.email + '_' + pickup.date + '_' + pickup.address.replace(/\s+/g, '_')}', 'Collected')" class="bg-green-600 text-white px-2 py-1 rounded text-xs">Collected</button>
          </td>
        `;
        assignedTable.appendChild(row);
      });
    } else {
      assignedTable.innerHTML = '<tr><td colspan="6" class="text-center p-2 text-gray-500">📭 No assigned pickups at the moment.</td></tr>';
    }
    
    // Render collected pickups table
    const collectedTable = document.getElementById("collectedPickupTable");
    if (collectedPickups.length > 0) {
      collectedTable.innerHTML = "";
      collectedPickups.forEach((pickup, index) => {
        console.log(`Rendering collected pickup ${index}:`, pickup);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="p-2 border">${pickup.date || 'N/A'}</td>
          <td class="p-2 border">${pickup.address || 'N/A'}</td>
          <td class="p-2 border">${pickup.contact || 'N/A'}</td>
          <td class="p-2 border">${pickup.weight || 0} kg</td>
          <td class="p-2 border">
            <span class="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">${pickup.status || 'Collected'}</span>
          </td>
        `;
        collectedTable.appendChild(row);
      });
    } else {
      collectedTable.innerHTML = '<tr><td colspan="5" class="text-center p-2 text-gray-500">📭 No collected pickups yet.</td></tr>';
    }
    
  } catch (error) {
    console.error("Error fetching pickups:", error);
    document.getElementById("assignedPickupTable").innerHTML = '<tr><td colspan="6" class="text-center p-2 text-red-500">⚠️ Error loading pickups. Please try again.</td></tr>';
  }
}

// Update pickup status by status only
async function updateStatus(pickupId, newStatus) {
  try {
    console.log(`Updating pickup to status: ${newStatus}`);
    const url = "https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/updatepickupstatus4";
    // Find the pickup object by pickupId
    const pickup = (window.currentPickups || []).find(p => {
      // Try to match by a composite key as used in the button
      return (
        (p.email + '_' + p.date + '_' + p.address.replace(/\s+/g, '_')) === pickupId
      );
    });
    if (!pickup) {
      alert("❌ Could not find pickup data for update.");
      return;
    }
    // Build payload with all required fields
    const payload = {
      pickupid: pickup.pickupid || pickup.pickupId || pickup.id,
      address: pickup.address,
      contact: pickup.contact,
      weight: pickup.weight,
      date: pickup.date,
      status: newStatus,
      email: pickup.email
    };
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      console.log("Status updated successfully");
      alert("✅ Status updated successfully!");
      fetchAvailablePickups(); // Refresh list
    } else {
      console.error("Failed to update status:", response.status);
      alert("❌ Could not update status. Please try again.");
    }
  } catch (error) {
    console.error("Error updating pickup status:", error);
    alert("⚠️ Error updating pickup status.");
  }
}

// Logout function for collector dashboard
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '../login/login.html';
}

document.addEventListener("DOMContentLoaded", fetchAvailablePickups);
