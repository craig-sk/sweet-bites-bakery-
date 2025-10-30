class SweetBitesApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupCart();
        this.setupAnimations();
        this.setupFormHandlers();
        this.updateCartDisplay();
    }

    setupMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileBtn && mobileNav) {
            mobileBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!mobileNav.contains(e.target) && !mobileBtn.contains(e.target)) {
                    mobileNav.classList.remove('active');
                }
            });
        }
    }

    setupCart() {
        this.cartModal = document.querySelector('.cart-modal');
        this.cartOverlay = document.querySelector('.cart-overlay');
        this.cartItems = document.querySelector('.cart-items');
        this.cartTotal = document.querySelector('.cart-total');

        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = e.target.closest('.product-card') || e.target.closest('li');
                this.addToCart(product);
            });
        });

        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.openCart();
            });
        }

        if (this.cartOverlay) {
            this.cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }

        const closeCart = document.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.closeCart();
            });
        }
    }

    addToCart(product) {
        const name = product.querySelector('h3')?.textContent || 'Product';
        const priceText = product.querySelector('p')?.textContent || 'R0';
        const price = parseInt(priceText.replace('R', '')) || 0;
        
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showSuccess('Item added to cart!');
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
    }

    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity <= 0) {
            this.removeFromCart(index);
        } else {
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
        }
    }

    openCart() {
        if (this.cartModal) {
            this.cartModal.classList.add('active');
            this.cartOverlay.classList.add('active');
            this.renderCartItems();
        }
    }

    closeCart() {
        if (this.cartModal) {
            this.cartModal.classList.remove('active');
            this.cartOverlay.classList.remove('active');
        }
    }

    renderCartItems() {
        if (!this.cartItems) return;
        
        this.cartItems.innerHTML = '';
        
        if (this.cart.length === 0) {
            this.cartItems.innerHTML = '<p>Your cart is empty</p>';
            if (this.cartTotal) {
                this.cartTotal.textContent = 'Total: R0';
            }
            return;
        }
        
        this.cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <div>R${item.price * item.quantity}</div>
                <button class="remove-item" style="color: #d291bc; border: none; background: none; cursor: pointer;">×</button>
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
            
            this.cartItems.appendChild(cartItem);
        });

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (this.cartTotal) {
            this.cartTotal.textContent = `Total: R${total}`;
        }
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
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

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
        });
    }

    handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        setTimeout(() => {
            this.showSuccess('Message sent successfully! We will contact you soon.');
            form.reset();
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 2000);
    }

    showSuccess(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message active';
        successMsg.textContent = message;
        
        document.querySelector('main').prepend(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }
}

const app = new SweetBitesApp();
