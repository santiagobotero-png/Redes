window.onload = async function(){

const id = localStorage.getItem("usuario_id");

if(!id){
alert("Debe iniciar sesión");
window.location.href = "login.html";
return;
}

const res = await fetch(`http://192.168.100.2/api/usuarios/${id}`);

if(res.status !== 200){
alert("Error al cargar información");
return;
}

const usuario = await res.json();

document.getElementById("id").innerText = usuario.id;
document.getElementById("username").innerText = usuario.username;
document.getElementById("email").innerText = usuario.email;
document.getElementById("nombre").innerText = usuario.nombre_completo;
document.getElementById("rol").innerText = usuario.rol;

}

function cerrarSesion(){
localStorage.clear();
window.location.href = "login.html";
}