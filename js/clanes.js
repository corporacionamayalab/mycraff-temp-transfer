// MYDCRAFF Clanes - Sistema completo de inscripción con administración
class MYDCRAFFClanesInscripcion {
    constructor() {
        this.clans = JSON.parse(localStorage.getItem('mydcraff_tournament_clans')) || [];
        this.adminCredentials = {
            username: 'admin',
            password: 'clanes2024' // CAMBIAR EN PRODUCCIÓN
        };
        this.isAdminLoggedIn = localStorage.getItem('mydcraff_clan_admin') === 'true';
        this.currentPlayerCount = 2; // Líder + Jugador 2 inicial
        this.maxPlayers = 10;
        this.init();
    }

    init() {
        this.initModals();
        this.initFormHandlers();
        this.initAdminSystem();
        this.initNotifications();
        this.updateUI();
        
        if (this.isAdminLoggedIn) {
            this.showAdminPanel();
        }
    }

    // ==================== SISTEMA DE INSCRIPCIÓN ====================
    initModals() {
        const inscribirBtn = document.getElementById('inscribir-clan');
        const startBtn = document.getElementById('start-inscription');
        const modal = document.getElementById('inscripcion-modal');
        const closeBtns = document.querySelectorAll('.modal-close');

        // Abrir modal de inscripción
        [inscribirBtn, startBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    modal.classList.add('show');
                    this.resetForm();
                });
            }
        });

        // Cerrar modales
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });

        // Cerrar modal al hacer click fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    }

    initFormHandlers() {
        const form = document.getElementById('clan-inscription-form');
        const addPlayerBtn = document.getElementById('add-player');

        // Enviar formulario
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitClanInscription(form);
            });
        }

        // Agregar jugador
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => {
                this.addPlayerForm();
            });
        }

        // Contador de jugadores en tiempo real
        this.updatePlayerCounter();
    }

    addPlayerForm() {
        if (this.currentPlayerCount >= this.maxPlayers) return;

        this.currentPlayerCount++;
        const playersContainer = document.getElementById('players-container');
        
        const playerForm = document.createElement('div');
        playerForm.className = 'player-form';
        playerForm.setAttribute('data-player', this.currentPlayerCount);
        playerForm.innerHTML = `
            <div class="player-header">
                <span class="player-number">Jugador ${this.currentPlayerCount}</span>
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

        playersContainer.appendChild(playerForm);

        // Agregar event listener al botón de eliminar
        const removeBtn = playerForm.querySelector('.remove-player');
        removeBtn.addEventListener('click', () => {
            this.removePlayerForm(playerForm);
        });

        this.updatePlayerCounter();
    }

    removePlayerForm(playerForm) {
        playerForm.style.opacity = '0';
        playerForm.style.transform = 'translateX(-20px)';
        playerForm.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            playerForm.remove();
            this.currentPlayerCount--;
            
            // Renumerar jugadores
            this.renumberPlayers();
            this.updatePlayerCounter();
        }, 300);
    }

    renumberPlayers() {
        const playerForms = document.querySelectorAll('.player-form:not(.leader)');
        playerForms.forEach((form, index) => {
            const playerNumber = form.querySelector('.player-number');
            if (playerNumber) {
                playerNumber.textContent = `Jugador ${index + 2}`;
                form.setAttribute('data-player', index + 2);
            }
        });
    }

    updatePlayerCounter() {
        const counter = document.getElementById('players-counter');
        const addBtn = document.getElementById('add-player');

        if (counter) {
            counter.textContent = `${this.currentPlayerCount}/${this.maxPlayers} jugadores`;
        }

        if (addBtn) {
            if (this.currentPlayerCount >= this.maxPlayers) {
                addBtn.disabled = true;
                addBtn.innerHTML = '<i class="fas fa-ban"></i> Límite alcanzado';
            } else {
                addBtn.disabled = false;
                addBtn.innerHTML = `<i class="fas fa-plus"></i> Agregar Jugador (${this.currentPlayerCount}/${this.maxPlayers})`;
            }
        }
    }

    resetForm() {
        this.currentPlayerCount = 2;
        
        // Remover jugadores adicionales
        const additionalPlayers = document.querySelectorAll('.player-form:not(.leader)');
        additionalPlayers.forEach((player, index) => {
            if (index > 0) { // Mantener solo el jugador 2
                player.remove();
            }
        });

        // Resetear formularios
        const form = document.getElementById('clan-inscription-form');
        if (form) {
            form.reset();
        }

        this.updatePlayerCounter();
    }

    submitClanInscription(form) {
        const formData = new FormData(form);
        const clanName = document.getElementById('clan-name').value;
        const clanTag = document.getElementById('clan-tag').value;
        const clanDescription = document.getElementById('clan-description').value;

        // Validaciones básicas
        if (!clanName || !clanTag || !clanDescription) {
            this.showNotification('❌ Por favor, completa toda la información del clan.', 'error');
            return;
        }

        // Validar jugadores
        const players = this.collectPlayersData();
        if (players.length < 2) {
            this.showNotification('❌ Debes incluir al menos 2 jugadores (líder + 1).', 'error');
            return;
        }

        if (players.length > this.maxPlayers) {
            this.showNotification(`❌ Máximo ${this.maxPlayers} jugadores permitidos.`, 'error');
            return;
        }

        // Verificar clan único
        const existingClan = this.clans.find(clan => 
            clan.name.toLowerCase() === clanName.toLowerCase() || 
            clan.tag.toLowerCase() === clanTag.toLowerCase()
        );

        if (existingClan) {
            this.showNotification('❌ Ya existe un clan con ese nombre o tag.', 'error');
            return;
        }

        // Crear objeto clan
        const clanData = {
            id: Date.now(),
            name: clanName,
            tag: clanTag,
            description: clanDescription,
            players: players,
            status: 'pending',
            timestamp: new Date().toLocaleString('es-ES'),
            submissionDate: new Date().toISOString()
        };

        // Guardar clan
        this.saveClan(clanData);
        
        // Cerrar modal y mostrar confirmación
        document.getElementById('inscripcion-modal').classList.remove('show');
        form.reset();
        
        this.showNotification('✅ ¡Clan inscrito exitosamente! En revisión por administradores.', 'success');
        this.updateUI();
    }

    collectPlayersData() {
        const players = [];
        const playerForms = document.querySelectorAll('.player-form');

        playerForms.forEach((form, index) => {
            const nameInput = form.querySelector('input[name="player-name[]"]');
            const discordInput = form.querySelector('input[name="player-discord[]"]');
            const emailInput = form.querySelector('input[name="player-email[]"]');
            const roleSelect = form.querySelector('select[name="player-role[]"]');

            if (nameInput && discordInput && emailInput && roleSelect) {
                players.push({
                    number: index + 1,
                    name: nameInput.value,
                    discord: discordInput.value,
                    email: emailInput.value,
                    role: roleSelect.value,
                    isLeader: form.classList.contains('leader')
                });
            }
        });

        return players;
    }

    saveClan(clanData) {
        this.clans.push(clanData);
        localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
    }

    // ==================== INTERFAZ DE USUARIO ====================
    updateUI() {
        this.updateStatusDisplay();
        this.updateAcceptedClans();
    }

    updateStatusDisplay() {
        const userClan = this.getUserClan();
        
        // Ocultar todos los estados primero
        document.getElementById('status-pending').style.display = 'none';
        document.getElementById('status-confirmed').style.display = 'none';
        document.getElementById('status-rejected').style.display = 'none';
        document.getElementById('status-empty').style.display = 'none';

        if (!userClan) {
            document.getElementById('status-empty').style.display = 'flex';
            return;
        }

        switch (userClan.status) {
            case 'pending':
                this.showPendingStatus(userClan);
                break;
            case 'accepted':
                this.showAcceptedStatus(userClan);
                break;
            case 'rejected':
                this.showRejectedStatus(userClan);
                break;
        }
    }

    getUserClan() {
        // En un sistema real, esto identificaría al usuario actual
        // Por ahora, mostramos el primer clan pendiente o aceptado
        return this.clans.find(clan => clan.status === 'accepted') || 
               this.clans.find(clan => clan.status === 'pending') ||
               this.clans.find(clan => clan.status === 'rejected');
    }

    showPendingStatus(clan) {
        const statusElement = document.getElementById('status-pending');
        const detailsElement = document.getElementById('pending-details');
        
        statusElement.style.display = 'flex';
        detailsElement.innerHTML = `
            <div class="clan-info-mini">
                <strong>${clan.name} ${clan.tag}</strong>
                <p>${clan.players.length} jugadores inscritos</p>
                <p><small>Enviado: ${clan.timestamp}</small></p>
            </div>
            <div class="status-message">
                <p>Los administradores revisarán tu clan en las próximas 24-48 horas.</p>
            </div>
        `;
    }

    showAcceptedStatus(clan) {
        const statusElement = document.getElementById('status-confirmed');
        const detailsElement = document.getElementById('confirmed-details');
        
        statusElement.style.display = 'flex';
        detailsElement.innerHTML = `
            <div class="clan-info-mini">
                <strong>${clan.name} ${clan.tag}</strong>
                <p>✅ Aceptado en el torneo</p>
                <p><small>Aceptado: ${clan.timestamp}</small></p>
            </div>
            <div class="players-list-mini">
                <strong>Jugadores aceptados:</strong>
                ${clan.players.map(player => 
                    `<div class="player-mini ${player.isLeader ? 'leader' : ''}">
                        ${player.number}. ${player.name} - ${player.role}
                        ${player.isLeader ? ' <i class="fas fa-crown"></i>' : ''}
                    </div>`
                ).join('')}
            </div>
        `;
    }

    showRejectedStatus(clan) {
        const statusElement = document.getElementById('status-rejected');
        const detailsElement = document.getElementById('rejected-details');
        
        statusElement.style.display = 'flex';
        detailsElement.innerHTML = `
            <div class="clan-info-mini">
                <strong>${clan.name} ${clan.tag}</strong>
                <p>❌ Inscripción rechazada</p>
                <p><small>Rechazado: ${clan.timestamp}</small></p>
            </div>
            <div class="rejection-reason">
                <strong>Razón:</strong>
                <p>El clan no cumple con los requisitos mínimos del torneo.</p>
            </div>
            <div class="rejection-actions">
                <button class="btn btn-primary btn-sm" onclick="clanesManager.editClanInscription()">
                    <i class="fas fa-edit"></i> Corregir y Reenviar
                </button>
            </div>
        `;
    }

    updateAcceptedClans() {
        const grid = document.getElementById('clanes-grid');
        const acceptedClans = this.clans.filter(clan => clan.status === 'accepted');

        if (acceptedClans.length === 0) {
            grid.innerHTML = '<p class="no-clans">Aún no hay clanes aceptados en el torneo.</p>';
            return;
        }

        grid.innerHTML = acceptedClans.map(clan => `
            <div class="clan-card-tournament">
                <div class="clan-header-tournament">
                    <div class="clan-icon-tournament">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="clan-info-tournament">
                        <h4>${clan.name}</h4>
                        <span class="clan-tag-tournament">${clan.tag}</span>
                    </div>
                </div>
                <div class="clan-description">
                    <p>${clan.description}</p>
                </div>
                <div class="clan-players">
                    ${clan.players.map(player => `
                        <div class="player-item ${player.isLeader ? 'leader' : ''}">
                            <span class="player-name">${player.name}</span>
                            <span class="player-role">${player.role}</span>
                            ${player.isLeader ? '<i class="fas fa-crown"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    editClanInscription() {
        const userClan = this.getUserClan();
        if (userClan) {
            // Cargar datos en el formulario
            document.getElementById('clan-name').value = userClan.name;
            document.getElementById('clan-tag').value = userClan.tag;
            document.getElementById('clan-description').value = userClan.description;
            
            // Abrir modal
            document.getElementById('inscripcion-modal').classList.add('show');
            
            // Remover clan antiguo
            this.clans = this.clans.filter(clan => clan.id !== userClan.id);
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
        }
    }

    // ==================== SISTEMA DE ADMINISTRACIÓN ====================
    initAdminSystem() {
        const loginLink = document.getElementById('admin-login-link');
        const loginModal = document.getElementById('login-modal');
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-admin');

        // Abrir modal de login
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleAdminLogout();
            });
        }

        // Tabs del panel admin
        this.initAdminTabs();
        
        // Botones de gestión
        this.initAdminActions();
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    handleAdminLogin() {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            
            this.isAdminLoggedIn = true;
            localStorage.setItem('mydcraff_clan_admin', 'true');
            
            this.hideLoginModal();
            this.showAdminPanel();
            this.showNotification('✅ Acceso administrativo concedido', 'success');
            
        } else {
            this.showNotification('❌ Credenciales incorrectas', 'error');
        }
    }

    handleAdminLogout() {
        this.isAdminLoggedIn = false;
        localStorage.removeItem('mydcraff_clan_admin');
        this.hideAdminPanel();
        this.showNotification('🔒 Sesión administrativa cerrada', 'info');
    }

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

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('show');
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
        this.updateAdminTab('accepted');
        this.updateAdminTab('rejected');
        this.updateAdminTab('stats');
    }

    updateAdminTab(tabId) {
        switch(tabId) {
            case 'pending':
                this.updatePendingClans();
                break;
            case 'accepted':
                this.updateAcceptedClansAdmin();
                break;
            case 'rejected':
                this.updateRejectedClans();
                break;
            case 'stats':
                this.updateStatsTab();
                break;
        }
    }

    updatePendingClans() {
        const list = document.getElementById('pending-clans-list');
        const pendingClans = this.clans.filter(clan => clan.status === 'pending');

        if (pendingClans.length === 0) {
            list.innerHTML = '<p class="no-clans">No hay clanes pendientes de revisión.</p>';
            return;
        }

        list.innerHTML = pendingClans.map(clan => `
            <div class="admin-clan-card pending" data-clan-id="${clan.id}">
                <div class="admin-clan-header">
                    <div class="admin-clan-info">
                        <h4>${clan.name}</h4>
                        <div class="admin-clan-tag">${clan.tag}</div>
                        <div class="clan-timestamp">Enviado: ${clan.timestamp}</div>
                    </div>
                </div>
                
                <div class="clan-description">
                    <p>${clan.description}</p>
                </div>

                <div class="admin-players-list">
                    ${clan.players.map(player => `
                        <div class="admin-player-item ${player.isLeader ? 'leader' : ''}">
                            <div class="admin-player-info">
                                <span class="admin-player-name">${player.name}</span>
                                <span class="admin-player-discord">${player.discord}</span>
                            </div>
                            <span class="admin-player-role">${player.role}</span>
                            ${player.isLeader ? '<i class="fas fa-crown" title="Líder"></i>' : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="admin-clan-actions">
                    <button class="btn btn-success btn-sm accept-clan" data-clan-id="${clan.id}">
                        <i class="fas fa-check"></i> Aceptar
                    </button>
                    <button class="btn btn-danger btn-sm reject-clan" data-clan-id="${clan.id}">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                    <button class="btn btn-info btn-sm view-details" data-clan-id="${clan.id}">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    updateAcceptedClansAdmin() {
        const list = document.getElementById('accepted-clans-list');
        const acceptedClans = this.clans.filter(clan => clan.status === 'accepted');

        if (acceptedClans.length === 0) {
            list.innerHTML = '<p class="no-clans">No hay clanes aceptados en el torneo.</p>';
            return;
        }

        list.innerHTML = acceptedClans.map(clan => `
            <div class="admin-clan-card accepted" data-clan-id="${clan.id}">
                <div class="admin-clan-header">
                    <div class="admin-clan-info">
                        <h4>${clan.name}</h4>
                        <div class="admin-clan-tag">${clan.tag}</div>
                        <div class="clan-timestamp">Aceptado: ${clan.timestamp}</div>
                    </div>
                </div>
                
                <div class="admin-players-list">
                    ${clan.players.map(player => `
                        <div class="admin-player-item ${player.isLeader ? 'leader' : ''}">
                            <div class="admin-player-info">
                                <span class="admin-player-name">${player.name}</span>
                                <span class="admin-player-discord">${player.discord}</span>
                            </div>
                            <span class="admin-player-role">${player.role}</span>
                            ${player.isLeader ? '<i class="fas fa-crown" title="Líder"></i>' : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="admin-clan-actions">
                    <button class="btn btn-warning btn-sm revoke-clan" data-clan-id="${clan.id}">
                        <i class="fas fa-undo"></i> Revocar
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    updateRejectedClans() {
        const list = document.getElementById('rejected-clans-list');
        const rejectedClans = this.clans.filter(clan => clan.status === 'rejected');

        if (rejectedClans.length === 0) {
            list.innerHTML = '<p class="no-clans">No hay clanes rechazados.</p>';
            return;
        }

        list.innerHTML = rejectedClans.map(clan => `
            <div class="admin-clan-card rejected" data-clan-id="${clan.id}">
                <div class="admin-clan-header">
                    <div class="admin-clan-info">
                        <h4>${clan.name}</h4>
                        <div class="admin-clan-tag">${clan.tag}</div>
                        <div class="clan-timestamp">Rechazado: ${clan.timestamp}</div>
                    </div>
                </div>

                <div class="admin-clan-actions">
                    <button class="btn btn-success btn-sm restore-clan" data-clan-id="${clan.id}">
                        <i class="fas fa-undo"></i> Restaurar
                    </button>
                    <button class="btn btn-danger btn-sm delete-clan" data-clan-id="${clan.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        this.attachAdminEventListeners();
    }

    updateStatsTab() {
        const totalClans = this.clans.length;
        const acceptedCount = this.clans.filter(clan => clan.status === 'accepted').length;
        const pendingCount = this.clans.filter(clan => clan.status === 'pending').length;
        const rejectedCount = this.clans.filter(clan => clan.status === 'rejected').length;
        
        const totalPlayers = this.clans.reduce((sum, clan) => sum + clan.players.length, 0);
        const capacity = Math.min(100, Math.round((acceptedCount / 20) * 100)); // Máximo 20 clanes

        document.getElementById('total-clans').textContent = totalClans;
        document.getElementById('accepted-count').textContent = acceptedCount;
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('rejected-count').textContent = rejectedCount;
        document.getElementById('total-players').textContent = totalPlayers;
        document.getElementById('capacity').textContent = `${capacity}%`;
    }

    attachAdminEventListeners() {
        // Aceptar clan
        document.querySelectorAll('.accept-clan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.dataset.clanId);
                this.acceptClan(clanId);
            });
        });

        // Rechazar clan
        document.querySelectorAll('.reject-clan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.dataset.clanId);
                this.rejectClan(clanId);
            });
        });

        // Revocar aceptación
        document.querySelectorAll('.revoke-clan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.dataset.clanId);
                this.revokeClan(clanId);
            });
        });

        // Restaurar clan rechazado
        document.querySelectorAll('.restore-clan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.dataset.clanId);
                this.restoreClan(clanId);
            });
        });

        // Eliminar clan
        document.querySelectorAll('.delete-clan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clanId = parseInt(e.target.dataset.clanId);
                if (confirm('¿Estás seguro de que quieres eliminar permanentemente este clan?')) {
                    this.deleteClan(clanId);
                }
            });
        });
    }

    initAdminActions() {
        const clearRejectedBtn = document.getElementById('clear-rejected');
        const clearAllBtn = document.getElementById('clear-all');
        const exportBtn = document.getElementById('export-data');

        if (clearRejectedBtn) {
            clearRejectedBtn.addEventListener('click', () => this.clearRejectedClans());
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllClans());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportClanData());
        }
    }

    acceptClan(clanId) {
        const clan = this.clans.find(c => c.id === clanId);
        if (clan) {
            clan.status = 'accepted';
            clan.timestamp = new Date().toLocaleString('es-ES');
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
            
            this.showNotification(`✅ Clan "${clan.name}" aceptado en el torneo`, 'success');
            this.updateAdminPanel();
            this.updateUI();
        }
    }

    rejectClan(clanId) {
        const clan = this.clans.find(c => c.id === clanId);
        if (clan) {
            clan.status = 'rejected';
            clan.timestamp = new Date().toLocaleString('es-ES');
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
            
            this.showNotification(`❌ Clan "${clan.name}" rechazado`, 'error');
            this.updateAdminPanel();
            this.updateUI();
        }
    }

    revokeClan(clanId) {
        const clan = this.clans.find(c => c.id === clanId);
        if (clan) {
            clan.status = 'pending';
            clan.timestamp = new Date().toLocaleString('es-ES');
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
            
            this.showNotification(`🔄 Clan "${clan.name}" revocado a pendiente`, 'warning');
            this.updateAdminPanel();
            this.updateUI();
        }
    }

    restoreClan(clanId) {
        const clan = this.clans.find(c => c.id === clanId);
        if (clan) {
            clan.status = 'pending';
            clan.timestamp = new Date().toLocaleString('es-ES');
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
            
            this.showNotification(`🔄 Clan "${clan.name}" restaurado a pendiente`, 'success');
            this.updateAdminPanel();
            this.updateUI();
        }
    }

    deleteClan(clanId) {
        this.clans = this.clans.filter(c => c.id !== clanId);
        localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
        
        this.showNotification('🗑️ Clan eliminado permanentemente', 'success');
        this.updateAdminPanel();
        this.updateUI();
    }

    clearRejectedClans() {
        const rejectedClans = this.clans.filter(clan => clan.status === 'rejected');
        if (rejectedClans.length === 0) {
            this.showNotification('ℹ️ No hay clanes rechazados para limpiar', 'info');
            return;
        }

        if (confirm(`¿Eliminar permanentemente ${rejectedClans.length} clan(es) rechazado(s)?`)) {
            this.clans = this.clans.filter(clan => clan.status !== 'rejected');
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
            this.showNotification(`🧹 ${rejectedClans.length} clan(es) rechazado(s) eliminados`, 'success');
            this.updateAdminPanel();
            this.updateUI();
        }
    }

    clearAllClans() {
        if (this.clans.length === 0) {
            this.showNotification('ℹ️ No hay clanes para limpiar', 'info');
            return;
        }

        if (confirm('⚠️ ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto eliminará TODOS los clanes (aceptados, pendientes y rechazados).\n\nEsta acción NO se puede deshacer.')) {
            this.clans = [];
            localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(this.clans));
            this.showNotification('💥 Todos los clanes han sido eliminados', 'warning');
            this.updateAdminPanel();
            this.updateUI();
        }
    }

    exportClanData() {
        if (this.clans.length === 0) {
            this.showNotification('ℹ️ No hay datos para exportar', 'info');
            return;
        }

        const dataStr = JSON.stringify(this.clans, null, 2);
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

    // ==================== NOTIFICACIONES ====================
    initNotifications() {
        // Ya está implementado en showNotification
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');

        if (!notification || !notificationText) return;

        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary)'
        };

        notification.style.background = colors[type] || colors.info;
        notificationText.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.clanesManager = new MYDCRAFFClanesInscripcion();
});

// Funciones globales para testing
window.MYDCRAFF_CLANES = {
    addTestClan: function() {
        const testClan = {
            id: Date.now(),
            name: 'Clan de Prueba',
            tag: '[TEST]',
            description: 'Este es un clan de prueba para testing',
            players: [
                { number: 1, name: 'LiderTest', discord: 'Lider#1234', email: 'lider@test.com', role: 'pvp', isLeader: true },
                { number: 2, name: 'JugadorTest', discord: 'Jugador#5678', email: 'jugador@test.com', role: 'support', isLeader: false }
            ],
            status: 'pending',
            timestamp: new Date().toLocaleString('es-ES'),
            submissionDate: new Date().toISOString()
        };
        
        const manager = window.clanesManager;
        manager.clans.push(testClan);
        localStorage.setItem('mydcraff_tournament_clans', JSON.stringify(manager.clans));
        manager.updateUI();
        manager.showNotification('Clan de prueba agregado', 'success');
    },
    
    clearTestData: function() {
        localStorage.removeItem('mydcraff_tournament_clans');
        localStorage.removeItem('mydcraff_clan_admin');
        location.reload();
    }
};  