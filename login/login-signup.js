const SUPABASE_URL = 'https://mtmrilvgybiwyjgqttqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bXJpbHZneWJpd3lqZ3F0dHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Mjg4OTEsImV4cCI6MjA1NDQwNDg5MX0.1nfCnZmh0jFR9xttubx5b8iaq7awEYPECXLZJNjpHPg';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements for toggling between login and signup forms
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

async function SignUp(event) {
event.preventDefault();

// Get values from the sign-up form
const form = event.target;
const name = form.querySelector('input[placeholder="Name"]').value.trim();
const email = form.querySelector('input[placeholder="Email"]').value.trim();
const password = form.querySelector('input[placeholder="Password"]').value;

const { data, error } = await supabaseClient
    .from('accounts')
    .insert([{ name, email, password }]);

if (error) {
    console.error('Error signing up:', error);
    Swal.fire({
    icon: 'error',
    title: 'Sign Up Failed',
    text: 'Error signing up: ' + error.message,
    confirmButtonColor: '#3085d6'
    });
    return false;
} else {
    Swal.fire({
    icon: 'success',
    title: 'Sign Up Successful!',
    text: 'You can now log in.',
    confirmButtonColor: '#3085d6'
    }).then(() => {
    form.reset();
    });
    return true;
}
}

async function Login(event) {
    event.preventDefault();
  
    // Get values from the login form
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
  
    const { data, error } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
  
    if (error || !data) {
      console.error('Error logging in:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password.',
        confirmButtonColor: '#d33'
      });
      return false;
    } else {
      // Save the user information to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(data));
      
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome back!',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        // Redirect to the homepage
        window.location.href = '/index.html';
      });
      return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
// Select the login and sign-up forms based on their container classes.
const loginForm = document.querySelector('.login form');
const signUpForm = document.querySelector('.register form');

    if (loginForm) {
        loginForm.addEventListener('submit', Login);
    }
    if (signUpForm) {
        signUpForm.addEventListener('submit', SignUp);
    }
});