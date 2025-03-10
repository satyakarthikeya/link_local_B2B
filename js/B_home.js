document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // Animate hamburger to X
            this.classList.toggle('active');
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    alert(`Searching for: ${searchTerm}`);
                    // Future implementation: Actual search functionality
                }
            }
        });
    }
    
    // Featured shops data (in a real application, this would come from an API)
    const featuredShops = [
        {
            id: 1,
            name: "Brew & Bean Coffee",
            image: "https://via.placeholder.com/500x300",
            description: "Artisanal coffee shop with freshly roasted beans",
            rating: 4.8,
            category: "Coffee & Tea"
        },
        {
            id: 2,
            name: "Urban Threads",
            image: "https://via.placeholder.com/500x300",
            description: "Local boutique with handcrafted clothing",
            rating: 4.6,
            category: "Clothing"
        },
        {
            id: 3,
            name: "Fresh Harvest Market",
            image: "https://via.placeholder.com/500x300",
            description: "Organic produce directly from local farmers",
            rating: 4.9,
            category: "Grocery"
        },
        {
            id: 4,
            name: "Tech Haven",
            image: "https://via.placeholder.com/500x300",
            description: "Your neighborhood tech repair and gadget shop",
            rating: 4.7,
            category: "Electronics"
        }
    ];
    
    // Featured deals data (in a real application, this would come from an API)
    const featuredDeals = [
        {
            id: 1,
            shopName: "Brew & Bean Coffee",
            image: "https://via.placeholder.com/500x300",
            discount: "30% OFF",
            description: "Any specialty coffee, Monday to Wednesday",
            validUntil: "Mar 30, 2025"
        },
        {
            id: 2,
            shopName: "Urban Threads",
            image: "https://via.placeholder.com/500x300",
            discount: "BUY 1 GET 1",
            description: "All t-shirts and accessories on weekends",
            validUntil: "Mar 15, 2025"
        },
        {
            id: 3,
            shopName: "Fresh Harvest Market",
            image: "https://via.placeholder.com/500x300",
            discount: "15% OFF",
            description: "Fresh produce basket, available daily",
            validUntil: "Apr 10, 2025"
        },
        {
            id: 4,
            shopName: "Tech Haven",
            image: "https://via.placeholder.com/500x300",
            discount: "50% OFF",
            description: "Phone screen replacement service",
            validUntil: "Mar 20, 2025"
        }
    ];
    
    // Function to render featured shops
    function renderFeaturedShops() {
        const featuredShopsContainer = document.getElementById('featured-shops');
        
        if (featuredShopsContainer) {
            featuredShopsContainer.innerHTML = '';
            
            featuredShops.forEach(shop => {
                const shopCard = document.createElement('div');
                shopCard.className = 'shop-card';
                shopCard.innerHTML = `
                    <div class="card-img">
                        <img src="${shop.image}" alt="${shop.name}">
                    </div>
                    <div class="card-content">
                        <div class="shop-rating">
                            <i class="fas fa-star"></i>
                            <span>${shop.rating}</span>
                        </div>
                        <h3>${shop.name}</h3>
                        <p>${shop.description}</p>
                        <div class="shop-category">${shop.category}</div>
                    </div>
                `;
                
                shopCard.addEventListener('click', function() {
                    // Future implementation: Navigate to shop detail page
                    alert(`Viewing ${shop.name} details`);
                });
                
                featuredShopsContainer.appendChild(shopCard);
            });
        }
    }
    
    // Function to render featured deals
    function renderFeaturedDeals() {
        const featuredDealsContainer = document.getElementById('featured-deals');
        
        if (featuredDealsContainer) {
            featuredDealsContainer.innerHTML = '';
            
            featuredDeals.forEach(deal => {
                const dealCard = document.createElement('div');
                dealCard.className = 'deal-card';
                dealCard.innerHTML = `
                    <div class="card-img">
                        <img src="${deal.image}" alt="${deal.shopName} Deal">
                    </div>
                    <div class="card-content">
                        <div class="deal-badge">${deal.discount}</div>
                        <h3>${deal.shopName}</h3>
                        <p>${deal.description}</p>
                        <div class="deal-period">
                            <i class="far fa-calendar-alt"></i>
                            Valid until ${deal.validUntil}
                        </div>
                    </div>
                `;
                
                dealCard.addEventListener('click', function() {
                    // Future implementation: Navigate to deal detail page
                    alert(`Viewing ${deal.shopName} deal details`);
                });
                
                featuredDealsContainer.appendChild(dealCard);
            });
        }
    }
    
    // Initialize page
    renderFeaturedShops();
    renderFeaturedDeals();
    
    // Add click event listeners to action buttons
    const actionButtons = document.querySelectorAll('.hero-actions button, .view-all-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert(`Navigating to: ${this.textContent.trim()}`);
            // Future implementation: Proper navigation
        });
    });
});