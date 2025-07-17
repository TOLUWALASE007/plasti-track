document.getElementById("registerForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const user = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    role: document.getElementById("role").value
  };

  try {
    const response = await fetch("https://api.mantahq.com/api/workflow/toluwalaseemmanuel20/plastitrack/registeruser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Registration successful!");
      window.location.href = "../login/login.html";
    } else {
      alert("❌ Error: " + (result.message || "Failed to register"));
    }
  } catch (err) {
    alert("⚠️ Something went wrong. Try again.");
    console.error(err);
  }
});
