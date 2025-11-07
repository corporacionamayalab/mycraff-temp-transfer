// ===== VARIABLES GLOBALES =====
let clans = JSON.parse(localStorage.getItem('mydcraffClans')) || [];
let currentUserClan = JSON.parse(localStorage.getItem('currentUserClan')) || null;
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadClansData();
    updateUI();
    updateAdminButton();
});

function initializeApp() {
    // Verificar si hay un clan del usuario actual
    if (currentUserClan) {
        showUserClanStatus();
    }
    
    // Cargar clanes inscritos
    renderClansGrid();
    
    // Actualizar estado del botón de administración
    updateAdminButton();
    
    // Si es admin, cargar panel admin
    if (isAdmin) {
        loadAdminData();
    }
}

function setupEventListeners() {
    // Modal de inscripción
    document.getElementById('inscribir-clan').addEventListener('click', openInscriptionModal);
    document.getElementById('start-inscription').addEventListener('click', openInscriptionModal);
    
    // Cerrar modales
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Formulario de inscripción
    document.getElementById('clan-inscription-form').addEventListener('submit', handleClanSubmission);
    
    // Agregar jugador
    document.getElementById('add-player').addEventListener('click', addPlayerForm);
    
    // Login admin
    document.getElementById('login-form').addEventListener('submit', handleAdminLogin);
    
    // Panel admin - botón en footer
    document.getElementById('open-admin-panel').addEventListener('click', openAdminPanel);
    
    // Panel admin - cerrar sesión
    document.getElementById('logout-admin').addEventListener('click', handleAdminLogout);
    
    // Pestañas admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchAdminTab);
    });
    
    // Acciones admin
    document.getElementById('clear-rejected').addEventListener('click', clearRejectedClans);
    document.getElementById('clear-all').addEventListener('click', clearAllData);
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
}

// ===== FUNCIONES DE ADMINISTRACIÓN =====
function updateAdminButton() {
    const adminBtn = document.getElementById('open-admin-panel');
    
    if (isAdmin) {
        adminBtn.classList.add('logged-in');
        adminBtn.innerHTML = '<i class="fas fa-cogs" aria-hidden="true"></i> Panel de Admin (Activo)';
    } else {
        adminBtn.classList.remove('logged-in');
        adminBtn.innerHTML = '<i class="fas fa-cogs" aria-hidden="true"></i> Panel de Administración';
    }
}

function openAdminPanel() {
    if (isAdmin) {
        // Si ya está logueado, abrir directamente el panel
        document.getElementById('admin-panel').classList.add('active');
        loadAdminData();
    } else {
        // Si no está logueado, mostrar modal de login
        document.getElementById('login-modal').classList.add('active');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Credenciales hardcodeadas (en producción usar autenticación segura)
    if (username === 'admin' && password === 'mydcraff2025') {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        closeAllModals();
        document.getElementById('admin-panel').classList.add('active');
        updateAdminButton();
        loadAdminData();
        showNotification('Sesión administrativa iniciada', 'success');
    } else {
        showNotification('Credenciales incorrectas', 'error');
    }
}

function handleAdminLogout() {
    isAdmin = false;
    localStorage.setItem('isAdmin', 'false');
    document.getElementById('admin-panel').classList.remove('active');
    updateAdminButton();
    showNotification('Sesión administrativa cerrada', 'success');
}

function switchAdminTab(e) {
    const tabName = e.target.getAttribute('data-tab');
    
    // Actualizar botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Actualizar contenido de pestañas
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Cargar datos específicos de la pestaña
    if (tabName === 'pending') loadPendingClans();
    else if (tabName === 'accepted') loadAcceptedClans();
    else if (tabName === 'rejected') loadRejectedClans();
    else if (tabName === 'stats') loadStats();
}

function loadAdminData() {
    loadPendingClans();
    loadStats();
}

function loadPendingClans() {
    const container = document.getElementById('pending-clans-list');
    const pendingClans = clans.filter(clan => clan.status === 'pending');
    
    if (pendingClans.length === 0) {
        container.innerHTML = '<p class="no-data">No hay clanes pendientes de revisión</p>';
        return;
    }
    
    container.innerHTML = pendingClans.map(clan => `
        <div class="admin-clan-card">
            <div class="admin-clan-header">
                <div>
                    <h4>${clan.name} <span class="clan-tag">${clan.tag}</span></h4>
                    <p>${clan.description}</p>
                    <p><small>Inscrito: ${new Date(clan.inscriptionDate).toLocaleDateString()}</small></p>
                </div>
                <div class="admin-clan-actions">
                    <button class="btn btn-primary btn-sm" onclick="approveClan('${clan.id}')">
                        <i class="fas fa-check"></i> Aprobar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectClan('${clan.id}')">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                </div>
            </div>
            <div class="admin-clan-players">
                ${clan.players.map(player => `
                    <div class="admin-player">
                        <div>
                            <strong>${player.name}</strong>
                            ${player.isLeader ? ' <i class="fas fa-crown" style="color: var(--accent-yellow);"></i>' : ''}
                            <br>
                            <small>${player.discord} • ${player.email}</small>
                        </div>
                        <span class="player-role">${player.role}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function loadAcceptedClans() {
    const container = document.getElementById('accepted-clans-list');
    const acceptedClans = clans.filter(clan => clan.status === 'confirmed');
    
    if (acceptedClans.length === 0) {
        container.innerHTML = '<p class="no-data">No hay clanes aceptados</p>';
        return;
    }
    
    container.innerHTML = acceptedClans.map(clan => `
        <div class="admin-clan-card">
            <div class="admin-clan-header">
                <div>
                    <h4>${clan.name} <span class="clan-tag">${clan.tag}</span></h4>
                    <p>${clan.description}</p>
                </div>
                <div class="admin-clan-actions">
                    <button class="btn btn-danger btn-sm" onclick="disqualifyClan('${clan.id}')">
                        <i class="fas fa-ban"></i> Descalificar
                    </button>
                </div>
            </div>
            <div class="admin-clan-players">
                ${clan.players.map(player => `
                    <div class="admin-player">
                        <div>
                            <strong>${player.name}</strong>
                            ${player.isLeader ? ' <i class="fas fa-crown" style="color: var(--accent-yellow);"></i>' : ''}
                        </div>
                        <span class="player-role">${player.role}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function loadRejectedClans() {
    const container = document.getElementById('rejected-clans-list');
    const rejectedClans = clans.filter(clan => clan.status === 'rejected');
    
    if (rejectedClans.length === 0) {
        container.innerHTML = '<p class="no-data">No hay clanes rechazados</p>';
        return;
    }
    
    container.innerHTML = rejectedClans.map(clan => `
        <div class="admin-clan-card">
            <div class="admin-clan-header">
                <div>
                    <h4>${clan.name} <span class="clan-tag">${clan.tag}</span></h4>
                    <p>${clan.description}</p>
                    <p><small><strong>Razón:</strong> ${clan.adminNotes || 'No especificada'}</small></p>
                </div>
                <div class="admin-clan-actions">
                    <button class="btn btn-primary btn-sm" onclick="restoreClan('${clan.id}')">
                        <i class="fas fa-undo"></i> Restaurar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadStats() {
    const totalClans = clans.length;
    const acceptedCount = clans.filter(clan => clan.status === 'confirmed').length;
    const pendingCount = clans.filter(clan => clan.status === 'pending').length;
    const rejectedCount = clans.filter(clan => clan.status === 'rejected').length;
    const totalPlayers = clans.reduce((sum, clan) => sum + clan.players.length, 0);
    const capacity = Math.min(100, Math.round((acceptedCount / 32) * 100)); // Asumiendo 32 clanes máximo
    
    document.getElementById('total-clans').textContent = totalClans;
    document.getElementById('accepted-count').textContent = acceptedCount;
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('rejected-count').textContent = rejectedCount;
    document.getElementById('total-players').textContent = totalPlayers;
    document.getElementById('capacity').textContent = `${capacity}%`;
}

// ===== ACCIONES ADMIN =====
function approveClan(clanId) {
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
        clan.status = 'confirmed';
        clan.adminNotes = 'Clan aprobado para el torneo';
        saveData();
        loadAdminData();
        renderClansGrid();
        
        // Si es el clan del usuario actual, actualizar UI
        if (currentUserClan && currentUserClan.id === clanId) {
            currentUserClan.status = 'confirmed';
            localStorage.setItem('currentUserClan', JSON.stringify(currentUserClan));
            showUserClanStatus();
        }
        
        showNotification('Clan aprobado correctamente', 'success');
    }
}

function rejectClan(clanId) {
    const reason = prompt('Ingrese la razón del rechazo:');
    if (reason === null) return;
    
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
        clan.status = 'rejected';
        clan.adminNotes = reason;
        saveData();
        loadAdminData();
        renderClansGrid();
        
        // Si es el clan del usuario actual, actualizar UI
        if (currentUserClan && currentUserClan.id === clanId) {
            currentUserClan.status = 'rejected';
            localStorage.setItem('currentUserClan', JSON.stringify(currentUserClan));
            showUserClanStatus();
        }
        
        showNotification('Clan rechazado', 'warning');
    }
}

function disqualifyClan(clanId) {
    if (!confirm('¿Está seguro de que desea descalificar este clan?')) return;
    
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
        clan.status = 'rejected';
        clan.adminNotes = 'Clan descalificado del torneo';
        saveData();
        loadAdminData();
        renderClansGrid();
        showNotification('Clan descalificado', 'warning');
    }
}

function restoreClan(clanId) {
    const clan = clans.find(c => c.id === clanId);
    if (clan) {
        clan.status = 'pending';
        clan.adminNotes = 'Clan restaurado para revisión';
        saveData();
        loadAdminData();
        showNotification('Clan restaurado a pendiente', 'success');
    }
}

function clearRejectedClans() {
    if (!confirm('¿Está seguro de que desea eliminar permanentemente todos los clanes rechazados?')) return;
    
    clans = clans.filter(clan => clan.status !== 'rejected');
    saveData();
    loadAdminData();
    showNotification('Clanes rechazados eliminados', 'success');
}

function clearAllData() {
    if (!confirm('¿ESTÁ SEGURO? Esto eliminará TODOS los datos del torneo (clanes, inscripciones, etc.). Esta acción es irreversible.')) return;
    
    clans = [];
    currentUserClan = null;
    saveData();
    loadAdminData();
    renderClansGrid();
    updateUI();
    showNotification('Todos los datos han sido eliminados', 'warning');
}

function exportData() {
    const dataStr = JSON.stringify(clans, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mydcraff-clanes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Datos exportados correctamente', 'success');
}

// ===== GESTIÓN DE MODALES =====
function openInscriptionModal() {
    document.getElementById('inscripcion-modal').classList.add('active');
    resetPlayerForms();
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('admin-panel').classList.remove('active');
}

// ===== GESTIÓN DE FORMULARIOS =====
function resetPlayerForms() {
    const container = document.getElementById('players-container');
    // Mantener solo el líder y el jugador 2
    while (container.children.length > 2) {
        container.removeChild(container.lastChild);
    }
    updatePlayerCounter();
}

function addPlayerForm() {
    const container = document.getElementById('players-container');
    const playerCount = container.children.length;
    
    if (playerCount >= 10) {
        showNotification('Máximo 10 jugadores por clan', 'warning');
        return;
    }
    
    const newPlayer = document.createElement('div');
    newPlayer.className = 'player-form';
    newPlayer.setAttribute('data-player', playerCount + 1);
    newPlayer.innerHTML = `
        <div class="player-header">
            <span class="player-number">Jugador ${playerCount + 1}</span>
            <button type="button" class="btn btn-danger btn-sm remove-player">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Nombre de Jugador *</label>
                <input type="text" name="player-name[]" required placeholder="Nombre en el juego">
            </div>
            <div class="form-group">
                <label>Discord ID *</label>
                <input type="text" name="player-discord[]" required placeholder="Usuario#1234">
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="player-email[]" required placeholder="jugador@email.com">
            </div>
            <div class="form-group">
                <label>Rol Principal *</label>
                <select name="player-role[]" required>
                    <option value="">Seleccionar rol</option>
                    <option value="pvp">PvP</option>
                    <option value="estratega">Estratega</option>
                    <option value="support">Support</option>
                    <option value="builder">Builder</option>
                    <option value="flex">Flex</option>
                </select>
            </div>
        </div>
    `;
    
    container.appendChild(newPlayer);
    
    // Agregar evento al botón de eliminar
    newPlayer.querySelector('.remove-player').addEventListener('click', function() {
        container.removeChild(newPlayer);
        updatePlayerCounter();
        renumberPlayers();
    });
    
    updatePlayerCounter();
}

function updatePlayerCounter() {
    const count = document.getElementById('players-container').children.length;
    const counter = document.getElementById('players-counter');
    const addButton = document.getElementById('add-player');
    
    counter.textContent = `${count}/10 jugadores`;
    addButton.textContent = `Agregar Jugador (${count}/10)`;
    addButton.disabled = count >= 10;
}

function renumberPlayers() {
    const container = document.getElementById('players-container');
    const players = container.querySelectorAll('.player-form:not(.leader)');
    
    players.forEach((player, index) => {
        const playerNumber = index + 2;
        player.setAttribute('data-player', playerNumber);
        player.querySelector('.player-number').textContent = `Jugador ${playerNumber}`;
    });
}

// ===== GESTIÓN DE CLANES =====
function handleClanSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const playerNames = formData.getAll('player-name[]');
    const playerDiscords = formData.getAll('player-discord[]');
    const playerEmails = formData.getAll('player-email[]');
    const playerRoles = formData.getAll('player-role[]');
    
    // Validar que hay exactamente 10 jugadores
    if (playerNames.length !== 10) {
        showNotification('Debe haber exactamente 10 jugadores en el clan', 'error');
        return;
    }
    
    // Crear objeto de jugadores
    const players = playerNames.map((name, index) => ({
        name: name.trim(),
        discord: playerDiscords[index].trim(),
        email: playerEmails[index].trim(),
        role: playerRoles[index],
        isLeader: index === 0
    }));
    
    // Crear objeto del clan
    const clan = {
        id: generateId(),
        name: document.getElementById('clan-name').value.trim(),
        tag: document.getElementById('clan-tag').value.trim(),
        description: document.getElementById('clan-description').value.trim(),
        players: players,
        status: 'pending',
        inscriptionDate: new Date().toISOString(),
        adminNotes: ''
    };
    
    // Guardar clan
    clans.push(clan);
    currentUserClan = clan;
    
    // Actualizar almacenamiento
    saveData();
    
    // Actualizar UI
    showUserClanStatus();
    renderClansGrid();
    
    // Cerrar modal y mostrar confirmación
    closeAllModals();
    showNotification('¡Clan inscrito correctamente! Está pendiente de revisión.', 'success');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showUserClanStatus() {
    if (!currentUserClan) return;
    
    // Ocultar todos los estados primero
    document.querySelectorAll('.status-card').forEach(card => {
        card.style.display = 'none';
    });
    
    // Mostrar el estado correspondiente
    const statusCard = document.getElementById(`status-${currentUserClan.status}`);
    statusCard.style.display = 'flex';
    
    // Actualizar detalles
    const detailsElement = document.getElementById(`${currentUserClan.status}-details`);
    if (detailsElement) {
        detailsElement.innerHTML = `
            <div class="clan-info-mini">
                <h4>${currentUserClan.name} <span class="clan-tag">${currentUserClan.tag}</span></h4>
                <p>${currentUserClan.description}</p>
                <p><strong>Fecha de inscripción:</strong> ${new Date(currentUserClan.inscriptionDate).toLocaleDateString()}</p>
                ${currentUserClan.adminNotes ? `<p><strong>Notas del administrador:</strong> ${currentUserClan.adminNotes}</p>` : ''}
            </div>
        `;
    }
}

function renderClansGrid() {
    const grid = document.getElementById('clanes-grid');
    const acceptedClans = clans.filter(clan => clan.status === 'confirmed');
    
    if (acceptedClans.length === 0) {
        grid.innerHTML = `
            <div class="no-clans-message">
                <i class="fas fa-users" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>Aún no hay clanes inscritos</h3>
                <p>¡Sé el primero en inscribir tu clan!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = acceptedClans.map(clan => `
        <div class="clan-card">
            <div class="clan-header">
                <div class="clan-badge">
                    <i class="fas fa-users"></i>
                </div>
                <div class="clan-info">
                    <h3>${clan.name}</h3>
                    <span class="clan-tag">${clan.tag}</span>
                </div>
            </div>
            <p class="clan-description">${clan.description}</p>
            <div class="clan-members">
                ${clan.players.slice(0, 5).map(player => `
                    <span class="member-tag">${player.name}</span>
                `).join('')}
                ${clan.players.length > 5 ? `<span class="member-tag">+${clan.players.length - 5} más</span>` : ''}
            </div>
        </div>
    `).join('');
}

// ===== UTILIDADES =====
function saveData() {
    localStorage.setItem('mydcraffClans', JSON.stringify(clans));
    if (currentUserClan) {
        localStorage.setItem('currentUserClan', JSON.stringify(currentUserClan));
    }
}

function loadClansData() {
    clans = JSON.parse(localStorage.getItem('mydcraffClans')) || [];
}

function updateUI() {
    if (!currentUserClan) {
        document.querySelectorAll('.status-card').forEach(card => {
            card.style.display = 'none';
        });
        document.getElementById('status-empty').style.display = 'flex';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// ===== DATOS DE EJEMPLO =====
function loadSampleData() {
    if (clans.length > 0) return;
    
    const sampleClans = [
        {
            id: 'sample1',
            name: 'Dragones Cósmicos',
            tag: '[DRAGON]',
            description: 'Clan legendario con años de experiencia en PvP competitivo',
            players: Array(10).fill().map((_, i) => ({
                name: i === 0 ? 'DragonMaster' : `Jugador${i+1}`,
                discord: i === 0 ? 'DragonMaster#1234' : `Jugador${i+1}#000${i}`,
                email: i === 0 ? 'dragon@email.com' : `jugador${i+1}@email.com`,
                role: i === 0 ? 'estratega' : ['pvp', 'support', 'builder'][i % 3],
                isLeader: i === 0
            })),
            status: 'confirmed',
            inscriptionDate: new Date().toISOString(),
            adminNotes: ''
        },
        {
            id: 'sample2',
            name: 'Guerreros de la Noche',
            tag: '[NIGHT]',
            description: 'Especialistas en estrategias sorpresa y combate nocturno',
            players: Array(10).fill().map((_, i) => ({
                name: i === 0 ? 'NightHunter' : `NightWarrior${i+1}`,
                discord: i === 0 ? 'NightHunter#5678' : `NightWarrior${i+1}#000${i}`,
                email: i === 0 ? 'night@email.com' : `warrior${i+1}@email.com`,
                role: i === 0 ? 'pvp' : ['pvp', 'support', 'builder'][i % 3],
                isLeader: i === 0
            })),
            status: 'pending',
            inscriptionDate: new Date().toISOString(),
            adminNotes: ''
        }
    ];
    
    clans = sampleClans;
    saveData();
    renderClansGrid();
    loadAdminData();
}

// Descomentar la siguiente línea para cargar datos de ejemplo al iniciar
// loadSampleData();