let modal = new bootstrap.Modal(document.getElementById('modalUsuario'));

let usuarioEditando = null;

/* =========================
   CARGAR USUARIOS
========================= */
async function cargarUsuarios(){

  const tabla = document.getElementById("tablaUsuarios");

  // 🔹 Evita errores si no estás en la vista usuarios
  if (!tabla) return;

  try {

    const res = await fetch("http://192.168.100.2/api/usuarios");
    const usuarios = await res.json();

    tabla.innerHTML = "";

    usuarios.forEach(usuario => {

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.username}</td>
        <td>${usuario.email}</td>
        <td>${usuario.nombre_completo}</td>
        <td>${usuario.rol}</td>
        <td>
          <button class="btn btn-warning btn-sm">Editar</button>
          <button class="btn btn-danger btn-sm">Eliminar</button>
        </td>
      `;

      // 🔹 Eventos seguros (NO inline)
      row.querySelector(".btn-warning").onclick = () =>
        editarUsuario(
          usuario.id,
          usuario.username,
          usuario.email,
          usuario.nombre_completo,
          usuario.rol
        );

      row.querySelector(".btn-danger").onclick = () =>
        eliminarUsuario(usuario.id);

      tabla.appendChild(row);

    });

  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
}

/* =========================
   FORMULARIO
========================= */
function mostrarFormulario(){

  usuarioEditando = null;

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("email").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("rol").value = "ADMIN";

  modal.show();
}

/* =========================
   EDITAR
========================= */
function editarUsuario(id, username, email, nombre, rol){

  usuarioEditando = id;

  document.getElementById("username").value = username;
  document.getElementById("password").value = ""; // 🔹 no se edita password aquí
  document.getElementById("email").value = email;
  document.getElementById("nombre").value = nombre;
  document.getElementById("rol").value = rol;

  modal.show();
}

/* =========================
   CREAR / ACTUALIZAR
========================= */
async function crearUsuario(){

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;
  const nombre = document.getElementById("nombre").value;
  const rol = document.getElementById("rol").value;

  try {

    if(usuarioEditando === null){

      await fetch("http://192.168.100.2/api/usuarios",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          username,
          password,
          email,
          nombre_completo: nombre,
          rol
        })
      });

    } else {

      await fetch(`http://192.168.100.2/api/usuarios/${usuarioEditando}`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          username,
          email,
          nombre_completo: nombre,
          rol,
          activo: 1
        })
      });

    }

    modal.hide();
    cargarUsuarios();

  } catch (error) {
    console.error("Error guardando usuario:", error);
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminarUsuario(id){

  if(!confirm("¿Seguro que deseas eliminar este usuario?")){
    return;
  }

  try {

    await fetch(`http://192.168.100.2/api/usuarios/${id}`,{
      method:"DELETE"
    });

    cargarUsuarios();

  } catch (error) {
    console.error("Error eliminando usuario:", error);
  }
}

/* =========================
   SESIÓN
========================= */
function cerrarSesion(){
  localStorage.clear();
  window.location.href = "login.html";
}
