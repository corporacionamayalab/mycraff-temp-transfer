// MYDCRAFF Elytra Races - Script para carreras de Elytra
class MYDCRAFFElytra {
    constructor() {
        this.raceDuration = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
        this.startTime = new Date();
        this.init();
    }

    init() {
        this.initRaceTimer();
        this.initRaceActions();
        this.initAnimations();
        this.initNotifications();
        this.initPilotUpdates();
    }

    // Timer de la carrera
    initRaceTimer() {
        const timerElement = document.getElementById('race-timer');
        const progressElement = document.getElementById('race-progress');
        const progressText = document.getElementById('progress-text');

        if (!timerElement || !progressElement) return;

        const updateTimer = () => {
            const now = new Date();
            const elapsed = now - this.startTime;
            const remaining = this.raceDuration - elapsed;

            if (remaining <= 0) {
                timerElement.textContent = '00:00:00';
                progressElement.style.width = '100%';
                progressText.textContent = '100% completado';
                this.showNotification('¡La carrera ha finalizado!', 'success');
                clearInterval(timerInterval);
                return;
            }

            // Calcular tiempo restante
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Actualizar progreso
            const progress = (elapsed / this.raceDuration) * 100;
            progressElement.style.width = `${Math.min(progress, 100)}%`;
            progressText.textContent = `${Math.min(Math.round(progress), 100)}% completado`;
        };

        // Actualizar inmediatamente y cada segundo
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    // Acciones de la carrera
    initRaceActions() {
        // Unirse a la carrera
        const joinButton = document.getElementById('join-race');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                this.joinRace();
            });
        }

        // Espacios libres para unirse
        document.querySelectorAll('.pilot-slot.empty').forEach(slot => {
            slot.addEventListener('click', () => {
                this.joinRace();
            });
        });

        // Ver transmisión
        document.querySelectorAll('.btn-secondary').forEach(button => {
            if (button.textContent.includes('Transmisión')) {
                button.addEventListener('click', () => {
                    this.showNotification('Redirigiendo a la transmisión en vivo...');
                    // window.open('https://twitch.tv/tucanal', '_blank');
                });
            }
        });

        // Descargar mapa
        document.querySelectorAll('.btn-accent').forEach(button => {
            if (button.textContent.includes('Descargar')) {
                button.addEventListener('click', () => {
                    this.showNotification('Iniciando descarga del mapa...');
                    // Lógica de descarga aquí
                });
            }
        });
    }

    // Unirse a la carrera
    joinRace() {
        const emptySlots = document.querySelectorAll('.pilot-slot.empty');
        if (emptySlots.length > 0) {
            const firstEmptySlot = emptySlots[0];
            
            // Simular proceso de unión
            this.showNotification('Uniéndote a la carrera...', 'info');
            
            setTimeout(() => {
                firstEmptySlot.classList.remove('empty');
                firstEmptySlot.innerHTML = `
                    <div class="pilot-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="pilot-info">
                        <span class="pilot-name">Tú</span>
                        <span class="pilot-time">--:--.--</span>
                    </div>
                    <div class="pilot-stats">
                        <span class="checkpoints">0/15</span>
                        <span class="speed">0 m/s</span>
                    </div>
                `;
                
                this.showNotification('¡Te has unido a la carrera! Buena suerte.', 'success');
                
                // Actualizar contador de pilotos
                this.updatePilotCount();
                
            }, 2000);
        } else {
            this.showNotification('La carrera está llena. Intenta en la próxima.', 'error');
        }
    }

    // Actualizar contador de pilotos
    updatePilotCount() {
        const pilotCount = document.querySelectorAll('.pilot-slot:not(.empty)').length;
        const countElement = document.querySelector('.pilots-section h4');
        if (countElement) {
            countElement.textContent = `Pilotos en Carrera (${pilotCount}/25)`;
        }
    }

    // Actualizaciones en tiempo real de pilotos
    initPilotUpdates() {
        setInterval(() => {
            this.simulatePilotProgress();
        }, 5000); // Actualizar cada 5 segundos
    }

    // Simular progreso de pilotos
    simulatePilotProgress() {
        const pilotSlots = document.querySelectorAll('.pilot-slot:not(.empty)');
        
        pilotSlots.forEach((slot, index) => {
            if (slot.querySelector('.pilot-name').textContent !== 'Tú') {
                // Solo actualizar pilotos NPC, no el jugador
                this.updatePilotStats(slot, index);
            }
        });

        // Actualizar mejor tiempo
        this.updateBestTime();
    }

    // Actualizar estadísticas de un piloto
    updatePilotStats(slot, position) {
        const timeElement = slot.querySelector('.pilot-time');
        const checkpointsElement = slot.querySelector('.checkpoints');
        const speedElement = slot.querySelector('.speed');

        if (timeElement && timeElement.textContent !== '--:--.--') {
            // Mejorar tiempo ligeramente
            const currentTime = this.parseTime(timeElement.textContent);
            const newTime = Math.max(currentTime - (Math.random() * 100), 240000); // Mínimo 4 minutos
            timeElement.textContent = this.formatTime(newTime);
        }

        // Avanzar checkpoints
        if (checkpointsElement) {
            const [current, total] = checkpointsElement.textContent.split('/').map(Number);
            if (current < total) {
                if (Math.random() > 0.7) { // 30% de probabilidad de avanzar
                    const newCurrent = Math.min(current + 1, total);
                    checkpointsElement.textContent = `${newCurrent}/${total}`;
                }
            }
        }

        // Actualizar velocidad
        if (speedElement) {
            const baseSpeed = 65 + (position * 0.5); // Pilotos mejores son más rápidos
            const randomSpeed = baseSpeed + (Math.random() * 10 - 5);
            speedElement.textContent = `${Math.round(randomSpeed)} m/s`;
        }
    }

    // Actualizar mejor tiempo global
    updateBestTime() {
        const bestTimeElement = document.getElementById('best-time');
        if (bestTimeElement) {
            const currentBest = this.parseTime(bestTimeElement.textContent);
            const newBest = currentBest - (Math.random() * 50); // Mejorar ligeramente
            bestTimeElement.textContent = this.formatTime(Math.max(newBest, 268900)); // Mínimo 4:28.90
        }
    }

    // Utilidades para formato de tiempo
    parseTime(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes * 60000 + seconds * 1000;
    }

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(2);
        return `${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}`;
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
                    
                    // Efecto especial para slots de pilotos
                    if (entry.target.classList.contains('pilot-slot')) {
                        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                        entry.target.style.transitionDelay = `${delay}ms`;
                    }
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.pilot-slot, .map-card, .tip-card, .table-row').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
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
            info: 'var(--accent)'
        };

        notification.style.background = colors[type] || colors.info;
        notificationText.textContent = message;
        notification.classList.add('show');

        // Ocultar después de 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Efectos de partículas de vuelo
    createFlightParticles() {
        const container = document.querySelector('.stars');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.background = i % 2 === 0 ? 'var(--accent)' : 'var(--sky-blue)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.zIndex = '-1';
            particle.style.opacity = '0.6';
            container.appendChild(particle);

            // Animación de vuelo
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.6 },
                { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.5)`, opacity: 0 },
                { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1)`, opacity: 0.6 }
            ], {
                duration: Math.random() * 4000 + 2000,
                iterations: Infinity,
                easing: 'ease-in-out'
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const elytraManager = new MYDCRAFFElytra();
    elytraManager.createFlightParticles();
});

// Efectos de tooltip para checkpoints
document.addEventListener('DOMContentLoaded', () => {
    const checkpoints = document.querySelectorAll('.checkpoint');
    checkpoints.forEach(checkpoint => {
        checkpoint.addEventListener('mouseenter', (e) => {
            const checkpointNum = e.currentTarget.dataset.checkpoint;
            const checkpointName = checkpointNum === '1' ? 'Línea de Salida' :
                                 checkpointNum === '5' ? 'Línea de Meta' :
                                 `Checkpoint ${checkpointNum}`;
            
            // Crear tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'checkpoint-tooltip';
            tooltip.textContent = checkpointName;
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '0.5rem';
            tooltip.style.borderRadius = '5px';
            tooltip.style.fontSize = '0.8rem';
            tooltip.style.zIndex = '1000';
            
            document.body.appendChild(tooltip);
            
            // Posicionar tooltip
            const rect = e.currentTarget.getBoundingClientRect();
            tooltip.style.left = (rect.left + window.scrollX) + 'px';
            tooltip.style.top = (rect.top + window.scrollY - 40) + 'px';
            
            // Guardar referencia para remover después
            e.currentTarget._tooltip = tooltip;
        });
        
        checkpoint.addEventListener('mouseleave', (e) => {
            if (e.currentTarget._tooltip) {
                e.currentTarget._tooltip.remove();
            }
        });
    });
});