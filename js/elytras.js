// Estado global de la aplicación
const appState = {
    // Configuración del evento
    eventoActivo: false,
    tiempoRestante: 2 * 60 * 60, // 2 horas en segundos
    tiempoTotal: 2 * 60 * 60,
    cuposTotales: 25,
    
    // Datos de participantes
    solicitudesPendientes: [],
    participantesConfirmados: [],
    solicitudesRechazadas: [],
    
    // Estado del admin
    adminAutenticado: false,
    modalAdminAbierto: false
};

// Credenciales de administración
const ADMIN_CREDENTIALS = {
    usuario: "admin",
    contraseña: "sky2024"
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacion();
    cargarDatosGuardados();
    actualizarInterfaz();
});

// Función de inicialización principal
function inicializarAplicacion() {
    console.log('🚀 Inicializando Sistema de Carreras Aéreas');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Iniciar temporizador si el evento está activo
    if (appState.eventoActivo) {
        iniciarTemporizador();
    }
}

// Configurar todos los event listeners
function configurarEventListeners() {
    // Botón de panel admin
    document.getElementById('admin-toggle').addEventListener('click', mostrarLoginAdmin);
    
    // Formulario de inscripción
    document.getElementById('inscription-form').addEventListener('submit', manejarSolicitudInscripcion);
    
    // Formulario de login
    document.getElementById('login-form').addEventListener('submit', manejarLoginAdmin);
    
    // Validación en tiempo real del nombre de Minecraft
    document.getElementById('minecraft-name').addEventListener('input', validarNombreMinecraft);
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', function(event) {
        const adminModal = document.getElementById('admin-modal');
        const loginModal = document.getElementById('login-modal');
        
        if (adminModal.style.display === 'block' && event.target === adminModal) {
            closeAdminModal();
        }
        if (loginModal.style.display === 'block' && event.target === loginModal) {
            closeLoginModal();
        }
    });
    
    // Tabs del panel admin
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            cambiarTabAdmin(this.dataset.tab);
        });
    });
}

// ==================== SISTEMA DE INSCRIPCIÓN ====================

function manejarSolicitudInscripcion(event) {
    event.preventDefault();
    
    const nombreInput = document.getElementById('minecraft-name');
    const emailInput = document.getElementById('player-email');
    const nivelSelect = document.getElementById('player-level');
    
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const nivel = nivelSelect.value;
    
    // Validaciones
    if (!validarNombreMinecraft()) {
        mostrarToast('❌ Nombre de Minecraft inválido', 'error');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarToast('❌ Email inválido', 'error');
        return;
    }
    
    if (!nivel) {
        mostrarToast('❌ Selecciona tu nivel de experiencia', 'error');
        return;
    }
    
    // Verificar si ya existe una solicitud pendiente con este nombre
    if (solicitudExistente(nombre)) {
        mostrarToast('⚠️ Ya tienes una solicitud pendiente', 'warning');
        return;
    }
    
    // Verificar si ya está confirmado
    if (participanteConfirmado(nombre)) {
        mostrarToast('✅ Ya estás confirmado en el evento', 'success');
        return;
    }
    
    // Crear nueva solicitud
    const nuevaSolicitud = {
        id: Date.now(),
        nombre: nombre,
        email: email,
        nivel: nivel,
        fechaSolicitud: new Date().toLocaleString(),
        estado: 'pendiente'
    };
    
    // Agregar a solicitudes pendientes
    appState.solicitudesPendientes.push(nuevaSolicitud);
    
    // Limpiar formulario
    nombreInput.value = '';
    emailInput.value = '';
    nivelSelect.value = '';
    
    // Actualizar interfaz
    actualizarInterfaz();
    guardarDatos();
    
    // Mostrar confirmación
    mostrarToast('✈️ Solicitud enviada correctamente', 'success');
    console.log(`Nueva solicitud: ${nombre} (${email}) - Nivel: ${nivel}`);
}

function validarNombreMinecraft() {
    const input = document.getElementById('minecraft-name');
    const nombre = input.value.trim();
    const regex = /^[a-zA-Z0-9_]{3,16}$/;
    
    if (!regex.test(nombre)) {
        input.style.borderColor = 'var(--error)';
        return false;
    }
    
    input.style.borderColor = 'var(--success)';
    return true;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function solicitudExistente(nombre) {
    return appState.solicitudesPendientes.some(s => 
        s.nombre.toLowerCase() === nombre.toLowerCase()
    );
}

function participanteConfirmado(nombre) {
    return appState.participantesConfirmados.some(p => 
        p.nombre.toLowerCase() === nombre.toLowerCase()
    );
}

// ==================== PANEL DE ADMINISTRACIÓN ====================

function mostrarLoginAdmin() {
    document.getElementById('login-modal').style.display = 'block';
    appState.modalAdminAbierto = true;
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    appState.modalAdminAbierto = false;
}

function manejarLoginAdmin(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('admin-username').value;
    const contraseña = document.getElementById('admin-password').value;
    
    if (usuario === ADMIN_CREDENTIALS.usuario && contraseña === ADMIN_CREDENTIALS.contraseña) {
        // Login exitoso
        appState.adminAutenticado = true;
        closeLoginModal();
        mostrarPanelAdmin();
        mostrarToast('🔓 Sesión administrativa iniciada', 'success');
    } else {
        mostrarToast('❌ Credenciales incorrectas', 'error');
    }
    
    // Limpiar formulario
    document.getElementById('login-form').reset();
}

function mostrarPanelAdmin() {
    const modal = document.getElementById('admin-modal');
    modal.style.display = 'block';
    appState.modalAdminAbierto = true;
    
    // Cargar datos en el panel
    actualizarPanelAdmin();
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
    appState.modalAdminAbierto = false;
    appState.adminAutenticado = false;
}

function actualizarPanelAdmin() {
    // Actualizar estadísticas
    document.getElementById('stat-confirmed').textContent = appState.participantesConfirmados.length;
    document.getElementById('stat-pending').textContent = appState.solicitudesPendientes.length;
    document.getElementById('stat-available').textContent = appState.cuposTotales - appState.participantesConfirmados.length;
    
    // Actualizar badges de tabs
    document.getElementById('pending-badge').textContent = appState.solicitudesPendientes.length;
    document.getElementById('confirmed-badge').textContent = appState.participantesConfirmados.length;
    document.getElementById('rejected-badge').textContent = appState.solicitudesRechazadas.length;
    
    // Cargar listas
    cargarSolicitudesPendientes();
    cargarParticipantesConfirmados();
    cargarSolicitudesRechazadas();
}

function cambiarTabAdmin(tabId) {
    // Remover clase active de todos los tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Ocultar todos los paneles
    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Activar tab seleccionado
    document.querySelector(`.admin-tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// ==================== GESTIÓN DE SOLICITUDES ====================

function cargarSolicitudesPendientes() {
    const lista = document.getElementById('pending-list');
    
    if (appState.solicitudesPendientes.length === 0) {
        lista.innerHTML = '<div class="empty-state">No hay solicitudes pendientes</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    appState.solicitudesPendientes.forEach(solicitud => {
        const elemento = crearElementoSolicitud(solicitud);
        lista.appendChild(elemento);
    });
}

function cargarParticipantesConfirmados() {
    const lista = document.getElementById('confirmed-list');
    
    if (appState.participantesConfirmados.length === 0) {
        lista.innerHTML = '<div class="empty-state">No hay participantes confirmados</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    appState.participantesConfirmados.forEach(participante => {
        const elemento = crearElementoParticipante(participante);
        lista.appendChild(elemento);
    });
}

function cargarSolicitudesRechazadas() {
    const lista = document.getElementById('rejected-list');
    
    if (appState.solicitudesRechazadas.length === 0) {
        lista.innerHTML = '<div class="empty-state">No hay solicitudes rechazadas</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    appState.solicitudesRechazadas.forEach(solicitud => {
        const elemento = crearElementoSolicitudRechazada(solicitud);
        lista.appendChild(elemento);
    });
}

function crearElementoSolicitud(solicitud) {
    const div = document.createElement('div');
    div.className = 'request-item';
    div.innerHTML = `
        <div class="request-info">
            <div class="request-name">${solicitud.nombre}</div>
            <div class="request-details">
                <span>${solicitud.email}</span>
                <span>${obtenerEtiquetaNivel(solicitud.nivel)}</span>
                <span>${solicitud.fechaSolicitud}</span>
            </div>
        </div>
        <div class="request-actions">
            <button class="btn-approve" onclick="aprobarSolicitud(${solicitud.id})" title="Aprobar">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn-reject" onclick="rechazarSolicitud(${solicitud.id})" title="Rechazar">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    return div;
}

function crearElementoParticipante(participante) {
    const div = document.createElement('div');
    div.className = 'participant-item';
    div.innerHTML = `
        <div class="participant-info">
            <div class="participant-name">${participante.nombre}</div>
            <div class="participant-details">
                <span>${participante.email}</span>
                <span>${obtenerEtiquetaNivel(participante.nivel)}</span>
                <span>Confirmado: ${participante.fechaConfirmacion}</span>
            </div>
        </div>
        <div class="participant-actions">
            <button class="btn-remove" onclick="removerParticipante(${participante.id})" title="Remover">
                <i class="fas fa-user-minus"></i>
            </button>
        </div>
    `;
    return div;
}

function crearElementoSolicitudRechazada(solicitud) {
    const div = document.createElement('div');
    div.className = 'request-item';
    div.innerHTML = `
        <div class="request-info">
            <div class="request-name">${solicitud.nombre}</div>
            <div class="request-details">
                <span>${solicitud.email}</span>
                <span>${obtenerEtiquetaNivel(solicitud.nivel)}</span>
                <span>Rechazado: ${solicitud.fechaRechazo}</span>
            </div>
        </div>
        <div class="request-actions">
            <button class="btn-approve" onclick="reconsiderarSolicitud(${solicitud.id})" title="Reconsiderar">
                <i class="fas fa-redo"></i>
            </button>
        </div>
    `;
    return div;
}

// ==================== ACCIONES DEL ADMIN ====================

function aprobarSolicitud(id) {
    const solicitudIndex = appState.solicitudesPendientes.findIndex(s => s.id === id);
    
    if (solicitudIndex === -1) return;
    
    const solicitud = appState.solicitudesPendientes[solicitudIndex];
    
    // Verificar si hay cupos disponibles
    if (appState.participantesConfirmados.length >= appState.cuposTotales) {
        mostrarToast('❌ No hay cupos disponibles', 'error');
        return;
    }
    
    // Verificar si ya está confirmado
    if (participanteConfirmado(solicitud.nombre)) {
        mostrarToast('⚠️ Este jugador ya está confirmado', 'warning');
        return;
    }
    
    // Mover a participantes confirmados
    const participante = {
        ...solicitud,
        fechaConfirmacion: new Date().toLocaleString(),
        estado: 'confirmado'
    };
    
    appState.participantesConfirmados.push(participante);
    appState.solicitudesPendientes.splice(solicitudIndex, 1);
    
    // Actualizar interfaz
    actualizarInterfaz();
    actualizarPanelAdmin();
    guardarDatos();
    
    mostrarToast(`✅ ${solicitud.nombre} aprobado para el evento`, 'success');
}

function rechazarSolicitud(id) {
    const solicitudIndex = appState.solicitudesPendientes.findIndex(s => s.id === id);
    
    if (solicitudIndex === -1) return;
    
    const solicitud = appState.solicitudesPendientes[solicitudIndex];
    
    // Mover a solicitudes rechazadas
    const solicitudRechazada = {
        ...solicitud,
        fechaRechazo: new Date().toLocaleString(),
        estado: 'rechazado'
    };
    
    appState.solicitudesRechazadas.push(solicitudRechazada);
    appState.solicitudesPendientes.splice(solicitudIndex, 1);
    
    // Actualizar interfaz
    actualizarInterfaz();
    actualizarPanelAdmin();
    guardarDatos();
    
    mostrarToast(`❌ ${solicitud.nombre} rechazado`, 'error');
}

function removerParticipante(id) {
    const participanteIndex = appState.participantesConfirmados.findIndex(p => p.id === id);
    
    if (participanteIndex === -1) return;
    
    const participante = appState.participantesConfirmados[participanteIndex];
    
    if (confirm(`¿Estás seguro de remover a ${participante.nombre} del evento?`)) {
        appState.participantesConfirmados.splice(participanteIndex, 1);
        
        // Actualizar interfaz
        actualizarInterfaz();
        actualizarPanelAdmin();
        guardarDatos();
        
        mostrarToast(`👋 ${participante.nombre} removido del evento`, 'warning');
    }
}

function reconsiderarSolicitud(id) {
    const solicitudIndex = appState.solicitudesRechazadas.findIndex(s => s.id === id);
    
    if (solicitudIndex === -1) return;
    
    const solicitud = appState.solicitudesRechazadas[solicitudIndex];
    
    // Mover de vuelta a pendientes
    const solicitudReconsiderada = {
        ...solicitud,
        fechaSolicitud: new Date().toLocaleString(),
        estado: 'pendiente'
    };
    
    // Remover propiedades de rechazo
    delete solicitudReconsiderada.fechaRechazo;
    
    appState.solicitudesPendientes.push(solicitudReconsiderada);
    appState.solicitudesRechazadas.splice(solicitudIndex, 1);
    
    // Actualizar interfaz
    actualizarInterfaz();
    actualizarPanelAdmin();
    guardarDatos();
    
    mostrarToast(`🔄 ${solicitud.nombre} reconsiderado`, 'success');
}

// ==================== CONTROL DEL EVENTO ====================

function startEvent() {
    if (appState.eventoActivo) {
        mostrarToast('⚠️ El evento ya está en curso', 'warning');
        return;
    }
    
    appState.eventoActivo = true;
    appState.tiempoRestante = appState.tiempoTotal;
    iniciarTemporizador();
    
    mostrarToast('🚀 Evento iniciado - ¡Que comiencen las carreras!', 'success');
    guardarDatos();
}

function pauseEvent() {
    if (!appState.eventoActivo) {
        mostrarToast('⚠️ El evento no está activo', 'warning');
        return;
    }
    
    appState.eventoActivo = false;
    mostrarToast('⏸️ Evento pausado', 'warning');
    guardarDatos();
}

function endEvent() {
    if (!appState.eventoActivo) {
        mostrarToast('⚠️ El evento no está activo', 'warning');
        return;
    }
    
    if (confirm('¿Estás seguro de finalizar el evento? Esto no se puede deshacer.')) {
        appState.eventoActivo = false;
        appState.tiempoRestante = 0;
        
        mostrarToast('🏁 Evento finalizado - ¡Gracias a todos los participantes!', 'success');
        guardarDatos();
        actualizarInterfaz();
    }
}

function clearAllData() {
    if (confirm('⚠️ ¿ESTÁS SEGURO? Esto eliminará TODOS los datos:\n\n• Participantes confirmados\n• Solicitudes pendientes\n• Solicitudes rechazadas\n\nEsta acción NO se puede deshacer.')) {
        appState.solicitudesPendientes = [];
        appState.participantesConfirmados = [];
        appState.solicitudesRechazadas = [];
        appState.eventoActivo = false;
        appState.tiempoRestante = appState.tiempoTotal;
        
        // Actualizar interfaz
        actualizarInterfaz();
        actualizarPanelAdmin();
        guardarDatos();
        
        mostrarToast('🗑️ Todos los datos han sido eliminados', 'success');
    }
}

// ==================== TEMPORIZADOR ====================

function iniciarTemporizador() {
    const timerInterval = setInterval(() => {
        if (appState.tiempoRestante > 0 && appState.eventoActivo) {
            appState.tiempoRestante--;
            actualizarTemporizadorUI();
        } else {
            clearInterval(timerInterval);
            if (appState.tiempoRestante <= 0) {
                finalizarEventoAutomatico();
            }
        }
    }, 1000);
}

function actualizarTemporizadorUI() {
    const timerElement = document.getElementById('main-timer');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const horas = Math.floor(appState.tiempoRestante / 3600);
    const minutos = Math.floor((appState.tiempoRestante % 3600) / 60);
    const segundos = appState.tiempoRestante % 60;
    
    const tiempoFormateado = 
        `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    
    if (timerElement) timerElement.textContent = tiempoFormateado;
    
    // Actualizar progreso
    const porcentaje = ((appState.tiempoTotal - appState.tiempoRestante) / appState.tiempoTotal) * 100;
    if (progressFill) progressFill.style.width = `${porcentaje}%`;
    if (progressText) progressText.textContent = `${Math.round(porcentaje)}% completado`;
}

function finalizarEventoAutomatico() {
    appState.eventoActivo = false;
    mostrarToast('🏁 ¡Tiempo agotado! El evento ha finalizado automáticamente', 'success');
    guardarDatos();
}

// ==================== INTERFAZ PÚBLICA ====================

function actualizarInterfaz() {
    // Actualizar contadores principales
    actualizarContadorCupos();
    actualizarContadorParticipantes();
    actualizarListaParticipantesPublica();
    actualizarTemporizadorUI();
}

function actualizarContadorCupos() {
    const cuposDisponibles = appState.cuposTotales - appState.participantesConfirmados.length;
    document.getElementById('available-spots').textContent = cuposDisponibles;
}

function actualizarContadorParticipantes() {
    document.getElementById('current-participants').textContent = 
        `${appState.participantesConfirmados.length}/${appState.cuposTotales} Participantes`;
}

function actualizarListaParticipantesPublica() {
    const grid = document.getElementById('participants-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (appState.participantesConfirmados.length === 0) {
        grid.innerHTML = '';
        if (emptyState) {
            grid.appendChild(emptyState);
        }
        return;
    }
    
    // Remover empty state si existe
    if (emptyState && emptyState.parentNode) {
        emptyState.parentNode.removeChild(emptyState);
    }
    
    grid.innerHTML = '';
    
    appState.participantesConfirmados.forEach(participante => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.innerHTML = `
            <div class="participant-avatar">
                ${participante.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div class="participant-info">
                <div class="participant-name">${participante.nombre}</div>
                <div class="participant-details">
                    <span>${obtenerEtiquetaNivel(participante.nivel)}</span>
                    <span>Confirmado: ${participante.fechaConfirmacion}</span>
                </div>
            </div>
            <div class="participant-status">
                Confirmado
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==================== UTILIDADES ====================

function obtenerEtiquetaNivel(nivel) {
    const niveles = {
        'beginner': '🥉 Principiante',
        'intermediate': '🥈 Intermedio', 
        'advanced': '🥇 Avanzado'
    };
    return niveles[nivel] || nivel;
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function refreshParticipants() {
    mostrarToast('🔄 Lista de participantes actualizada', 'info');
    actualizarListaParticipantesPublica();
}

// ==================== ALMACENAMIENTO ====================

function guardarDatos() {
    try {
        localStorage.setItem('carrerasElytra_data', JSON.stringify(appState));
        console.log('💾 Datos guardados correctamente');
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
}

function cargarDatosGuardados() {
    try {
        const datosGuardados = localStorage.getItem('carrerasElytra_data');
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            
            // Actualizar appState con datos guardados
            Object.keys(datos).forEach(key => {
                if (appState.hasOwnProperty(key)) {
                    appState[key] = datos[key];
                }
            });
            
            console.log('📂 Datos cargados correctamente');
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ==================== NOTIFICACIONES ====================

function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Configurar color según tipo
    const colores = {
        success: 'var(--success)',
        error: 'var(--error)', 
        warning: 'var(--warning)',
        info: 'var(--accent)'
    };
    
    toast.style.background = colores[tipo] || colores.info;
    toastMessage.textContent = mensaje;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ==================== FUNCIONES GLOBALES ====================

// Hacer funciones disponibles globalmente para los onclick en HTML
window.scrollToSection = scrollToSection;
window.refreshParticipants = refreshParticipants;
window.startEvent = startEvent;
window.pauseEvent = pauseEvent;
window.endEvent = endEvent;
window.clearAllData = clearAllData;
window.aprobarSolicitud = aprobarSolicitud;
window.rechazarSolicitud = rechazarSolicitud;
window.removerParticipante = removerParticipante;
window.reconsiderarSolicitud = reconsiderarSolicitud;
window.closeAdminModal = closeAdminModal;

console.log('✅ Sistema de Carreras Aéreas cargado correctamente');