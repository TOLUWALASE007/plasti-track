document.addEventListener("DOMContentLoaded", function() {
  // Auto-fill email if remembered
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail) {
    document.getElementById("email").value = rememberedEmail;
    document.getElementById("rememberMe").checked = true;
  }
});

document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;
  const roleInput = document.getElementById("role");

  try {
    console.log("Sending credentials:", { email, password });
    const response = await fetch("https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/loginuser3", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    console.log("API response:", result);
    let user = null;
    if (Array.isArray(result.data)) {
      user = result.data.find(u => u.email === email || u.password === password);
    }

    if (user) {
      // Auto-fill the role field in the form
      if (roleInput) {
        roleInput.value = user.role || "user";
      }
      // Store user info in sessionStorage or localStorage based on rememberMe
      if (rememberMe) {
        localStorage.setItem("userId", user.id || user._id || user.userId || "");
        localStorage.setItem("userName", user.name || user.email);
        localStorage.setItem("userRole", user.role || "user");
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("userEmail", user.email); // <-- Save email for pickup scheduling
      } else {
        sessionStorage.setItem("userId", user.id || user._id || user.userId || "");
        sessionStorage.setItem("userName", user.name || user.email);
        sessionStorage.setItem("userRole", user.role || "user");
        sessionStorage.setItem("userEmail", user.email); // <-- Save email for pickup scheduling
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail"); // <-- Remove from localStorage if not remembered
      }
      alert("✅ Login successful!");
      // Redirect based on role (case-insensitive)
      const role = (user.role || "user").toLowerCase();
      if (role === "user") window.location.href = "../schedule/schedule.html";
      else if (role === "collector") window.location.href = "../collector/collector.html";
      else if (role === "admin") window.location.href = "../admin/admin.html";
      else window.location.href = "../index.html";
    } else {
      if (roleInput) roleInput.value = "";
      alert("❌ Incorrect email or password.");
    }
  } catch (err) {
    alert("⚠️ Login failed. Try again.");
    console.error(err);
  }
});
