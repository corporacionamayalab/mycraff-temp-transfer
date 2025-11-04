// MYDCRAFF Clanes - Script para el sistema de clanes
class MYDCRAFFClanes {
    constructor() {
        this.init();
    }

    init() {
        this.initModals();
        this.initClanActions();
        this.initAnimations();
        this.initNotifications();
        this.initWarSchedule();
    }

    // Modales
    initModals() {
        const createClanBtn = document.getElementById('create-clan');
        const modal = document.getElementById('create-clan-modal');
        const closeBtns = document.querySelectorAll('.modal-close');
        const clanForm = document.querySelector('.clan-form');

        // Abrir modal crear clan
        if (createClanBtn && modal) {
            createClanBtn.addEventListener('click', () => {
                modal.classList.add('show');
            });
        }

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

        // Enviar formulario de clan
        if (clanForm) {
            clanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createClan(clanForm);
            });
        }
    }

    // Crear clan
    createClan(form) {
        const formData = new FormData(form);
        const clanName = document.getElementById('clan-name').value;
        const clanTag = document.getElementById('clan-tag').value;

        if (!clanName || !clanTag) {
            this.showNotification('Por favor, completa todos los campos.', 'error');
            return;
        }

        // Simular creación de clan
        this.showNotification('Creando clan...', 'info');

        setTimeout(() => {
            document.getElementById('create-clan-modal').classList.remove('show');
            form.reset();
            this.showNotification(`¡Clan "${clanName}" creado exitosamente!`, 'success');
            
            // Simular actualización de la lista de clanes
            this.simulateNewClan(clanName, clanTag);
        }, 2000);
    }

    // Simular nuevo clan en el ranking
    simulateNewClan(name, tag) {
        const rankingTable = document.querySelector('.ranking-table');
        if (rankingTable) {
            const newRow = document.createElement('div');
            newRow.className = 'table-row';
            newRow.innerHTML = `
                <span class="rank">48</span>
                <span class="clan-info">
                    <i class="fas fa-star"></i>
                    ${name} ${tag}
                </span>
                <span class="points">0</span>
                <span>0</span>
                <span>1/30</span>
                <span class="level">1</span>
            `;
            
            // Agregar con animación
            newRow.style.opacity = '0';
            newRow.style.transform = 'translateY(20px)';
            rankingTable.appendChild(newRow);
            
            setTimeout(() => {
                newRow.style.opacity = '1';
                newRow.style.transform = 'translateY(0)';
                newRow.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }, 100);
        }
    }

    // Acciones de clanes
    initClanActions() {
        // Botones de solicitud de unión
        document.querySelectorAll('.btn-small.btn-secondary').forEach(btn => {
            if (btn.textContent.includes('Solicitar')) {
                btn.addEventListener('click', (e) => {
                    const clanCard = e.target.closest('.clan-card');
                    const clanName = clanCard.querySelector('h3').textContent;
                    this.sendJoinRequest(clanName);
                });
            }
        });

        // Botones de ver perfil
        document.querySelectorAll('.btn-small.btn-primary').forEach(btn => {
            if (btn.textContent.includes('Ver Perfil')) {
                btn.addEventListener('click', (e) => {
                    const clanCard = e.target.closest('.clan-card');
                    const clanName = clanCard.querySelector('h3').textContent;
                    this.showNotification(`Mostrando perfil de: ${clanName}`, 'info');
                });
            }
        });

        // Unirse a clan
        const joinClanBtn = document.getElementById('join-clan');
        if (joinClanBtn) {
            joinClanBtn.addEventListener('click', () => {
                this.showNotification('Buscando clanes disponibles...', 'info');
            });
        }

        // Recordatorios de guerra
        document.querySelectorAll('.btn-small.btn-secondary').forEach(btn => {
            if (btn.textContent.includes('Recordarme')) {
                btn.addEventListener('click', (e) => {
                    const scheduleItem = e.target.closest('.schedule-item');
                    const warInfo = scheduleItem.querySelector('.clan-name').textContent;
                    this.setWarReminder(warInfo);
                });
            }
        });

        // Ver transmisión
        document.querySelectorAll('.btn-small.btn-accent').forEach(btn => {
            if (btn.textContent.includes('Transmisión')) {
                btn.addEventListener('click', () => {
                    this.showNotification('Redirigiendo a la transmisión en vivo...', 'info');
                    // window.open('https://twitch.tv/tucanal', '_blank');
                });
            }
        });
    }

    // Enviar solicitud de unión
    sendJoinRequest(clanName) {
        this.showNotification(`Enviando solicitud a: ${clanName}`, 'info');
        
        setTimeout(() => {
            this.showNotification(`Solicitud enviada a ${clanName}. Espera su respuesta.`, 'success');
        }, 1500);
    }

    // Programar recordatorio de guerra
    setWarReminder(warInfo) {
        this.showNotification(`Recordatorio programado para: ${warInfo}`, 'success');
    }

    // Animaciones
    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Efectos especiales para tarjetas de clan
                    if (entry.target.classList.contains('clan-card')) {
                        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                        entry.target.style.transitionDelay = `${delay}ms`;
                    }
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.clan-card, .system-card, .war-type, .schedule-item, .table-row').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Calendario de guerras
    initWarSchedule() {
        // Actualizar tiempos en tiempo real
        setInterval(() => {
            this.updateWarTimes();
        }, 60000); // Cada minuto

        this.updateWarTimes();
    }

    // Actualizar tiempos de guerra
    updateWarTimes() {
        const scheduleItems = document.querySelectorAll('.schedule-item');
        
        scheduleItems.forEach(item => {
            const timeElement = item.querySelector('.time');
            const dateElement = item.querySelector('.date');
            
            if (timeElement && dateElement) {
                const now = new Date();
                const warTime = this.parseWarTime(dateElement.textContent, timeElement.textContent);
                
                if (warTime) {
                    const diff = warTime - now;
                    if (diff > 0) {
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        
                        if (hours > 0) {
                            timeElement.textContent = `En ${hours}h ${minutes}m`;
                        } else {
                            timeElement.textContent = `En ${minutes}m`;
                        }
                    } else {
                        timeElement.textContent = '¡En vivo!';
                        timeElement.style.color = 'var(--accent)';
                        timeElement.style.fontWeight = 'bold';
                    }
                }
            }
        });
    }

    // Parsear tiempo de guerra
    parseWarTime(dateStr, timeStr) {
        const now = new Date();
        let warDate = new Date();
        
        if (dateStr === 'Hoy') {
            // Mantener la fecha actual
        } else if (dateStr === 'Mañana') {
            warDate.setDate(warDate.getDate() + 1);
        }
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        warDate.setHours(hours, minutes, 0, 0);
        
        return warDate;
    }

    // Simular actualizaciones en tiempo real
    simulateLiveUpdates() {
        setInterval(() => {
            this.updateClanStats();
        }, 10000); // Cada 10 segundos
    }

    // Actualizar estadísticas de clanes
    updateClanStats() {
        const clanStats = document.querySelectorAll('.clan-stats');
        
        clanStats.forEach(stats => {
            const pointsElement = stats.querySelector('.stat-value:nth-child(1)');
            const victoriesElement = stats.querySelector('.stat-value:nth-child(2)');
            
            if (pointsElement && Math.random() > 0.8) { // 20% de probabilidad
                const currentPoints = parseInt(pointsElement.textContent.replace(/,/g, ''));
                const newPoints = currentPoints + Math.floor(Math.random() * 10);
                pointsElement.textContent = newPoints.toLocaleString();
            }
            
            if (victoriesElement && Math.random() > 0.9) { // 10% de probabilidad
                const currentVictories = parseInt(victoriesElement.textContent);
                const newVictories = currentVictories + 1;
                victoriesElement.textContent = newVictories;
                
                // Mostrar notificación de victoria
                const clanName = stats.closest('.clan-card').querySelector('h3').textContent;
                this.showNotification(`¡${clanName} ha ganado una batalla!`, 'success');
            }
        });
    }

    // Sistema de notificaciones
    initNotifications() {
        // Ya está implementado en showNotification
    }

    // Mostrar notificación
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

    // Efectos de partículas bélicas
    createBattleParticles() {
        const container = document.querySelector('.stars');
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.background = i % 3 === 0 ? 'var(--accent)' : 
                                      i % 3 === 1 ? 'var(--primary-light)' : 'var(--gold)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.zIndex = '-1';
            particle.style.opacity = '0.7';
            container.appendChild(particle);

            // Animación de batalla
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.7 },
                { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.5)`, opacity: 0.3 },
                { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1)`, opacity: 0.7 }
            ], {
                duration: Math.random() * 3000 + 2000,
                iterations: Infinity,
                easing: 'ease-in-out'
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const clanesManager = new MYDCRAFFClanes();
    clanesManager.simulateLiveUpdates();
    clanesManager.createBattleParticles();
});

// Filtros de ranking
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tableRows = document.querySelectorAll('.table-row');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            // Agregar active al botón clickeado
            btn.classList.add('active');

            const filter = btn.textContent.toLowerCase();
            
            tableRows.forEach(row => {
                if (filter === 'todos') {
                    row.style.display = 'grid';
                } else {
                    const clanName = row.querySelector('.clan-info').textContent.toLowerCase();
                    if (clanName.includes(filter)) {
                        row.style.display = 'grid';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    });
});