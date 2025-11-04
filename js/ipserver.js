// MYDCRAFF - Página Simple de IP del Servidor
class MYDCRAFFIPServer {
    constructor() {
        this.init();
    }

    init() {
        this.initIPCopy();
        this.initAnimations();
        this.initSocialLinks();
        this.initSmoothScroll();
    }

    // Copiar IP al portapapeles
    initIPCopy() {
        const copyBtn = document.getElementById('copy-ip');
        const serverIp = document.getElementById('server-ip');

        if (!copyBtn || !serverIp) return;

        copyBtn.addEventListener('click', async () => {
            const ip = serverIp.textContent;

            try {
                // Intentar usar la API moderna del portapapeles
                await navigator.clipboard.writeText(ip);
                this.showNotification('¡IP copiada al portapapeles!');
                this.animateCopyButton(copyBtn);
            } catch (err) {
                // Fallback para navegadores más antiguos
                this.fallbackCopy(ip);
            }
        });
    }

    // Fallback para copiar
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('¡IP copiada al portapapeles!');
            this.animateCopyButton(document.getElementById('copy-ip'));
        } catch (err) {
            this.showNotification('Error al copiar la IP', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Animación del botón de copiar
    animateCopyButton(button) {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');

        if (!notification || !notificationText) return;

        // Cambiar color según el tipo
        if (type === 'error') {
            notification.style.background = '#f44336';
        } else {
            notification.style.background = 'var(--success)';
        }

        notificationText.textContent = message;
        notification.classList.add('show');

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Animaciones de entrada
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
                    
                    // Efecto especial para tarjetas sociales
                    if (entry.target.classList.contains('social-card')) {
                        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                        entry.target.style.transitionDelay = `${delay}ms`;
                    }
                }
            });
        }, observerOptions);

        // Observar elementos para animación
        document.querySelectorAll('.ip-card, .social-card, .store-card, .info-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Manejar enlaces sociales (aquí puedes agregar tus URLs reales)
    initSocialLinks() {
        const socialLinks = {
            discord: '#',
            youtube: '#',
            twitch: '#',
            twitter: '#',
            instagram: '#',
            tiktok: '#'
        };

        // Aquí puedes agregar lógica adicional para los enlaces sociales
        console.log('Enlaces sociales configurados:', socialLinks);
    }

    // Scroll suave para navegación
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Efecto de partículas simples para el fondo
    createParticles() {
        const container = document.querySelector('.stars');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.background = 'white';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.zIndex = '-1';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            container.appendChild(particle);

            // Animación simple
            particle.animate([
                { transform: 'translateY(0)', opacity: particle.style.opacity },
                { transform: `translateY(${Math.random() * 100 - 50}px)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                iterations: Infinity,
                direction: 'alternate'
            });
        }
    }

    // Actualización en tiempo real de estadísticas (simulada)
    simulateLiveStats() {
        setInterval(() => {
            const stats = document.querySelectorAll('.info-card p');
            if (stats.length >= 2) {
                // Simular actualización de jugadores online
                const playerCount = Math.floor(Math.random() * 50) + 450;
                stats[1].textContent = `+${playerCount} jugadores registrados`;
            }
        }, 10000); // Actualizar cada 10 segundos
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const ipServer = new MYDCRAFFIPServer();
    ipServer.createParticles();
    ipServer.simulateLiveStats();
});

// Mejoras de accesibilidad
document.addEventListener('keydown', (e) => {
    // Navegación por teclado mejorada
    if (e.key === 'Escape') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('show');
        }
    }
});

// Mejorar focus para accesibilidad
document.addEventListener('focusin', (e) => {
    e.target.classList.add('focus-visible');
});

document.addEventListener('focusout', (e) => {
    e.target.classList.remove('focus-visible');
});