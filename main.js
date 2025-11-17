class SweetBitesApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('sweetbites_cart')) || [];
        this.allProducts = [];
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupCart();
        this.setupSearch();
        this.setupAnimations();
        this.setupFormHandlers();
        this.setupSEO();
        this.updateCartDisplay();
        this.collectProducts();
    }

    setupSearch() {
        const searchHTML = `
            <div class="search-container" style="margin: 2rem 0; max-width: 500px; margin-left: auto; margin-right: auto;">
                <div style="position: relative;">
                    <input type="text" id="menu-search" placeholder="Search cupcakes, cakes, bread, pastries..." 
                           style="width: 100%; padding: 1rem 1rem 1rem 3rem; border: 2px solid #ddd; border-radius: 50px; font-size: 1rem; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-search" style="position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: #d291bc;"></i>
                </div>
                <div id="search-results" style="display: none; margin-top: 1rem; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-height: 300px; overflow-y: auto;"></div>
            </div>
        `;

        const fullMenuSection = document.querySelector('section:nth-child(3) h2');
        if (fullMenuSection) {
            fullMenuSection.insertAdjacentHTML('afterend', searchHTML);
            
            const searchInput = document.getElementById('menu-search');
            const searchResults = document.getElementById('search-results');
            
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                this.handleSearch(searchTerm, searchResults);
            });

            searchInput.addEventListener('focus', () => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm) {
                    this.handleSearch(searchTerm, searchResults);
                }
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    searchResults.style.display = 'none';
                }
            });
        }
    }

    collectProducts() {
        const productCards = document.querySelectorAll('.product-card');
        this.allProducts = [];
        
        productCards.forEach(card => {
            const name = card.querySelector('h3')?.textContent?.trim() || '';
            const price = card.querySelector('p')?.textContent?.trim() || '';
            const image = card.querySelector('img')?.src || '';
            const category = this.getProductCategory(card);
            
            if (name) {
                this.allProducts.push({
                    element: card,
                    name: name,
                    price: price,
                    image: image,
                    category: category,
                    originalDisplay: card.style.display
                });
            }
        });
    }

    getProductCategory(card) {
        const categorySection = card.closest('.menu-category');
        if (categorySection) {
            const categoryTitle = categorySection.querySelector('h3');
            if (categoryTitle) {
                return categoryTitle.textContent.replace(/[^a-zA-Z ]/g, '').trim();
            }
        }
        return 'Other';
    }

    handleSearch(searchTerm, resultsContainer) {
        if (searchTerm.length < 2) {
            resultsContainer.style.display = 'none';
            this.showAllProducts();
            return;
        }

        const filteredProducts = this.allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.price.toLowerCase().includes(searchTerm)
        );

        this.displaySearchResults(filteredProducts, resultsContainer, searchTerm);
        this.filterProductsDisplay(searchTerm);
    }

    displaySearchResults(products, container, searchTerm) {
        if (products.length === 0) {
            container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: #5a4a42;">No products found for "${searchTerm}"</div>`;
            container.style.display = 'block';
            return;
        }

        let resultsHTML = '';
        products.forEach(product => {
            resultsHTML += `
                <div class="search-result-item" style="padding: 1rem; border-bottom: 1px solid #f0e6d9; cursor: pointer; display: flex; align-items: center; gap: 1rem; transition: background-color 0.2s;" 
                     onmouseover="this.style.backgroundColor='#f9f7f4'" 
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="sweetBitesApp.selectSearchResult('${product.name.replace(/'/g, "\\'")}')">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">` : ''}
                    <div>
                        <div style="font-weight: bold; color: #5a4a42;">${product.name}</div>
                        <div style="font-size: 0.9rem; color: #87a96b;">${product.price} • ${product.category}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = resultsHTML;
        container.style.display = 'block';
    }

    selectSearchResult(productName) {
        const searchInput = document.getElementById('menu-search');
        const resultsContainer = document.getElementById('search-results');
        
        searchInput.value = productName;
        resultsContainer.style.display = 'none';
        
        this.handleSearch(productName.toLowerCase(), resultsContainer);
        
        const productElement = this.allProducts.find(p => p.name === productName)?.element;
        if (productElement) {
            productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            productElement.style.transform = 'scale(1.05)';
            productElement.style.boxShadow = '0 0 0 2px #d291bc';
            setTimeout(() => {
                productElement.style.transform = 'scale(1)';
                productElement.style.boxShadow = '';
            }, 2000);
        }
    }

    filterProductsDisplay(searchTerm) {
        this.allProducts.forEach(product => {
            const matchesSearch = 
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.price.toLowerCase().includes(searchTerm);
            
            if (matchesSearch) {
                product.element.style.display = 'block';
                product.element.closest('.menu-category').style.display = 'block';
            } else {
                product.element.style.display = 'none';
            }
        });

        this.updateCategoryVisibility();
    }

    updateCategoryVisibility() {
        const categories = document.querySelectorAll('.menu-category');
        categories.forEach(category => {
            const visibleProducts = category.querySelectorAll('.product-card[style*="display: block"], .product-card:not([style*="display: none"])');
            if (visibleProducts.length === 0) {
                category.style.display = 'none';
            } else {
                category.style.display = 'block';
            }
        });
    }

    showAllProducts() {
        this.allProducts.forEach(product => {
            product.element.style.display = product.originalDisplay || 'block';
        });
        
        const categories = document.querySelectorAll('.menu-category');
        categories.forEach(category => {
            category.style.display = 'block';
        });
    }

    setupMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileBtn && mobileNav) {
            mobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                mobileNav.classList.toggle('active');
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
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sweetBitesApp = new SweetBitesApp();
    });
} else {
    window.sweetBitesApp = new SweetBitesApp();
}
