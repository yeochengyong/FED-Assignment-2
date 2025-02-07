function navigateToCategory(categoryPage) {
    window.location.href = `${categoryPage}`;
}

// update log in with account page with sidebar
document.addEventListener('DOMContentLoaded', () => {
    // Check if a user is logged in (saved in localStorage)
    const loggedInUser = localStorage.getItem('loggedInUser');
    const headerAction = document.querySelector('.header-top-action');
  
    if (loggedInUser && headerAction) {
        // Parse the stored user data
        const user = JSON.parse(loggedInUser);
        
        // Replace the login link with an account icon
        headerAction.innerHTML = `<i class='bx bx-user' style="font-size: 24px;"></i>`;
        headerAction.removeAttribute('href');
        
        // When the account icon is clicked, toggle the sidebar
        headerAction.addEventListener('click', toggleSidebar);
    
        // Populate the sidebar with the user's info
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<p><strong>${user.name || 'User'}</strong></p>
                                    <p>${user.email}</p>`;
        }
    } else if (headerAction) {
        // If no user is logged in, ensure the header only shows "Login"
        headerAction.innerHTML = 'Login';
        headerAction.setAttribute('href', '/login/login-signup.html');
    }
  
    // Set up sidebar close button listener
    const closeSidebarBtn = document.getElementById('close-sidebar');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }
  
    // Set up log out button listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        });
    }
});

function toggleSidebar() {
const sidebar = document.getElementById('account-sidebar');
if (sidebar) {
    sidebar.classList.toggle('open');
}
}

