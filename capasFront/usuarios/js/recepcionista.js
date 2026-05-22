async function buscarHuesped() {

const id = document.getElementById("idHuesped").value;

if(!id){
    alert("Ingrese un ID");
    return;
}

const res = await fetch(`http://192.168.100.2/api/usuarios/${id}`);

if(res.status !== 200){
    alert("Huésped no encontrado");
    return;
}

const usuario = await res.json();

document.getElementById("res_id").innerText = usuario.id;
document.getElementById("res_username").innerText = usuario.username;
document.getElementById("res_email").innerText = usuario.email;
document.getElementById("res_nombre").innerText = usuario.nombre_completo;
document.getElementById("res_rol").innerText = usuario.rol;

}

function cerrarSesion(){
localStorage.clear();
window.location.href = "login.html";
}