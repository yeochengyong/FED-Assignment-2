const container = document.querySelector('.log-container');
const registerBtn = document.querySelector('.register-link');
const loginBtn = document.querySelector('.login-link');

// Add event listeners
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

document.getElementById('logoutButton').onclick = function () {
    alert('You have been logged out.');
    window.location.href = '/'; 
};

function notifyLogin() {
    alert("You have successfully logged in!");
    return true; 
}

function notifySignUp() {
    alert("You have successfully signed up!");
    return true; 
}