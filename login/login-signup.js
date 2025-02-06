const container = document.querySelector('.log-container');
const registerLink = document.querySelector('.register-link a');
const loginLink = document.querySelector('.login-link a');

// Toggle between login and register forms
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.add('active');
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    container.classList.remove('active');
});

// Helper function to display success message
function displaySuccessMessage(message) {
    if (document.querySelector('.success-message')) return;

    // Create and style the success message
    const successBox = document.createElement('div');
    successBox.className = 'success-message';
    successBox.innerText = message;

    document.body.appendChild(successBox);

    setTimeout(() => {
        successBox.remove();
    }, 3000);
}

// Successful login
function notifyLogin() {
    displaySuccessMessage("You have successfully logged in!");
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 3000);
    return true;
}

// Successful sign-up
function notifySignUp() {
    displaySuccessMessage("You have successfully signed up!");
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 3000);
    return true;
}

// login api call
async function login(email, password) {
    const BASE_URL = 'https://fedassmt2-9c70.restdb.io/rest/userdb';
    const API_KEY = '678f6ed4718b1a5fb3f81480';

    try {
        const response = await fetch(`${BASE_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const users = await response.json();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            notifyLogin();
        } else {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.innerText = 'Invalid email or password';
            } else {
                alert('Invalid email or password');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.innerText = 'An error occurred. Please try again.';
        } else {
            alert('An error occurred. Please try again.');
        }
    }
}

// sign up api call
async function signUp(name, email, password) {
    const BASE_URL = 'https://fedassmt2-9c70.restdb.io/rest/userdb';
    const API_KEY = '678f6ed4718b1a5fb3f81480'; 

    if (!name || !email || !password) {
        alert('Please fill in all the fields.');
        return false;
    }

    try {
        const response = await fetch(`${BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        if (response.ok) {
            notifySignUp();
            return true; // allow form
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Sign-up error:', error);
        alert('An error occurred during sign-up. Please try again.');
        return false;
    }
}

// sign up event listener
document.querySelector('.form-box.register form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.querySelector('.form-box.register input[placeholder="Name"]').value.trim();
    const email = document.querySelector('.form-box.register input[placeholder="Email"]').value.trim();
    const password = document.querySelector('.form-box.register input[placeholder="Password"]').value.trim();

    await signUp(name, email, password);
});

// login event listener
document.querySelector('.form-box.login form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('.form-box.login input[placeholder="Email"]').value.trim();
    const password = document.querySelector('.form-box.login input[placeholder="Password"]').value.trim();

    await login(email, password);
});
