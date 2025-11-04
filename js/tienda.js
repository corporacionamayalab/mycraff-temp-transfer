// Variables globales
let cart = [];
let currentCategory = 'rangos';

// Elementos del DOM
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const categoryCards = document.querySelectorAll('.category-card');
const categorySections = document.querySelectorAll('.category-section');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    initEventListeners();
    updateCartDisplay();
    loadProductImages();
});

// Event Listeners
function initEventListeners() {
    // Carrito
    cartToggle.addEventListener('click', toggleCart);
    cartClose.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', checkout);

    // Categorías
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            switchCategory(category);
        });
    });

    // Agregar al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.add-to-cart');
            addToCart(
                product.dataset.product,
                parseFloat(product.dataset.price)
            );
        });
    });

    // Cerrar carrito con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
}

// Funciones del Carrito
function toggleCart() {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function addToCart(productName, price) {
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    
    // Mostrar notificación
    showNotification(`${productName} agregado al carrito`);
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCart();
    updateCartDisplay();
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('El carrito ya está vacío', 'warning');
        return;
    }

    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        updateCartDisplay();
        showNotification('Carrito vaciado', 'info');
    }
}

function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Actualizar contador
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Actualizar items del carrito
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-color);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    // Actualizar total
    cartTotal.textContent = total.toFixed(2);
}

function checkout() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'warning');
        return;
    }

    // Simular proceso de pago
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Aquí integrarías con tu sistema de pago real
    showNotification(`Redirigiendo al pago - Total: $${total.toFixed(2)}`, 'success');
    
    // Simular redirección
    setTimeout(() => {
        alert(`¡Gracias por tu compra!\nTotal: $${total.toFixed(2)}\n\nEste es un simulador. En una implementación real, se integraría con un sistema de pago como PayPal, Stripe, etc.`);
        clearCart();
        closeCart();
    }, 2000);
}

// Funciones de Categorías
function switchCategory(category) {
    // Actualizar categoría activa
    currentCategory = category;
    
    // Ocultar todas las secciones
    categorySections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${category}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Scroll suave a la sección
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.nav a[href="#categorias"]').classList.add('active');
}

// Función para cargar imágenes con fallback
function loadProductImages() {
    const productImages = document.querySelectorAll('.product-image img');
    
    productImages.forEach(img => {
        // Verificar si la imagen existe
        fetch(img.src)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Imagen no encontrada');
                }
            })
            .catch(error => {
                // Mostrar placeholder si la imagen no existe
                img.style.display = 'none';
                const placeholder = img.nextElementSibling;
                if (placeholder) {
                    placeholder.style.display = 'flex';
                }
            });
    });
}

// Storage
function saveCart() {
    localStorage.setItem('mydcraff_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('mydcraff_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Notificaciones
function showNotification(message, type = 'success') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 
                     type === 'warning' ? 'var(--warning-color)' : 
                     type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 1200;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Efectos visuales adicionales
function addHoverEffects() {
    // Efecto de partículas en botones (opcional)
    const buttons = document.querySelectorAll('.btn-primary, .category-card, .product-card');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Inicializar efectos
addHoverEffects();

// Exportar funciones para uso global
window.removeFromCart = removeFromCart;