document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            tabBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the tab to activate
            const tabToActivate = this.getAttribute('data-tab');
            
            // Remove active class from all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to the corresponding tab content
            document.getElementById(tabToActivate + '-tab').classList.add('active');
        });
    });
    
    // Product Form Functionality
    const addProductBtn = document.getElementById('add-product-btn');
    const formOverlay = document.getElementById('product-form-overlay');
    const formCloseBtn = document.getElementById('form-close-btn');
    const addProductForm = document.getElementById('add-product-form');
    const productImageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    const productsContainer = document.getElementById('products-container');
    
    // Show product form
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            formOverlay.classList.add('active');
        });
    }
    
    // Close product form
    if (formCloseBtn) {
        formCloseBtn.addEventListener('click', function() {
            formOverlay.classList.remove('active');
        });
    }
    
    // Image preview functionality
    if (productImageInput) {
        productImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Product Preview">`;
                }
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = 'No image selected';
            }
        });
    }
    
    // Handle form submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const productName = document.getElementById('product-name').value;
            const productCategory = document.getElementById('product-category').value;
            const productPrice = document.getElementById('product-price').value;
            const productQuantity = document.getElementById('product-quantity').value;
            
            // Create new product card
            const newProduct = document.createElement('div');
            newProduct.className = 'product-card';
            newProduct.innerHTML = `
                <div class="product-image">
                    <img src="${imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : 'https://via.placeholder.com/300x200'}" alt="${productName}">
                    <div class="product-actions">
                        <button><i class="fas fa-edit"></i></button>
                        <button><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-name">${productName}</div>
                    <div class="product-category">${productCategory}</div>
                    <div class="product-price">${parseFloat(productPrice).toFixed(2)}Rs</div>
                    <div class="inventory">In stock: ${productQuantity} units</div>
                </div>
            `;
            
            // Add new product to grid
            if (productsContainer) {
                productsContainer.prepend(newProduct);
            }
            
            // Reset form and close overlay
            addProductForm.reset();
            imagePreview.innerHTML = 'No image selected';
            formOverlay.classList.remove('active');
            
            // Optional: Show success message
            alert('Product added successfully!');
        });
    }
    
    // Add event listeners for order action buttons
    const orderActionBtns = document.querySelectorAll('.order-btn');
    orderActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            const orderId = this.closest('.order-card').querySelector('.order-id').textContent;
            alert(`${action} action initiated for ${orderId}`);
            
            // If it's an Accept or Reject button, you might want to remove the order card
            if (action === 'Accept' || action === 'Reject') {
                // Uncomment the line below to actually remove the order
                // this.closest('.order-card').remove();
            }
        });
    });
    
    // Delete product functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('fa-trash') || e.target.parentElement.classList.contains('fa-trash')) {
            const productCard = e.target.closest('.product-card');
            if (productCard && confirm('Are you sure you want to delete this product?')) {
                productCard.remove();
            }
        }
    });
});