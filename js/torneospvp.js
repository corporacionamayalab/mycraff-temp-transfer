// MYDCRAFF PvP - Script para torneos
class MYDCRAFFPvP {
    constructor() {
        this.init();
    }

    init() {
        this.initCountdown();
        this.initTournamentActions();
        this.initScrollAnimations();
        this.initNotifications();
    }

    // Countdown para el torneo
    initCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        let timeLeft = 15 * 60; // 15 minutos en segundos

        const updateCountdown = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            countdownElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                countdownElement.textContent = '¡Comenzó!';
                countdownElement.style.color = 'var(--accent)';
                clearInterval(countdownInterval);
            } else {
                timeLeft--;
            }
        };

        // Actualizar inmediatamente y cada segundo
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Acciones de los torneos
    initTournamentActions() {
        // Botones de inscripción
        document.querySelectorAll('.btn-primary:not(:disabled)').forEach(button => {
            button.addEventListener('click', (e) => {
                const tournamentCard = e.target.closest('.tournament-card');
                const tournamentName = tournamentCard.querySelector('h3').textContent;
                
                this.showNotification(`Inscribiéndote a: ${tournamentName}`);
                
                // Simular proceso de inscripción
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                button.disabled = true;
                
                setTimeout(() => {
                    this.showNotification('¡Inscripción exitosa! Revisa tu correo para confirmar.', 'success');
                    button.innerHTML = '<i class="fas fa-check"></i> Inscrito';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-secondary');
                }, 2000);
            });
        });

        // Botón ver brackets
        document.querySelectorAll('.btn-accent').forEach(button => {
            button.addEventListener('click', () => {
                this.showNotification('Mostrando brackets del torneo...');
                // Aquí iría la lógica para mostrar los brackets
            });
        });

        // Botón ver transmisión
        document.querySelectorAll('.btn-secondary').forEach(button => {
            if (button.textContent.includes('Transmisión')) {
                button.addEventListener('click', () => {
                    this.showNotification('Redirigiendo a la transmisión en vivo...');
                    // window.open('https://twitch.tv/tucanal', '_blank');
                });
            }
        });
    }

    // Animaciones al hacer scroll
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
        document.querySelectorAll('.tournament-card, .table-row, .player-slot').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
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

    // Simular actualización en tiempo real de jugadores
    simulateLiveUpdates() {
        setInterval(() => {
            const playerSlots = document.querySelectorAll('.player-slot');
            if (playerSlots.length > 0) {
                const randomPlayer = playerSlots[Math.floor(Math.random() * playerSlots.length)];
                randomPlayer.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    randomPlayer.style.animation = '';
                }, 500);
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const pvpManager = new MYDCRAFFPvP();
    pvpManager.simulateLiveUpdates(); // Opcional: para efectos visuales
});

// Efectos de partículas para el fondo
function createBattleParticles() {
    const container = document.querySelector('.stars');
    if (!container) return;

    // Crear partículas de batalla (efectos especiales)
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '3px';
        particle.style.height = '3px';
        particle.style.background = i % 2 === 0 ? 'var(--accent)' : 'var(--primary-light)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.zIndex = '-1';
        particle.style.opacity = '0.6';
        container.appendChild(particle);

        // Animación de batalla
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.6 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.5)`, opacity: 0 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1)`, opacity: 0.6 }
        ], {
            duration: Math.random() * 2000 + 1000,
            iterations: Infinity
        });
    }
}

// Iniciar partículas de batalla
createBattleParticles();