document.getElementById("loginForm").addEventListener("submit", async function(e){

e.preventDefault();

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

try{

const res = await fetch("http://192.168.100.2/api/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
username: username,
password: password
})
});

if(!res.ok){
alert("Usuario o contraseña incorrectos");
return;
}

const data = await res.json();

// Guardar datos del usuario
localStorage.setItem("usuario_id", data.id);
localStorage.setItem("rol", data.rol);

// Redirección según rol
if(data.rol === "ADMIN"){
window.location.href = "panel_admin.html";
}
else if(data.rol === "RECEPCIONISTA"){
window.location.href = "panel_recepcionista.html";
}
else if(data.rol === "HUESPED"){
window.location.href = "panel_huesped.html";
}
else{
alert("Rol no reconocido");
}

}catch(error){

console.error("Error en login:", error);
alert("Error al conectar con el servidor");

}

});