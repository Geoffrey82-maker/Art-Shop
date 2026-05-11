const handleRegister = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
    }
};

const handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('http://localhost:5000/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store the access token
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        alert('Login successful!');
        window.location.href = 'index.html'; // Redirect to main page
    } catch (error) {
        alert(error.message);
    }
};

// Attach event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Initialize user profile on all pages
    initializeUserProfile();
});

// Check if user is logged in and update UI
function isUserLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

// Get current user data
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Initialize user profile UI
function initializeUserProfile() {
    const authNavBtn = document.getElementById('authNavBtn');
    if (!authNavBtn) return;

    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        if (user) {
            // Update user profile display
            const displayName = document.getElementById('userDisplayName');
            const displayEmail = document.getElementById('userDisplayEmail');
            const avatarPlaceholder = document.getElementById('userAvatarPlaceholder');

            if (displayName) displayName.textContent = user.username || 'User';
            if (displayEmail) displayEmail.textContent = user.email || '';
            if (avatarPlaceholder) {
                const firstLetter = (user.username || 'U').charAt(0).toUpperCase();
                avatarPlaceholder.textContent = firstLetter;
            }

            // User is logged in, remove onclick for signup
            authNavBtn.removeAttribute('onclick');
            authNavBtn.onclick = () => toggleUserProfile();
        }
    } else {
        // User is not logged in, show signup
        authNavBtn.onclick = () => {
            window.location.href = 'signup.html';
        };
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    toggleUserProfile(); // Close the drawer
    alert('You have been logged out.');
    window.location.href = 'index.html';
}
