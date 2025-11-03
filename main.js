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
        }
    }

    setupCart() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = e.target.closest('.product-card');
                this.addToCart(product);
            });
        });

        document.querySelector('.cart-icon').addEventListener('click', () => {
            this.openCart();
        });

        document.querySelector('.cart-overlay').addEventListener('click', () => {
            this.closeCart();
        });

        document.querySelector('.close-cart').addEventListener('click', () => {
            this.closeCart();
        });
    }

    addToCart(product) {
        const name = product.querySelector('h3').textContent;
        const price = parseInt(product.querySelector('p').textContent.replace('R', ''));
        
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
        document.querySelector('.cart-modal').classList.add('active');
        document.querySelector('.cart-overlay').classList.add('active');
        this.renderCartItems();
    }

    closeCart() {
        document.querySelector('.cart-modal').classList.remove('active');
        document.querySelector('.cart-overlay').classList.remove('active');
    }

    renderCartItems() {
        const cartItems = document.querySelector('.cart-items');
        const cartTotal = document.querySelector('.cart-total');
        
        cartItems.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            cartTotal.textContent = 'Total: R0';
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
                <button class="remove-item">×</button>
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
    }

    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
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
        });
    }

    handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        setTimeout(() => {
            this.showSuccess('Message sent successfully!');
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
