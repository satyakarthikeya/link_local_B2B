// Show/hide password functionality
document.addEventListener('DOMContentLoaded', function() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = this.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    markInvalid(input, 'This field is required');
                    isValid = false;
                } else {
                    clearInvalid(input);
                    
                    // Email validation
                    if (input.type === 'email' && !validateEmail(input.value)) {
                        markInvalid(input, 'Please enter a valid email address');
                        isValid = false;
                    }
                    
                    // Password validation
                    if (input.id === 'password' && input.value.length < 8) {
                        markInvalid(input, 'Password must be at least 8 characters');
                        isValid = false;
                    }
                    
                    // Confirm password validation
                    if (input.id === 'confirmPassword') {
                        const password = document.getElementById('password');
                        if (input.value !== password.value) {
                            markInvalid(input, 'Passwords do not match');
                            isValid = false;
                        }
                    }
                }
            });
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                setTimeout(() => {
                    // Redirect to dashboard or show success message
                    if (form.id === 'loginForm') {
                        window.location.href = 'dashboard.html';
                    } else {
                        alert('Registration successful! Please check your email to verify your account.');
                        window.location.href = 'login_page.html';
                    }
                }, 2000);
            }
        });
    });
    
    // Input field validation on blur
    const allInputs = document.querySelectorAll('input');
    
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                markInvalid(this, 'This field is required');
            } else {
                clearInvalid(this);
            }
        });
        
        input.addEventListener('input', function() {
            clearInvalid(this);
        });
    });
});

function markInvalid(input, message) {
    input.classList.add('invalid');
    
    // Remove any existing error message
    const existingError = input.parentElement.nextElementSibling;
    if (existingError && existingError.classList.contains('error-message')) {
        existingError.remove();
    }
    
    // Add error message
    const errorSpan = document.createElement('span');
    errorSpan.classList.add('error-message');
    errorSpan.textContent = message;
    input.parentElement.insertAdjacentElement('afterend', errorSpan);
}

function clearInvalid(input) {
    input.classList.remove('invalid');
    
    // Remove error message if it exists
    const existingError = input.parentElement.nextElementSibling;
    if (existingError && existingError.classList.contains('error-message')) {
        existingError.remove();
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}