const MYDCRAFF = (() => {
            // Configuración
            const config = {
                carousel: {
                    autoSlideInterval: 5000,
                    transitionDuration: 500
                }
            };

            // Estado de la aplicación
            const state = {
                carousel: {
                    currentSlide: 0,
                    totalSlides: 0,
                    autoSlide: null
                }
            };

            // Cache de elementos DOM
            const dom = {};

            // Inicialización
            function init() {
                cacheDOM();
                initCarousel();
                initScrollAnimations();
                initEventListeners();
                initAccessibility();
            }

            // Cache de elementos frecuentemente usados
            function cacheDOM() {
                dom.carousel = {
                    track: document.querySelector('.carousel__track'),
                    slides: document.querySelectorAll('.carousel__slide'),
                    prevBtn: document.querySelector('.carousel__nav--prev'),
                    nextBtn: document.querySelector('.carousel__nav--next'),
                    indicators: document.querySelectorAll('.carousel__indicator')
                };
            }

            // Carrusel
            function initCarousel() {
                if (!dom.carousel.track) return;

                state.carousel.totalSlides = dom.carousel.slides.length;
                
                // Auto-slide
                state.carousel.autoSlide = setInterval(() => {
                    nextSlide();
                }, config.carousel.autoSlideInterval);

                // Pausar auto-slide al interactuar
                const carousel = dom.carousel.track.closest('.carousel');
                carousel.addEventListener('mouseenter', pauseAutoSlide);
                carousel.addEventListener('mouseleave', resumeAutoSlide);
                carousel.addEventListener('focusin', pauseAutoSlide);
                carousel.addEventListener('focusout', resumeAutoSlide);
            }

            function nextSlide() {
                state.carousel.currentSlide = (state.carousel.currentSlide + 1) % state.carousel.totalSlides;
                updateCarousel();
            }

            function prevSlide() {
                state.carousel.currentSlide = (state.carousel.currentSlide - 1 + state.carousel.totalSlides) % state.carousel.totalSlides;
                updateCarousel();
            }

            function goToSlide(index) {
                state.carousel.currentSlide = index;
                updateCarousel();
            }

            function updateCarousel() {
                // Mover track
                dom.carousel.track.style.transform = `translateX(-${state.carousel.currentSlide * 100}%)`;
                
                // Actualizar indicadores
                dom.carousel.indicators.forEach((indicator, index) => {
                    const isActive = index === state.carousel.currentSlide;
                    indicator.classList.toggle('active', isActive);
                    indicator.setAttribute('aria-current', isActive);
                });
                
                // Actualizar slides
                dom.carousel.slides.forEach((slide, index) => {
                    slide.setAttribute('aria-label', `${index + 1} de ${state.carousel.totalSlides}`);
                });
            }

            function pauseAutoSlide() {
                clearInterval(state.carousel.autoSlide);
            }

            function resumeAutoSlide() {
                state.carousel.autoSlide = setInterval(() => {
                    nextSlide();
                }, config.carousel.autoSlideInterval);
            }

            // Animaciones al hacer scroll
            function initScrollAnimations() {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('loaded');
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                // Observar elementos animables
                document.querySelectorAll('.feature, .rank, .post').forEach(el => {
                    el.classList.add('loading');
                    observer.observe(el);
                });
            }

            // Event listeners
            function initEventListeners() {
                // Carrusel
                if (dom.carousel.prevBtn) {
                    dom.carousel.prevBtn.addEventListener('click', prevSlide);
                }
                if (dom.carousel.nextBtn) {
                    dom.carousel.nextBtn.addEventListener('click', nextSlide);
                }
                
                // Indicadores del carrusel
                dom.carousel.indicators.forEach((indicator, index) => {
                    indicator.addEventListener('click', () => goToSlide(index));
                });

                // Scroll suave
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', smoothScroll);
                });

                // Mejora de focus para accesibilidad
                document.addEventListener('keydown', handleKeydown);
            }

            // Scroll suave
            function smoothScroll(e) {
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
            }

            // Mejoras de accesibilidad
            function initAccessibility() {
                // Mejor manejo de focus
                document.addEventListener('focusin', (e) => {
                    e.target.classList.add('focus-visible');
                });

                document.addEventListener('focusout', (e) => {
                    e.target.classList.remove('focus-visible');
                });
            }

            // Manejo de teclado
            function handleKeydown(e) {
                // Navegación del carrusel con teclado
                if (e.key === 'ArrowLeft' && document.activeElement.closest('.carousel')) {
                    e.preventDefault();
                    prevSlide();
                } else if (e.key === 'ArrowRight' && document.activeElement.closest('.carousel')) {
                    e.preventDefault();
                    nextSlide();
                }
            }

            // API pública
            return {
                init,
                nextSlide,
                prevSlide,
                goToSlide
            };
        })();

        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', MYDCRAFF.init);
        } else {
            MYDCRAFF.init();
        }