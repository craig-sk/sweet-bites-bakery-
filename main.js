class SweetBitesApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('sweetbites_cart')) || [];
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupCart();
        this.setupAnimations();
        this.setupFormHandlers();
        this.setupSEO();
        this.updateCartDisplay();
    }

    setupSEO() {
        const schema = {
            "@context": "https://schema.org",
            "@type": "Bakery",
            "name": "Sweet Bites Bakery",
            "description": "Family-owned bakery in Cape Town. Order cupcakes, cakes, breads and pastries.",
            "url": window.location.href,
            "telephone": "+27621234567",
            "email": "hello@sweetbites.co.za",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Bakery Street, City Center",
                "addressLocality": "Cape Town",
                "addressCountry": "ZA"
            },
            "openingHours": [
                "Mo-Sa 07:00-19:00",
                "Su 08:00-16:00"
            ],
            "priceRange": "R25 - R240"
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'load',
                    value: loadTime,
                    event_category: 'Load Time'
                });
            }
        });
    }

    setupMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileBtn && mobileNav) {
            mobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                mobileNav.classList.toggle('active');
                this.trackEvent('mobile_menu', { state: mobileNav.classList.contains('active') ? 'open' : 'closed' });
            });

            document.addEventListener('click', (e) => {
                if (!mobileNav.contains(e.target) && !mobileBtn.contains(e.target)) {
                    mobileNav.classList.remove('active');
                }
            });

            mobileNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileNav.classList.remove('active');
                });
            });
        }
    }

    setupCart() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const product = e.target.closest('.product-card');
                if (product) {
                    this.addToCart(product);
                    e.preventDefault();
                }
            }
        });

        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-cart') || 
                e.target.classList.contains('cart-overlay') ||
                (e.target.classList.contains('btn') && e.target.textContent.includes('Continue Shopping'))) {
                this.closeCart();
                e.preventDefault();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    addToCart(product) {
        const name = product.querySelector('h3')?.textContent?.trim() || 'Bakery Item';
        const priceText = product.querySelector('p')?.textContent || 'R0';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
        const image = product.querySelector('img')?.src || '';
        
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: name,
                price: price,
                quantity: 1,
                image: image
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showSuccess('Item added to cart!');
        this.trackEvent('add_to_cart', { product: name, price: price });
        
        product.style.transform = 'scale(1.05)';
        setTimeout(() => {
            product.style.transform = 'scale(1)';
        }, 300);
    }

    removeFromCart(index) {
        const removedItem = this.cart[index];
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
        this.trackEvent('remove_from_cart', { product: removedItem.name });
    }

    updateQuantity(index, change) {
        const item = this.cart[index];
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(index);
        } else {
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
            this.trackEvent('update_cart_quantity', { 
                product: item.name, 
                quantity: item.quantity 
            });
        }
    }

    openCart() {
        document.querySelector('.cart-modal').classList.add('active');
        document.querySelector('.cart-overlay').classList.add('active');
        this.renderCartItems();
        this.trackEvent('open_cart', { item_count: this.cart.length });
    }

    closeCart() {
        document.querySelector('.cart-modal').classList.remove('active');
        document.querySelector('.cart-overlay').classList.remove('active');
    }

    renderCartItems() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total');
        
        if (!cartItems || !cartTotal) return;
        
        cartItems.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #5a4a42;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; color: #d291bc;"></i>
                    <p>Your cart is empty</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some delicious treats!</p>
                </div>
            `;
            cartTotal.textContent = 'Total: R0';
            return;
        }
        
        this.cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item fade-in';
            cartItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : ''}
                    <div>
                        <strong>${item.name}</strong>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                </div>
                <div>R${item.price * item.quantity}</div>
                <button class="remove-item" aria-label="Remove item">×</button>
            `;
            
            cartItem.querySelector('.minus').addEventListener('click', () => {
                this.updateQuantity(index, -1);
            });
            
            cartItem.querySelector('.plus').addEventListener('click', () => {
                this.updateQuantity(index, 1);
            });
            
            cartItem.querySelector('.remove-item').addEventListener('click', () => {
                this.removeFromCart(index);
            });
            
            cartItems.appendChild(cartItem);
        });

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `Total: R${total}`;
        
        const existingCheckout = document.querySelector('.checkout-btn');
        if (existingCheckout) existingCheckout.remove();
        
        if (this.cart.length > 0) {
            const checkoutBtn = document.createElement('button');
            checkoutBtn.className = 'btn checkout-btn';
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.style.marginTop = '1rem';
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
            cartTotal.parentNode.insertBefore(checkoutBtn, cartTotal.nextSibling);
        }
    }

    proceedToCheckout() {
        this.trackEvent('begin_checkout', { 
            item_count: this.cart.length,
            total_value: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
        
        window.location.href = 'enquiry.html?cart=' + encodeURIComponent(JSON.stringify(this.cart));
    }

    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    saveCart() {
        localStorage.setItem('sweetbites_cart', JSON.stringify(this.cart));
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.trackEvent('element_view', { element: entry.target.className });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    setupFormHandlers() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
            
            form.querySelectorAll('input, textarea').forEach(field => {
                field.addEventListener('focus', () => {
                    this.trackEvent('form_focus', { field: field.name || field.type });
                });
            });
        });
    }

    handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        setTimeout(() => {
            this.showSuccess('Message sent successfully! We will contact you soon.');
            this.trackEvent('form_submit', { 
                form_type: form.id || 'contact_form',
                fields_count: form.querySelectorAll('input, textarea, select').length
            });
            
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 2000);
    }

    showSuccess(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message active';
        successMsg.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        const main = document.querySelector('main');
        if (main) {
            main.prepend(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        }
    }

    trackEvent(action, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, data);
        }
        console.log(`Event: ${action}`, data);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sweetBitesApp = new SweetBitesApp();
    });
} else {
    window.sweetBitesApp = new SweetBitesApp();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SweetBitesApp;
}
