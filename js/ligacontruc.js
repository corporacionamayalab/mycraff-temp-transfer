// MYDCRAFF Construcciones - Sistema completo con panel administrativo
class MYDCRAFFConstrucciones {
    constructor() {
        this.clanes = JSON.parse(localStorage.getItem('mydcraff_clanes')) || [];
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

        const pendingClanes = this.clanes.filter(c => c.status === 'pending');

        if (pendingClanes.length === 0) {
            pendingList.innerHTML = '<p class="no-players">No hay clanes pendientes de revisión</p>';
            return;
        }

        pendingList.innerHTML = pendingClanes.map(clan => `
            <div class="admin-clan-slot pending" data-id="${clan.id}">
                <div class="clan-avatar">
                    <i class="fas fa-users"></i>
                </div>
                <div class="admin-clan-info">
                    <span class="admin-clan-name">${clan.name}</span>
                    <div class="admin-clan-details">
                        <div><strong>Líder:</strong> ${clan.leader}</div>
                        <div><strong>Constructores:</strong> ${clan.members}</div>
                        <div><strong>Discord:</strong> ${clan.discord}</div>
                        <div><strong>Inscrito:</strong> ${clan.timestamp}</div>
                    </div>
                </div>
                <div class="admin-clan-actions">
                    <button class="btn btn-success btn-sm confirm-btn" data-id="${clan.id}">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                    <button class="btn btn-danger btn-sm reject-btn" data-id="${clan.id}">
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

        const confirmedClanes = this.clanes.filter(c => c.status === 'confirmed');

        if (confirmedClanes.length === 0) {
            confirmedList.innerHTML = '<p class="no-players">No hay clanes confirmados en el torneo</p>';
            return;
        }

        confirmedList.innerHTML = confirmedClanes.map(clan => `
            <div class="admin-clan-slot confirmed" data-id="${clan.id}">
                <div class="clan-avatar">
                    <i class="fas fa-users"></i>
                </div>
                <div class="admin-clan-info">
                    <span class="admin-clan-name">${clan.name}</span>
                    <div class="admin-clan-details">
                        <div><strong>Líder:</strong> ${clan.leader}</div>
                        <div><strong>Constructores:</strong> ${clan.members}</div>
                        <div><strong>Discord:</strong> ${clan.discord}</div>
                        <div><strong>Confirmado:</strong> ${clan.timestamp}</div>
                    </div>
                </div>
                <div class="admin-clan-actions">
                    <button class="btn btn-warning btn-sm remove-btn" data-id="${clan.id}">
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

        const rejectedClanes = this.clanes.filter(c => c.status === 'rejected');

        if (rejectedClanes.length === 0) {
            rejectedList.innerHTML = '<p class="no-players">No hay clanes rechazados</p>';
            return;
        }

        rejectedList.innerHTML = rejectedClanes.map(clan => `
            <div class="admin-clan-slot rejected" data-id="${clan.id}">
                <div class="clan-avatar">
                    <i class="fas fa-users"></i>
                </div>
                <div class="admin-clan-info">
                    <span class="admin-clan-name">${clan.name}</span>
                    <div class="admin-clan-details">
                        <div><strong>Líder:</strong> ${clan.leader}</div>
                        <div><strong>Constructores:</strong> ${clan.members}</div>
                        <div><strong>Discord:</strong> ${clan.discord}</div>
                        <div><strong>Rechazado:</strong> ${clan.timestamp}</div>
                    </div>
                </div>
                <div class="admin-clan-actions">
                    <button class="btn btn-success btn-sm restore-btn" data-id="${clan.id}">
                        <i class="fas fa-undo"></i> Restaurar
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${clan.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    attachAdminEventListeners() {
        // Confirmar clan
        document.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.closest('.confirm-btn').dataset.id);
                this.confirmClan(clanId);
            });
        });

        // Rechazar clan
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.closest('.reject-btn').dataset.id);
                this.rejectClan(clanId);
            });
        });

        // Quitar clan confirmado
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.closest('.remove-btn').dataset.id);
                this.removeClan(clanId);
            });
        });

        // Restaurar clan rechazado
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.closest('.restore-btn').dataset.id);
                this.restoreClan(clanId);
            });
        });

        // Eliminar permanentemente
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.closest('.delete-btn').dataset.id);
                if (confirm('¿Estás seguro de que quieres eliminar permanentemente este clan?')) {
                    this.deleteClan(clanId);
                }
            });
        });
    }

    updateManagementTab() {
        const totalClanes = this.clanes.length;
        const confirmedCount = this.clanes.filter(c => c.status === 'confirmed').length;
        const pendingCount = this.clanes.filter(c => c.status === 'pending').length;
        const rejectedCount = this.clanes.filter(c => c.status === 'rejected').length;

        document.getElementById('total-clanes').textContent = totalClanes;
        document.getElementById('confirmed-count').textContent = confirmedCount;
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('rejected-count').textContent = rejectedCount;

        // Botones de gestión
        const clearRejectedBtn = document.getElementById('clear-rejected');
        const clearAllBtn = document.getElementById('clear-all');
        const exportBtn = document.getElementById('export-data');

        if (clearRejectedBtn) {
            clearRejectedBtn.onclick = () => this.clearRejectedClanes();
        }

        if (clearAllBtn) {
            clearAllBtn.onclick = () => this.clearAllClanes();
        }

        if (exportBtn) {
            exportBtn.onclick = () => this.exportClanData();
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
        const clanNameInput = document.getElementById('clan-name');
        const leaderInput = document.getElementById('leader-name');
        const membersInput = document.getElementById('members-count');
        const discordInput = document.getElementById('clan-discord');

        const clanData = {
            id: Date.now(),
            name: clanNameInput.value.trim(),
            leader: leaderInput.value.trim(),
            members: parseInt(membersInput.value),
            discord: discordInput.value.trim(),
            status: 'pending',
            timestamp: new Date().toLocaleString('es-ES')
        };

        // Validaciones
        if (!clanData.name || !clanData.leader || !clanData.discord) {
            this.showNotification('❌ Por favor completa todos los campos', 'error');
            return;
        }

        if (clanData.name.length < 3) {
            this.showNotification('❌ El nombre del clan debe tener al menos 3 caracteres', 'error');
            return;
        }

        if (clanData.members < 1 || clanData.members > 8) {
            this.showNotification('❌ El clan debe tener entre 1 y 8 constructores', 'error');
            return;
        }

        // Verificar si el clan ya existe
        const existingClan = this.clanes.find(c => 
            c.name.toLowerCase() === clanData.name.toLowerCase()
        );

        if (existingClan) {
            this.showNotification('⚠️ Este clan ya está registrado en el sistema', 'warning');
            return;
        }

        // Verificar límite de clanes confirmados
        const confirmedClanes = this.clanes.filter(c => c.status === 'confirmed').length;
        if (confirmedClanes >= 3) {
            this.showNotification('❌ El torneo ya tiene 3 clanes confirmados. No se aceptan más inscripciones.', 'error');
            return;
        }

        // Guardar clan
        this.saveClan(clanData);
        
        // Limpiar formulario
        document.getElementById('inscription-form').reset();
        
        this.showNotification('✅ ¡Inscripción del clan enviada! Espera la confirmación de los administradores.', 'success');
        this.updateAllDisplays();
    }

    saveClan(clanData) {
        this.clanes.push(clanData);
        localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
    }

    // ==================== GESTIÓN DE CLANES ====================
    confirmClan(clanId) {
        const clanIndex = this.clanes.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            // Verificar que no exceda el límite de 3 clanes
            const confirmedClanes = this.clanes.filter(c => c.status === 'confirmed').length;
            if (confirmedClanes >= 3) {
                this.showNotification('❌ Ya hay 3 clanes confirmados. No se pueden confirmar más.', 'error');
                return;
            }

            this.clanes[clanIndex].status = 'confirmed';
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification(`✅ Clan ${this.clanes[clanIndex].name} confirmado en el torneo`, 'success');
            this.updateAllDisplays();
        }
    }

    rejectClan(clanId) {
        const clanIndex = this.clanes.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            this.clanes[clanIndex].status = 'rejected';
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification(`❌ Clan ${this.clanes[clanIndex].name} rechazado`, 'error');
            this.updateAllDisplays();
        }
    }

    removeClan(clanId) {
        const clanIndex = this.clanes.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            this.clanes[clanIndex].status = 'rejected';
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification(`⚠️ Clan ${this.clanes[clanIndex].name} removido del torneo`, 'warning');
            this.updateAllDisplays();
        }
    }

    restoreClan(clanId) {
        const clanIndex = this.clanes.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            this.clanes[clanIndex].status = 'pending';
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification(`🔄 Clan ${this.clanes[clanIndex].name} restaurado a pendiente`, 'success');
            this.updateAllDisplays();
        }
    }

    deleteClan(clanId) {
        const clanIndex = this.clanes.findIndex(c => c.id === clanId);
        if (clanIndex !== -1) {
            const clanName = this.clanes[clanIndex].name;
            this.clanes.splice(clanIndex, 1);
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification(`🗑️ Clan ${clanName} eliminado permanentemente`, 'success');
            this.updateAllDisplays();
        }
    }

    clearRejectedClanes() {
        const rejectedClanes = this.clanes.filter(c => c.status === 'rejected');
        
        if (rejectedClanes.length === 0) {
            this.showNotification('ℹ️ No hay clanes rechazados para limpiar', 'info');
            return;
        }

        if (confirm(`¿Estás seguro de que quieres eliminar permanentemente a ${rejectedClanes.length} clan(es) rechazado(s)?`)) {
            this.clanes = this.clanes.filter(c => c.status !== 'rejected');
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification(`🧹 ${rejectedClanes.length} clan(es) rechazado(s) eliminados`, 'success');
            this.updateAllDisplays();
        }
    }

    clearAllClanes() {
        if (this.clanes.length === 0) {
            this.showNotification('ℹ️ No hay clanes para limpiar', 'info');
            return;
        }

        if (confirm('⚠️ ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto eliminará TODOS los clanes (confirmados, pendientes y rechazados).\n\nEsta acción NO se puede deshacer.')) {
            this.clanes = [];
            localStorage.setItem('mydcraff_clanes', JSON.stringify(this.clanes));
            this.showNotification('💥 Todos los clanes han sido eliminados del sistema', 'warning');
            this.updateAllDisplays();
        }
    }

    exportClanData() {
        if (this.clanes.length === 0) {
            this.showNotification('ℹ️ No hay datos para exportar', 'info');
            return;
        }

        const dataStr = JSON.stringify(this.clanes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mydcraff_clanes_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showNotification('📥 Datos exportados correctamente', 'success');
    }

    // ==================== ACTUALIZACIONES DE INTERFAZ ====================
    updateAllDisplays() {
        this.updateConfirmedClanes();
        this.updateClanesCount();
        
        if (this.isAdminLoggedIn) {
            this.updateAdminPanel();
        }
    }

    updateConfirmedClanes() {
        const confirmedList = document.getElementById('confirmed-clans-list');
        const titleElement = document.getElementById('confirmed-clans-title');

        if (!confirmedList || !titleElement) return;

        const confirmedClanes = this.clanes.filter(c => c.status === 'confirmed');
        titleElement.textContent = `Clanes Inscritos (${confirmedClanes.length}/3)`;

        if (confirmedClanes.length === 0) {
            confirmedList.innerHTML = '<p class="no-players">No hay clanes confirmados todavía</p>';
        } else {
            confirmedList.innerHTML = confirmedClanes.map(clan => `
                <div class="clan-slot" data-status="confirmed">
                    <div class="clan-avatar">
                        <i class="fas fa-users"></i>
                    </div>
                    <span class="clan-name">${clan.name}</span>
                    <span class="clan-status confirmed">${clan.members} constructores</span>
                </div>
            `).join('');
        }

        this.updateJoinButton(confirmedClanes.length);
    }

    updateClanesCount() {
        const countElement = document.getElementById('clans-count');
        if (!countElement) return;

        const confirmedCount = this.clanes.filter(c => c.status === 'confirmed').length;
        
        if (confirmedCount >= 3) {
            countElement.innerHTML = '<strong>3/3 Clanes</strong><span>Lleno - Listo para comenzar</span>';
        } else {
            countElement.innerHTML = `<strong>${confirmedCount}/3 Clanes</strong><span>Inscripciones abiertas</span>`;
        }
    }

    updateJoinButton(confirmedCount) {
        const joinButton = document.getElementById('join-tournament');
        if (!joinButton) return;

        if (confirmedCount >= 3) {
            joinButton.innerHTML = '<i class="fas fa-door-open"></i> Torneo Lleno';
            joinButton.disabled = true;
        } else {
            joinButton.innerHTML = '<i class="fas fa-users"></i> Inscribir Clan';
            joinButton.disabled = false;
        }
    }

    // ==================== COUNTDOWN ====================
    initCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        let timeLeft = 20 * 60; // 20 minutos en segundos

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
        document.querySelectorAll('.tournament-card, .table-row, .clan-slot, .hero-content, .inscription-card').forEach(el => {
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
function createConstructionParticles() {
    const container = document.querySelector('.stars');
    if (!container) return;

    // Crear partículas de construcción (efectos especiales)
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = Math.random() * 4 + 2 + 'px';
        particle.style.background = i % 3 === 0 ? 'var(--accent)' : 
                                  i % 3 === 1 ? 'var(--primary-light)' : 'var(--primary)';
        particle.style.borderRadius = i % 2 === 0 ? '50%' : '2px';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.zIndex = '-1';
        particle.style.opacity = '0.4';
        container.appendChild(particle);

        // Animación de construcción (más lenta y suave)
        particle.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 0.4 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg)`, opacity: 0.8 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg)`, opacity: 0.4 }
        ], {
            duration: Math.random() * 5000 + 3000,
            iterations: Infinity
        });
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    const construccionesManager = new MYDCRAFFConstrucciones();
    createConstructionParticles();
    
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
        localStorage.removeItem('mydcraff_clanes');
        localStorage.removeItem('mydcraff_admin');
        location.reload();
    },
    
    getStats: function() {
        const clanes = JSON.parse(localStorage.getItem('mydcraff_clanes')) || [];
        return {
            total: clanes.length,
            confirmed: clanes.filter(c => c.status === 'confirmed').length,
            pending: clanes.filter(c => c.status === 'pending').length,
            rejected: clanes.filter(c => c.status === 'rejected').length
        };
    },
    
    addTestClanes: function(count = 2) {
        const testNames = ['Arquitectos Elite', 'Build Masters', 'Creative Crew', 'Block Artists'];
        const testLeaders = ['MasterBuilder', 'DesignPro', 'CreativeMind', 'BlockMaster'];
        const clanes = JSON.parse(localStorage.getItem('mydcraff_clanes')) || [];
        
        for (let i = 0; i < count; i++) {
            clanes.push({
                id: Date.now() + i,
                name: `${testNames[i % testNames.length]}`,
                leader: `${testLeaders[i % testLeaders.length]}`,
                members: Math.floor(Math.random() * 8) + 1,
                discord: `Clan${i + 1}#1234`,
                status: 'pending',
                timestamp: new Date().toLocaleString('es-ES')
            });
        }
        
        localStorage.setItem('mydcraff_clanes', JSON.stringify(clanes));
        location.reload();
    }
};