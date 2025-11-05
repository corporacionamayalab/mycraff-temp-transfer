// MYDCRAFF PvP - Sistema completo con panel administrativo
class MYDCRAFFPvP {
    constructor() {
        this.players = JSON.parse(localStorage.getItem('mydcraff_players')) || [];
        this.adminCredentials = {
            username: 'MYDCraff',
            password: 'Abcdef1234' // CAMBIAR EN PRODUCCIÓN
        };
        this.isAdminLoggedIn = localStorage.getItem('mydcraff_admin') === 'true';
        this.init();
    }

    init() {
        this.initCountdown();
        this.initTournamentActions();
        this.initScrollAnimations();
        this.initNotifications();
        this.initLoginSystem();
        this.updateAllDisplays();
        
        if (this.isAdminLoggedIn) {
            this.showAdminPanel();
        }
    }

    // ==================== SISTEMA DE LOGIN ====================
    initLoginSystem() {
        const loginLink = document.getElementById('admin-login-link');
        const loginModal = document.getElementById('login-modal');
        const loginForm = document.getElementById('login-form');
        const closeModal = document.querySelector('.close-modal');
        const logoutBtn = document.getElementById('logout-admin');

        // Abrir modal de login
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        // Cerrar modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        // Cerrar modal al hacer click fuera
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.hideLoginModal();
                }
            });
        }

        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Tabs del panel admin
        this.initAdminTabs();
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('show');
            // Limpiar campos
            document.getElementById('admin-username').value = '';
            document.getElementById('admin-password').value = '';
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    handleLogin() {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            
            this.isAdminLoggedIn = true;
            localStorage.setItem('mydcraff_admin', 'true');
            
            this.hideLoginModal();
            this.showAdminPanel();
            this.showNotification('✅ Acceso administrativo concedido', 'success');
            
        } else {
            this.showNotification('❌ Credenciales incorrectas', 'error');
        }
    }

    handleLogout() {
        this.isAdminLoggedIn = false;
        localStorage.removeItem('mydcraff_admin');
        this.hideAdminPanel();
        this.showNotification('🔒 Sesión administrativa cerrada', 'info');
    }

    // ==================== PANEL DE ADMINISTRACIÓN ====================
    showAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.add('show');
            this.updateAdminPanel();
        }
    }

    hideAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.remove('show');
        }
    }

    initAdminTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchAdminTab(tabId);
            });
        });
    }

    switchAdminTab(tabId) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Actualizar datos específicos de la pestaña
        this.updateAdminTab(tabId);
    }

    updateAdminPanel() {
        this.updateAdminTab('pending');
        this.updateAdminTab('confirmed');
        this.updateAdminTab('rejected');
        this.updateAdminTab('management');
    }

    updateAdminTab(tabId) {
        switch(tabId) {
            case 'pending':
                this.updatePendingAdminList();
                break;
            case 'confirmed':
                this.updateConfirmedAdminList();
                break;
            case 'rejected':
                this.updateRejectedAdminList();
                break;
            case 'management':
                this.updateManagementTab();
                break;
        }
    }

    updatePendingAdminList() {
        const pendingList = document.getElementById('pending-list');
        if (!pendingList) return;

        const pendingPlayers = this.players.filter(p => p.status === 'pending');

        if (pendingPlayers.length === 0) {
            pendingList.innerHTML = '<p class="no-players">No hay jugadores pendientes de revisión</p>';
            return;
        }

        pendingList.innerHTML = pendingPlayers.map(player => `
            <div class="admin-player-slot pending" data-id="${player.id}">
                <div class="player-avatar">
                    <i class="fas fa-user-clock"></i>
                </div>
                <div class="admin-player-info">
                    <span class="admin-player-name">${player.name}</span>
                    <div class="admin-player-details">
                        <div><strong>Discord:</strong> ${player.discord}</div>
                        <div><strong>Email:</strong> ${player.email}</div>
                        <div><strong>Inscrito:</strong> ${player.timestamp}</div>
                    </div>
                </div>
                <div class="admin-player-actions">
                    <button class="btn btn-success btn-sm confirm-btn" data-id="${player.id}">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                    <button class="btn btn-danger btn-sm reject-btn" data-id="${player.id}">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    updateConfirmedAdminList() {
        const confirmedList = document.getElementById('confirmed-admin-list');
        if (!confirmedList) return;

        const confirmedPlayers = this.players.filter(p => p.status === 'confirmed');

        if (confirmedPlayers.length === 0) {
            confirmedList.innerHTML = '<p class="no-players">No hay jugadores confirmados en el torneo</p>';
            return;
        }

        confirmedList.innerHTML = confirmedPlayers.map(player => `
            <div class="admin-player-slot confirmed" data-id="${player.id}">
                <div class="player-avatar">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="admin-player-info">
                    <span class="admin-player-name">${player.name}</span>
                    <div class="admin-player-details">
                        <div><strong>Discord:</strong> ${player.discord}</div>
                        <div><strong>Email:</strong> ${player.email}</div>
                        <div><strong>Confirmado:</strong> ${player.timestamp}</div>
                    </div>
                </div>
                <div class="admin-player-actions">
                    <button class="btn btn-warning btn-sm remove-btn" data-id="${player.id}">
                        <i class="fas fa-user-slash"></i> Quitar
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    updateRejectedAdminList() {
        const rejectedList = document.getElementById('rejected-list');
        if (!rejectedList) return;

        const rejectedPlayers = this.players.filter(p => p.status === 'rejected');

        if (rejectedPlayers.length === 0) {
            rejectedList.innerHTML = '<p class="no-players">No hay jugadores rechazados</p>';
            return;
        }

        rejectedList.innerHTML = rejectedPlayers.map(player => `
            <div class="admin-player-slot rejected" data-id="${player.id}">
                <div class="player-avatar">
                    <i class="fas fa-user-times"></i>
                </div>
                <div class="admin-player-info">
                    <span class="admin-player-name">${player.name}</span>
                    <div class="admin-player-details">
                        <div><strong>Discord:</strong> ${player.discord}</div>
                        <div><strong>Email:</strong> ${player.email}</div>
                        <div><strong>Rechazado:</strong> ${player.timestamp}</div>
                    </div>
                </div>
                <div class="admin-player-actions">
                    <button class="btn btn-success btn-sm restore-btn" data-id="${player.id}">
                        <i class="fas fa-undo"></i> Restaurar
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${player.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    attachAdminEventListeners() {
        // Confirmar jugador
        document.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.closest('.confirm-btn').dataset.id);
                this.confirmPlayer(playerId);
            });
        });

        // Rechazar jugador
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.closest('.reject-btn').dataset.id);
                this.rejectPlayer(playerId);
            });
        });

        // Quitar jugador confirmado
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.closest('.remove-btn').dataset.id);
                this.removePlayer(playerId);
            });
        });

        // Restaurar jugador rechazado
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.closest('.restore-btn').dataset.id);
                this.restorePlayer(playerId);
            });
        });

        // Eliminar permanentemente
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = parseInt(e.target.closest('.delete-btn').dataset.id);
                if (confirm('¿Estás seguro de que quieres eliminar permanentemente este jugador?')) {
                    this.deletePlayer(playerId);
                }
            });
        });
    }

    updateManagementTab() {
        const totalPlayers = this.players.length;
        const confirmedCount = this.players.filter(p => p.status === 'confirmed').length;
        const pendingCount = this.players.filter(p => p.status === 'pending').length;
        const rejectedCount = this.players.filter(p => p.status === 'rejected').length;

        document.getElementById('total-players').textContent = totalPlayers;
        document.getElementById('confirmed-count').textContent = confirmedCount;
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('rejected-count').textContent = rejectedCount;

        // Botones de gestión
        const clearRejectedBtn = document.getElementById('clear-rejected');
        const clearAllBtn = document.getElementById('clear-all');
        const exportBtn = document.getElementById('export-data');

        if (clearRejectedBtn) {
            clearRejectedBtn.onclick = () => this.clearRejectedPlayers();
        }

        if (clearAllBtn) {
            clearAllBtn.onclick = () => this.clearAllPlayers();
        }

        if (exportBtn) {
            exportBtn.onclick = () => this.exportPlayerData();
        }
    }

    // ==================== SISTEMA DE INSCRIPCIONES ====================
    initTournamentActions() {
        const inscriptionForm = document.getElementById('inscription-form');
        if (inscriptionForm) {
            inscriptionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInscription();
            });
        }

        const joinButton = document.getElementById('join-tournament');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                document.getElementById('inscripcion').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }

        // Botones de torneos próximos
        document.querySelectorAll('.tournaments-grid .btn-primary').forEach(button => {
            button.addEventListener('click', () => {
                this.showNotification('🔔 Los torneos próximos se abrirán pronto', 'info');
            });
        });
    }

    handleInscription() {
        const nameInput = document.getElementById('player-name');
        const emailInput = document.getElementById('player-email');
        const discordInput = document.getElementById('player-discord');

        const playerData = {
            id: Date.now(),
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            discord: discordInput.value.trim(),
            status: 'pending',
            timestamp: new Date().toLocaleString('es-ES')
        };

        // Validaciones
        if (!playerData.name || !playerData.email || !playerData.discord) {
            this.showNotification('❌ Por favor completa todos los campos', 'error');
            return;
        }

        if (playerData.name.length < 3) {
            this.showNotification('❌ El nombre debe tener al menos 3 caracteres', 'error');
            return;
        }

        if (!this.isValidEmail(playerData.email)) {
            this.showNotification('❌ Por favor ingresa un email válido', 'error');
            return;
        }

        // Verificar si el jugador ya existe
        const existingPlayer = this.players.find(p => 
            p.name.toLowerCase() === playerData.name.toLowerCase() || 
            p.email.toLowerCase() === playerData.email.toLowerCase()
        );

        if (existingPlayer) {
            this.showNotification('⚠️ Este jugador ya está registrado en el sistema', 'warning');
            return;
        }

        // Guardar jugador
        this.savePlayer(playerData);
        
        // Limpiar formulario
        document.getElementById('inscription-form').reset();
        
        this.showNotification('✅ ¡Inscripción enviada! Espera la confirmación de los administradores.', 'success');
        this.updateAllDisplays();
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    savePlayer(playerData) {
        this.players.push(playerData);
        localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
    }

    // ==================== GESTIÓN DE JUGADORES ====================
    confirmPlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].status = 'confirmed';
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification(`✅ Jugador ${this.players[playerIndex].name} confirmado en el torneo`, 'success');
            this.updateAllDisplays();
        }
    }

    rejectPlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].status = 'rejected';
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification(`❌ Jugador ${this.players[playerIndex].name} rechazado`, 'error');
            this.updateAllDisplays();
        }
    }

    removePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].status = 'rejected';
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification(`⚠️ Jugador ${this.players[playerIndex].name} removido del torneo`, 'warning');
            this.updateAllDisplays();
        }
    }

    restorePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].status = 'pending';
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification(`🔄 Jugador ${this.players[playerIndex].name} restaurado a pendiente`, 'success');
            this.updateAllDisplays();
        }
    }

    deletePlayer(playerId) {
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            const playerName = this.players[playerIndex].name;
            this.players.splice(playerIndex, 1);
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification(`🗑️ Jugador ${playerName} eliminado permanentemente`, 'success');
            this.updateAllDisplays();
        }
    }

    clearRejectedPlayers() {
        const rejectedPlayers = this.players.filter(p => p.status === 'rejected');
        
        if (rejectedPlayers.length === 0) {
            this.showNotification('ℹ️ No hay jugadores rechazados para limpiar', 'info');
            return;
        }

        if (confirm(`¿Estás seguro de que quieres eliminar permanentemente a ${rejectedPlayers.length} jugador(es) rechazado(s)?`)) {
            this.players = this.players.filter(p => p.status !== 'rejected');
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification(`🧹 ${rejectedPlayers.length} jugador(es) rechazado(s) eliminados`, 'success');
            this.updateAllDisplays();
        }
    }

    clearAllPlayers() {
        if (this.players.length === 0) {
            this.showNotification('ℹ️ No hay jugadores para limpiar', 'info');
            return;
        }

        if (confirm('⚠️ ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto eliminará TODOS los jugadores (confirmados, pendientes y rechazados).\n\nEsta acción NO se puede deshacer.')) {
            this.players = [];
            localStorage.setItem('mydcraff_players', JSON.stringify(this.players));
            this.showNotification('💥 Todos los jugadores han sido eliminados del sistema', 'warning');
            this.updateAllDisplays();
        }
    }

    exportPlayerData() {
        if (this.players.length === 0) {
            this.showNotification('ℹ️ No hay datos para exportar', 'info');
            return;
        }

        const dataStr = JSON.stringify(this.players, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mydcraff_players_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showNotification('📥 Datos exportados correctamente', 'success');
    }

    // ==================== ACTUALIZACIONES DE INTERFAZ ====================
    updateAllDisplays() {
        this.updateConfirmedPlayers();
        this.updatePlayersCount();
        
        if (this.isAdminLoggedIn) {
            this.updateAdminPanel();
        }
    }

    updateConfirmedPlayers() {
        const confirmedList = document.getElementById('confirmed-players-list');
        const titleElement = document.getElementById('confirmed-players-title');

        if (!confirmedList || !titleElement) return;

        const confirmedPlayers = this.players.filter(p => p.status === 'confirmed');
        titleElement.textContent = `Jugadores Inscritos (${confirmedPlayers.length}/25)`;

        if (confirmedPlayers.length === 0) {
            confirmedList.innerHTML = '<p class="no-players">No hay jugadores confirmados todavía</p>';
        } else {
            confirmedList.innerHTML = confirmedPlayers.map(player => `
                <div class="player-slot" data-status="confirmed">
                    <div class="player-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <span class="player-name">${player.name}</span>
                    <span class="player-status confirmed">Confirmado</span>
                </div>
            `).join('');
        }

        this.updateJoinButton(confirmedPlayers.length);
    }

    updatePlayersCount() {
        const countElement = document.getElementById('players-count');
        if (!countElement) return;

        const confirmedCount = this.players.filter(p => p.status === 'confirmed').length;
        
        if (confirmedCount >= 25) {
            countElement.innerHTML = '<strong>25/25 Jugadores</strong><span>Lleno - Listo para comenzar</span>';
        } else {
            countElement.innerHTML = `<strong>${confirmedCount}/25 Jugadores</strong><span>Inscripciones abiertas</span>`;
        }
    }

    updateJoinButton(confirmedCount) {
        const joinButton = document.getElementById('join-tournament');
        if (!joinButton) return;

        if (confirmedCount >= 25) {
            joinButton.innerHTML = '<i class="fas fa-door-open"></i> Torneo Lleno';
            joinButton.disabled = true;
        } else {
            joinButton.innerHTML = '<i class="fas fa-user-plus"></i> Unirse al Torneo';
            joinButton.disabled = false;
        }
    }

    // ==================== COUNTDOWN ====================
    initCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        let timeLeft = 15 * 60; // 15 minutos en segundos

        const updateCountdown = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            countdownElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 300 && timeLeft > 0) { // 5 minutos o menos
                countdownElement.style.color = 'var(--warning)';
                countdownElement.style.fontWeight = 'bold';
            }
            
            if (timeLeft <= 0) {
                countdownElement.textContent = '¡Comenzó!';
                countdownElement.style.color = 'var(--accent)';
                countdownElement.style.fontWeight = 'bold';
                clearInterval(countdownInterval);
            } else {
                timeLeft--;
            }
        };

        // Actualizar inmediatamente y cada segundo
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    // ==================== ANIMACIONES ====================
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.tournament-card, .table-row, .player-slot, .hero-content, .inscription-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ==================== NOTIFICACIONES ====================
    initNotifications() {
        // El sistema ya está implementado en showNotification
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');

        if (!notification || !notificationText) return;

        // Cambiar color según el tipo
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary)'
        };

        notification.style.background = colors[type] || colors.info;
        notificationText.textContent = message;
        notification.classList.add('show');

        // Ocultar después de 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// ==================== EFECTOS VISUALES ====================
function createBattleParticles() {
    const container = document.querySelector('.stars');
    if (!container) return;

    // Crear partículas de batalla (efectos especiales)
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = Math.random() * 3 + 1 + 'px';
        particle.style.background = i % 3 === 0 ? 'var(--accent)' : 
                                  i % 3 === 1 ? 'var(--primary-light)' : 'var(--warning)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.zIndex = '-1';
        particle.style.opacity = '0.6';
        container.appendChild(particle);

        // Animación de batalla
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.6 },
            { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1.5)`, opacity: 0 },
            { transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1)`, opacity: 0.6 }
        ], {
            duration: Math.random() * 3000 + 2000,
            iterations: Infinity
        });
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    const pvpManager = new MYDCRAFFPvP();
    createBattleParticles();
    
    // Efecto de carga inicial
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 100);
});

// ==================== FUNCIONES GLOBALES (para consola) ====================
// Estas funciones pueden ser útiles para debugging
window.MYDCRAFF = {
    clearAllData: function() {
        localStorage.removeItem('mydcraff_players');
        localStorage.removeItem('mydcraff_admin');
        location.reload();
    },
    
    getStats: function() {
        const players = JSON.parse(localStorage.getItem('mydcraff_players')) || [];
        return {
            total: players.length,
            confirmed: players.filter(p => p.status === 'confirmed').length,
            pending: players.filter(p => p.status === 'pending').length,
            rejected: players.filter(p => p.status === 'rejected').length
        };
    },
    
    addTestPlayers: function(count = 5) {
        const testNames = ['TestPlayer', 'DemoUser', 'ExampleGamer', 'SampleFighter', 'TrialCompetitor'];
        const players = JSON.parse(localStorage.getItem('mydcraff_players')) || [];
        
        for (let i = 0; i < count; i++) {
            players.push({
                id: Date.now() + i,
                name: `${testNames[i % testNames.length]}${i + 1}`,
                email: `test${i + 1}@example.com`,
                discord: `TestUser${i + 1}#1234`,
                status: 'pending',
                timestamp: new Date().toLocaleString('es-ES')
            });
        }
        
        localStorage.setItem('mydcraff_players', JSON.stringify(players));
        location.reload();
    }
};