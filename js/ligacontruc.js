// MYDCRAFF Builders League - Script para Liga de Constructores
class MYDCRAFFBuilders {
    constructor() {
        this.init();
    }

    init() {
        this.initCountdown();
        this.initAnimations();
        this.initNotifications();
        this.initClanInteractions();
    }

    // Countdown para el tiempo de construcción
    initCountdown() {
        const countdownElement = document.getElementById('build-time');
        if (!countdownElement) return;

        // 12 días desde ahora
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 12);
        endTime.setHours(20, 0, 0, 0); // 20:00 GMT

        const updateCountdown = () => {
            const now = new Date();
            const diff = endTime - now;

            if (diff <= 0) {
                countdownElement.textContent = '¡Tiempo finalizado!';
                countdownElement.style.color = 'var(--accent)';
                clearInterval(countdownInterval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            countdownElement.textContent = `${days} días ${hours} horas ${minutes} minutos`;
        };

        // Actualizar inmediatamente y cada minuto
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 60000);
    }

    // Animaciones al hacer scroll
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
                    
                    // Efecto especial para tarjetas de construcción
                    if (entry.target.classList.contains('construction-card')) {
                        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                        entry.target.style.transitionDelay = `${delay}ms`;
                    }
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.clan-card, .construction-card, .table-row').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Interacciones con los clanes
    initClanInteractions() {
        // Efecto hover en miembros del clan
        document.querySelectorAll('.member').forEach(member => {
            member.addEventListener('click', (e) => {
                const memberName = e.currentTarget.querySelector('span').textContent;
                this.showNotification(`Ver perfil de: ${memberName}`);
            });
        });

        // Click en tarjetas de clan para ver detalles
        document.querySelectorAll('.clan-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.member')) {
                    const clanName = card.querySelector('h3').textContent;
                    this.showNotification(`Mostrando detalles de: ${clanName}`);
                }
            });
        });

        // Click en construcciones para ampliar
        document.querySelectorAll('.construction-image').forEach(image => {
            image.addEventListener('click', (e) => {
                const constructionTitle = e.currentTarget.querySelector('h3').textContent;
                this.showNotification(`Ampliando imagen: ${constructionTitle}`);
            });
        });
    }

    // Simular actualizaciones en tiempo real del progreso
    simulateProgressUpdates() {
        setInterval(() => {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const currentWidth = parseInt(bar.style.width);
                if (currentWidth < 100) {
                    const newWidth = Math.min(currentWidth + Math.random() * 2, 100);
                    bar.style.width = `${newWidth}%`;
                }
            });

            // Actualizar puntuaciones aleatoriamente
            const clanScores = document.querySelectorAll('.clan-score, .points');
            clanScores.forEach(score => {
                if (Math.random() > 0.7) { // 30% de probabilidad
                    const currentScore = parseInt(score.textContent.replace(/,/g, ''));
                    const newScore = currentScore + Math.floor(Math.random() * 50);
                    score.textContent = newScore.toLocaleString();
                }
            });
        }, 10000); // Cada 10 segundos
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

    // Efectos de partículas de construcción
    createBuildParticles() {
        const container = document.querySelector('.stars');
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = i % 3 === 0 ? 'var(--gold)' : 
                                      i % 3 === 1 ? 'var(--silver)' : 'var(--bronze)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.zIndex = '-1';
            particle.style.opacity = '0.7';
            container.appendChild(particle);

            // Animación de construcción (movimiento más lento y elegante)
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.7 },
                { transform: `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.3)`, opacity: 0.3 },
                { transform: `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1)`, opacity: 0.7 }
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
    const buildersManager = new MYDCRAFFBuilders();
    buildersManager.simulateProgressUpdates();
    buildersManager.createBuildParticles();
});

// Efectos de tooltip para miembros
document.addEventListener('DOMContentLoaded', () => {
    const members = document.querySelectorAll('.member');
    members.forEach(member => {
        member.addEventListener('mouseenter', (e) => {
            const role = e.currentTarget.querySelector('i').className.includes('crown') ? 'Líder del Clan' :
                        e.currentTarget.querySelector('i').className.includes('star') ? 'Constructor Senior' : 'Constructor';
            
            // Crear tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'member-tooltip';
            tooltip.textContent = role;
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
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - 40) + 'px';
            
            // Guardar referencia para remover después
            e.currentTarget._tooltip = tooltip;
        });
        
        member.addEventListener('mouseleave', (e) => {
            if (e.currentTarget._tooltip) {
                e.currentTarget._tooltip.remove();
            }
        });
    });
});