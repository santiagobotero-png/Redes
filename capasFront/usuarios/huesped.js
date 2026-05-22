window.onload = async function(){

    const id = localStorage.getItem("usuario_id");

    // 🔐 Validar sesión
    if(!id){
        alert("Debe iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    try {

        // =========================================
        // 🔹 1. CARGAR DATOS DEL USUARIO
        // =========================================
        const resUsuario = await fetch(`http://192.168.100.2/api/usuarios/${id}`);

        if(resUsuario.status !== 200){
            throw new Error("Error al cargar usuario");
        }

        const usuario = await resUsuario.json();

        document.getElementById("id").innerText = usuario.id;
        document.getElementById("username").innerText = usuario.username;
        document.getElementById("email").innerText = usuario.email;
        document.getElementById("nombre").innerText = usuario.nombre_completo;
        document.getElementById("rol").innerText = usuario.rol;


        // =========================================
        // 🔹 2. CARGAR RESERVAS (NUEVO)
        // =========================================
        const resReservas = await fetch(`http://192.168.100.2/api/ordenes/huesped/${id}/resumen`);

        if(resReservas.status !== 200){
            throw new Error("Error al cargar reservas");
        }

        const reservas = await resReservas.json();

        renderizarReservas(reservas);

    } catch (error) {
        console.error(error);
        alert("Error al cargar el panel");
    }
};


// =========================================
// 🔹 RENDER RESERVAS
// =========================================
function renderizarReservas(reservas){

    const activas = document.getElementById('reservas-activas');
    const finalizadas = document.getElementById('reservas-finalizadas');
    const canceladas = document.getElementById('reservas-canceladas');

    activas.innerHTML = '';
    finalizadas.innerHTML = '';
    canceladas.innerHTML = '';

    if(reservas.length === 0){
        activas.innerHTML = '<p>No tienes reservas</p>';
        return;
    }

    reservas.forEach(r => {

        const card = crearCardReserva(r);

        if(r.estado === 'activa'){
            activas.appendChild(card);
        } else if(r.estado === 'finalizada'){
            finalizadas.appendChild(card);
        } else if(r.estado === 'cancelada'){
            canceladas.appendChild(card);
        }

    });
}


// =========================================
// 🔹 CREAR TARJETA
// =========================================
function crearCardReserva(r){

    const col = document.createElement('div');
    col.className = "col-md-4";

    col.innerHTML = `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">

                <h5>Reserva #${r.id_reserva}</h5>

                <p><strong>Habitación:</strong> ${r.id_habitacion}</p>

                <p>
                    ${formatearFecha(r.fecha_inicio)} →
                    ${formatearFecha(r.fecha_fin)}
                </p>

                <p><strong>Total:</strong> $${r.total}</p>

                <small class="text-muted">
                    Habitación: $${r.total_habitacion}<br>
                    Servicios: $${r.total_servicios}
                </small>

                <br><br>

                <a href="ver_reserva.html?id=${r.id_reserva}" class="btn btn-outline-primary btn-sm">
                    Ver detalle
                </a>

            </div>
        </div>
    `;

    return col;
}


// =========================================
// 🔹 FORMATEAR FECHA
// =========================================
function formatearFecha(fechaISO){
    const [fecha] = fechaISO.split('T');
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
}


// =========================================
// 🔹 CERRAR SESIÓN
// =========================================
function cerrarSesion(){
    localStorage.clear();
    window.location.href = "../login.html";
}
