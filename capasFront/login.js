document.getElementById("loginForm").addEventListener("submit", async function(e){

  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const mensaje = document.getElementById("mensaje");

  try {

    const res = await fetch("http://192.168.100.2/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    // 🔴 Credenciales incorrectas
    if (!res.ok) {
      mensaje.classList.remove("d-none");
      mensaje.textContent = "Usuario o contraseña incorrectos";
      return;
    }

    const data = await res.json();

    // 🔹 Guardar usuario en sesión
    localStorage.setItem("usuario", JSON.stringify({
      id: data.id,
      username: data.username,
      nombre_completo: data.nombre_completo,
      rol: data.rol
    }));

    // 🔹 Redirección según rol
    if (data.rol === "admin") {
      window.location.href = "index.html";
    } else if (data.rol === "HUESPED") {
      window.location.href = "usuarios/panel_huesped.html";
    } else {
      // fallback
      window.location.href = "index.html";
    }

  } catch (error) {

    console.error("Error en login:", error);

    mensaje.classList.remove("d-none");
    mensaje.textContent = "Error al conectar con el servidor";

  }

});
